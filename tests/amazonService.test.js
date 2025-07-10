import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AmazonProductService } from '../src/services/amazonService.js';

// Mock the paapi5-nodejs-sdk
jest.mock('paapi5-nodejs-sdk', () => ({
  ApiClient: {
    instance: {
      accessKey: null,
      secretKey: null
    }
  },
  DefaultApi: jest.fn(),
  SearchItemsRequest: jest.fn(),
  PartnerType: {
    Associates: 'Associates'
  }
}));

describe('AmazonProductService', () => {
  let amazonService;
  
  beforeEach(() => {
    process.env.AMAZON_ACCESS_KEY = 'test_access_key';
    process.env.AMAZON_SECRET_KEY = 'test_secret_key';
    process.env.AMAZON_ASSOCIATE_TAG = 'test-tag-20';
    
    amazonService = new AmazonProductService();
  });
  
  describe('searchProducts', () => {
    it('should search for products with keywords', async () => {
      const mockResponse = {
        SearchResult: {
          Items: [
            {
              ASIN: 'B08N5WRWNB',
              ItemInfo: {
                Title: { DisplayValue: 'Echo Dot (4ª Geração)' },
                Features: { DisplayValues: ['Alexa', 'Smart Home'] }
              },
              Offers: {
                Listings: [{
                  Price: {
                    Amount: 299.90,
                    Currency: 'BRL',
                    DisplayAmount: 'R$ 299,90'
                  }
                }]
              }
            }
          ],
          TotalResultCount: 1
        }
      };
      
      // Mock the API call
      amazonService.api.searchItems = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await amazonService.searchProducts({
        keywords: 'echo dot',
        category: 'electronics'
      });
      
      const products = JSON.parse(result.content[0].text);
      expect(products.products).toHaveLength(1);
      expect(products.products[0].asin).toBe('B08N5WRWNB');
      expect(products.products[0].title).toBe('Echo Dot (4ª Geração)');
    });
    
    it('should handle search errors gracefully', async () => {
      amazonService.api.searchItems = jest.fn().mockRejectedValue(
        new Error('API rate limit exceeded')
      );
      
      await expect(amazonService.searchProducts({ keywords: 'test' }))
        .rejects.toThrow('Failed to search Amazon products');
    });
  });
  
  describe('generateAffiliateLink', () => {
    it('should generate correct affiliate link format', async () => {
      const result = await amazonService.generateAffiliateLink(
        'B08N5WRWNB',
        'test_campaign'
      );
      
      const linkData = JSON.parse(result.content[0].text);
      expect(linkData.asin).toBe('B08N5WRWNB');
      expect(linkData.campaignId).toBe('test_campaign');
      expect(linkData.affiliateLink).toContain('amazon.com.br');
      expect(linkData.affiliateLink).toContain('tag=test-tag-20');
      expect(linkData.affiliateLink).toContain('ascsubtag=test_campaign');
    });
  });
  
  describe('formatSearchResults', () => {
    it('should format empty results correctly', () => {
      const formatted = amazonService.formatSearchResults({});
      expect(formatted.products).toEqual([]);
      expect(formatted.totalResults).toBe(0);
    });
    
    it('should extract all relevant product fields', () => {
      const mockItem = {
        ASIN: 'B123456',
        ItemInfo: {
          Title: { DisplayValue: 'Test Product' },
          Features: { DisplayValues: ['Feature 1', 'Feature 2'] },
          Classifications: {
            Binding: { DisplayValue: 'Electronics' }
          }
        },
        Images: {
          Primary: {
            Large: { URL: 'https://example.com/image.jpg' }
          }
        },
        Offers: {
          Listings: [{
            Price: {
              Amount: 99.99,
              Currency: 'BRL',
              DisplayAmount: 'R$ 99,99'
            },
            SavingBasis: {
              Amount: 20,
              Percentage: 20
            },
            DeliveryInfo: {
              IsFreeShippingEligible: true,
              IsPrimeEligible: false
            }
          }]
        }
      };
      
      const result = amazonService.formatSearchResults({
        Items: [mockItem],
        TotalResultCount: 1
      });
      
      expect(result.products[0]).toMatchObject({
        asin: 'B123456',
        title: 'Test Product',
        features: ['Feature 1', 'Feature 2'],
        category: 'Electronics',
        image: 'https://example.com/image.jpg'
      });
    });
  });
});
