import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (req.user.resetDailyUsage()) {
      await req.user.save();
    }
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

export const checkLimits = (limitType) => {
  return async (req, res, next) => {
    const user = req.user;
    const usage = user.usage[`${limitType}_today`];
    const limit = user.limits[`daily_${limitType}`];
    
    if (usage >= limit) {
      return res.status(429).json({
        success: false,
        message: `Daily ${limitType} limit reached (${limit}/${limit})`
      });
    }
    
    next();
  };
};
