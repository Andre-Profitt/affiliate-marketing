import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  platform: { 
    type: String, 
    enum: ['shopee', 'amazon', 'mercadolivre'],
    default: 'shopee' 
  },
  external_id: String,  // Shopee item ID
  shop_id: String,      // Shopee shop ID
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  original_price: Number,
  discount: Number,
  currency: {
    type: String,
    default: 'BRL'
  },
  image: String,
  images: [String],
  url: String,
  affiliate_url: String,
  category: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  sold: Number,
  stock: Number,
  seller: {
    name: String,
    rating: Number
  },
  commission_rate: Number,
  last_updated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for efficient searching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ user_id: 1, platform: 1 });
productSchema.index({ external_id: 1, platform: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
