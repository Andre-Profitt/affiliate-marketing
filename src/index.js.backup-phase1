import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { AmazonProductService } from './services/amazonService.js';
import { ShopeeProductService } from './services/shopeeService.js';
import { ContentGeneratorService } from './services/contentService.js';
import { WhatsAppService } from './services/whatsappService.js';
import { InstagramService } from './services/instagramService.js';
import { CacheService } from './services/cacheService.js';
import { SchedulingService } from './services/schedulingService.js';
import { logger } from './utils/logger.js';

dotenv.config();

// Initialize services
const amazonService = new AmazonProductService();
const shopeeService = new ShopeeProductService();
const contentService = new ContentGeneratorService();
const whatsappService = new WhatsAppService();
const instagramService = new InstagramService();
const cacheService = new CacheService();
const schedulingService = new SchedulingService();

// Define available tools
const tools = [
  {
    name: 'discover_trending_products',
    description: 'Discover trending products with AI analysis and recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { 
          type: 'string', 
          enum: ['amazon', 'shopee', 'both'],
          description: 'Platform to search' 
        },
        category: { 
          type: 'string', 
          description: 'Product category (optional)' 
        },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' }
          }
        },
        limit: { 
          type: 'number', 
          description: 'Number of products to return (default: 10)' 
        }
      },
      required: ['platform']
    }
  },
  {
    name: 'get_product_categories',
    description: 'Get available product categories for browsing',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { 
          type: 'string', 
          enum: ['amazon', 'shopee'],
          description: 'Platform to get categories from' 
        }
      },
      required: ['platform']
    }
  },
  {
    name: 'create_affiliate_campaign_batch',
    description: 'Create affiliate links and content for multiple selected products',
    inputSchema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string', enum: ['amazon', 'shopee'] },
              productId: { type: 'string' },
              asin: { type: 'string' },
              url: { type: 'string' }
            }
          },
          description: 'Array of products to process'
        },
        campaignName: { type: 'string' },
        contentTone: { 
          type: 'string',
          enum: ['casual', 'professional', 'urgent', 'friendly'] 
        },
        platforms: {
          type: 'array',
          items: { type: 'string', enum: ['whatsapp', 'instagram'] },
          description: 'Target platforms for content'
        }
      },
      required: ['products', 'campaignName', 'platforms']
    }
  },
  {
    name: 'schedule_campaign_posts',
    description: 'Schedule posts for a campaign across multiple platforms',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string' },
        schedule: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'ISO 8601 date' },
            endDate: { type: 'string', description: 'ISO 8601 date' },
            times: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Times to post each day (e.g., ["09:00", "19:00"])' 
            },
            days: {
              type: 'array',
              items: { 
                type: 'string',
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
              },
              description: 'Days of week to post'
            },
            timezone: { type: 'string', description: 'Timezone (default: America/Sao_Paulo)' }
          },
          required: ['startDate', 'times']
        },
        platforms: {
          type: 'array',
          items: { type: 'string', enum: ['whatsapp', 'instagram'] }
        },
        recipients: {
          type: 'array',
          items: { type: 'string' },
          description: 'WhatsApp recipients (optional)'
        }
      },
      required: ['campaignId', 'schedule', 'platforms']
    }
  },
  {
    name: 'get_scheduled_posts',
    description: 'View all scheduled posts',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Filter by start date' },
        endDate: { type: 'string', description: 'Filter by end date' },
        platform: { type: 'string', enum: ['whatsapp', 'instagram', 'all'] },
        status: { type: 'string', enum: ['pending', 'sent', 'failed', 'all'] }
      }
    }
  },
  {
    name: 'search_amazon_products',
    description: 'Search for products on Amazon Brazil',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search keywords' },
        category: { type: 'string', description: 'Product category (optional)' },
        minPrice: { type: 'number', description: 'Minimum price in BRL (optional)' },
        maxPrice: { type: 'number', description: 'Maximum price in BRL (optional)' }
      },
      required: ['keywords']
    }
  },
  {
    name: 'get_amazon_product_details',
    description: 'Get detailed information about an Amazon product',
    inputSchema: {
      type: 'object',
      properties: {
        asin: { type: 'string', description: 'Amazon ASIN' }
      },
      required: ['asin']
    }
  },
  {
    name: 'generate_amazon_affiliate_link',
    description: 'Generate affiliate link for Amazon product',
    inputSchema: {
      type: 'object',
      properties: {
        asin: { type: 'string', description: 'Amazon ASIN' },
        campaignId: { type: 'string', description: 'Campaign ID for tracking' }
      },
      required: ['asin']
    }
  },
  {
    name: 'search_shopee_products',
    description: 'Search for products on Shopee Brazil',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search keywords' },
        minPrice: { type: 'number', description: 'Minimum price in BRL (optional)' },
        maxPrice: { type: 'number', description: 'Maximum price in BRL (optional)' }
      },
      required: ['keywords']
    }
  },
  {
    name: 'generate_shopee_affiliate_link',
    description: 'Generate affiliate link for Shopee product',
    inputSchema: {
      type: 'object',
      properties: {
        productUrl: { type: 'string', description: 'Shopee product URL' },
        campaignId: { type: 'string', description: 'Campaign ID for tracking' }
      },
      required: ['productUrl']
    }
  },
  {
    name: 'generate_promotional_content',
    description: 'Generate AI-powered promotional content for a product',
    inputSchema: {
      type: 'object',
      properties: {
        productData: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            imageUrl: { type: 'string' }
          },
          required: ['name', 'price']
        },
        platform: { 
          type: 'string', 
          enum: ['whatsapp', 'instagram', 'both'],
          description: 'Target platform for content'
        },
        tone: {
          type: 'string',
          enum: ['casual', 'professional', 'urgent', 'friendly'],
          description: 'Tone of the content'
        }
      },
      required: ['productData', 'platform']
    }
  },
  {
    name: 'send_whatsapp_message',
    description: 'Send promotional message via WhatsApp',
    inputSchema: {
      type: 'object',
      properties: {
        recipient: { type: 'string', description: 'WhatsApp number (with country code)' },
        content: { type: 'string', description: 'Message content' },
        mediaUrl: { type: 'string', description: 'URL of media to attach (optional)' },
        schedule: { type: 'string', description: 'ISO 8601 datetime to schedule (optional)' }
      },
      required: ['recipient', 'content']
    }
  },
  {
    name: 'send_whatsapp_bulk',
    description: 'Send promotional messages to multiple WhatsApp contacts',
    inputSchema: {
      type: 'object',
      properties: {
        recipients: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of WhatsApp numbers'
        },
        content: { type: 'string', description: 'Message content' },
        mediaUrl: { type: 'string', description: 'URL of media to attach (optional)' },
        batchSize: { type: 'number', description: 'Messages per batch (default: 10)' },
        delayMs: { type: 'number', description: 'Delay between batches in ms (default: 5000)' }
      },
      required: ['recipients', 'content']
    }
  },
  {
    name: 'post_to_instagram',
    description: 'Create Instagram post or story',
    inputSchema: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          enum: ['post', 'story', 'reel'],
          description: 'Type of Instagram content'
        },
        caption: { type: 'string', description: 'Post caption with hashtags' },
        mediaUrl: { type: 'string', description: 'URL of image or video' },
        schedule: { type: 'string', description: 'ISO 8601 datetime to schedule (optional)' }
      },
      required: ['type', 'caption', 'mediaUrl']
    }
  },
  {
    name: 'analyze_best_posting_time',
    description: 'Analyze best times to post based on audience engagement',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { 
          type: 'string', 
          enum: ['whatsapp', 'instagram'],
          description: 'Platform to analyze'
        },
        timezone: { 
          type: 'string', 
          description: 'Timezone (default: America/Sao_Paulo)' 
        }
      },
      required: ['platform']
    }
  },
  {
    name: 'create_campaign',
    description: 'Create a multi-platform promotional campaign',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Campaign name' },
        products: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string', enum: ['amazon', 'shopee'] },
              productId: { type: 'string' }
            }
          }
        },
        platforms: {
          type: 'array',
          items: { type: 'string', enum: ['whatsapp', 'instagram'] }
        },
        schedule: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            frequency: { type: 'string', enum: ['once', 'daily', 'weekly'] }
          }
        }
      },
      required: ['name', 'products', 'platforms']
    }
  },
  {
    name: 'get_campaign_analytics',
    description: 'Get analytics for affiliate campaigns',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID (optional for all campaigns)' },
        startDate: { type: 'string', description: 'Start date ISO 8601' },
        endDate: { type: 'string', description: 'End date ISO 8601' }
      },
      required: ['startDate', 'endDate']
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'affiliate-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    logger.info(`Executing tool: ${name}`, { args });
    
    switch (name) {
      case 'discover_trending_products':
        return await discoverTrendingProducts(args);
        
      case 'get_product_categories':
        return await getProductCategories(args);
        
      case 'create_affiliate_campaign_batch':
        return await createAffiliateCampaignBatch(args);
        
      case 'schedule_campaign_posts':
        return await scheduleCampaignPosts(args);
        
      case 'get_scheduled_posts':
        return await getScheduledPosts(args);
        
      case 'search_amazon_products':
        return await amazonService.searchProducts(args);
        
      case 'get_amazon_product_details':
        return await amazonService.getProductDetails(args.asin);
        
      case 'generate_amazon_affiliate_link':
        return await amazonService.generateAffiliateLink(args.asin, args.campaignId);
        
      case 'search_shopee_products':
        return await shopeeService.searchProducts(args);
        
      case 'generate_shopee_affiliate_link':
        return await shopeeService.generateAffiliateLink(args.productUrl, args.campaignId);
        
      case 'generate_promotional_content':
        return await contentService.generateContent(args.productData, args.platform, args.tone);
        
      case 'send_whatsapp_message':
        return await whatsappService.sendMessage(args);
        
      case 'send_whatsapp_bulk':
        return await whatsappService.sendBulkMessages(args);
        
      case 'post_to_instagram':
        return await instagramService.createPost(args);
        
      case 'analyze_best_posting_time':
        return await contentService.analyzeBestPostingTime(args.platform, args.timezone);
        
      case 'create_campaign':
        return await createCampaign(args);
        
      case 'get_campaign_analytics':
        return await getCampaignAnalytics(args);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Tool execution error: ${name}`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`
        }
      ]
    };
  }
});

// Product discovery functions
async function discoverTrendingProducts(args) {
  const { platform, category, priceRange, limit = 10 } = args;
  
  try {
    let allProducts = [];
    
    // Fetch products from platforms
    if (platform === 'amazon' || platform === 'both') {
      const amazonResults = await amazonService.searchProducts({
        keywords: category || 'mais vendidos',
        category,
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max
      });
      const amazonProducts = JSON.parse(amazonResults.content[0].text).products;
      allProducts.push(...amazonProducts.map(p => ({ ...p, platform: 'amazon' })));
    }
    
    if (platform === 'shopee' || platform === 'both') {
      const shopeeResults = await shopeeService.searchProducts({
        keywords: category || 'promoção',
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max
      });
      const shopeeProducts = JSON.parse(shopeeResults.content[0].text).products;
      allProducts.push(...shopeeProducts.map(p => ({ ...p, platform: 'shopee' })));
    }
    
    // Use AI to analyze and recommend products
    const analysis = await contentService.analyzeProducts(allProducts.slice(0, limit));
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          totalFound: allProducts.length,
          analyzed: limit,
          recommendations: analysis.recommendations,
          products: analysis.products,
          insights: analysis.insights
        }, null, 2)
      }]
    };
  } catch (error) {
    logger.error('Product discovery error:', error);
    throw error;
  }
}

async function getProductCategories(args) {
  const { platform } = args;
  
  const categories = {
    amazon: [
      { id: 'electronics', name: 'Eletrônicos', trending: true },
      { id: 'books', name: 'Livros', trending: false },
      { id: 'home', name: 'Casa e Cozinha', trending: true },
      { id: 'fashion', name: 'Moda Feminina', trending: true },
      { id: 'beauty', name: 'Beleza', trending: true },
      { id: 'sports', name: 'Esportes e Lazer', trending: false },
      { id: 'toys', name: 'Brinquedos e Jogos', trending: false },
      { id: 'automotive', name: 'Automotivo', trending: false },
      { id: 'grocery', name: 'Alimentos e Bebidas', trending: true },
      { id: 'health', name: 'Saúde e Cuidados Pessoais', trending: true }
    ],
    shopee: [
      { id: 'eletronicos', name: 'Eletrônicos', trending: true },
      { id: 'moda', name: 'Moda e Acessórios', trending: true },
      { id: 'beleza', name: 'Beleza e Saúde', trending: true },
      { id: 'casa', name: 'Casa e Decoração', trending: false },
      { id: 'esportes', name: 'Esportes e Lazer', trending: false },
      { id: 'brinquedos', name: 'Brinquedos', trending: false },
      { id: 'pets', name: 'Pets', trending: true },
      { id: 'papelaria', name: 'Papelaria', trending: false },
      { id: 'games', name: 'Games', trending: true },
      { id: 'bebes', name: 'Bebês', trending: false }
    ]
  };
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        platform,
        categories: categories[platform] || [],
        totalCategories: categories[platform]?.length || 0
      }, null, 2)
    }]
  };
}

async function createAffiliateCampaignBatch(args) {
  const { products, campaignName, contentTone = 'friendly', platforms } = args;
  
  try {
    const campaignId = `campaign_${Date.now()}`;
    const processedProducts = [];
    
    for (const product of products) {
      let affiliateLink;
      let productDetails;
      
      // Generate affiliate link
      if (product.platform === 'amazon') {
        affiliateLink = await amazonService.generateAffiliateLink(product.asin || product.productId, campaignId);
        productDetails = await amazonService.getProductDetails(product.asin || product.productId);
      } else if (product.platform === 'shopee') {
        affiliateLink = await shopeeService.generateAffiliateLink(product.url, campaignId);
        productDetails = await shopeeService.getProductDetails(product.url);
      }
      
      // Generate content for each platform
      const content = {};
      for (const platform of platforms) {
        const generatedContent = await contentService.generateContent(
          productDetails,
          platform,
          contentTone
        );
        content[platform] = JSON.parse(generatedContent.content[0].text);
      }
      
      processedProducts.push({
        product: productDetails,
        affiliateLink: JSON.parse(affiliateLink.content[0].text),
        content,
        platform: product.platform
      });
    }
    
    // Store campaign data
    await cacheService.set(`campaign:${campaignId}`, {
      id: campaignId,
      name: campaignName,
      products: processedProducts,
      platforms,
      contentTone,
      createdAt: new Date().toISOString(),
      status: 'ready'
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          campaignId,
          campaignName,
          productsProcessed: processedProducts.length,
          platforms,
          status: 'ready',
          message: 'Campaign created successfully. Use schedule_campaign_posts to schedule distribution.'
        }, null, 2)
      }]
    };
  } catch (error) {
    logger.error('Batch campaign creation error:', error);
    throw error;
  }
}

async function scheduleCampaignPosts(args) {
  const { campaignId, schedule, platforms, recipients } = args;
  
  try {
    // Get campaign data
    const campaign = await cacheService.get(`campaign:${campaignId}`);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    const scheduledPosts = [];
    const { startDate, endDate, times, days, timezone = 'America/Sao_Paulo' } = schedule;
    
    // Generate schedule dates
    const scheduleData = generateScheduleDates({
      startDate,
      endDate,
      times,
      days,
      timezone
    });
    
    // Create scheduled posts for each date/time
    let productIndex = 0;
    for (const scheduledTime of scheduleData) {
      const product = campaign.products[productIndex % campaign.products.length];
      
      for (const platform of platforms) {
        const post = {
          id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          campaignId,
          product: product.product,
          affiliateLink: product.affiliateLink,
          content: product.content[platform],
          platform,
          scheduledTime,
          recipients: platform === 'whatsapp' ? recipients : null,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };
        
        scheduledPosts.push(post);
        
        // Store each scheduled post
        await cacheService.set(`scheduled:${post.id}`, post, 30 * 24 * 3600); // 30 days TTL
      }
      
      productIndex++;
    }
    
    // Update campaign with schedule info
    campaign.schedule = schedule;
    campaign.scheduledPosts = scheduledPosts.map(p => p.id);
    await cacheService.set(`campaign:${campaignId}`, campaign);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          campaignId,
          totalPostsScheduled: scheduledPosts.length,
          platforms,
          schedule: {
            ...schedule,
            timezone
          },
          firstPost: scheduledPosts[0]?.scheduledTime,
          lastPost: scheduledPosts[scheduledPosts.length - 1]?.scheduledTime,
          message: 'Posts scheduled successfully'
        }, null, 2)
      }]
    };
  } catch (error) {
    logger.error('Schedule campaign error:', error);
    throw error;
  }
}

async function getScheduledPosts(args) {
  const { startDate, endDate, platform = 'all', status = 'all' } = args;
  
  try {
    // In production, this would query a database
    // For now, we'll return mock data
    const scheduledPosts = [
      {
        id: 'post_123',
        campaignId: 'campaign_456',
        platform: 'whatsapp',
        scheduledTime: '2024-01-15T19:00:00Z',
        status: 'scheduled',
        product: { name: 'Echo Dot 4ª Geração' }
      },
      {
        id: 'post_124',
        campaignId: 'campaign_456',
        platform: 'instagram',
        scheduledTime: '2024-01-15T18:00:00Z',
        status: 'scheduled',
        product: { name: 'Kindle Paperwhite' }
      }
    ];
    
    // Filter by criteria
    let filtered = scheduledPosts;
    
    if (platform !== 'all') {
      filtered = filtered.filter(p => p.platform === platform);
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.scheduledTime) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.scheduledTime) <= new Date(endDate));
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          totalPosts: filtered.length,
          filters: { platform, status, startDate, endDate },
          posts: filtered
        }, null, 2)
      }]
    };
  } catch (error) {
    logger.error('Get scheduled posts error:', error);
    throw error;
  }
}

// Helper function to generate schedule dates
function generateScheduleDates({ startDate, endDate, times, days, timezone }) {
  const dates = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
  
  const dayMap = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  const allowedDays = days ? days.map(d => dayMap[d.toLowerCase()]) : [0, 1, 2, 3, 4, 5, 6];
  
  let current = new Date(start);
  while (current <= end) {
    if (allowedDays.includes(current.getDay())) {
      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduled = new Date(current);
        scheduled.setHours(hours, minutes, 0, 0);
        dates.push(scheduled.toISOString());
      }
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Campaign management functions
async function createCampaign(args) {
  const { name, products, platforms, schedule } = args;
  
  // Generate content for each product
  const contents = [];
  for (const product of products) {
    let productData;
    
    if (product.platform === 'amazon') {
      productData = await amazonService.getProductDetails(product.productId);
    } else if (product.platform === 'shopee') {
      productData = await shopeeService.getProductDetails(product.productId);
    }
    
    for (const platform of platforms) {
      const content = await contentService.generateContent(productData, platform);
      contents.push({
        product: productData,
        platform,
        content
      });
    }
  }
  
  // Store campaign data
  const campaignId = `campaign_${Date.now()}`;
  await cacheService.set(`campaign:${campaignId}`, {
    name,
    products,
    platforms,
    schedule,
    contents,
    createdAt: new Date().toISOString()
  });
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          campaignId,
          message: 'Campaign created successfully',
          totalContent: contents.length
        }, null, 2)
      }
    ]
  };
}

async function getCampaignAnalytics(args) {
  // Placeholder for analytics implementation
  const analytics = {
    period: {
      start: args.startDate,
      end: args.endDate
    },
    metrics: {
      totalClicks: 0,
      totalRevenue: 0,
      conversionRate: 0,
      topProducts: [],
      platformPerformance: {
        whatsapp: { sent: 0, clicked: 0 },
        instagram: { posts: 0, engagement: 0 }
      }
    }
  };
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(analytics, null, 2)
      }
    ]
  };
}

// Start server
async function main() {
  logger.info('Starting Affiliate MCP Server...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('Affiliate MCP Server running');
}

main().catch((error) => {
  logger.error('Server startup error:', error);
  process.exit(1);
});
