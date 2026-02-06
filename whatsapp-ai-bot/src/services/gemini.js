import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// נאנו בננה personality - added to each prompt instead of systemInstruction
// to ensure compatibility with gemini-1.5-flash on v1 API
const NANO_BANANA_PERSONALITY = `אתה נאנו בננה 🍌 - בוט WhatsApp חכם, מהיר וידידותי שנבנה עם Gemini AI.

🤖 מי אתה:
נאנו בננה - בוט קטן אבל חזק, מהיר וחכם שעוזר בכל דבר!
- נאנו = מהיר, טכנולוגי, מדויק
- בננה = אנרגטי, ישראלי, ידידותי

תפקידך:
- לענות על שאלות בצורה מהירה וברורה
- לנתח תמונות וסרטונים
- לחפש מידע באינטרנט ולהחזיר תוצאות עדכניות
- לספק תשובות מדויקות ותמציתיות
- לעזור במשימות יומיומיות

סגנון תשובות:
- תמיד ענה בעברית אלא אם המשתמש מבקש אחרת
- היה ידידותי, מקצועי ונגיש
- תן תשובות קצרות וממוקדות
- אם משהו לא ברור - שאל שאלות הבהרה
- אם אתה לא יודע משהו - תגיד זאת בכנות
- סיים כל תשובה עם החתימה: 🍌 נאנו בננה - הבוט החכם שלך

יכולות מיוחדות:
- ניתוח וידאו מתקדם
- חיפוש מידע באינטרנט בזמן אמת
- ניתוח תמונות מהיר
- תגובות מהירות לשאלות פשוטות`;

/**
 * Send a message to Gemini AI
 * @param {string} message - The text message to send
 * @param {Array} mediaData - Optional array of media objects {mimeType, data}
 * @returns {Promise<string>} - Gemini's response
 */
export async function sendToGemini(message, mediaData = []) {
  try {
    // Use gemini-1.5-flash WITHOUT systemInstruction - only way to use v1 stable API
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    // Add personality directly to message (no systemInstruction)
    const fullMessage = `${NANO_BANANA_PERSONALITY}\n\n${message}`;

    let prompt;

    if (mediaData && mediaData.length > 0) {
      // For media (images/videos)
      prompt = [
        fullMessage,
        ...mediaData.map(media => ({
          inlineData: {
            mimeType: media.mimeType,
            data: media.data,
          },
        })),
      ];
    } else {
      // Text only
      prompt = fullMessage;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error calling Gemini API:', {
      error: error.message,
      status: error.status,
      statusText: error.statusText,
      model: 'gemini-1.5-flash'
    });

    // Add more specific error information
    let errorMessage = `Gemini API error: ${error.message}`;
    if (error.status === 404) {
      errorMessage += ' [Model not found - check API version]';
    } else if (error.status === 429) {
      errorMessage += ' [Quota exceeded]';
    }

    throw new Error(errorMessage);
  }
}

/**
 * Analyze a video using Gemini
 * @param {string} videoData - Base64 encoded video data
 * @param {string} mimeType - Video MIME type (e.g., 'video/mp4')
 * @param {string} prompt - Optional prompt for the analysis
 * @returns {Promise<string>} - Gemini's analysis
 */
export async function analyzeVideo(videoData, mimeType, prompt = 'Please analyze this video and provide a detailed description of what you see.') {
  return await sendToGemini(prompt, [{
    mimeType,
    data: videoData,
  }]);
}

/**
 * Search the web and answer using Gemini
 * @param {string} query - The search query
 * @returns {Promise<string>} - Gemini's response with web search results
 */
export async function searchWeb(query) {
  const enhancedQuery = `Please search the web and provide current information about: ${query}\n\nProvide accurate, up-to-date information from reliable sources.`;
  return await sendToGemini(enhancedQuery);
}

/**
 * Analyze an image using Gemini
 * @param {string} imageData - Base64 encoded image data
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} prompt - Optional prompt for the analysis
 * @returns {Promise<string>} - Gemini's analysis
 */
export async function analyzeImage(imageData, mimeType, prompt = 'What do you see in this image? Provide a detailed description.') {
  return await sendToGemini(prompt, [{
    mimeType,
    data: imageData,
  }]);
}
