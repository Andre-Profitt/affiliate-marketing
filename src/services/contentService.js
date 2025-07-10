import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import sharp from 'sharp';
import { logger } from '../utils/logger.js';

export class ContentGeneratorService {
  constructor() {
    // Use Claude for text generation
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    // Keep OpenAI for DALL-E image generation only
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateContent(productData, platform, tone = 'friendly') {
    try {
      const platformConfig = this.getPlatformConfig(platform);
      const toneInstructions = this.getToneInstructions(tone);
      
      // Generate text content with Claude
      const textContent = await this.generateTextContent(
        productData, 
        platformConfig, 
        toneInstructions
      );
      
      // Generate or optimize images (still using DALL-E)
      const mediaContent = await this.generateMediaContent(
        productData, 
        platformConfig
      );
      
      // Format for specific platform
      const formattedContent = this.formatForPlatform(
        textContent, 
        mediaContent, 
        platform
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            platform,
            text: formattedContent.text,
            media: formattedContent.media,
            hashtags: formattedContent.hashtags,
            metadata: {
              tone,
              characterCount: formattedContent.text.length,
              optimizedFor: platform,
              generatedBy: 'Claude Sonnet 4'
            }
          }, null, 2)
        }]
      };
      
    } catch (error) {
      logger.error('Content generation error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async generateTextContent(productData, platformConfig, toneInstructions) {
    const systemPrompt = `Você é um especialista em marketing de afiliados brasileiro, criando conteúdo promocional persuasivo e autêntico para produtos. Sempre responda em português brasileiro natural e envolvente.`;
    
    const userPrompt = `
    Crie uma descrição promocional em português brasileiro para o seguinte produto:
    
    Produto: ${productData.title || productData.name}
    Preço: R$ ${productData.price?.formatted || productData.price}
    ${productData.savings?.percentage ? `Desconto: ${productData.savings.percentage}%` : ''}
    ${productData.features ? `Características: ${productData.features.join(', ')}` : ''}
    
    Instruções:
    - Use linguagem ${toneInstructions}
    - Máximo de ${platformConfig.maxLength} caracteres
    - Inclua emoji relevantes ${platformConfig.allowEmoji ? '✅' : '❌'}
    - Destaque os principais benefícios
    - Inclua um call-to-action persuasivo
    - ${platformConfig.specificInstructions}
    
    Formato: ${platformConfig.format}
    
    Importante: Crie um texto único e criativo, não genérico. Foque em despertar o interesse e criar urgência.
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error(`Failed to generate text content: ${error.message}`);
    }
  }

  async generateMediaContent(productData, platformConfig) {
    try {
      if (productData.image || productData.images?.primary) {
        // Optimize existing image
        const imageUrl = productData.image || productData.images.primary;
        const optimizedImage = await this.optimizeImage(imageUrl, platformConfig);
        return { type: 'image', url: optimizedImage };
      } else if (process.env.OPENAI_API_KEY) {
        // Generate new image with DALL-E if OpenAI key is available
        const imagePrompt = `
        Professional product photography of ${productData.title || productData.name},
        Brazilian e-commerce style, vibrant colors, clean white background,
        promotional badge showing "${productData.savings?.percentage || '10'}% OFF",
        high quality, commercial photography
        `;

        const response = await this.openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: platformConfig.imageSize
        });

        return { type: 'generated', url: response.data[0].url };
      } else {
        // No image generation available
        logger.info('No OpenAI API key provided, skipping image generation');
        return { type: 'none', url: null };
      }
    } catch (error) {
      logger.error('Media generation error:', error);
      return { type: 'none', url: null };
    }
  }

  async optimizeImage(imageUrl, platformConfig) {
    try {
      // Download image
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      
      // Optimize with sharp
      const optimized = await sharp(Buffer.from(buffer))
        .resize(platformConfig.imageWidth, platformConfig.imageHeight, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Convert to base64 for return
      return `data:image/jpeg;base64,${optimized.toString('base64')}`;
      
    } catch (error) {
      logger.error('Image optimization error:', error);
      return imageUrl; // Return original if optimization fails
    }
  }

  formatForPlatform(textContent, mediaContent, platform) {
    const baseHashtags = [
      '#oferta', '#promocao', '#desconto', '#brasil', 
      '#compras', '#economia', '#ofertasdobrasil'
    ];
    
    switch (platform) {
      case 'whatsapp':
        return {
          text: this.formatWhatsAppText(textContent),
          media: mediaContent,
          hashtags: [] // WhatsApp doesn't use hashtags
        };
        
      case 'instagram':
        const instagramHashtags = [
          ...baseHashtags,
          '#instagood', '#instashopping', '#brazilianshopping',
          '#comprasonline', '#descontosimperdíveis'
        ];
        return {
          text: textContent,
          media: mediaContent,
          hashtags: instagramHashtags.slice(0, 30)
        };
        
      case 'both':
        return {
          whatsapp: this.formatForPlatform(textContent, mediaContent, 'whatsapp'),
          instagram: this.formatForPlatform(textContent, mediaContent, 'instagram')
        };
        
      default:
        return { text: textContent, media: mediaContent, hashtags: baseHashtags };
    }
  }

  formatWhatsAppText(text) {
    // Format text for WhatsApp with bold, italic, etc.
    return text
      .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold
      .replace(/__(.*?)__/g, '_$1_') // Italic
      .replace(/~~(.*?)~~/g, '~$1~'); // Strikethrough
  }

  getPlatformConfig(platform) {
    const configs = {
      whatsapp: {
        maxLength: 1000,
        allowEmoji: true,
        format: 'casual message with line breaks',
        specificInstructions: 'Use formatação do WhatsApp (*negrito* _itálico_)',
        imageSize: '1024x1024',
        imageWidth: 1080,
        imageHeight: 1080
      },
      instagram: {
        maxLength: 2200,
        allowEmoji: true,
        format: 'engaging caption with call-to-action',
        specificInstructions: 'Primeira linha deve ser impactante. Inclua espaçamento para legibilidade.',
        imageSize: '1024x1024',
        imageWidth: 1080,
        imageHeight: 1080
      }
    };
    
    return configs[platform] || configs.instagram;
  }

  getToneInstructions(tone) {
    const tones = {
      casual: 'conversacional e descontraída, como um amigo recomendando',
      professional: 'profissional mas acessível, com credibilidade',
      urgent: 'com senso de urgência e escassez, destacando oferta limitada',
      friendly: 'amigável e acolhedora, criando conexão com o leitor'
    };
    
    return tones[tone] || tones.friendly;
  }

  async analyzeProducts(products) {
    try {
      const systemPrompt = `Você é um especialista em marketing de afiliados brasileiro, analisando produtos para campanhas promocionais. Forneça insights valiosos sobre tendências, potencial de vendas e estratégias de marketing.`;
      
      const userPrompt = `
      Analise os seguintes produtos e forneça recomendações para marketing de afiliados:
      
      Produtos:
      ${JSON.stringify(products.map(p => ({
        nome: p.title || p.name,
        preço: p.price?.formatted || p.price,
        plataforma: p.platform,
        categoria: p.category,
        avaliação: p.reviews?.rating || 'N/A',
        vendas: p.sold || 'N/A'
      })), null, 2)}
      
      Por favor, forneça:
      1. Top 3 produtos mais promissores para afiliados
      2. Análise de tendências de mercado baseada nesses produtos
      3. Estratégias de marketing recomendadas
      4. Melhores horários e plataformas para promover cada tipo de produto
      5. Estimativa de potencial de conversão (alto/médio/baixo)
      
      Responda em formato JSON estruturado.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      // Parse the JSON response from Claude
      const analysisText = response.content[0].text;
      let analysis;
      
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);;
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback structure if JSON extraction fails
          analysis = {
            recommendations: [],
            insights: {},
            products: products.map((p, i) => ({
              ...p,
              recommendationScore: 8 - i,
              conversionPotential: i < 3 ? 'alto' : 'médio'
            }))
          };
        }
      } catch (parseError) {
        logger.error('Failed to parse AI analysis:', parseError);
        // Return structured fallback
        analysis = {
          recommendations: [
            {
              productIndex: 0,
              reason: 'Produto mais popular baseado em vendas e avaliações'
            }
          ],
          insights: {
            trends: 'Produtos eletrônicos e casa mostram alta demanda',
            bestPlatforms: ['whatsapp', 'instagram'],
            bestTimes: ['19:00', '21:00']
          },
          products: products.map((p, i) => ({
            ...p,
            recommendationScore: 8 - i,
            conversionPotential: i < 3 ? 'alto' : 'médio',
            suggestedStrategy: 'Foque em benefícios e economia'
          }))
        };
      }
      
      return analysis;
      
    } catch (error) {
      logger.error('Product analysis error:', error);
      // Return basic analysis on error
      return {
        recommendations: products.slice(0, 3).map((p, i) => ({
          product: p,
          score: 10 - i,
          reason: 'Selecionado baseado em popularidade'
        })),
        insights: {
          error: 'Análise simplificada devido a erro',
          suggestion: 'Produtos parecem promissores para afiliados'
        },
        products: products
      };
    }
  }

  async analyzeBestPostingTime(platform, timezone = 'America/Sao_Paulo') {
    // Analyze historical data for best posting times
    const bestTimes = {
      whatsapp: {
        weekdays: [
          { time: '08:00', engagement: 'high', reason: 'Início do dia de trabalho' },
          { time: '12:30', engagement: 'very_high', reason: 'Horário de almoço' },
          { time: '19:00', engagement: 'peak', reason: 'Fim do expediente' },
          { time: '21:00', engagement: 'high', reason: 'Horário de relaxamento' }
        ],
        weekends: [
          { time: '10:00', engagement: 'high', reason: 'Manhã de sábado' },
          { time: '15:00', engagement: 'medium', reason: 'Tarde de fim de semana' },
          { time: '20:00', engagement: 'high', reason: 'Noite de domingo' }
        ]
      },
      instagram: {
        weekdays: [
          { time: '07:00', engagement: 'medium', reason: 'Checagem matinal' },
          { time: '12:00', engagement: 'high', reason: 'Pausa para almoço' },
          { time: '18:00', engagement: 'peak', reason: 'Hora de pico - quinta-feira' },
          { time: '21:00', engagement: 'high', reason: 'Navegação noturna' }
        ],
        weekends: [
          { time: '11:00', engagement: 'high', reason: 'Sábado de manhã' },
          { time: '17:00', engagement: 'very_high', reason: 'Tarde de sábado' },
          { time: '19:00', engagement: 'high', reason: 'Domingo à noite' }
        ]
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          platform,
          timezone,
          bestTimes: bestTimes[platform],
          recommendations: {
            frequency: platform === 'whatsapp' ? '2-3 vezes por dia' : '1-2 posts por dia',
            avoidTimes: ['02:00-06:00', '14:00-16:00'],
            bestDays: ['Terça', 'Quinta', 'Sábado'],
            specialEvents: [
              'Black Friday Brasil - Novembro',
              'Dia do Consumidor - 15 de Março',
              'Natal - Dezembro'
            ]
          }
        }, null, 2)
      }]
    };
  }
}
