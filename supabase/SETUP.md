# Supabase Setup Guide
## מדריך הגדרת Supabase לפרויקט NU!

---

## 📋 שלב 1: יצירת פרויקט Supabase

1. **גש ל-https://supabase.com**
2. **לחץ על "Start your project"**
3. **התחבר עם GitHub / Google**
4. **לחץ על "New Project"**
5. **מלא פרטים:**
   - Name: `nu-dating`
   - Database Password: בחר סיסמה חזקה (שמור אותה!)
   - Region: `Central EU` (קרוב לישראל)
6. **לחץ "Create new project"**

⏳ **ההקמה לוקחת 1-2 דקות...**

---

## 📋 שלב 2: העתק Credentials

### כשהפרויקט מוכן:

1. **לך ל-Project Settings** (⚙️ בצד שמאל למטה)
2. **לחץ על "API"**
3. **העתק:**
   - `Project URL` → זה ה-VITE_SUPABASE_URL
   - `anon public` → זה ה-VITE_SUPABASE_ANON_KEY

### הכנס אותם ל-`.env`:

```bash
# עבור לתיקיית הפרויקט:
cd "C:\Users\hovav\Desktop\עבודה של מיכאל\nu-dating"

# ערוך את קובץ .env והכנס:
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxx...
```

---

## 📋 שלב 3: הרץ את ה-Migrations

### אופציה 1: דרך SQL Editor (מומלץ)

1. **גש ל-SQL Editor** בצד שמאל
2. **לחץ "New Query"**
3. **העתק והדבק את התוכן של כל קובץ migration לפי הסדר:**

   ```
   ✅ 001_create_users_table.sql
   ✅ 002_create_likes_table.sql
   ✅ 003_create_matches_table.sql
   ✅ 004_create_loop_tables.sql
   ✅ 005_create_safety_tables.sql
   ```

4. **לחץ RUN** (או Ctrl+Enter) לכל קובץ
5. **ודא שאין שגיאות** (צריך להופיע "Success. No rows returned")

### אופציה 2: דרך Supabase CLI (מתקדם)

```bash
# התקן Supabase CLI
npm install -g supabase

# התחבר
supabase login

# קישור לפרויקט
supabase link --project-ref YOUR_PROJECT_REF

# הרץ migrations
supabase db push
```

---

## 📋 שלב 4: הגדר Storage Buckets

1. **לך ל-Storage** בצד שמאל
2. **לחץ "Create a new bucket"**
3. **צור bucket בשם:** `photos`
4. **הגדרות:**
   - Public: ✅ (כדי שתמונות יהיו נגישות)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

### הגדר Policies ל-Storage:

לחץ על bucket `photos` → Policies → New Policy

**Policy 1: Upload Photos**
```sql
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Read Photos**
```sql
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');
```

**Policy 3: Delete Photos**
```sql
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📋 שלב 5: הפעל Email Auth

1. **לך ל-Authentication** → Settings
2. **ודא ש-Email provider מופעל** (אמור להיות ON כברירת מחדל)
3. **Confirm email:** אפשר לכבות לצורך פיתוח (תדליק בפרודקשן!)

---

## 📋 שלב 6: בדוק את ההתקנה

### חזור לפרויקט ותריץ:

```bash
cd "C:\Users\hovav\Desktop\עבודה של מיכאל\nu-dating"

# הפעל את הפרויקט
npm run dev
```

### פתח ב-browser:
```
http://localhost:5174
```

נסה להיכנס לדף `/signup` ולהירשם!

---

## 🎯 מבנה הטבלאות שנוצרו

```
users              - משתמשים
├── likes          - היסטוריית סוויפ
├── matches        - מאצ'ים הדדיים
│   └── loops      - לופים (פידים משותפים)
│       ├── loop_posts     - פוסטים
│       ├── loop_comments  - תגובות
│       └── loop_likes     - לייקים
├── blocks         - חסימות
└── reports        - דיווחים
```

---

## ✅ Checklist

- [ ] יצרתי פרויקט Supabase
- [ ] העתקתי URL ו-ANON_KEY ל-`.env`
- [ ] הרצתי את 5 ה-migrations
- [ ] יצרתי bucket `photos`
- [ ] הגדרתי Storage Policies
- [ ] Email Auth פעיל
- [ ] בדקתי שהפרויקט רץ

---

## 🆘 פתרון בעיות

### שגיאה: "relation does not exist"
→ לא הרצת את ה-migrations. חזור לשלב 3.

### שגיאה: "Missing Supabase environment variables"
→ לא מילאת `.env` כראוי. חזור לשלב 2.

### תמונות לא נטענות
→ ודא ש-bucket `photos` הוא Public ויש לו Policies.

---

**אחרי שסיימת - תודיע לי ונמשיך לבניית Auth! 🚀**
