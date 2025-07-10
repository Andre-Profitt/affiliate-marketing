import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import shopeeAPI from '../src/services/shopeeAPIService.js';
import { ContentGeneratorService } from '../src/services/contentService.js';
import { CacheService } from '../src/services/cacheService.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.WEB_PORT || 3001;

// Initialize services
const contentService = new ContentGeneratorService();
const cacheService = new CacheService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Get trending products
app.get('/api/products/trending', async (req, res) => {
  try {
    const { platform = 'shopee', category, limit = 10 } = req.query;
    
    // For now, focus on Shopee since Amazon needs approval
    if (platform === 'shopee' || platform === 'both') {
      try {
        // Use the real Shopee API
        const products = await shopeeAPI.searchProducts({
          keywords: category || 'promoção flash sale',
          limit: parseInt(limit)
        });
        
        // If we have Claude API key, analyze products
        let insights = {};
        if (process.env.ANTHROPIC_API_KEY) {
          const analysis = await contentService.analyzeProducts(products);
          insights = analysis.insights;
        }
        
        return res.json({
          success: true,
          products,
          insights,
          totalFound: products.length,
          source: 'live_api'
        });
        
      } catch (error) {
        logger.error('Shopee API error, trying flash sale:', error);
        
        // Try flash sale products as fallback
        const flashProducts = await shopeeAPI.getFlashSaleProducts(limit);
        return res.json({
          success: true,
          products: flashProducts,
          insights: { suggestion: 'Produtos em promoção relâmpago!' },
          totalFound: flashProducts.length,
          source: 'flash_sale'
        });
      }
    }
    
    // Return empty for Amazon until we have credentials
    res.json({
      success: true,
      products: [],
      message: 'Amazon integration pending approval',
      totalFound: 0
    });
    
  } catch (error) {
    logger.error('Trending products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product details
app.get('/api/product/:platform/:productId', async (req, res) => {
  try {
    const { platform, productId } = req.params;
    
    if (platform === 'shopee') {
      // Extract shopId and itemId from productId (format: shopId_itemId)
      const [shopId, itemId] = productId.split('_');
      const details = await shopeeAPI.getProductDetails(itemId, shopId);
      
      res.json({ success: true, product: details });
    } else {
      res.status(400).json({ success: false, error: 'Platform not supported yet' });
    }
    
  } catch (error) {
    logger.error('Product details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate affiliate link
app.post('/api/affiliate/generate', async (req, res) => {
  try {
    const { platform, productId, url, campaignId = 'web_dashboard' } = req.body;
    
    if (platform === 'shopee') {
      const [shopId, itemId] = productId.split('_');
      const affiliateData = await shopeeAPI.generateAffiliateLink(itemId, shopId, campaignId);
      
      res.json({ success: true, ...affiliateData });
    } else {
      // Mock Amazon affiliate link until we have credentials
      res.json({ 
        success: true, 
        affiliateUrl: `https://www.amazon.com.br/dp/${productId}?tag=pending-20`,
        shortLink: `https://amzn.to/demo${productId}`,
        message: 'Demo link - Amazon approval pending'
      });
    }
    
  } catch (error) {
    logger.error('Affiliate link error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate content for product
app.post('/api/content/generate', async (req, res) => {
  try {
    const { product, platform = 'both', tone = 'friendly' } = req.body;
    
    if (process.env.ANTHROPIC_API_KEY) {
      // Use Claude for content generation
      const content = await contentService.generateContent(product, platform, tone);
      const contentData = JSON.parse(content.content[0].text);
      
      res.json({ success: true, content: contentData });
    } else {
      // Fallback to template-based content
      const content = {
        text: `🔥 OFERTA IMPERDÍVEL! 🔥\n\n${product.title}\n\n💰 Por apenas ${product.price?.formatted || 'R$ ' + product.price}${product.savings ? ` (${product.savings.percentage}% OFF!)` : ''}${product.sold ? `\n📦 ${product.sold}` : ''}\n\n✅ Produto original\n✅ Entrega rápida\n✅ Compra segura\n\n🛒 Aproveite agora! Link na bio\n\n#oferta #promocao #shopee #${platform}`,
        media: { url: product.image || product.images?.[0] },
        hashtags: ['#oferta', '#promocao', '#desconto', '#shopee', '#brasil']
      };
      
      res.json({ success: true, content });
    }
    
  } catch (error) {
    logger.error('Content generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get categories
app.get('/api/categories/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    
    const categories = {
      shopee: [
        { id: 'all', name: 'Todos', icon: '🛍️' },
        { id: 'flash sale', name: 'Flash Sale', icon: '⚡', trending: true },
        { id: 'eletrônicos', name: 'Eletrônicos', icon: '📱', trending: true },
        { id: 'moda feminina', name: 'Moda Feminina', icon: '👗', trending: true },
        { id: 'beleza', name: 'Beleza', icon: '💄', trending: true },
        { id: 'casa', name: 'Casa e Decoração', icon: '🏠' },
        { id: 'esportes', name: 'Esportes', icon: '⚽' },
        { id: 'brinquedos', name: 'Brinquedos', icon: '🎮' },
        { id: 'saúde', name: 'Saúde', icon: '💊' }
      ],
      amazon: [
        { id: 'all', name: 'Todos (Em breve)', icon: '📦', disabled: true }
      ],
      both: [
        { id: 'all', name: 'Todos', icon: '🛍️' },
        { id: 'eletrônicos', name: 'Eletrônicos', icon: '📱', trending: true },
        { id: 'moda', name: 'Moda', icon: '👗', trending: true },
        { id: 'beleza', name: 'Beleza', icon: '💄', trending: true },
        { id: 'casa', name: 'Casa', icon: '🏠' }
      ]
    };
    
    res.json({
      success: true,
      categories: categories[platform] || categories.shopee
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System status endpoint
app.get('/api/status', async (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    services: {
      shopee: 'active',
      amazon: 'pending_approval',
      contentAI: process.env.ANTHROPIC_API_KEY ? 'active' : 'inactive'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Production web dashboard running at http://localhost:${PORT}`);
  logger.info(`📡 Using Shopee Live API`);
  if (process.env.ANTHROPIC_API_KEY) {
    logger.info(`🤖 Claude AI content generation enabled`);
  }
  logger.info(`⏳ Amazon integration pending (awaiting approval)`);
});
