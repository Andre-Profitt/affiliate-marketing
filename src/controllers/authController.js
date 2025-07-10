import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      name
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      subscription_tier: req.user.subscription_tier,
      limits: req.user.limits,
      usage: req.user.usage
    }
  });
};

export const updateApiKeys = async (req, res) => {
  try {
    const updates = req.body;
    const allowedKeys = [
      'amazon_access_key',
      'amazon_secret_key',
      'amazon_partner_tag',
      'shopee_affiliate_id',
      'anthropic_api_key',
      'openai_api_key'
    ];

    const filteredUpdates = {};
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        filteredUpdates[`api_keys.${key}`] = updates[key];
      }
    }

    await User.findByIdAndUpdate(req.user._id, filteredUpdates);

    res.json({
      success: true,
      message: 'API keys updated successfully'
    });
  } catch (error) {
    logger.error('Update API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating API keys'
    });
  }
};
