import paapi from 'paapi5-nodejs-sdk';
import { logger } from '../utils/logger.js';
import { CacheService } from './cacheService.js';

export class AmazonProductService {
  constructor() {
    this.cache = new CacheService();
    this.initializeClient();
  }

  initializeClient() {
    const defaultClient = paapi.ApiClient.instance;
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
    
    this.api = new paapi.DefaultApi();
    this.partnerTag = process.env.AMAZON_ASSOCIATE_TAG || 'affiliate-br-20';
    this.marketplace = 'www.amazon.com.br';
  }

  async searchProducts({ keywords, category, minPrice, maxPrice }) {
    try {
      // Check cache first
      const cacheKey = `amazon:search:${keywords}:${category}:${minPrice}:${maxPrice}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached Amazon search results');
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(cached, null, 2)
          }]
        };
      }

      const request = new paapi.SearchItemsRequest();
      request['PartnerTag'] = this.partnerTag;
      request['PartnerType'] = paapi.PartnerType.Associates;
      request['Marketplace'] = this.marketplace;
      request['Keywords'] = keywords;
      
      // Add optional filters
      if (category) {
        request['SearchIndex'] = this.mapCategory(category);
      }
      
      if (minPrice || maxPrice) {
        request['MinPrice'] = minPrice ? minPrice * 100 : undefined; // Convert to centavos
        request['MaxPrice'] = maxPrice ? maxPrice * 100 : undefined;
      }
      
      request['Resources'] = [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.Classifications',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.DeliveryInfo',
        'BrowseNodeInfo.BrowseNodes'
      ];

      const response = await this.api.searchItems(request);
      
      // Process and format results
      const products = this.formatSearchResults(response.SearchResult);
      
      // Cache results for 1 hour
      await this.cache.set(cacheKey, products, 3600);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(products, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Amazon search error:', error);
      throw new Error(`Failed to search Amazon products: ${error.message}`);
    }
  }

  async getProductDetails(asin) {
    try {
      const cacheKey = `amazon:product:${asin}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(cached, null, 2)
          }]
        };
      }

      const request = new paapi.GetItemsRequest();
      request['PartnerTag'] = this.partnerTag;
      request['PartnerType'] = paapi.PartnerType.Associates;
      request['Marketplace'] = this.marketplace;
      request['ItemIds'] = [asin];
      request['Resources'] = [
        'Images.Primary.Large',
        'Images.Variants.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ManufactureInfo',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.DeliveryInfo',
        'Offers.Listings.Promotions',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ];

      const response = await this.api.getItems(request);
      const product = this.formatProductDetails(response.ItemsResult.Items[0]);
      
      await this.cache.set(cacheKey, product, 3600);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(product, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Amazon product details error:', error);
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  async generateAffiliateLink(asin, campaignId = '') {
    try {
      const baseUrl = `https://www.amazon.com.br/dp/${asin}`;
      const affiliateParams = new URLSearchParams({
        tag: this.partnerTag,
        linkCode: 'as2',
        camp: '1789',
        creative: '9325',
        creativeASIN: asin
      });

      if (campaignId) {
        affiliateParams.append('ascsubtag', campaignId);
      }

      const affiliateLink = `${baseUrl}?${affiliateParams.toString()}`;
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            asin,
            affiliateLink,
            campaignId,
            shortLink: await this.createShortLink(affiliateLink)
          }, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Affiliate link generation error:', error);
      throw new Error(`Failed to generate affiliate link: ${error.message}`);
    }
  }

  formatSearchResults(searchResult) {
    if (!searchResult || !searchResult.Items) {
      return { products: [], totalResults: 0 };
    }

    const products = searchResult.Items.map(item => ({
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'N/A',
      price: {
        amount: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'BRL',
        formatted: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'N/A'
      },
      savings: {
        amount: item.Offers?.Listings?.[0]?.SavingBasis?.Amount || 0,
        percentage: item.Offers?.Listings?.[0]?.SavingBasis?.Percentage || 0
      },
      image: item.Images?.Primary?.Large?.URL || '',
      features: item.ItemInfo?.Features?.DisplayValues || [],
      category: item.ItemInfo?.Classifications?.Binding?.DisplayValue || 'N/A',
      delivery: {
        isFreeShipping: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsFreeShippingEligible || false,
        isPrimeEligible: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false
      }
    }));

    return {
      products,
      totalResults: searchResult.TotalResultCount || products.length
    };
  }

  formatProductDetails(item) {
    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'N/A',
      manufacturer: item.ItemInfo?.ManufactureInfo?.Name?.DisplayValue || 'N/A',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 'N/A',
      price: {
        amount: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'BRL',
        formatted: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'N/A'
      },
      savings: {
        amount: item.Offers?.Listings?.[0]?.SavingBasis?.Amount || 0,
        percentage: item.Offers?.Listings?.[0]?.SavingBasis?.Percentage || 0,
        basis: item.Offers?.Listings?.[0]?.SavingBasis?.DisplayAmount || 'N/A'
      },
      images: {
        primary: item.Images?.Primary?.Large?.URL || '',
        variants: item.Images?.Variants?.map(v => v.Large?.URL).filter(Boolean) || []
      },
      features: item.ItemInfo?.Features?.DisplayValues || [],
      technicalInfo: item.ItemInfo?.TechnicalInfo || {},
      productInfo: {
        dimensions: item.ItemInfo?.ProductInfo?.ItemDimensions || {},
        weight: item.ItemInfo?.ProductInfo?.Weight || {}
      },
      reviews: {
        rating: item.CustomerReviews?.StarRating?.Value || 0,
        count: item.CustomerReviews?.Count || 0
      },
      delivery: {
        isFreeShipping: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsFreeShippingEligible || false,
        isPrimeEligible: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'N/A'
      },
      promotions: item.Offers?.Listings?.[0]?.Promotions || []
    };
  }

  mapCategory(category) {
    const categoryMap = {
      'electronics': 'Electronics',
      'books': 'Books',
      'home': 'HomeAndKitchen',
      'fashion': 'FashionWomen',
      'beauty': 'Beauty',
      'sports': 'SportsAndOutdoors',
      'toys': 'ToysAndGames',
      'automotive': 'Automotive',
      'grocery': 'Grocery',
      'health': 'HealthPersonalCare'
    };
    
    return categoryMap[category.toLowerCase()] || 'All';
  }

  async createShortLink(url) {
    // Implement URL shortening logic here
    // For now, return the original URL
    return url;
  }
}
