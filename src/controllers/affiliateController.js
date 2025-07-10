import axios from 'axios';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';

// Real Shopee API integration
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    logger.info(`Searching Shopee for: ${q}`);

    // Shopee Brazil API endpoint (based on research)
    const shopeeUrl = 'https://shopee.com.br/api/v4/search/search_items';
    
    const response = await axios.get(shopeeUrl, {
      params: {
        by: 'relevancy',
        keyword: q,
        limit: limit,
        newest: (page - 1) * limit,
        order: 'desc',
        page_type: 'search',
        scenario: 'PAGE_GLOBAL_SEARCH',
        version: 2
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://shopee.com.br/',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    if (!response.data || !response.data.items) {
      logger.warn('No items found in Shopee response');
      return res.json({ success: true, products: [] });
    }

    // Transform Shopee data to our format
    const products = response.data.items.map(item => {
      const itemBasic = item.item_basic || item;
      
      return {
        platform: 'shopee',
        external_id: itemBasic.itemid?.toString(),
        shop_id: itemBasic.shopid?.toString(),
        name: itemBasic.name,
        description: itemBasic.description || '',
        price: itemBasic.price / 100000, // Convert from smallest unit
        original_price: itemBasic.price_before_discount ? itemBasic.price_before_discount / 100000 : null,
        discount: itemBasic.raw_discount || 0,
        currency: 'BRL',
        image: `https://cf.shopee.com.br/file/${itemBasic.image}`,
        images: itemBasic.images ? itemBasic.images.map(img => `https://cf.shopee.com.br/file/${img}`) : [],
        url: `https://shopee.com.br/product/${itemBasic.shopid}/${itemBasic.itemid}`,
        rating: itemBasic.item_rating?.rating_star || 0,
        sold: itemBasic.historical_sold || 0,
        stock: itemBasic.stock || 0,
        seller: {
          name: itemBasic.shop_name || 'Unknown',
          rating: itemBasic.shop_rating || 0
        }
      };
    });

    // Save to database for caching
    const savedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Update or create
          const updated = await Product.findOneAndUpdate(
            { external_id: product.external_id, platform: 'shopee' },
            { ...product, user_id: userId },
            { upsert: true, new: true }
          );
          return updated;
        } catch (error) {
          logger.error('Error saving product:', error);
          return product;
        }
      })
    );

    // Update user's search count
    req.user.usage.searches_today += 1;
    await req.user.save();

    res.json({
      success: true,
      count: savedProducts.length,
      page: parseInt(page),
      products: savedProducts
    });

  } catch (error) {
    logger.error('Shopee search error:', error);
    
    // Fallback to database search if API fails
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Rate limited by Shopee. Try again later.'
      });
    }

    // Try searching in our database
    try {
      const dbProducts = await Product.find({
        user_id: req.user._id,
        $text: { $search: req.query.q }
      }).limit(20);

      return res.json({
        success: true,
        products: dbProducts,
        source: 'cache'
      });
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Search failed. Please try again.'
      });
    }
  }
};

// Generate affiliate link
export const generateAffiliateLink = async (req, res) => {
  try {
    const { productId, url } = req.body;
    const userId = req.user._id;

    if (!productId && !url) {
      return res.status(400).json({
        success: false,
        message: 'Product ID or URL required'
      });
    }

    // Find product in database
    let product;
    if (productId) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ url });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate affiliate link
    // For now, using simple tracking parameter
    // In production, integrate with Ecomobi/Admitad API
    const affiliateId = req.user.api_keys?.shopee_affiliate_id || process.env.SHOPEE_AFFILIATE_ID || 'default';
    const trackingId = `${userId}_${Date.now()}`;
    
    let affiliateUrl;
    if (product.platform === 'shopee') {
      // Shopee affiliate link format (based on research)
      affiliateUrl = `${product.url}?af_id=${affiliateId}&af_click_lookback=7d&af_reengagement_window=7d&is_retargeting=true&af_viewthrough_lookback=1d&utm_campaign=affiliate&utm_source=${userId}&utm_medium=web&clickid=${trackingId}`;
    } else {
      // Generic affiliate link
      affiliateUrl = `${product.url}?ref=${affiliateId}&uid=${userId}&click=${trackingId}`;
    }

    // Update product with affiliate link
    product.affiliate_url = affiliateUrl;
    await product.save();

    // Create click tracking record (for analytics)
    // You can create a Click model to track this

    res.json({
      success: true,
      affiliateUrl,
      trackingId,
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });

  } catch (error) {
    logger.error('Generate link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate affiliate link'
    });
  }
};

// Get trending products (real data)
export const getTrendingProducts = async (req, res) => {
  try {
    const { platform = 'shopee', limit = 10 } = req.query;
    
    // For Shopee, fetch from their trending/recommended endpoint
    const trendingUrl = 'https://shopee.com.br/api/v4/recommend/recommend';
    
    const response = await axios.get(trendingUrl, {
      params: {
        bundle: 'daily_discover_main',
        limit: limit,
        offset: 0
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://shopee.com.br/'
      }
    });

    const products = response.data.data?.sections?.[0]?.data?.item || [];
    
    const formattedProducts = products.map(item => ({
      platform: 'shopee',
      external_id: item.itemid?.toString(),
      name: item.name,
      price: item.price / 100000,
      image: `https://cf.shopee.com.br/file/${item.image}`,
      url: `https://shopee.com.br/product/${item.shopid}/${item.itemid}`,
      sold: item.sold || item.historical_sold || 0,
      rating: item.item_rating?.rating_star || 0
    }));

    res.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    logger.error('Get trending error:', error);
    
    // Fallback to most viewed products in DB
    const trendingFromDb = await Product.find({ platform: req.query.platform })
      .sort('-sold -rating')
      .limit(10);
      
    res.json({
      success: true,
      products: trendingFromDb,
      source: 'cache'
    });
  }
};

// Batch generate affiliate links
export const batchGenerateLinks = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array required'
      });
    }

    const results = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const product = await Product.findById(productId);
          if (!product) return null;

          const affiliateId = req.user.api_keys?.shopee_affiliate_id || process.env.SHOPEE_AFFILIATE_ID || 'default';
          const trackingId = `${userId}_${Date.now()}_${productId}`;
          
          const affiliateUrl = `${product.url}?af_id=${affiliateId}&utm_source=${userId}&clickid=${trackingId}`;
          
          product.affiliate_url = affiliateUrl;
          await product.save();

          return {
            productId,
            affiliateUrl,
            name: product.name,
            image: product.image
          };
        } catch (error) {
          logger.error(`Failed to generate link for ${productId}:`, error);
          return null;
        }
      })
    );

    const successful = results.filter(r => r !== null);

    res.json({
      success: true,
      count: successful.length,
      links: successful
    });

  } catch (error) {
    logger.error('Batch generate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate links'
    });
  }
};
