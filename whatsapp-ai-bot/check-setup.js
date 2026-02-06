import axios from 'axios';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

console.log('\n' + chalk.blue.bold('═══════════════════════════════════════════'));
console.log(chalk.blue.bold('   בדיקת הגדרות WhatsApp Bot'));
console.log(chalk.blue.bold('═══════════════════════════════════════════') + '\n');

let allGood = true;

// 1. Check environment variables
console.log(chalk.yellow('📋 בודק משתני סביבה...'));
if (WHATSAPP_TOKEN) {
  console.log(chalk.green('✅ WHATSAPP_TOKEN מוגדר'));
  console.log(chalk.gray(`   (${WHATSAPP_TOKEN.substring(0, 20)}...)`));
} else {
  console.log(chalk.red('❌ WHATSAPP_TOKEN חסר'));
  allGood = false;
}

if (PHONE_NUMBER_ID) {
  console.log(chalk.green('✅ PHONE_NUMBER_ID מוגדר'));
  console.log(chalk.gray(`   (${PHONE_NUMBER_ID})`));
} else {
  console.log(chalk.red('❌ PHONE_NUMBER_ID חסר'));
  allGood = false;
}

if (BUSINESS_ACCOUNT_ID) {
  console.log(chalk.green('✅ BUSINESS_ACCOUNT_ID מוגדר'));
  console.log(chalk.gray(`   (${BUSINESS_ACCOUNT_ID})`));
} else {
  console.log(chalk.red('❌ BUSINESS_ACCOUNT_ID חסר'));
  allGood = false;
}

console.log('');

// 2. Check Token validity
console.log(chalk.yellow('🔑 בודק תקינות Token...'));
try {
  const response = await axios.get(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}`,
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    }
  );

  console.log(chalk.green('✅ Token תקין ופעיל'));
  console.log(chalk.gray(`   Phone Number: ${response.data.display_phone_number || 'N/A'}`));
  console.log(chalk.gray(`   Verified Name: ${response.data.verified_name || 'N/A'}`));
} catch (error) {
  console.log(chalk.red('❌ Token לא תקין או אין הרשאות'));
  if (error.response) {
    console.log(chalk.red(`   שגיאה: ${error.response.data.error.message}`));
    console.log(chalk.yellow('   💡 עליך ליצור Token חדש ב-Meta Developer Console'));
  }
  allGood = false;
}

console.log('');

// 3. Check message sending permissions
console.log(chalk.yellow('📤 בודק הרשאות שליחה...'));
try {
  // Try to get business account info (requires permissions)
  const response = await axios.get(
    `https://graph.facebook.com/v21.0/${BUSINESS_ACCOUNT_ID}`,
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    }
  );

  console.log(chalk.green('✅ יש הרשאות גישה ל-Business Account'));
  console.log(chalk.gray(`   Account: ${response.data.name || 'N/A'}`));
} catch (error) {
  console.log(chalk.red('❌ אין הרשאות גישה ל-Business Account'));
  if (error.response) {
    console.log(chalk.red(`   שגיאה: ${error.response.data.error.message}`));
    if (error.response.data.error.message.includes('permission')) {
      console.log(chalk.yellow('   💡 ה-Token לא כולל את ההרשאות הנדרשות:'));
      console.log(chalk.yellow('      - whatsapp_business_messaging'));
      console.log(chalk.yellow('      - whatsapp_business_management'));
    }
  }
  allGood = false;
}

console.log('');

// 4. Check webhook endpoint
console.log(chalk.yellow('🌐 בודק Webhook endpoint...'));
try {
  const response = await axios.get('http://localhost:8080/health');
  if (response.status === 200) {
    console.log(chalk.green('✅ Server רץ על localhost:8080'));
  }
} catch (error) {
  console.log(chalk.red('❌ Server לא רץ'));
  console.log(chalk.yellow('   💡 הרץ: npm run start:cloud'));
  allGood = false;
}

console.log('');

// Summary
console.log(chalk.blue.bold('═══════════════════════════════════════════'));
if (allGood) {
  console.log(chalk.green.bold('🎉 הכל מוכן! הבוט יכול לעבוד!'));
  console.log('');
  console.log(chalk.cyan('📝 צעדים הבאים:'));
  console.log('   1. ודא ש-Subscribe ל-"messages" ב-Meta Console');
  console.log('   2. שלח הודעה למספר הבוט ב-WhatsApp');
  console.log('   3. בדוק את הלוגים של הServer');
} else {
  console.log(chalk.red.bold('⚠️  יש בעיות שצריך לתקן'));
  console.log('');
  console.log(chalk.yellow('📖 קרא את FIX-GUIDE.md להוראות מפורטות'));
  console.log(chalk.yellow('   או את SETUP-GUIDE.md להגדרה מחדש'));
}
console.log(chalk.blue.bold('═══════════════════════════════════════════') + '\n');
