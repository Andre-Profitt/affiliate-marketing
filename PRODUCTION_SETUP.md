# 🚀 Production Setup Guide

## Step 1: Install Production Dependencies

```bash
# Install only what we need for production
npm install axios cheerio express cors dotenv winston

# Optional: Install Redis for caching
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Linux
```

## Step 2: Configure Environment

```bash
# Copy production environment template
cp .env.production .env

# Edit with your credentials
nano .env  # or use your favorite editor
```

### Required Configuration:

1. **Shopee Affiliate ID**:
   - Option A: Direct with Shopee (if available in Brazil)
   - Option B: Join Ecomobi Network: https://app.ecomobi.com
   - Option C: Join Admitad: https://www.admitad.com/br/

2. **Claude AI (Optional but Recommended)**:
   - Get API key from: https://console.anthropic.com
   - Adds AI-powered content generation
   - Improves product recommendations

## Step 3: Start Production Server

```bash
# Start the production server
node web/server-production.js

# Or with PM2 (recommended for production)
npm install -g pm2
pm2 start web/server-production.js --name affiliate-dashboard
```

## Step 4: Access Dashboard

Open: http://localhost:3001

## 🔥 What's Working Now:

### ✅ Shopee Integration
- **Live Product Search**: Real-time data from Shopee API
- **Flash Sales**: Access to current promotions
- **Product Details**: Full product information
- **Affiliate Links**: Generate tracked links
- **Real Prices**: Current pricing and discounts

### ✅ Content Generation
- **Template-Based**: Works without AI
- **AI-Powered**: With Claude API key
- **Multi-Platform**: WhatsApp & Instagram ready

### ⏳ Coming Soon (After Amazon Approval)
- Amazon product search
- Amazon affiliate links
- Price comparison
- Multi-platform campaigns

## 📊 Production Features

### 1. Real Shopee Data
The system now fetches:
- Live product listings
- Current prices
- Real-time stock
- Actual sales numbers
- Flash sale items

### 2. Intelligent Caching
- 30-minute cache for searches
- Reduces API calls
- Improves performance

### 3. Error Handling
- Fallback to flash sales if search fails
- Graceful degradation
- Detailed logging

## 🛡️ Security Best Practices

1. **API Keys**: Never commit .env to git
2. **CORS**: Restrict origins in production
3. **Rate Limiting**: Add if needed
4. **HTTPS**: Use reverse proxy (nginx/caddy)

## 📈 Monitoring

Check system status:
```
http://localhost:3001/api/status
```

View logs:
```bash
# If using PM2
pm2 logs affiliate-dashboard
```

## 🚨 Troubleshooting

### Shopee API Not Working?
1. Check internet connection
2. Verify no IP blocking
3. Try VPN if needed
4. Check console logs

### Products Not Loading?
1. Clear cache
2. Check API status endpoint
3. Review error logs

## 🎯 Next Steps

1. **Get Shopee Affiliate Account**
   - Fastest: Join Ecomobi or Admitad today
   - Direct: Apply at Shopee (if available)

2. **Optional: Get Claude API**
   - Improves content quality
   - Better product recommendations
   - https://console.anthropic.com

3. **Deploy to Cloud** (Optional)
   - DigitalOcean: $5/month
   - Heroku: Free tier available
   - AWS: EC2 free tier

## 💰 Start Making Money!

Your dashboard is ready for production. Start by:
1. Finding trending products
2. Generating affiliate links
3. Creating content
4. Sharing on WhatsApp/Instagram
5. Tracking your earnings!

Good luck! 🚀
