import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TO_NUMBER = '972535315154';

const surpriseMessage = `🎉 הפתעה מיוחדת! 🎉

✨ הבוט שלך משודרג ועכשיו בעל יכולות על! ✨

🤖 יש לי עכשיו שני מוחות AI:

🔷 Claude Sonnet 4.5 (אני!)
• שאלות מורכבות וניתוח עמוק
• כתיבת קוד ופתרון באגים
• תכנון אסטרטגי ועזרה במשימות
• ניתוח מסמכים וטקסטים ארוכים
• חשיבה עמוקה ופתרון בעיות

🔶 Gemini 1.5 Flash
• שאלות מהירות ותשובות קלילות
• ניתוח וידאו מלא
• חיפוש באינטרנט בזמן אמת
• תגובות מהירות

💡 איך זה עובד?
אני מחליט אוטומטית איזה AI הכי מתאים לכל שאלה!

📝 דוגמאות:
• "הסבר לי איך עובד..." → Claude 🤖
• "כתוב לי קוד ש..." → Claude 🤖
• "חפש באינטרנט..." → Gemini 🔶
• שאלה מורכבת → Claude 🤖
• שאלה פשוטה → Gemini 🔶

🎯 נסה עכשיו! שלח לי שאלה ותראה את הקסם!

🌍 אני מדבר בכל השפות שתרצה:
• עברית ✅
• English ✅
• العربية ✅
• ועוד...

💪 נבנה עם ❤️ על ידי Claude Code!`;

console.log('🎉 שולח הודעה מתוקנת עם עברית תקינה...\n');

const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: TO_NUMBER,
  type: 'text',
  text: {
    body: surpriseMessage
  }
};

try {
  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  console.log('✅ הודעה נשלחה בהצלחה!');
  console.log('📊 Status:', response.status);
  console.log('📄 Message ID:', response.data.messages[0].id);
  console.log('\n🎉 בדוק את ה-WhatsApp שלך!');

} catch (error) {
  console.error('❌ שגיאה:');
  if (error.response) {
    console.error(JSON.stringify(error.response.data, null, 2));
  } else {
    console.error(error.message);
  }
}
