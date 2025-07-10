# Affiliate Dashboard - Web Interface

A beautiful web dashboard for managing affiliate marketing campaigns with Amazon and Shopee products.

## Features

### 🎯 Product Discovery
- **AI-Powered Analysis**: Claude Sonnet 4 analyzes products and provides insights
- **Trending Products**: Automatically fetches top 10 trending products
- **Platform Filtering**: Switch between Amazon, Shopee, or both
- **Category Browsing**: Filter by categories with trend indicators

### 🔗 Affiliate Management
- **One-Click Links**: Generate affiliate links instantly
- **Batch Processing**: Select multiple products for campaigns
- **Campaign Creation**: Create multi-product campaigns with AI content
- **Link Tracking**: Custom campaign IDs for analytics

### 💅 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live product selection and stats
- **Beautiful Cards**: Product cards with images, prices, and ratings
- **Smooth Animations**: Professional transitions and effects

## Getting Started

### Prerequisites
- Affiliate MCP Server running
- Node.js 18+
- API credentials configured in `.env`

### Installation

1. Navigate to the project:
```bash
cd /Users/andreprofitt/affiliate-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the web server:
```bash
npm run web
```

4. Open your browser:
```
http://localhost:3001
```

## Usage

### 1. Browse Products
- Select platform (Amazon/Shopee/Both)
- Choose category
- Products load automatically with AI insights

### 2. Generate Affiliate Links
- Click "🔗 Gerar Link" on any product
- Link is generated and ready to copy
- Includes tracking for analytics

### 3. Create Campaigns
- Select multiple products (click "+ Selecionar")
- Click "Criar Campanha" button
- Enter campaign name
- Get affiliate links + AI content for all products

### 4. Copy & Share
- Click any link to copy
- Content is optimized for WhatsApp/Instagram
- Ready to paste and share

## API Endpoints

The web server exposes these endpoints:

### `GET /api/products/trending`
Get trending products with AI analysis
- Query params: `platform`, `category`, `limit`

### `POST /api/affiliate/generate`
Generate affiliate link for a product
- Body: `{ platform, productId, url, campaignId }`

### `POST /api/content/generate`
Generate promotional content with AI
- Body: `{ product, platform, tone }`

### `GET /api/categories/:platform`
Get available categories for a platform

### `POST /api/campaign/create`
Create campaign with multiple products
- Body: `{ products, campaignName, platforms }`

## Screenshots

### Main Dashboard
- Grid of trending products
- Platform and category filters
- Real-time stats

### Product Card
- Product image
- Price with discount badge
- Rating and sales info
- Quick action buttons

### Campaign Creation
- Selected products panel
- Batch link generation
- AI content for each product

## Configuration

### Environment Variables
```env
WEB_PORT=3001  # Web server port
```

### Customization
- Edit `web/public/styles.css` for styling
- Modify `web/public/app.js` for functionality
- Update `web/server.js` for API changes

## Troubleshooting

### Products not loading?
1. Check MCP server is running
2. Verify API credentials in `.env`
3. Check browser console for errors

### Shopee scraping slow?
- Normal behavior (3-5s per request)
- Consider caching results
- Reduce number of products

### Links not generating?
1. Verify affiliate credentials
2. Check platform API limits
3. Review server logs

## Tech Stack

- **Frontend**: Vanilla JavaScript, CSS3
- **Backend**: Express.js
- **Services**: MCP Server integration
- **AI**: Claude Sonnet 4
- **Styling**: Custom CSS with modern design

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Scheduled posting integration
- [ ] Export campaigns to CSV
- [ ] Product price history
- [ ] Multi-language support
- [ ] Dark mode theme

## Support

For issues or questions:
- Check main README.md
- Review server logs
- Open GitHub issue
