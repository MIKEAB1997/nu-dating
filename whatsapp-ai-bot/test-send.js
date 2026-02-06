import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TO_NUMBER = '972535315154';

console.log('🔍 בודק הגדרות WhatsApp API...\n');
console.log(`📞 Phone Number ID: ${PHONE_NUMBER_ID}`);
console.log(`🎯 To Number: ${TO_NUMBER}`);
console.log(`🔑 Token (first 20 chars): ${WHATSAPP_TOKEN?.substring(0, 20)}...`);
console.log('\n📤 שולח הודעת בדיקה...\n');

const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: TO_NUMBER,
  type: 'text',
  text: {
    body: '🧪 הודעת בדיקה מהבוט! אם אתה רואה את זה - הכל עובד מעולה! 🎉'
  }
};

console.log('📋 Request payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n🌐 API URL:', url);
console.log('\n⏳ שולח בקשה...\n');

try {
  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('✅ התשובה התקבלה!\n');
  console.log('📊 Status:', response.status);
  console.log('📄 Response data:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n🎉 ההודעה נשלחה בהצלחה! בדוק את ה-WhatsApp שלך.');

} catch (error) {
  console.error('❌ שגיאה בשליחת ההודעה!\n');

  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Error data:');
    console.error(JSON.stringify(error.response.data, null, 2));

    // Parse common errors
    const errorData = error.response.data;
    const errorMessage = errorData?.error?.message;
    const errorCode = errorData?.error?.code;

    console.error('\n🔍 ניתוח השגיאה:');
    console.error(`   קוד שגיאה: ${errorCode}`);
    console.error(`   הודעת שגיאה: ${errorMessage}`);

    if (errorMessage?.includes('permissions')) {
      console.error('\n💡 נראה שיש בעיית הרשאות. ודא ש:');
      console.error('   1. ה-Token תקף ולא פג תוקפו');
      console.error('   2. יש לך הרשאות לשלוח הודעות');
      console.error('   3. מספר הטלפון מאומת ב-WhatsApp Business');
    }

    if (errorMessage?.includes('phone number')) {
      console.error('\n💡 נראה שיש בעיה עם מספר הטלפון. ודא ש:');
      console.error('   1. מספר הטלפון בפורמט הנכון (972535315154)');
      console.error('   2. המספר רשום ב-WhatsApp');
    }

    if (errorCode === 100 || errorCode === 190) {
      console.error('\n💡 בעיית Token:');
      console.error('   1. ה-Token אולי לא תקף');
      console.error('   2. צריך ליצור Token חדש ב-Meta Developer Console');
    }

  } else if (error.request) {
    console.error('❌ לא התקבלה תשובה מהשרת');
    console.error('בדוק את חיבור האינטרנט');
  } else {
    console.error('❌ שגיאה:', error.message);
  }

  process.exit(1);
}
