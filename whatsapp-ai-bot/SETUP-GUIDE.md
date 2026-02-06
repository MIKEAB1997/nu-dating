# 🤖 WhatsApp AI Bot - מדריך התקנה והפעלה

## ✅ מה כבר מוכן

הבוט נבנה ומוכן לפעולה! כל הקוד והתשתית במקום.

### מה יש:
- ✅ בוט WhatsApp מלא עם Gemini AI
- ✅ תמיכה בטקסט, תמונות, וידאו
- ✅ חיפוש באינטרנט
- ✅ Server רץ על port 8080
- ✅ URL ציבורי: `https://ripe-tables-hunt.loca.lt`

---

## 🚀 הפעלת הבוט

### הרצת הבוט:

```bash
cd "C:\Users\hovav\Desktop\עבודה של מיכאל\nu-dating\whatsapp-ai-bot"
npm run start:cloud
```

הבוט רץ על: `http://localhost:8080`

---

## 🔧 הגדרת Webhook ב-Meta

**זה הצעד החשוב ביותר!**

### שלב 1: הגדרת Webhook URL

1. **לך ל:** https://developers.facebook.com/apps
2. **בחר את האפליקציה שלך**
3. **לך ל: WhatsApp → Configuration**
4. **תחת "Webhook":**
   - **Callback URL:** `https://curly-fly-3.loca.lt/webhook`
   - **Verify Token:** `my_verify_token_123`
   - לחץ **"Verify and Save"**

### שלב 2: Subscribe to Webhook Fields (קריטי!)

**⚠️ שלב זה חיוני! בלעדיו הבוט לא יקבל הודעות!**

5. **גלול למטה ל-"Webhook fields"**
6. **תחת "messages":**
   - לחץ **"Subscribe"** ✅
7. **תחת "message_status" (אופציונלי):**
   - לחץ **"Subscribe"** ✅

**אם לא תעשה Subscribe, Meta לא ישלח הודעות לבוט!**

### שלב 2: בדיקה

1. שלח הודעה מהטלפון שלך למספר הבוט
2. הבוט יענה לך אוטומטית עם Gemini AI!

---

## 🔑 פרטי ה-API

### פרטים נוכחיים:

```env
# Gemini AI
GEMINI_API_KEY=AIzaSyCg_LZm3VgT_qg0p3oKd48gagwmKRdX3wc

# WhatsApp Business API
WHATSAPP_TOKEN=EAAVW8pNlEVUBQmINz1Sg7CgYhJ7Hg6wIy9uDZB2d6pSG66lQTuZCtesJzhjn46QQKPg700BoHq6yrodlsHorH2aULyeUIJLRIq4wygCMz1yxwslXqITTHabYpfKnqfvpjLsQkjUFCAKovvhizjpvq4c7c3mzHEn2ZB7REFsASe36eEXKld0Y92zZCWsVOCxluPpm6Mit0zYZBPZB6S16HjRJSbnpTTpY7GUdPtKeTZCVVZA0E60Wky9p6qBct2xVYizPswZAyqDJQhMMDZBoZAH34sAugZDZD
WHATSAPP_PHONE_NUMBER_ID=954930261042928
WHATSAPP_BUSINESS_ACCOUNT_ID=807035702418024
WHATSAPP_VERIFY_TOKEN=my_verify_token_123

# Server
PORT=8080
```

---

## ⚠️ בעיה ידועה: הרשאות Token

ה-Token הנוכחי **אינו כולל הרשאות לשליחת הודעות**.

### השגיאה:
```
"(#10) Application does not have permission for this action"
```

### פתרון:

אם אתה רוצה **לשלוח** הודעות (לא רק לקבל), צריך Token חדש עם:
- `whatsapp_business_messaging`
- `whatsapp_business_management`

**איך לקבל Token חדש:**
1. לך ל: https://developers.facebook.com/apps
2. WhatsApp → API Setup
3. לחץ "Generate new token"
4. בחר בהרשאות הנדרשות
5. העתק את הToken החדש
6. עדכן ב-`.env`

---

## 📱 שימוש בבוט

### מה הבוט יכול:

1. **הודעות טקסט:**
   ```
   אתה: "מה זה React?"
   בוט: [תשובה מפורטת מ-Gemini]
   ```

2. **תמונות:**
   ```
   אתה: [שולח תמונה]
   בוט: [ניתוח מפורט של התמונה]
   ```

3. **וידאו:**
   ```
   אתה: [שולח סרטון]
   בוט: [תמלול + ניתוח הסרטון]
   ```

4. **חיפוש:**
   ```
   אתה: "חפש באינטרנט על AI חדשות"
   בוט: [מידע עדכני מהרשת]
   ```

---

## 🛠️ פקודות שימושיות

### הרצת הבוט:
```bash
npm run start:cloud
```

### בדיקת בריאות:
```bash
curl http://localhost:8080/health
```

### בדיקת Webhook:
```bash
curl https://ripe-tables-hunt.loca.lt/webhook
```

---

## 📊 מבנה הפרויקט

```
whatsapp-ai-bot/
├── src/
│   ├── services/
│   │   ├── gemini.js           # Gemini AI
│   │   └── whatsapp-cloud.js   # WhatsApp Cloud API
│   ├── handlers/
│   │   ├── textHandler.js      # טיפול בטקסט
│   │   ├── imageHandler.js     # טיפול בתמונות
│   │   └── videoHandler.js     # טיפול בוידאו
│   ├── routers/
│   │   └── aiRouter.js         # Routing ל-Gemini
│   ├── utils/
│   │   ├── cache.js            # Cache system
│   │   └── mediaDownloader.js  # הורדת מדיה
│   └── config/
│       └── env.js              # הגדרות סביבה
├── server-cloud.js             # Server ראשי
├── .env                        # API Keys
└── package.json
```

---

## 🐛 פתרון בעיות נפוצות

### הבוט לא מגיב להודעות:

1. **בדוק ש-Webhook מוגדר נכון** ב-Meta Console
2. **וודא ש-localtunnel רץ:** בדוק `https://ripe-tables-hunt.loca.lt/webhook`
3. **בדוק לוגים:** ראה את הלוגים בconsole של הבוט

### "Webhook verification failed":

- וודא ש-Verify Token הוא: `my_verify_token_123`
- וודא שהURL נכון: `https://ripe-tables-hunt.loca.lt/webhook`

### שגיאת הרשאות:

- צריך Token חדש עם ההרשאות הנכונות (ראה למעלה)

---

## 📞 תמיכה

לשאלות או בעיות:
1. בדוק את הלוגים של הבוט
2. בדוק את Meta Developer Console
3. וודא שכל ה-API Keys תקינים

---

**נבנה עם ❤️ על ידי Claude Code**
