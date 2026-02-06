import { sendToGemini, analyzeVideo, searchWeb, analyzeImage as geminiAnalyzeImage } from '../services/gemini.js';
import { sendToClaude, isClaudeAvailable } from '../services/claude.js';
import { handleImageGeneration } from '../handlers/imageGenHandler.js';

/**
 * Decide which AI to use based on message content and type
 * Claude: Complex questions, code, deep analysis, strategy
 * Gemini: Videos, web search, simple questions, fast responses
 * @param {string} message - The message text
 * @param {string} mediaType - Type of media ('text', 'image', 'video', 'audio', etc.)
 * @param {number} messageLength - Length of the message
 * @returns {string} - AI service to use ('claude' or 'gemini')
 */
export function routeToAI(message, mediaType = 'text', messageLength = 0) {
  // Check for image generation intent first (before AI availability check)
  const imageGenKeywords = [
    'צור תמונה', 'תייצר תמונה', 'עשה תמונה', 'בנה תמונה',
    'generate image', 'create image', 'make image', 'design image',
    'צור לי לוגו', 'תעצב לי', 'תכנן לי', 'עיצוב',
    'logo', 'לוגו', 'תמונה של', 'picture of', 'image of'
  ];

  if (imageGenKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
    console.log('🎨 Using Image Generator');
    return 'image-generator';
  }

  // If Claude is not available, always use Gemini
  if (!isClaudeAvailable()) {
    console.log('ℹ️ Claude not available - using Gemini');
    if (mediaType === 'video') {
      console.log('🎥 Using Gemini: Video analysis');
    } else if (mediaType === 'image') {
      console.log('🖼️ Using Gemini: Image analysis');
    } else {
      console.log('💬 Using Gemini: Text processing');
    }
    return 'gemini';
  }

  // Video always goes to Gemini (better at video)
  if (mediaType === 'video') {
    console.log('🎥 Using Gemini: Video analysis');
    return 'gemini';
  }

  // Check for web search intent - use Gemini
  const searchKeywords = ['חפש', 'search', 'מה קורה', 'חדשות', 'news', 'עדכני', 'current', 'latest', 'what\'s happening'];
  if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
    console.log('🌐 Using Gemini: Web search');
    return 'gemini';
  }

  // Complex queries go to Claude
  const complexKeywords = [
    'קוד', 'code', 'תכנות', 'programming', 'bug', 'באג',
    'אסטרטגיה', 'strategy', 'תכנון', 'plan', 'design',
    'הסבר', 'explain', 'למה', 'why', 'איך', 'how',
    'פתור', 'solve', 'בעיה', 'problem',
    'נתח', 'analyze', 'סיכום', 'summary',
    'משימה', 'task', 'פרויקט', 'project',
    'מסמך', 'document', 'דוח', 'report'
  ];

  if (complexKeywords.some(keyword => message.toLowerCase().includes(keyword)) || messageLength > 300) {
    console.log('🤖 Using Claude: Complex query');
    return 'claude';
  }

  // Images with complex questions go to Claude
  if (mediaType === 'image' && messageLength > 50) {
    console.log('🤖 Using Claude: Complex image analysis');
    return 'claude';
  }

  // Default: simple questions to Gemini (faster + cheaper)
  console.log('💬 Using Gemini: Simple query');
  return 'gemini';
}

/**
 * Process a message with the appropriate AI
 * @param {string} message - The message text
 * @param {Object} options - Processing options
 * @param {string} options.mediaType - Type of media
 * @param {string} options.mediaData - Base64 encoded media data
 * @param {string} options.mimeType - MIME type of media
 * @returns {Promise<string>} - AI response
 */
export async function processMessage(message, options = {}) {
  const {
    mediaType = 'text',
    mediaData = null,
    mimeType = null,
    from = null,
  } = options;

  try {
    // Decide which AI to use
    const aiService = routeToAI(message, mediaType, message.length);

    // Handle image generation requests
    if (aiService === 'image-generator') {
      console.log('🎨 Routing to image generation handler');
      // Note: image generation needs 'from' to send a WhatsApp message
      // If called without 'from', just return the response text
      return await handleImageGeneration(message, from);
    }

    // Handle video (always Gemini)
    if (mediaType === 'video' && mediaData) {
      console.log('📹 Processing video with Gemini...');
      return await analyzeVideo(mediaData, mimeType, message || 'נתח את הסרטון הזה בפירוט');
    }

    // Handle images
    if (mediaType === 'image' && mediaData) {
      if (aiService === 'claude') {
        console.log('🖼️ Processing image with Claude...');
        const mediaArray = [{ mimeType, data: mediaData }];
        return await sendToClaude(message || 'מה אתה רואה בתמונה? תן תיאור מפורט', mediaArray);
      } else {
        console.log('🖼️ Processing image with Gemini...');
        return await geminiAnalyzeImage(mediaData, mimeType, message || 'מה אתה רואה בתמונה? תן תיאור מפורט');
      }
    }

    // Handle text messages
    console.log(`💬 Processing text with ${aiService === 'claude' ? 'Claude' : 'Gemini'}...`);

    // Enhance prompt based on content type
    let enhancedMessage = message;

    // Check for web search intent
    const searchKeywords = ['חפש', 'search', 'מה קורה', 'חדשות', 'news', 'עדכני', 'current', 'latest', 'what\'s happening'];
    if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      enhancedMessage = `חפש באינטרנט ותן מידע עדכני על: ${message}`;
    }

    // Route to appropriate service with fallback
    try {
      if (aiService === 'claude') {
        return await sendToClaude(enhancedMessage);
      } else {
        return await sendToGemini(enhancedMessage);
      }
    } catch (primaryError) {
      console.error(`❌ Primary AI (${aiService}) failed:`, primaryError.message);

      // Try fallback if Gemini failed and Claude is available
      if (aiService === 'gemini' && isClaudeAvailable()) {
        console.log('🔄 Falling back to Claude...');
        try {
          return await sendToClaude(enhancedMessage);
        } catch (fallbackError) {
          console.error('❌ Fallback to Claude also failed:', fallbackError.message);
          throw primaryError; // throw original error
        }
      }

      // No fallback available, throw original error
      throw primaryError;
    }

  } catch (error) {
    console.error('Error processing message:', error);
    throw new Error(`שגיאה בעיבוד ההודעה: ${error.message}`);
  }
}
