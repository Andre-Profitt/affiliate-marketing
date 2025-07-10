import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Campaign name is required']
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  products: [{
    platform: {
      type: String,
      enum: ['amazon', 'shopee'],
      required: true
    },
    product_id: String,
    product_data: mongoose.Schema.Types.Mixed,
    affiliate_link: String,
    commission_rate: Number
  }],
  platforms: [{
    type: String,
    enum: ['whatsapp', 'instagram', 'email']
  }],
  schedule: {
    start_date: Date,
    end_date: Date,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'custom']
    },
    times: [String],
    days: [String]
  },
  content: [{
    platform: String,
    type: String,
    text: String,
    media_urls: [String],
    generated_by: {
      type: String,
      enum: ['claude', 'openai', 'template', 'manual']
    }
  }],
  analytics: {
    total_clicks: { type: Number, default: 0 },
    total_conversions: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    last_click: Date
  }
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
