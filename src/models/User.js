import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  subscription_tier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  api_keys: {
    amazon_access_key: { type: String, select: false },
    amazon_secret_key: { type: String, select: false },
    amazon_partner_tag: { type: String },
    shopee_affiliate_id: { type: String },
    anthropic_api_key: { type: String, select: false },
    openai_api_key: { type: String, select: false }
  },
  limits: {
    daily_searches: { type: Number, default: 10 },
    daily_campaigns: { type: Number, default: 3 },
    daily_posts: { type: Number, default: 5 }
  },
  usage: {
    searches_today: { type: Number, default: 0 },
    campaigns_today: { type: Number, default: 0 },
    posts_today: { type: Number, default: 0 },
    last_reset: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.resetDailyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.last_reset);
  if (now.getDate() !== lastReset.getDate()) {
    this.usage.searches_today = 0;
    this.usage.campaigns_today = 0;
    this.usage.posts_today = 0;
    this.usage.last_reset = now;
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
