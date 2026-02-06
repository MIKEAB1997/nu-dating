import { processMessage } from '../routers/aiRouter.js';
import { getCached, setCached } from '../utils/cache.js';

/**
 * Handle text messages
 * @param {string} messageText - The text message
 * @param {string} senderId - Sender's ID
 * @returns {Promise<string>} - AI response
 */
export async function handleTextMessage(messageText, senderId) {
  try {
    console.log(`\n📝 Processing text message from ${senderId}`);
    console.log(`Message: ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}`);

    // Check cache for similar messages
    const cacheKey = `text:${messageText.toLowerCase().trim()}`;
    const cachedResponse = getCached(cacheKey);

    if (cachedResponse) {
      console.log('✅ Returning cached response');
      return cachedResponse;
    }

    // Process with AI
    const response = await processMessage(messageText, {
      mediaType: 'text',
    });

    // Cache the response
    setCached(cacheKey, response);

    console.log('✅ Text message processed successfully');
    return response;
  } catch (error) {
    console.error('❌ Error handling text message:', error);

    // Provide specific error messages based on error type
    let userMessage = 'סליחה, אני לא מצליח לעבד את ההודעה כרגע.\n\n';

    if (error.message.includes('Gemini API')) {
      userMessage += '🔴 בעיה בשירות Gemini AI.\nאנא נסה שוב בעוד כמה רגעים.';
    } else if (error.message.includes('Claude API')) {
      userMessage += '🔴 בעיה בשירות Claude AI.\nאנא נסה שוב בעוד כמה רגעים.';
    } else if (error.message.includes('quota') || error.message.includes('Quota')) {
      userMessage += '⚠️ הגעתי למכסת השימוש.\nאנא צור קשר עם התמיכה.';
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      userMessage += '⏱️ הבקשה לקחה יותר מדי זמן.\nאנא נסה שוב.';
    } else {
      userMessage += '🐛 שגיאה לא צפויה.\nאנא נסה שוב מאוחר יותר.';
    }

    userMessage += '\n\n🍌 נאנו בננה';

    return userMessage;
  }
}
