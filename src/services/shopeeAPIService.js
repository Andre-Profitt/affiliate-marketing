import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { CacheService } from './cacheService.js';

export class ShopeeAPIService {
  constructor() {
    this.cache = new CacheService();
    this.baseURL = 'https://shopee.com.br/api/v4';
    this.searchURL = 'https://shopee.com.br/api/v4/search/search_items';
    
    // Shopee API configuration
    this.config = {
      appId: '10027', // Shopee web app ID
      version: '4.0.0',
      platform: 'web',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://shopee.com.br/',
      origin: 'https://shopee.com.br'
    };
  }

  // Generate Shopee API signature
  generateSignature(path, params) {
    // Shopee uses a specific signature algorithm for API requests
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${path}${timestamp}`;
    const signature = crypto.createHash('md5').update(message).digest('hex');
    return { signature, timestamp };
  }

  // Build request headers
  getHeaders() {
    return {
      'User-Agent': this.config.userAgent,
      'Referer': this.config.referer,
      'Origin': this.config.origin,
      'Accept': 'application/json',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'X-Requested-With': 'XMLHttpRequest',
      'X-API-SOURCE': 'pc',
      'X-Shopee-Language': 'pt-BR',
      'Content-Type': 'application/json'
    };
  }

  // Search products using internal API
  async searchProducts({ keywords, minPrice, maxPrice, limit = 20, page = 1 }) {
    try {
      const cacheKey = `shopee:api:search:${keywords}:${minPrice}:${maxPrice}:${page}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached Shopee API results');
        return cached;
      }

      // Build search parameters
      const params = {
        by: 'relevancy',
        keyword: keywords,
        limit: limit,
        newest: (page - 1) * limit,
        order: 'desc',
        page_type: 'search',
        scenario: 'PAGE_GLOBAL_SEARCH',
        version: 2,
        // Price filter (in cents)
        price_min: minPrice ? minPrice * 100 : undefined,
        price_max: maxPrice ? maxPrice * 100 : undefined
      };

      // Clean undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      logger.info('Calling Shopee API:', { keywords, page });

      const response = await axios.get(this.searchURL, {
        params,
        headers: this.getHeaders(),
        timeout: 10000
      });

      if (response.data && response.data.items) {
        const products = this.formatProducts(response.data.items);
        
        // Cache for 30 minutes
        await this.cache.set(cacheKey, products, 1800);
        
        return products;
      }

      throw new Error('Invalid response from Shopee API');

    } catch (error) {
      logger.error('Shopee API search error:', error.message);
      
      // If API fails, try alternative endpoint
      return this.searchProductsAlternative({ keywords, minPrice, maxPrice, limit });
    }
  }

  // Alternative search method using recommendation API
  async searchProductsAlternative({ keywords, minPrice, maxPrice, limit = 20 }) {
    try {
      // Shopee's recommendation API endpoint
      const url = 'https://shopee.com.br/api/v4/recommend/recommend';
      
      const params = {
        bundle: 'shop_page_category_tab_main',
        cate_level: 1,
        limit: limit,
        offset: 0,
        section: 'shop_page_category_tab_main_sec',
        tab_name: 'popular'
      };

      const response = await axios.get(url, {
        params,
        headers: this.getHeaders()
      });

      if (response.data && response.data.data && response.data.data.sections) {
        const items = response.data.data.sections[0]?.data?.item || [];
        return this.formatProducts(items);
      }

      // Fallback to flash sale API
      return this.getFlashSaleProducts(limit);

    } catch (error) {
      logger.error('Alternative search error:', error.message);
      throw error;
    }
  }

  // Get flash sale products
  async getFlashSaleProducts(limit = 20) {
    try {
      const url = 'https://shopee.com.br/api/v4/flash_sale/flash_sale_get_items';
      
      const params = {
        limit: limit,
        offset: 0,
        need_personalize: true,
        with_dp_items: true
      };

      const response = await axios.get(url, {
        params,
        headers: this.getHeaders()
      });

      if (response.data && response.data.data && response.data.data.items) {
        return this.formatProducts(response.data.data.items);
      }

      throw new Error('No flash sale data available');

    } catch (error) {
      logger.error('Flash sale API error:', error.message);
      throw error;
    }
  }

  // Get product details using internal API
  async getProductDetails(itemId, shopId) {
    try {
      const url = 'https://shopee.com.br/api/v4/item/get';
      
      const params = {
        itemid: itemId,
        shopid: shopId
      };

      const response = await axios.get(url, {
        params,
        headers: this.getHeaders()
      });

      if (response.data && response.data.data) {
        return this.formatProductDetails(response.data.data);
      }

      throw new Error('Product not found');

    } catch (error) {
      logger.error('Product details API error:', error.message);
      throw error;
    }
  }

  // Format products from API response
  formatProducts(items) {
    return items.map(item => {
      const itemBasic = item.item_basic || item;
      
      return {
        id: `${itemBasic.shopid}_${itemBasic.itemid}`,
        itemId: itemBasic.itemid,
        shopId: itemBasic.shopid,
        platform: 'shopee',
        title: itemBasic.name,
        price: {
          amount: itemBasic.price / 100000, // Convert from cents
          formatted: `R$ ${(itemBasic.price / 100000).toFixed(2).replace('.', ',')}`,
          currency: 'BRL'
        },
        originalPrice: itemBasic.price_before_discount ? {
          amount: itemBasic.price_before_discount / 100000,
          formatted: `R$ ${(itemBasic.price_before_discount / 100000).toFixed(2).replace('.', ',')}`
        } : null,
        savings: itemBasic.raw_discount ? {
          percentage: Math.abs(itemBasic.raw_discount),
          amount: (itemBasic.price_before_discount - itemBasic.price) / 100000
        } : null,
        image: `https://cf.shopee.com.br/file/${itemBasic.image}`,
        images: itemBasic.images ? itemBasic.images.map(img => `https://cf.shopee.com.br/file/${img}`) : [],
        sold: itemBasic.historical_sold > 0 ? `${this.formatSoldCount(itemBasic.historical_sold)} vendidos` : '',
        stock: itemBasic.stock,
        rating: {
          average: itemBasic.item_rating?.rating_star || 0,
          count: itemBasic.item_rating?.rating_count || [0, 0, 0, 0, 0]
        },
        url: `https://shopee.com.br/product/${itemBasic.shopid}/${itemBasic.itemid}`,
        shop: {
          id: itemBasic.shopid,
          name: itemBasic.shop_name || '',
          location: itemBasic.shop_location || 'Brasil'
        },
        isOfficialShop: itemBasic.is_official_shop || false,
        isMall: itemBasic.shopee_verified || false,
        freeShipping: itemBasic.show_free_shipping || false
      };
    });
  }

  // Format product details
  formatProductDetails(data) {
    return {
      id: `${data.shopid}_${data.itemid}`,
      itemId: data.itemid,
      shopId: data.shopid,
      platform: 'shopee',
      title: data.name,
      description: data.description,
      price: {
        amount: data.price / 100000,
        formatted: `R$ ${(data.price / 100000).toFixed(2).replace('.', ',')}`,
        currency: 'BRL'
      },
      images: data.images.map(img => `https://cf.shopee.com.br/file/${img}`),
      categories: data.categories,
      attributes: data.attributes,
      specifications: this.extractSpecifications(data),
      variations: data.models || [],
      shop: {
        id: data.shopid,
        name: data.shop_name,
        rating: data.shop_rating,
        responseRate: data.response_rate,
        responseTime: data.response_time
      }
    };
  }

  // Extract product specifications
  extractSpecifications(data) {
    const specs = {};
    
    if (data.attributes) {
      data.attributes.forEach(attr => {
        specs[attr.name] = attr.value;
      });
    }
    
    return specs;
  }

  // Format sold count for display
  formatSoldCount(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${Math.floor(count / 1000)} mil`;
    }
    return count.toString();
  }

  // Generate affiliate link for Shopee product
  async generateAffiliateLink(itemId, shopId, campaignId = 'api') {
    // Shopee Brazil affiliate program parameters
    const baseUrl = `https://shopee.com.br/product/${shopId}/${itemId}`;
    
    // Add tracking parameters
    const params = new URLSearchParams({
      // Affiliate tracking
      af_id: process.env.SHOPEE_AFFILIATE_ID || 'default',
      af_sub1: campaignId,
      af_sub2: 'mcp_api',
      // UTM parameters
      utm_source: 'affiliate',
      utm_medium: 'api',
      utm_campaign: campaignId
    });
    
    const affiliateUrl = `${baseUrl}?${params.toString()}`;
    
    // Create short link using Shopee's shortener
    const shortLink = await this.createShortLink(affiliateUrl);
    
    return {
      originalUrl: baseUrl,
      affiliateUrl,
      shortLink,
      campaignId
    };
  }

  // Create short link using Shopee's URL shortener
  async createShortLink(url) {
    try {
      // Shopee's internal URL shortener endpoint
      const response = await axios.post(
        'https://shopee.com.br/api/v4/shorten_url',
        { url },
        { headers: this.getHeaders() }
      );
      
      if (response.data && response.data.short_url) {
        return response.data.short_url;
      }
      
      return url; // Return original if shortening fails
      
    } catch (error) {
      logger.error('URL shortening error:', error.message);
      return url;
    }
  }
}

// Export singleton instance
export default new ShopeeAPIService();
