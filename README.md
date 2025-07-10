# Affiliate MCP Server

A comprehensive MCP (Model Context Protocol) server for automating affiliate marketing with Amazon Brazil and Shopee. This server provides tools for product discovery, affiliate link generation, AI-powered content creation, and automated posting to WhatsApp and Instagram.

## Features

### 🔍 Product Discovery
- **Amazon Brazil Integration**: Search products using PA-API 5.0
- **Shopee Integration**: Web scraping for product discovery
- **Advanced Filtering**: Price ranges, categories, and more
- **Product Details**: Comprehensive information including reviews and ratings

### 🔗 Affiliate Link Generation
- **Amazon Associates**: Automatic affiliate link creation with tracking
- **Shopee Affiliates**: Support for Ecomobi and Admitad networks
- **Campaign Tracking**: Custom campaign IDs for performance monitoring
- **URL Shortening**: Clean, shareable links

### ✨ AI-Powered Content
- **Claude Sonnet 4 Integration**: Intelligent promotional content generation
- **DALL-E 3**: Custom product image creation
- **Platform Optimization**: Tailored content for WhatsApp and Instagram
- **Brazilian Portuguese**: Native language support with cultural adaptation

### 📱 Social Media Automation
- **WhatsApp Business API**: Send individual and bulk messages
- **Instagram Integration**: Create posts, stories, and reels
- **Smart Scheduling**: Optimal posting times for Brazilian audience
- **Compliance**: LGPD and platform policy adherence

### 📊 Analytics & Optimization
- **Campaign Management**: Multi-platform campaign orchestration
- **Performance Tracking**: Click tracking and conversion monitoring
- **A/B Testing**: Content optimization based on engagement
- **Best Time Analysis**: Data-driven posting schedule recommendations

## Prerequisites

- Node.js 18+ 
- Redis (for caching)
- MongoDB (optional, for persistent storage)
- API Keys:
  - Amazon PA-API credentials
  - Anthropic API key (Claude)
  - OpenAI API key (optional, for DALL-E)
  - WhatsApp Business API access
  - Instagram Business Account
  - Shopee affiliate network account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/affiliate-mcp-server.git
cd affiliate-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API credentials
```

4. Start Redis:
```bash
redis-server
```

5. Run the server:
```bash
npm start
```

## MCP Client Configuration

Add to your MCP client settings:

```json
{
  "mcpServers": {
    "affiliate-server": {
      "command": "node",
      "args": ["/path/to/affiliate-mcp-server/src/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Available Tools

### Product Discovery & Analysis Tools

#### `discover_trending_products`
Discover trending products with AI analysis and recommendations.
```json
{
  "platform": "both",
  "category": "electronics",
  "priceRange": {
    "min": 100,
    "max": 1000
  },
  "limit": 10
}
```

#### `get_product_categories`
Get available product categories for browsing.
```json
{
  "platform": "amazon"
}
```

#### `create_affiliate_campaign_batch`
Create affiliate links and content for multiple selected products.
```json
{
  "products": [
    {
      "platform": "amazon",
      "asin": "B08N5WRWNB"
    },
    {
      "platform": "shopee",
      "url": "https://shopee.com.br/product-url"
    }
  ],
  "campaignName": "Tech Tuesday Deals",
  "contentTone": "urgent",
  "platforms": ["whatsapp", "instagram"]
}
```

### Scheduling Tools

#### `schedule_campaign_posts`
Schedule posts for a campaign across multiple platforms.
```json
{
  "campaignId": "campaign_123456",
  "schedule": {
    "startDate": "2024-01-15",
    "endDate": "2024-01-31",
    "times": ["09:00", "19:00"],
    "days": ["monday", "wednesday", "friday"],
    "timezone": "America/Sao_Paulo"
  },
  "platforms": ["whatsapp", "instagram"],
  "recipients": ["5511999999999"]
}
```

#### `get_scheduled_posts`
View all scheduled posts with filtering options.
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-31",
  "platform": "whatsapp",
  "status": "scheduled"
}
```

### Product Search Tools

#### `search_amazon_products`
Search for products on Amazon Brazil.
```json
{
  "keywords": "smartphone samsung",
  "category": "electronics",
  "minPrice": 1000,
  "maxPrice": 3000
}
```

#### `search_shopee_products`
Search for products on Shopee Brazil.
```json
{
  "keywords": "tênis nike",
  "minPrice": 100,
  "maxPrice": 500
}
```

### Affiliate Link Tools

#### `generate_amazon_affiliate_link`
Generate Amazon affiliate link with tracking.
```json
{
  "asin": "B08N5WRWNB",
  "campaignId": "black_friday_2024"
}
```

#### `generate_shopee_affiliate_link`
Generate Shopee affiliate link.
```json
{
  "productUrl": "https://shopee.com.br/product-url",
  "campaignId": "promo_janeiro"
}
```

### Content Generation Tools

#### `generate_promotional_content`
Create AI-powered promotional content.
```json
{
  "productData": {
    "name": "Echo Dot 4ª Geração",
    "price": 299.90,
    "description": "Smart speaker com Alexa",
    "features": ["Controle por voz", "Casa inteligente"],
    "imageUrl": "https://example.com/image.jpg"
  },
  "platform": "whatsapp",
  "tone": "friendly"
}
```

### Messaging Tools

#### `send_whatsapp_message`
Send individual WhatsApp message.
```json
{
  "recipient": "5511999999999",
  "content": "🎉 Oferta Imperdível! Echo Dot com 40% OFF...",
  "mediaUrl": "https://example.com/product.jpg"
}
```

#### `send_whatsapp_bulk`
Send bulk WhatsApp messages.
```json
{
  "recipients": ["5511999999999", "5511888888888"],
  "content": "Promoção exclusiva para você!",
  "batchSize": 10,
  "delayMs": 5000
}
```

#### `post_to_instagram`
Create Instagram content.
```json
{
  "type": "post",
  "caption": "Novidade chegando! 🚀\n\n#oferta #brasil",
  "mediaUrl": "https://example.com/image.jpg",
  "schedule": "2024-01-15T18:00:00Z"
}
```

### Campaign Tools

#### `create_campaign`
Create multi-platform campaign.
```json
{
  "name": "Campanha Verão 2024",
  "products": [
    {"platform": "amazon", "productId": "B08N5WRWNB"},
    {"platform": "shopee", "productId": "12345"}
  ],
  "platforms": ["whatsapp", "instagram"],
  "schedule": {
    "startDate": "2024-01-15",
    "endDate": "2024-01-31",
    "frequency": "daily"
  }
}
```

## Usage Examples

### Example 1: Complete Workflow - Discover, Select, and Schedule

```javascript
// 1. Discover trending products with AI analysis
const trending = await discoverTrendingProducts({
  platform: "both",
  category: "electronics",
  priceRange: { min: 100, max: 500 },
  limit: 10
});

// AI provides recommendations like:
// {
//   "recommendations": [
//     {
//       "product": "Echo Dot 4ª Geração",
//       "score": 9.5,
//       "reason": "Alta demanda, 45% desconto, avaliação 4.8"
//     }
//   ],
//   "insights": {
//     "trends": "Smart home devices em alta para o verão",
//     "bestPlatforms": ["whatsapp"],
//     "conversionPotential": "alto"
//   }
// }

// 2. Create campaign with selected products
const campaign = await createAffiliateCampaignBatch({
  products: [
    { platform: "amazon", asin: "B08N5WRWNB" },
    { platform: "shopee", url: "https://shopee.com.br/smart-lamp" }
  ],
  campaignName: "Smart Home Week",
  contentTone: "friendly",
  platforms: ["whatsapp", "instagram"]
});

// 3. Schedule automated posting
const scheduled = await scheduleCampaignPosts({
  campaignId: campaign.campaignId,
  schedule: {
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    times: ["09:00", "19:00"],  // Best times from AI analysis
    days: ["tuesday", "thursday", "saturday"]
  },
  platforms: ["whatsapp", "instagram"],
  recipients: ["5511999999999", "5511888888888"]
});

// 4. Monitor scheduled posts
const posts = await getScheduledPosts({
  startDate: "2024-01-15",
  platform: "all",
  status: "scheduled"
});
```

### Example 2: Browse Categories and Select Products

```javascript
// 1. Browse available categories
const categories = await getProductCategories({
  platform: "amazon"
});
// Returns:
// {
//   "categories": [
//     { "id": "electronics", "name": "Eletrônicos", "trending": true },
//     { "id": "beauty", "name": "Beleza", "trending": true },
//     ...
//   ]
// }

// 2. Get trending products from a specific category
const beautyProducts = await discoverTrendingProducts({
  platform: "amazon",
  category: "beauty",
  limit: 5
});

// 3. Claude provides insights:
// "Produtos de skincare coreana estão em alta demanda.
//  Recomendo focar em máscaras faciais e séruns.
//  Melhor conversão: Instagram Stories às 21h"
```

### Example 3: Find and Promote Amazon Product

```javascript
// 1. Search for product
const products = await searchAmazonProducts({
  keywords: "kindle paperwhite",
  maxPrice: 1000
});

// 2. Generate affiliate link
const affiliate = await generateAmazonAffiliateLink({
  asin: products[0].asin,
  campaignId: "kindle_promo"
});

// 3. Create promotional content
const content = await generatePromotionalContent({
  productData: products[0],
  platform: "both",
  tone: "urgent"
});

// 4. Send to WhatsApp
await sendWhatsAppBulk({
  recipients: ["5511999999999"],
  content: content.whatsapp.text,
  mediaUrl: content.whatsapp.media.url
});

// 5. Post to Instagram
await postToInstagram({
  type: "post",
  caption: content.instagram.text,
  mediaUrl: content.instagram.media.url
});
```

### Example 4: Shopee Flash Sale Campaign

```javascript
// 1. Find Shopee products on sale
const products = await searchShopeeProducts({
  keywords: "fone bluetooth",
  maxPrice: 200
});

// 2. Generate content for each product
for (const product of products.slice(0, 5)) {
  const link = await generateShopeeAffiliateLink({
    productUrl: product.url,
    campaignId: "flash_sale"
  });
  
  const content = await generatePromotionalContent({
    productData: product,
    platform: "whatsapp",
    tone: "urgent"
  });
  
  // 3. Send to WhatsApp groups
  await sendWhatsAppMessage({
    recipient: "5511999999999",
    content: content.text + "\n\n" + link.shortLink
  });
}
```

## API Integration Details

### Amazon PA-API 5.0

- **Rate Limits**: 1 request per second initially
- **Caching**: 1-hour TTL for product data
- **Marketplace**: www.amazon.com.br
- **Required Scopes**: Product Advertising API access

### WhatsApp Business API

- **Provider Options**: Zenvia, Take Blip, Infobip
- **Message Types**: Text, Image, Document
- **Rate Limits**: 10 messages per second
- **Compliance**: Double opt-in required

### Instagram Graph API

- **Content Types**: Feed posts, Stories, Reels
- **Media Requirements**: JPEG/PNG for images, MP4 for videos
- **Scheduling**: Via Facebook Page API
- **Analytics**: Insights API for performance tracking

## Best Practices

### Content Creation
- Keep WhatsApp messages under 1000 characters
- Use emoji strategically for engagement
- Include clear CTAs in all content
- Test different tones for your audience

### Posting Schedule
- **WhatsApp Peak**: 19:00-21:00 BRT
- **Instagram Peak**: 18:00 Thursday
- **Avoid**: 02:00-06:00, 14:00-16:00
- **Best Days**: Tuesday, Thursday, Saturday

### Compliance
- Always obtain opt-in consent for WhatsApp
- Follow LGPD data protection requirements
- Respect platform rate limits
- Use approved message templates

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis is running: `redis-cli ping`
   - Check REDIS_URL in .env

2. **Amazon API Errors**
   - Verify API credentials
   - Check rate limit status
   - Ensure Associate tag is valid

3. **WhatsApp Message Failed**
   - Verify phone number format (include country code)
   - Check opt-in consent
   - Ensure API key is valid

4. **Instagram Post Failed**
   - Verify Business Account setup
   - Check access token permissions
   - Ensure media URLs are publicly accessible

## Development

### Running Tests
```bash
npm test
```

### Debug Mode
```bash
LOG_LEVEL=debug npm start
```

### Adding New Tools
1. Define tool in `src/index.js`
2. Implement service in `src/services/`
3. Add tests in `tests/`
4. Update documentation

## Security Considerations

- Store API keys securely using environment variables
- Implement rate limiting for all external APIs
- Validate and sanitize all user inputs
- Use HTTPS for all webhook endpoints
- Regularly rotate API credentials
- Monitor for suspicious activity

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/affiliate-mcp-server/issues)
- Documentation: [Wiki](https://github.com/yourusername/affiliate-mcp-server/wiki)

## Acknowledgments

- Amazon Product Advertising API
- WhatsApp Business Platform
- Instagram Graph API
- Anthropic Claude Sonnet 4
- OpenAI DALL-E (optional for image generation)
- Model Context Protocol (MCP) by Anthropic
