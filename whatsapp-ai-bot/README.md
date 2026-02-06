# 🤖 WhatsApp AI Bot with Multimodal Capabilities

בוט WhatsApp חכם עם יכולות מולטימדיה המשלב שני מודלי AI מתקדמים:
- **Claude** (Anthropic) - לניתוח תמונות מורכב, קוד, וטקסטים ארוכים
- **Gemini** (Google) - לניתוח וידאו וחיפוש באינטרנט

## ✨ Features

- 📸 **ניתוח תמונות** - ניתוח מפורט של תמונות
- 🎥 **ניתוח סרטונים** - ניתוח וידאו מלא עם Gemini
- 🌐 **חיפוש באינטרנט** - מידע עדכני מהרשת
- 💬 **שיחות חכמות** - תגובות טבעיות ומתקדמות
- 🔄 **Routing אוטומטי** - בחירה חכמה של ה-AI המתאים
- 💾 **Cache** - שמירת תגובות למהירות מירבית
- 🛡️ **Fallback** - מעבר אוטומטי בין AI במקרה של כשל

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- חשבון WhatsApp
- API Keys:
  - [Anthropic Claude API](https://console.anthropic.com/)
  - [Google Gemini API](https://makersuite.google.com/app/apikey)

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

ערוך את הקובץ `.env` והוסף את ה-API keys שלך:

```env
# Anthropic (Claude) API Key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Start the Bot

```bash
npm start
```

או למצב פיתוח עם auto-reload:

```bash
npm run dev
```

### 4. Scan QR Code

כשהבוט מתחיל, יופיע QR code במסוף. סרוק אותו עם האפליקציה של WhatsApp בטלפון שלך:

1. פתח את WhatsApp בטלפון
2. לחץ על ⋮ (Android) או הגדרות (iOS)
3. בחר "מכשירים מקושרים"
4. לחץ "קשר מכשיר"
5. סרוק את ה-QR code שמופיע במסוף

## 📁 Project Structure

```
whatsapp-ai-bot/
├── src/
│   ├── index.js              # Entry point
│   ├── config/
│   │   └── env.js           # Environment configuration
│   ├── services/
│   │   ├── claude.js        # Claude AI integration
│   │   ├── gemini.js        # Gemini AI integration
│   │   └── whatsapp.js      # WhatsApp client
│   ├── routers/
│   │   └── aiRouter.js      # AI routing logic
│   ├── handlers/
│   │   ├── textHandler.js   # Text message handler
│   │   ├── imageHandler.js  # Image handler
│   │   └── videoHandler.js  # Video handler
│   └── utils/
│       ├── cache.js         # Caching system
│       └── mediaDownloader.js # Media utilities
├── tests/
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🎯 How It Works

הבוט מחליט אוטומטית איזה AI להשתמש בהתאם לסוג ההודעה:

### Claude משמש ל:
- 📸 תמונות מורכבות (תרשימים, טבלאות)
- 💻 שאלות על קוד ותכנות
- 📝 טקסטים ארוכים ומורכבים
- 🤔 משימות הדורשות חשיבה מעמיקה

### Gemini משמש ל:
- 🎥 ניתוח וידאו (הכי חזק!)
- 🔍 חיפושים באינטרנט
- 🌐 שאלות על מידע עדכני

## 💡 Usage Examples

### שליחת הודעת טקסט
```
משתמש: "מה זה React?"
בוט: [תשובה מפורטת מ-Claude]
```

### שליחת תמונה
```
משתמש: [שולח תמונה של קוד]
בוט: [ניתוח מפורט של הקוד על ידי Claude]
```

### שליחת וידאו
```
משתמש: [שולח סרטון]
בוט: [ניתוח הסרטון על ידי Gemini]
```

### חיפוש באינטרנט
```
משתמש: "מה קורה היום בחדשות?"
בוט: [מידע עדכני מהאינטרנט דרך Gemini]
```

## 🔧 Configuration

### Cache Settings

ניתן לשנות את הגדרות ה-cache בקובץ `.env`:

```env
CACHE_TTL=3600  # Time to live in seconds (default: 1 hour)
```

### Port Configuration

```env
PORT=3000  # Server port (default: 3000)
```

## 🐛 Troubleshooting

### QR Code לא מופיע
- וודא ש-Node.js מותקן בגרסה 18 ומעלה
- נסה להסיר את התיקייה `.wwebjs_auth` ולהריץ שוב

### שגיאות API
- בדוק שה-API keys שלך תקינים
- וודא שיש לך מספיק קרדיט ב-API

### הבוט לא מגיב
- בדוק את הלוגים במסוף
- וודא שהאינטרנט פעיל
- נסה לשלוח הודעה פשוטה ראשונה

## 📊 Cost Estimates

עלויות משוערות (תלוי בשימוש):
- **Claude API**: $10-50/חודש
- **Gemini API**: חינם עד מכסה מסוימת, אחר כך $5-30/חודש
- **סה"כ**: ~$15-80/חודש

## 🔒 Security

- ⚠️ **לעולם אל תשתף את ה-API keys**
- 🔐 הקובץ `.env` לא מופיע ב-git
- 🛡️ השתמש ב-environment variables בייצור

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome!

## 📧 Support

אם יש בעיות או שאלות, פתח issue בגיטהאב.

---

**Made with ❤️ using Claude Code**
