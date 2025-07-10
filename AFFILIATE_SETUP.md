# 🔐 Affiliate Setup Guide

## Quick Setup for Shopee Affiliates

### Option 1: Ecomobi (Recommended for Brazil)

1. **Sign Up**
   - Go to: https://ecomobi.com/
   - Click "Become an Affiliate"
   - Select country: Brazil
   - Choose platforms: Shopee

2. **Get Approved** (1-3 days)
   - Fill out your channels (Instagram, WhatsApp, etc.)
   - Describe your promotion strategy
   - Wait for email approval

3. **Get API Credentials**
   - Login to dashboard
   - Go to "API" or "Integrations"
   - Copy your API key
   - Find your Affiliate ID

4. **Add to .env**
   ```env
   SHOPEE_AFFILIATE_ID=your_affiliate_id_here
   ECOMOBI_API_KEY=your_api_key_here
   ```

### Option 2: Admitad

1. **Sign Up**
   - Go to: https://www.admitad.com/br/
   - Register as publisher
   - Verify email

2. **Apply for Shopee**
   - Search "Shopee" in programs
   - Apply for Shopee Brazil
   - Wait for approval

3. **Get Credentials**
   - Go to API section
   - Create application
   - Get client ID and secret

4. **Add to .env**
   ```env
   SHOPEE_AFFILIATE_ID=your_publisher_id
   ADMITAD_CLIENT_ID=your_client_id
   ADMITAD_CLIENT_SECRET=your_client_secret
   ```

## Testing Your Setup

1. **Manual Test First**
   - Find a product on Shopee.com.br
   - Generate affiliate link in dashboard
   - Share it somewhere
   - Verify tracking works

2. **API Test**
   ```bash
   # Start the system
   ./start-all.sh
   
   # Run tests
   ./test-phase2.sh
   ```

3. **Frontend Test**
   - Go to http://localhost:5173
   - Search for "notebook"
   - Generate affiliate link
   - Check if link has your affiliate ID

## Commission Rates

Typical Shopee commission rates:
- Electronics: 3-5%
- Fashion: 8-12%
- Home & Living: 6-10%
- Beauty: 10-15%

Payments: Monthly via bank transfer or PayPal

## Troubleshooting

### "No affiliate ID" error
Add `SHOPEE_AFFILIATE_ID` to .env

### "Products not found"
Shopee API may be blocking. Wait or use VPN.

### "Rate limited"
Too many requests. Wait 15 minutes.

## Pro Tips

1. **Start Small**: Test with 5-10 products first
2. **Track Everything**: Use UTM parameters
3. **Content Matters**: Good descriptions = more sales
4. **Timing**: Post during peak hours (8-10 PM Brazil)
5. **Diversify**: Don't rely on one product

## Support

- Ecomobi Support: support@ecomobi.com
- Admitad Support: support@admitad.com
- Shopee Seller Center: https://seller.shopee.com.br/
