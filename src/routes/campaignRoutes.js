import express from 'express';
import Campaign from '../models/Campaign.js';
import { protect, checkLimits } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user_id: req.user._id })
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
});

router.post('/', protect, checkLimits('campaigns'), async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      user_id: req.user._id
    });
    
    req.user.usage.campaigns_today += 1;
    await req.user.save();
    
    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
});

router.post('/:id/click', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { 'analytics.total_clicks': 1 },
        'analytics.last_click': new Date()
      },
      { new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

export default router;
