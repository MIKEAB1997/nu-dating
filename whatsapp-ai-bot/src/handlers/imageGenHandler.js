import { sendTextMessage } from '../services/whatsapp-cloud.js';

/**
 * Handle image generation requests
 * @param {string} prompt - Description of image to create
 * @param {string} from - Sender phone number
 * @returns {Promise<string>} - Response message
 */
export async function handleImageGeneration(prompt, from) {
  try {
    console.log(`🎨 Image generation request: "${prompt}"`);

    // For now, provide a helpful response about image generation
    // TODO: In the future, integrate with DALL-E or Stable Diffusion API
    const response =
      `🎨 *יצירת תמונות*\n\n` +
      `קיבלתי את הבקשה שלך: "${prompt}"\n\n` +
      `📝 *מה אני יכול לעשות עכשיו:*\n` +
      `• לנתח תמונות קיימות בפירוט\n` +
      `• לעזור לך לתכנן עיצוב (מושגים, צבעים, רעיונות)\n` +
      `• להמליץ על כלים ליצירת תמונות\n\n` +
      `🔮 *בקרוב:*\n` +
      `יכולת יצירת תמונות אוטומטית תתווסף בעדכון הבא!\n\n` +
      `💡 *בינתיים, אני ממליץ:*\n` +
      `• DALL-E (OpenAI)\n` +
      `• Midjourney\n` +
      `• Stable Diffusion\n\n` +
      `🍌 נאנו בננה - הבוט החכם שלך`;

    await sendTextMessage(from, response);
    return response;
  } catch (error) {
    console.error('Error in image generation handler:', error);
    const errorMessage =
      `סליחה, נתקלתי בבעיה בעת טיפול בבקשת יצירת התמונה.\n\n` +
      `🍌 נאנו בננה - הבוט החכם שלך`;

    await sendTextMessage(from, errorMessage);
    return errorMessage;
  }
}
