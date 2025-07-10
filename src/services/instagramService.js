import axios from 'axios';
import { logger } from '../utils/logger.js';

export class InstagramService {
  constructor() {
    this.apiUrl = 'https://graph.instagram.com/v18.0';
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.pageId = process.env.FACEBOOK_PAGE_ID;
  }

  async createPost({ type, caption, mediaUrl, schedule }) {
    try {
      if (schedule) {
        return await this.schedulePost({ type, caption, mediaUrl, schedule });
      }

      let mediaId;
      
      switch (type) {
        case 'post':
          mediaId = await this.createPhotoContainer(mediaUrl, caption);
          break;
        case 'story':
          mediaId = await this.createStoryContainer(mediaUrl);
          break;
        case 'reel':
          mediaId = await this.createReelContainer(mediaUrl, caption);
          break;
        default:
          throw new Error(`Unknown post type: ${type}`);
      }

      // Publish the media
      const publishedPost = await this.publishMedia(mediaId);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            postId: publishedPost.id,
            type,
            publishedAt: new Date().toISOString(),
            permalink: await this.getPermalink(publishedPost.id)
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('Instagram post error:', error);
      throw new Error(`Failed to create Instagram post: ${error.message}`);
    }
  }

  async createPhotoContainer(imageUrl, caption) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.businessAccountId}/media`,
        {
          image_url: imageUrl,
          caption: this.formatCaption(caption),
          access_token: this.accessToken
        }
      );

      logger.info('Photo container created', { containerId: response.data.id });
      return response.data.id;

    } catch (error) {
      logger.error('Photo container error:', error);
      throw error;
    }
  }

  async createStoryContainer(mediaUrl) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.businessAccountId}/media`,
        {
          media_type: 'STORIES',
          image_url: mediaUrl,
          access_token: this.accessToken
        }
      );

      return response.data.id;

    } catch (error) {
      logger.error('Story container error:', error);
      throw error;
    }
  }

  async createReelContainer(videoUrl, caption) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.businessAccountId}/media`,
        {
          media_type: 'REELS',
          video_url: videoUrl,
          caption: this.formatCaption(caption),
          share_to_feed: true,
          access_token: this.accessToken
        }
      );

      return response.data.id;

    } catch (error) {
      logger.error('Reel container error:', error);
      throw error;
    }
  }

  async publishMedia(creationId) {
    try {
      // Check if media is ready
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isReady && attempts < maxAttempts) {
        const status = await this.checkMediaStatus(creationId);
        
        if (status === 'FINISHED') {
          isReady = true;
        } else if (status === 'ERROR') {
          throw new Error('Media processing failed');
        } else {
          // Wait before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      if (!isReady) {
        throw new Error('Media processing timeout');
      }

      // Publish the media
      const response = await axios.post(
        `${this.apiUrl}/${this.businessAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken
        }
      );

      return response.data;

    } catch (error) {
      logger.error('Media publish error:', error);
      throw error;
    }
  }

  async checkMediaStatus(creationId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${creationId}`,
        {
          params: {
            fields: 'status_code',
            access_token: this.accessToken
          }
        }
      );

      return response.data.status_code;

    } catch (error) {
      logger.error('Media status check error:', error);
      throw error;
    }
  }

  async schedulePost({ type, caption, mediaUrl, schedule }) {
    // For scheduled posts, we need to use Facebook's Page API
    const scheduledTime = Math.floor(new Date(schedule).getTime() / 1000);
    
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/feed`,
        {
          message: caption,
          link: mediaUrl,
          published: false,
          scheduled_publish_time: scheduledTime,
          access_token: this.accessToken
        }
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            scheduled: true,
            scheduledPostId: response.data.id,
            scheduledTime: new Date(scheduledTime * 1000).toISOString(),
            message: 'Post scheduled successfully'
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('Schedule post error:', error);
      throw new Error(`Failed to schedule post: ${error.message}`);
    }
  }

  formatCaption(caption) {
    // Ensure caption meets Instagram requirements
    const maxLength = 2200;
    let formatted = caption;

    // Truncate if too long
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }

    // Add line breaks for readability
    formatted = formatted.replace(/([.!?])\s+/g, '$1\n\n');

    return formatted;
  }

  async getPermalink(mediaId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: this.accessToken
          }
        }
      );

      return response.data.permalink;

    } catch (error) {
      logger.error('Get permalink error:', error);
      return null;
    }
  }

  async getInsights(mediaId, metrics = ['reach', 'impressions', 'engagement']) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${mediaId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            access_token: this.accessToken
          }
        }
      );

      return response.data.data;

    } catch (error) {
      logger.error('Get insights error:', error);
      throw new Error(`Failed to get insights: ${error.message}`);
    }
  }

  async getHashtagInsights(hashtag) {
    try {
      // Search for hashtag ID
      const searchResponse = await axios.get(
        `${this.apiUrl}/ig_hashtag_search`,
        {
          params: {
            user_id: this.businessAccountId,
            q: hashtag,
            access_token: this.accessToken
          }
        }
      );

      const hashtagId = searchResponse.data.data[0].id;

      // Get recent media for hashtag
      const mediaResponse = await axios.get(
        `${this.apiUrl}/${hashtagId}/recent_media`,
        {
          params: {
            user_id: this.businessAccountId,
            fields: 'id,caption,media_type,media_url,permalink',
            access_token: this.accessToken
          }
        }
      );

      return mediaResponse.data;

    } catch (error) {
      logger.error('Hashtag insights error:', error);
      throw new Error(`Failed to get hashtag insights: ${error.message}`);
    }
  }

  async getAccountInsights(period = 'day', metrics = ['reach', 'impressions']) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.businessAccountId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            period,
            access_token: this.accessToken
          }
        }
      );

      return response.data.data;

    } catch (error) {
      logger.error('Account insights error:', error);
      throw new Error(`Failed to get account insights: ${error.message}`);
    }
  }
}
