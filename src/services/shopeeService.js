import puppeteer from 'puppeteer';
import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { CacheService } from './cacheService.js';

export class ShopeeProductService {
  constructor() {
    this.cache = new CacheService();
    this.browser = null;
    this.affiliateNetwork = process.env.SHOPEE_AFFILIATE_NETWORK || 'ecomobi';
    this.affiliateId = process.env.SHOPEE_AFFILIATE_ID;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async searchProducts({ keywords, minPrice, maxPrice }) {
    try {
      const cacheKey = `shopee:search:${keywords}:${minPrice}:${maxPrice}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(cached, null, 2)
          }]
        };
      }

      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set Brazilian user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Build search URL
      let searchUrl = `https://shopee.com.br/search?keyword=${encodeURIComponent(keywords)}`;
      if (minPrice) searchUrl += `&minPrice=${minPrice * 100}`;
      if (maxPrice) searchUrl += `&maxPrice=${maxPrice * 100}`;
      
      logger.info(`Searching Shopee: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for products to load
      await page.waitForSelector('[data-sqe="item"]', { timeout: 10000 });
      
      // Extract product data
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-sqe="item"]');
        return Array.from(items).slice(0, 20).map(item => {
          const link = item.querySelector('a');
          const title = item.querySelector('[data-sqe="name"]')?.textContent || '';
          const price = item.querySelector('[data-sqe="price"]')?.textContent || '';
          const image = item.querySelector('img')?.src || '';
          const sold = item.querySelector('.shopee-rating-stars__stars')?.parentElement?.nextSibling?.textContent || '';
          
          return {
            title: title.trim(),
            price: price.trim(),
            image,
            sold: sold.trim(),
            url: link ? `https://shopee.com.br${link.getAttribute('href')}` : '',
            shopId: link?.getAttribute('href')?.match(/\.(\d+)\.(\d+)/)?.[1] || '',
            itemId: link?.getAttribute('href')?.match(/\.(\d+)\.(\d+)/)?.[2] || ''
          };
        });
      });
      
      const formattedProducts = this.formatShopeeProducts(products);
      await this.cache.set(cacheKey, formattedProducts, 3600);
      
      await page.close();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(formattedProducts, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Shopee search error:', error);
      throw new Error(`Failed to search Shopee products: ${error.message}`);
    }
  }

  async getProductDetails(productUrl) {
    try {
      const cacheKey = `shopee:product:${productUrl}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      logger.info(`Getting Shopee product details: ${productUrl}`);
      
      await page.goto(productUrl, { waitUntil: 'networkidle2' });
      
      // Wait for product details to load
      await page.waitForSelector('[class*="product-briefing"]', { timeout: 10000 });
      
      const productData = await page.evaluate(() => {
        const getTextContent = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : '';
        };
        
        const getImages = () => {
          const images = document.querySelectorAll('[class*="product-image"] img');
          return Array.from(images).map(img => img.src).filter(Boolean);
        };
        
        const getSpecs = () => {
          const specs = {};
          document.querySelectorAll('[class*="product-detail"] .items-center').forEach(row => {
            const label = row.querySelector('label')?.textContent?.trim();
            const value = row.querySelector('div:not(label)')?.textContent?.trim();
            if (label && value) {
              specs[label] = value;
            }
          });
          return specs;
        };
        
        return {
          title: getTextContent('h1'),
          price: getTextContent('[class*="pqTWkA"]'),
          originalPrice: getTextContent('[class*="product-price-original"]'),
          discount: getTextContent('[class*="percent-discount"]'),
          rating: getTextContent('[class*="rating-stars"]'),
          sold: getTextContent('[class*="sold-label"]'),
          stock: getTextContent('[class*="items-left"]'),
          description: getTextContent('[class*="product-description"]'),
          specifications: getSpecs(),
          images: getImages(),
          shop: {
            name: getTextContent('[class*="shop-name"]'),
            location: getTextContent('[class*="shop-location"]')
          }
        };
      });
      
      await page.close();
      
      await this.cache.set(cacheKey, productData, 3600);
      
      return productData;
      
    } catch (error) {
      logger.error('Shopee product details error:', error);
      throw new Error(`Failed to get Shopee product details: ${error.message}`);
    }
  }

  async generateAffiliateLink(productUrl, campaignId = '') {
    try {
      let trackingUrl = productUrl;
      
      // Add affiliate tracking parameters based on network
      if (this.affiliateNetwork === 'ecomobi') {
        const params = new URLSearchParams({
          af_id: this.affiliateId,
          af_sub1: campaignId || 'default',
          af_sub2: 'mcp_server',
          utm_source: 'ecomobi',
          utm_medium: 'affiliate',
          utm_campaign: campaignId || 'affiliate_mcp'
        });
        
        trackingUrl = `${productUrl}${productUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      } else if (this.affiliateNetwork === 'admitad') {
        // Admitad tracking
        const admitadUrl = `https://ad.admitad.com/g/${this.affiliateId}/`;
        trackingUrl = `${admitadUrl}?ulp=${encodeURIComponent(productUrl)}&subid=${campaignId}`;
      }
      
      // Create short link
      const shortLink = await this.createShortLink(trackingUrl);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            originalUrl: productUrl,
            affiliateLink: trackingUrl,
            shortLink,
            network: this.affiliateNetwork,
            campaignId
          }, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Shopee affiliate link error:', error);
      throw new Error(`Failed to generate Shopee affiliate link: ${error.message}`);
    }
  }

  formatShopeeProducts(products) {
    return {
      products: products.map(product => ({
        title: product.title,
        price: this.parseShopeePrice(product.price),
        image: product.image,
        url: product.url,
        sold: product.sold,
        shopId: product.shopId,
        itemId: product.itemId
      })),
      totalResults: products.length
    };
  }

  parseShopeePrice(priceString) {
    // Extract numeric value from Shopee price string (e.g., "R$ 29,90")
    const match = priceString.match(/R\$\s*([\d.,]+)/);
    if (match) {
      const price = parseFloat(match[1].replace('.', '').replace(',', '.'));
      return {
        amount: price,
        currency: 'BRL',
        formatted: priceString
      };
    }
    return {
      amount: 0,
      currency: 'BRL',
      formatted: priceString
    };
  }

  async createShortLink(url) {
    // Implement URL shortening
    // For now, return original URL
    return url;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
