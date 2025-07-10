import axios from 'axios';
import PQueue from 'p-queue';
import { logger } from '../utils/logger.js';

export class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1';
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    // Rate limiting queue
    this.queue = new PQueue({
      concurrency: 2,
      interval: 1000,
      intervalCap: 10 // 10 messages per second max
    });
    
    this.optInList = new Set(); // In production, use database
  }

  async sendMessage({ recipient, content, mediaUrl, schedule }) {
    try {
      // Check opt-in consent
      if (!this.hasOptInConsent(recipient)) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'No opt-in consent for recipient',
              recipient
            }, null, 2)
          }]
        };
      }

      if (schedule) {
        return await this.scheduleMessage({ recipient, content, mediaUrl, schedule });
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(recipient),
        type: mediaUrl ? 'image' : 'text'
      };

      if (mediaUrl) {
        messageData.image = {
          link: mediaUrl,
          caption: content
        };
      } else {
        messageData.text = {
          body: content
        };
      }

      const response = await this.queue.add(() => 
        axios.post(
          `${this.apiUrl}/messages`,
          messageData,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      logger.info('WhatsApp message sent', { 
        recipient, 
        messageId: response.data.messages[0].id 
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageId: response.data.messages[0].id,
            recipient,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('WhatsApp send error:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendBulkMessages({ recipients, content, mediaUrl, batchSize = 10, delayMs = 5000 }) {
    try {
      const results = {
        sent: [],
        failed: [],
        totalRecipients: recipients.length
      };

      // Process in batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(recipient => 
          this.sendMessage({ recipient, content, mediaUrl })
            .then(result => {
              results.sent.push({ recipient, ...JSON.parse(result.content[0].text) });
            })
            .catch(error => {
              results.failed.push({ recipient, error: error.message });
            })
        );

        await Promise.all(batchPromises);

        // Delay between batches to avoid rate limits
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            summary: {
              total: results.totalRecipients,
              sent: results.sent.length,
              failed: results.failed.length
            },
            results
          }, null, 2)
        }]
      };

    } catch (error) {
      logger.error('Bulk WhatsApp send error:', error);
      throw new Error(`Failed to send bulk WhatsApp messages: ${error.message}`);
    }
  }

  async scheduleMessage({ recipient, content, mediaUrl, schedule }) {
    // In production, integrate with a job scheduler like Bull or Agenda
    const scheduledTime = new Date(schedule);
    const delay = scheduledTime.getTime() - Date.now();

    if (delay <= 0) {
      return await this.sendMessage({ recipient, content, mediaUrl });
    }

    // Store scheduled message in database
    const scheduledId = `scheduled_${Date.now()}_${recipient}`;
    
    logger.info('Message scheduled', { 
      scheduledId, 
      recipient, 
      scheduledTime: scheduledTime.toISOString() 
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          scheduled: true,
          scheduledId,
          recipient,
          scheduledTime: scheduledTime.toISOString(),
          message: 'Message scheduled successfully'
        }, null, 2)
      }]
    };
  }

  hasOptInConsent(recipient) {
    // In production, check database for opt-in status
    // For demo, we'll implement basic logic
    return true; // Assume consent for demo
  }

  formatPhoneNumber(number) {
    // Ensure number is in international format
    let formatted = number.replace(/\D/g, '');
    
    // Add Brazil country code if not present
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted;
    }
    
    return formatted;
  }

  async createMessageTemplate(name, content, category = 'MARKETING') {
    try {
      const templateData = {
        name,
        category,
        language: 'pt_BR',
        components: [
          {
            type: 'BODY',
            text: content
          }
        ]
      };

      const response = await axios.post(
        `${this.apiUrl}/message_templates`,
        templateData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        templateId: response.data.id,
        status: response.data.status
      };

    } catch (error) {
      logger.error('Template creation error:', error);
      throw new Error(`Failed to create message template: ${error.message}`);
    }
  }

  async getMessageStatus(messageId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;

    } catch (error) {
      logger.error('Get message status error:', error);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  async registerWebhook(url, events = ['messages', 'message_status']) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/webhook`,
        {
          url,
          events
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      logger.error('Webhook registration error:', error);
      throw new Error(`Failed to register webhook: ${error.message}`);
    }
  }
}
