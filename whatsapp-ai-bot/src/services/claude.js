import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';

let anthropic;

// Initialize Claude client only if API key is provided
if (config.anthropicApiKey && config.anthropicApiKey !== 'YOUR_CLAUDE_KEY_HERE') {
  anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
  });
}

/**
 * Send a message to Claude AI
 * @param {string} message - The text message to send
 * @param {Array} mediaData - Optional array of media objects {mimeType, data}
 * @returns {Promise<string>} - Claude's response
 */
export async function sendToClaude(message, mediaData = []) {
  if (!anthropic) {
    throw new Error('Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file.');
  }

  try {
    console.log('🤖 Processing with Claude...');

    // Build content array
    const content = [];

    // Add images if provided
    if (mediaData && mediaData.length > 0) {
      for (const media of mediaData) {
        if (media.mimeType.startsWith('image/')) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: media.mimeType,
              data: media.data,
            },
          });
        }
      }
    }

    // Add text message
    content.push({
      type: 'text',
      text: message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: content,
      }],
      system: `אתה נאנו בננה 🍌 - בוט WhatsApp חכם, מהיר וידידותי שנבנה עם Claude Code.

🤖 מי אתה:
נאנו בננה - בוט קטן אבל חזק, מהיר וחכם שעוזר בכל דבר!
- נאנו = מהיר, טכנולוגי, מדויק
- בננה = אנרגטי, ישראלי, ידידותי

תפקידך:
- לענות על שאלות בצורה ברורה ומדויקת
- לנתח תמונות ומסמכים בפירוט
- לעזור במשימות מורכבות ובעיות שדורשות חשיבה עמוקה
- לכתוב קוד ולפתור בעיות טכניות
- לספק הסברים מפורטים כשצריך
- לעזור בניהול משימות ומעקב אחר פרויקטים

סגנון תשובות:
- תמיד ענה בעברית אלא אם המשתמש מבקש אחרת
- היה ידידותי, מקצועי ונגיש
- תן תשובות תמציתיות אך מלאות
- אם משהו לא ברור - שאל שאלות הבהרה
- אם אתה לא יודע משהו - תגיד זאת בכנות
- סיים כל תשובה עם החתימה: 🍌 נאנו בננה - הבוט החכם שלך

יכולות מיוחדות:
- ניתוח תמונות ומסמכים מורכבים
- כתיבה ובדיקת קוד
- עזרה בתכנון ואסטרטגיה
- פתרון בעיות מורכבות עם הסבר מפורט
- מצוין בניתוח טכני ומקצועי`,
    });

    const responseText = response.content[0].text;
    console.log('✅ Claude response received');
    return responseText;

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Claude API error: ${error.message}`);
  }
}

/**
 * Check if Claude API is available
 * @returns {boolean}
 */
export function isClaudeAvailable() {
  return !!anthropic;
}
