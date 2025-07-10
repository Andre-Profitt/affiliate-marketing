import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { CacheService } from './cacheService.js';
import { WhatsAppService } from './whatsappService.js';
import { InstagramService } from './instagramService.js';

export class SchedulingService {
  constructor() {
    this.cache = new CacheService();
    this.whatsapp = new WhatsAppService();
    this.instagram = new InstagramService();
    this.scheduledJobs = new Map();
    
    // Check for scheduled posts every minute
    this.startScheduler();
  }

  startScheduler() {
    // Run every minute to check for posts to send
    cron.schedule('* * * * *', async () => {
      try {
        await this.processScheduledPosts();
      } catch (error) {
        logger.error('Scheduler error:', error);
      }
    });
    
    logger.info('Scheduling service started');
  }

  async processScheduledPosts() {
    const now = new Date();
    const nowISO = now.toISOString();
    
    // In production, query database for scheduled posts
    // For now, we'll check cached posts
    const posts = await this.getPostsDueNow(nowISO);
    
    for (const post of posts) {
      try {
        await this.executePost(post);
      } catch (error) {
        logger.error(`Failed to execute post ${post.id}:`, error);
        await this.updatePostStatus(post.id, 'failed', error.message);
      }
    }
  }

  async executePost(post) {
    logger.info(`Executing scheduled post ${post.id} for ${post.platform}`);
    
    let result;
    
    switch (post.platform) {
      case 'whatsapp':
        if (post.recipients && post.recipients.length > 0) {
          // Send to multiple recipients
          result = await this.whatsapp.sendBulkMessages({
            recipients: post.recipients,
            content: post.content.text,
            mediaUrl: post.content.media?.url
          });
        } else {
          logger.warn(`WhatsApp post ${post.id} has no recipients`);
          return;
        }
        break;
        
      case 'instagram':
        result = await this.instagram.createPost({
          type: 'post',
          caption: post.content.text + '\n\n' + (post.content.hashtags || []).join(' '),
          mediaUrl: post.content.media?.url
        });
        break;
        
      default:
        throw new Error(`Unknown platform: ${post.platform}`);
    }
    
    await this.updatePostStatus(post.id, 'sent', null, result);
    logger.info(`Successfully sent post ${post.id}`);
  }

  async getPostsDueNow(currentTime) {
    // In production, this would be a database query
    // For demo, return empty array
    return [];
  }

  async updatePostStatus(postId, status, error = null, result = null) {
    const post = await this.cache.get(`scheduled:${postId}`);
    if (post) {
      post.status = status;
      post.executedAt = new Date().toISOString();
      if (error) post.error = error;
      if (result) post.result = result;
      
      await this.cache.set(`scheduled:${postId}`, post);
    }
  }

  async schedulePost(postData) {
    const { id, scheduledTime, platform } = postData;
    
    // Calculate delay until scheduled time
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();
    const delay = scheduledDate.getTime() - now.getTime();
    
    if (delay <= 0) {
      // Post immediately if scheduled time has passed
      await this.executePost(postData);
      return;
    }
    
    // Store post for later execution
    await this.cache.set(`scheduled:${id}`, postData, Math.ceil(delay / 1000) + 3600); // TTL = delay + 1 hour
    
    logger.info(`Post ${id} scheduled for ${scheduledTime}`);
  }

  async cancelScheduledPost(postId) {
    const post = await this.cache.get(`scheduled:${postId}`);
    if (post) {
      post.status = 'cancelled';
      post.cancelledAt = new Date().toISOString();
      await this.cache.set(`scheduled:${postId}`, post);
      
      logger.info(`Post ${postId} cancelled`);
      return true;
    }
    return false;
  }

  async reschedulePost(postId, newScheduledTime) {
    const post = await this.cache.get(`scheduled:${postId}`);
    if (post) {
      post.scheduledTime = newScheduledTime;
      post.rescheduledAt = new Date().toISOString();
      await this.schedulePost(post);
      
      logger.info(`Post ${postId} rescheduled to ${newScheduledTime}`);
      return true;
    }
    return false;
  }

  async getScheduledPostsForCampaign(campaignId) {
    // In production, query database
    // For demo, return sample data
    return [];
  }

  async getUpcomingPosts(limit = 10) {
    // In production, query database for next N posts
    // For demo, return sample data
    return [];
  }

  stop() {
    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
    logger.info('Scheduling service stopped');
  }
}
