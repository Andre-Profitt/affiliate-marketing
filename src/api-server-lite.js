// Lightweight API server that works without MongoDB
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'lite (no database)',
    timestamp: new Date().toISOString()
  });
});

// Mock auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: { email, name: 'Test User' }
    });
  } else {
    res.status(400).json({ success: false, message: 'Email and password required' });
  }
});

// Mock product search (returns static Shopee-like data)
app.get('/api/affiliate/products/search', (req, res) => {
  const { q } = req.query;
  
  const mockProducts = [
    {
      _id: '1',
      platform: 'shopee',
      name: `${q} - iPhone 15 Pro Max 256GB Titanium Natural`,
      price: 8999.99,
      original_price: 9999.99,
      discount: 10,
      image: 'https://cf.shopee.com.br/file/br-11134207-7r98o-lqe7gg8m0h5v68',
      url: 'https://shopee.com.br/product/123/456',
      rating: 4.9,
      sold: 1523,
      seller: { name: 'Apple Store Brasil' }
    },
    {
      _id: '2',
      platform: 'shopee',
      name: `${q} - Samsung Galaxy S24 Ultra 512GB`,
      price: 7499.99,
      original_price: 8999.99,
      discount: 17,
      image: 'https://cf.shopee.com.br/file/br-11134207-7r98o-lqe7gg8m0h5v69',
      url: 'https://shopee.com.br/product/789/012',
      rating: 4.8,
      sold: 892,
      seller: { name: 'Samsung Official' }
    },
    {
      _id: '3',
      platform: 'shopee',
      name: `${q} - Notebook Gamer Dell G15 RTX 4060`,
      price: 5999.99,
      original_price: 7299.99,
      discount: 18,
      image: 'https://cf.shopee.com.br/file/br-11134207-7r98o-lqe7gg8m0h5v70',
      url: 'https://shopee.com.br/product/345/678',
      rating: 4.7,
      sold: 445,
      seller: { name: 'Dell Brasil' }
    }
  ];
  
  res.json({
    success: true,
    products: mockProducts,
    count: mockProducts.length,
    source: 'mock'
  });
});

// Mock affiliate link generation
app.post('/api/affiliate/links/generate', (req, res) => {
  const { productId, url } = req.body;
  const trackingId = `track_${Date.now()}`;
  
  res.json({
    success: true,
    affiliateUrl: `${url || 'https://shopee.com.br'}?affiliate_id=YOUR_ID&click=${trackingId}`,
    trackingId
  });
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 API Server (Lite Mode) running on port ${PORT}
📱 Frontend can connect to: http://localhost:${PORT}/api
⚠️  Note: Running without database - using mock data
💡 To use real data, install MongoDB: ./fix-mongodb.sh
  `);
});
