import axios from 'axios';
import { config } from '../config/env.js';
import { handleTextMessage } from '../handlers/textHandler.js';
import { handleImageMessage } from '../handlers/imageHandler.js';
import { handleVideoMessage } from '../handlers/videoHandler.js';

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${config.whatsappPhoneNumberId}`;

/**
 * Send a text message via WhatsApp Cloud API
 * @param {string} to - Recipient phone number (without @c.us)
 * @param {string} text - Message text
 * @returns {Promise<object>} - API response
 */
export async function sendTextMessage(to, text) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          'Authorization': `Bearer ${config.whatsappToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send a message with media
 * @param {string} to - Recipient phone number
 * @param {string} mediaType - 'image' or 'video'
 * @param {string} mediaUrl - URL of the media
 * @param {string} caption - Optional caption
 * @returns {Promise<object>} - API response
 */
export async function sendMediaMessage(to, mediaType, mediaUrl, caption = '') {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: mediaType,
      [mediaType]: {
        link: mediaUrl,
      },
    };

    if (caption) {
      payload[mediaType].caption = caption;
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${config.whatsappToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending media message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Download media from WhatsApp
 * @param {string} mediaId - Media ID from webhook
 * @returns {Promise<Buffer>} - Media data
 */
export async function downloadMedia(mediaId) {
  try {
    // First, get the media URL
    const urlResponse = await axios.get(
      `https://graph.facebook.com/v21.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.whatsappToken}`,
        },
      }
    );

    const mediaUrl = urlResponse.data.url;

    // Then download the actual media
    const mediaResponse = await axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${config.whatsappToken}`,
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(mediaResponse.data);
  } catch (error) {
    console.error('Error downloading media:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Process incoming webhook message
 * @param {object} message - Message object from webhook
 * @returns {Promise<void>}
 */
export async function processIncomingMessage(message) {
  try {
    const from = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📨 New message from: ${from}`);
    console.log(`🆔 Message ID: ${messageId}`);
    console.log(`⏰ Timestamp: ${new Date(timestamp * 1000).toLocaleString()}`);

    let response;

    // Handle different message types
    if (message.type === 'text') {
      console.log('💬 Message type: Text');
      console.log(`📝 Content: ${message.text.body}`);
      response = await handleTextMessage(message.text.body, from);
    } else if (message.type === 'image') {
      console.log('📷 Message type: Image');
      const imageBuffer = await downloadMedia(message.image.id);
      const base64Image = `data:${message.image.mime_type};base64,${imageBuffer.toString('base64')}`;
      const caption = message.image.caption || '';
      response = await handleImageMessage(base64Image, caption, from);
    } else if (message.type === 'video') {
      console.log('🎬 Message type: Video');
      const videoBuffer = await downloadMedia(message.video.id);
      const base64Video = `data:${message.video.mime_type};base64,${videoBuffer.toString('base64')}`;
      const caption = message.video.caption || '';
      response = await handleVideoMessage(base64Video, caption, from);
    } else {
      response = 'סליחה, אני תומך רק בהודעות טקסט, תמונות וסרטונים.';
    }

    // Send response
    console.log(`\n💬 Sending response...`);
    await sendTextMessage(from, response);
    console.log(`✅ Response sent successfully!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (error) {
    console.error('❌ Error processing message:', error);
    try {
      await sendTextMessage(message.from, 'סליחה, אירעה שגיאה בעיבוד ההודעה. נסה שוב מאוחר יותר.');
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  }
}

/**
 * Send initial surprise message
 * @param {string} phoneNumber - Phone number to send to
 * @returns {Promise<void>}
 */
export async function sendSurpriseMessage(phoneNumber) {
  const message =
    '🍌 *שלום! אני נאנו בננה - הבוט החכם שלך!* 🍌\n\n' +
    '✨ בוט קטן אבל חזק, מהיר וחכם שעוזר בכל דבר! ✨\n\n' +
    '🤖 *היכולות שלי:*\n\n' +
    '📸 *ניתוח תמונות* - שלח לי תמונה ואנתח אותה בפירוט\n' +
    '🎨 *יצירת תמונות* - בקש ואצור לך לוגו או עיצוב מותאם אישית\n' +
    '🎥 *ניתוח וידאו* - אסכם ואנתח סרטונים (הכי חזק!)\n' +
    '🌐 *חיפוש באינטרנט* - מידע עדכני בזמן אמת\n' +
    '💬 *שיחה חכמה* - תגובות מדויקות ומפורטות\n' +
    '📊 *ניתוח מסמכים* - תרשימים, טבלאות, PDF\n' +
    '🧠 *פתרון בעיות* - עזרה בקידוד, מתמטיקה, היגיון\n' +
    '📚 *הסברים מפורטים* - כל נושא שתבקש\n' +
    '🎯 *המלצות אישיות* - ייעוץ והכוונה\n' +
    '📬 *התראות חכמות* - עדכונים על משימות ופרויקטים\n\n' +
    '🚀 *מופעל על ידי Claude Sonnet 4.5 + Gemini AI*\n' +
    '⚡ זמין 24/7 ללא הפסקה\n' +
    '🔄 מתעדכן באופן שוטף\n\n' +
    '💡 *דוגמאות לשימוש:*\n' +
    '• "חפש באינטרנט על AI חדשות 2026"\n' +
    '• "צור לי לוגו צהוב עם בננה"\n' +
    '• שלח תמונה ושאל "מה זה?"\n' +
    '• שלח וידאו לסיכום מהיר\n' +
    '• "עזור לי לפתור בעיה ב..."\n' +
    '• "הסבר לי איך עובד..."\n' +
    '• "תן לי רעיונות ל..."\n\n' +
    '🎯 אני פה לעזור בכל דבר!\n\n' +
    '💪 נבנה עם ❤️ על ידי Claude Code + Gemini AI\n\n' +
    '🍌 נאנו בננה - הבוט החכם שלך';

  try {
    console.log(`\n🎊 שולח הודעת הפתעה ל-${phoneNumber}...`);
    await sendTextMessage(phoneNumber, message);
    console.log('✅ הודעת ההפתעה נשלחה בהצלחה!\n');
  } catch (error) {
    console.error('❌ שגיאה בשליחת הודעת הפתעה:', error);
    throw error;
  }
}
