import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AmazonProductService } from '../src/services/amazonService.js';
import { ShopeeProductService } from '../src/services/shopeeService.js';
import { ContentGeneratorService } from '../src/services/contentService.js';
import { CacheService } from '../src/services/cacheService.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.WEB_PORT || 3001;

// Initialize services
const amazonService = new AmazonProductService();
const shopeeService = new ShopeeProductService();
const contentService = new ContentGeneratorService();
const cacheService = new CacheService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Demo mode for testing without API credentials
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.AMAZON_ACCESS_KEY;

if (DEMO_MODE) {
  logger.info('Running in DEMO mode - using mock data');
}

// Get trending products
app.get('/api/products/trending', async (req, res) => {
  try {
    const { platform = 'both', category, limit = 10 } = req.query;
    const products = [];
    
    // Demo mode - return mock data
    if (DEMO_MODE) {
      const mockProducts = getMockProducts(platform, category);
      return res.json({
        success: true,
        products: mockProducts.slice(0, limit),
        insights: {
          trends: 'Produtos eletrônicos e casa estão em alta demanda este mês',
          bestPlatforms: ['whatsapp'],
          conversionPotential: 'alto'
        },
        totalFound: mockProducts.length
      });
    }
    
    // Real API calls follow...
    
    // Fetch from Amazon
    if (platform === 'amazon' || platform === 'both') {
      try {
        const amazonResults = await amazonService.searchProducts({
          keywords: category || 'mais vendidos',
          category,
          maxPrice: 5000
        });
        const amazonData = JSON.parse(amazonResults.content[0].text);
        products.push(...amazonData.products.slice(0, 5).map(p => ({
          ...p,
          platform: 'amazon',
          id: p.asin
        })));
      } catch (error) {
        logger.error('Amazon fetch error:', error);
      }
    }
    
    // Fetch from Shopee
    if (platform === 'shopee' || platform === 'both') {
      try {
        const shopeeResults = await shopeeService.searchProducts({
          keywords: category || 'promoção',
          maxPrice: 5000
        });
        const shopeeData = JSON.parse(shopeeResults.content[0].text);
        products.push(...shopeeData.products.slice(0, 5).map(p => ({
          ...p,
          platform: 'shopee',
          id: p.itemId || Math.random().toString(36).substr(2, 9)
        })));
      } catch (error) {
        logger.error('Shopee fetch error:', error);
      }
    }
    
    // Analyze with AI
    const analysis = await contentService.analyzeProducts(products.slice(0, limit));
    
    res.json({
      success: true,
      products: analysis.products || products,
      insights: analysis.insights,
      totalFound: products.length
    });
  } catch (error) {
    logger.error('Trending products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate affiliate link
app.post('/api/affiliate/generate', async (req, res) => {
  try {
    const { platform, productId, url, campaignId = 'web_dashboard' } = req.body;
    let result;
    
    if (platform === 'amazon') {
      result = await amazonService.generateAffiliateLink(productId, campaignId);
    } else if (platform === 'shopee') {
      result = await shopeeService.generateAffiliateLink(url, campaignId);
    } else {
      throw new Error('Invalid platform');
    }
    
    const linkData = JSON.parse(result.content[0].text);
    res.json({ success: true, ...linkData });
  } catch (error) {
    logger.error('Affiliate link error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate content for product
app.post('/api/content/generate', async (req, res) => {
  try {
    const { product, platform = 'both', tone = 'friendly' } = req.body;
    
    const content = await contentService.generateContent(product, platform, tone);
    const contentData = JSON.parse(content.content[0].text);
    
    res.json({ success: true, content: contentData });
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
      amazon: [
        { id: 'all', name: 'Todos', icon: '🛍️' },
        { id: 'electronics', name: 'Eletrônicos', icon: '📱', trending: true },
        { id: 'home', name: 'Casa', icon: '🏠', trending: true },
        { id: 'beauty', name: 'Beleza', icon: '💄', trending: true },
        { id: 'fashion', name: 'Moda', icon: '👗', trending: true },
        { id: 'sports', name: 'Esportes', icon: '⚽' },
        { id: 'books', name: 'Livros', icon: '📚' },
        { id: 'toys', name: 'Brinquedos', icon: '🎮' }
      ],
      shopee: [
        { id: 'all', name: 'Todos', icon: '🛍️' },
        { id: 'eletronicos', name: 'Eletrônicos', icon: '📱', trending: true },
        { id: 'moda', name: 'Moda', icon: '👗', trending: true },
        { id: 'beleza', name: 'Beleza', icon: '💄', trending: true },
        { id: 'casa', name: 'Casa', icon: '🏠' },
        { id: 'esportes', name: 'Esportes', icon: '⚽' },
        { id: 'games', name: 'Games', icon: '🎮', trending: true }
      ],
      both: [
        { id: 'all', name: 'Todos', icon: '🛍️' },
        { id: 'electronics', name: 'Eletrônicos', icon: '📱', trending: true },
        { id: 'beauty', name: 'Beleza', icon: '💄', trending: true },
        { id: 'home', name: 'Casa', icon: '🏠', trending: true },
        { id: 'fashion', name: 'Moda', icon: '👗', trending: true }
      ]
    };
    
    res.json({
      success: true,
      categories: categories[platform] || categories.both
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create campaign from selected products
app.post('/api/campaign/create', async (req, res) => {
  try {
    const { products, campaignName, platforms = ['whatsapp'] } = req.body;
    const campaignId = `campaign_${Date.now()}`;
    
    const processedProducts = [];
    
    for (const product of products) {
      // Generate affiliate link
      let affiliateLink;
      if (product.platform === 'amazon') {
        const linkResult = await amazonService.generateAffiliateLink(product.id, campaignId);
        affiliateLink = JSON.parse(linkResult.content[0].text);
      } else {
        const linkResult = await shopeeService.generateAffiliateLink(product.url, campaignId);
        affiliateLink = JSON.parse(linkResult.content[0].text);
      }
      
      // Generate content
      const contentResult = await contentService.generateContent(product, platforms[0], 'friendly');
      const content = JSON.parse(contentResult.content[0].text);
      
      processedProducts.push({
        product,
        affiliateLink,
        content
      });
    }
    
    // Store campaign
    await cacheService.set(`campaign:${campaignId}`, {
      id: campaignId,
      name: campaignName,
      products: processedProducts,
      platforms,
      createdAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      campaignId,
      productsProcessed: processedProducts.length,
      products: processedProducts
    });
  } catch (error) {
    logger.error('Campaign creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Web dashboard running at http://localhost:${PORT}`);
  logger.info(`API endpoints available at http://localhost:${PORT}/api`);
  if (DEMO_MODE) {
    logger.info('🎮 Running in DEMO mode - no API credentials required');
  }
});

// Mock data for demo mode
function getMockProducts(platform, category) {
  const mockProducts = [
    {
      id: 'demo1',
      asin: 'B08N5WRWNB',
      platform: 'amazon',
      title: 'Echo Dot (4ª Geração) Smart Speaker com Alexa',
      price: { amount: 299.90, formatted: 'R$ 299,90', currency: 'BRL' },
      savings: { percentage: 40 },
      image: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
      reviews: { rating: 4.7, count: 50420 },
      category: 'electronics',
      url: 'https://www.amazon.com.br/dp/B08N5WRWNB',
      recommendationScore: 9.5,
      conversionPotential: 'alto'
    },
    {
      id: 'demo2',
      asin: 'B08MGWMBW1',
      platform: 'amazon',
      title: 'Kindle Paperwhite (8 GB) - Agora com tela de 6,8"',
      price: { amount: 599.00, formatted: 'R$ 599,00', currency: 'BRL' },
      savings: { percentage: 25 },
      image: 'https://m.media-amazon.com/images/I/61SrwJ8T4JL._AC_SL1000_.jpg',
      reviews: { rating: 4.6, count: 28350 },
      category: 'electronics',
      url: 'https://www.amazon.com.br/dp/B08MGWMBW1',
      recommendationScore: 9.0,
      conversionPotential: 'alto'
    },
    {
      id: 'demo3',
      platform: 'shopee',
      title: 'Fone de Ouvido Bluetooth TWS Pro 6',
      price: { amount: 89.90, formatted: 'R$ 89,90', currency: 'BRL' },
      savings: { percentage: 60 },
      image: 'https://cf.shopee.com.br/file/sg-11134201-22100-qgqxd89d7aiv29',
      sold: '10 mil vendidos',
      category: 'eletronicos',
      url: 'https://shopee.com.br/product/123456',
      recommendationScore: 8.5,
      conversionPotential: 'alto'
    },
    {
      id: 'demo4',
      platform: 'shopee',
      title: 'Kit 10 Máscaras Faciais Coreanas Hidratantes',
      price: { amount: 45.90, formatted: 'R$ 45,90', currency: 'BRL' },
      savings: { percentage: 50 },
      image: 'https://cf.shopee.com.br/file/br-11134207-7qukw-lf3hdpb8m5fv78',
      sold: '5 mil vendidos',
      category: 'beleza',
      url: 'https://shopee.com.br/product/789012',
      recommendationScore: 8.0,
      conversionPotential: 'médio'
    },
    {
      id: 'demo5',
      asin: 'B07FQK1TS9',
      platform: 'amazon',
      title: 'Fire TV Stick Lite com Controle Remoto por Voz',
      price: { amount: 199.90, formatted: 'R$ 199,90', currency: 'BRL' },
      savings: { percentage: 35 },
      image: 'https://m.media-amazon.com/images/I/51MXu-1TkpL._AC_SL1000_.jpg',
      reviews: { rating: 4.5, count: 35678 },
      category: 'electronics',
      url: 'https://www.amazon.com.br/dp/B07FQK1TS9',
      recommendationScore: 8.8,
      conversionPotential: 'alto'
    },
    {
      id: 'demo6',
      platform: 'shopee',
      title: 'Smartwatch D20 Y68 Monitor Cardíaco',
      price: { amount: 59.90, formatted: 'R$ 59,90', currency: 'BRL' },
      savings: { percentage: 70 },
      image: 'https://cf.shopee.com.br/file/br-11134207-7r98p-lmrnpefbcvh748',
      sold: '20 mil vendidos',
      category: 'eletronicos',
      url: 'https://shopee.com.br/product/345678',
      recommendationScore: 7.5,
      conversionPotential: 'médio'
    },
    {
      id: 'demo7',
      asin: 'B09JVKXB2F',
      platform: 'amazon',
      title: 'Robô Aspirador Inteligente Wi-Fi',
      price: { amount: 899.00, formatted: 'R$ 899,00', currency: 'BRL' },
      savings: { percentage: 30 },
      image: 'https://m.media-amazon.com/images/I/61J-Gu29CmL._AC_SL1500_.jpg',
      reviews: { rating: 4.4, count: 12890 },
      category: 'home',
      url: 'https://www.amazon.com.br/dp/B09JVKXB2F',
      recommendationScore: 8.2,
      conversionPotential: 'médio'
    },
    {
      id: 'demo8',
      platform: 'shopee',
      title: 'Kit Organizador de Maquiagem Acrílico',
      price: { amount: 79.90, formatted: 'R$ 79,90', currency: 'BRL' },
      savings: { percentage: 45 },
      image: 'https://cf.shopee.com.br/file/sg-11134201-22110-h4oxxb7x7ejv76',
      sold: '8 mil vendidos',
      category: 'beleza',
      url: 'https://shopee.com.br/product/901234',
      recommendationScore: 7.8,
      conversionPotential: 'médio'
    },
    {
      id: 'demo9',
      asin: 'B08C1W5N87',
      platform: 'amazon',
      title: 'Ring Alarm Kit 5 peças - Sistema de Segurança',
      price: { amount: 1299.00, formatted: 'R$ 1.299,00', currency: 'BRL' },
      savings: { percentage: 20 },
      image: 'https://m.media-amazon.com/images/I/71J3pksjq5L._AC_SL1500_.jpg',
      reviews: { rating: 4.6, count: 8765 },
      category: 'home',
      url: 'https://www.amazon.com.br/dp/B08C1W5N87',
      recommendationScore: 7.5,
      conversionPotential: 'médio'
    },
    {
      id: 'demo10',
      platform: 'shopee',
      title: 'Luminária RGB LED Gaming Setup',
      price: { amount: 129.90, formatted: 'R$ 129,90', currency: 'BRL' },
      savings: { percentage: 55 },
      image: 'https://cf.shopee.com.br/file/br-11134207-7r990-lkt1h9kh7reb95',
      sold: '15 mil vendidos',
      category: 'casa',
      url: 'https://shopee.com.br/product/567890',
      recommendationScore: 8.0,
      conversionPotential: 'alto'
    }
  ];

  // Filter by platform
  let filtered = mockProducts;
  if (platform !== 'both') {
    filtered = filtered.filter(p => p.platform === platform);
  }

  // Filter by category if provided
  if (category && category !== 'all') {
    filtered = filtered.filter(p => 
      p.category === category || 
      (category === 'electronics' && p.category === 'eletronicos') ||
      (category === 'beauty' && p.category === 'beleza') ||
      (category === 'home' && p.category === 'casa')
    );
  }

  return filtered;
}
