const { Client } = require('pg');

const connectionString = 'postgresql://postgres:9U2LqDBpQu7Mm7iL@db.fpgcncwvmockcumchrsv.supabase.co:5432/postgres';

const testUsers = [
  {
    name: 'נועה כהן',
    email: 'noa@test.com',
    age: 25,
    gender: 'female',
    looking_for: ['male'],
    city: 'תל אביב',
    bio: 'אוהבת לטייל, לצפות בסרטים ולבשל. מחפשת מישהו עם חוש הומור טוב ואהבה לחיים.',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'],
    interests: ['טיולים', 'בישול', 'קולנוע', 'יוגה', 'קריאה'],
    occupation: 'מעצבת גרפית',
    latitude: 32.0853,
    longitude: 34.7818,
  },
  {
    name: 'דניאל לוי',
    email: 'daniel@test.com',
    age: 28,
    gender: 'male',
    looking_for: ['female'],
    city: 'ירושלים',
    bio: 'מתכנת ביום, מוזיקאי בלילה. אוהב הופעות חיות וקפה טוב. מחפש מישהי עם חיוך יפה.',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'],
    interests: ['מוזיקה', 'טכנולוגיה', 'קפה', 'הופעות', 'גיטרה'],
    occupation: 'מפתח תוכנה',
    latitude: 31.7683,
    longitude: 35.2137,
  },
  {
    name: 'מאיה שרון',
    email: 'maya@test.com',
    age: 24,
    gender: 'female',
    looking_for: ['male'],
    city: 'חיפה',
    bio: 'סטודנטית לפסיכולוגיה. אוהבת ים, ספרים וטיולים בטבע. מחפשת מישהו אמיתי ורציני.',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop'],
    interests: ['ים', 'קריאה', 'טיולים', 'פסיכולוגיה', 'יוגה'],
    occupation: 'סטודנטית',
    latitude: 32.7940,
    longitude: 34.9896,
  },
  {
    name: 'יואב מזרחי',
    email: 'yoav@test.com',
    age: 30,
    gender: 'male',
    looking_for: ['female'],
    city: 'תל אביב',
    bio: 'יזם בתחום הפינטק. אוהב אתגרים חדשים, אוכל טוב ושיחות עמוקות. מחפש שותפה לחיים.',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop'],
    interests: ['עסקים', 'ספורט', 'אוכל', 'נסיעות', 'טכנולוגיה'],
    occupation: 'יזם',
    latitude: 32.0853,
    longitude: 34.7818,
  },
  {
    name: 'שירה אברהם',
    email: 'shira@test.com',
    age: 26,
    gender: 'female',
    looking_for: ['male'],
    city: 'רמת גן',
    bio: 'רופאה וטרינרית. אוהבת חיות, טבע ואנשים טובים. מחפשת מישהו שאוהב חיות כמוני.',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'],
    interests: ['חיות', 'טבע', 'ריצה', 'צילום', 'מוזיקה'],
    occupation: 'וטרינרית',
    latitude: 32.0680,
    longitude: 34.8248,
  },
  {
    name: 'אורי גולן',
    email: 'ori@test.com',
    age: 27,
    gender: 'male',
    looking_for: ['female'],
    city: 'הרצליה',
    bio: 'מהנדס תוכנה שאוהב את הים והספורט. מחפש מישהי שתהיה גם חברה הכי טובה.',
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop'],
    interests: ['גלישה', 'ספורט', 'טכנולוגיה', 'בישול', 'נסיעות'],
    occupation: 'מהנדס תוכנה',
    latitude: 32.1663,
    longitude: 34.8463,
  },
  {
    name: 'תמר רוזנברג',
    email: 'tamar@test.com',
    age: 29,
    gender: 'female',
    looking_for: ['male'],
    city: 'תל אביב',
    bio: 'עורכת דין שאוהבת תיאטרון, אמנות ויין טוב. מחפשת מישהו מעניין לשיחה.',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'],
    interests: ['תיאטרון', 'אמנות', 'יין', 'קריאה', 'נסיעות'],
    occupation: 'עורכת דין',
    latitude: 32.0853,
    longitude: 34.7818,
  },
  {
    name: 'איתי ברק',
    email: 'itai@test.com',
    age: 31,
    gender: 'male',
    looking_for: ['female'],
    city: 'רעננה',
    bio: 'רואה חשבון שאוהב לנגן בגיטרה ולבשל. מחפש מישהי שתאהב את הפסטה שלי.',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'],
    interests: ['מוזיקה', 'בישול', 'ספורט', 'קולנוע', 'נסיעות'],
    occupation: 'רואה חשבון',
    latitude: 32.1841,
    longitude: 34.8714,
  },
  {
    name: 'ליה פרידמן',
    email: 'lia@test.com',
    age: 23,
    gender: 'female',
    looking_for: ['male'],
    city: 'באר שבע',
    bio: 'סטודנטית להנדסה שאוהבת מדבר וכוכבים. מחפשת מישהו להרפתקאות.',
    photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop'],
    interests: ['טיולים', 'אסטרונומיה', 'צילום', 'מוזיקה', 'קריאה'],
    occupation: 'סטודנטית',
    latitude: 31.2530,
    longitude: 34.7915,
  },
  {
    name: 'עומר כץ',
    email: 'omer@test.com',
    age: 26,
    gender: 'male',
    looking_for: ['female'],
    city: 'אשדוד',
    bio: 'שף במקצוע ובתשוקה. אוהב ליצור חוויות קולינריות ולשמח אנשים עם אוכל.',
    photos: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'],
    interests: ['בישול', 'יין', 'נסיעות', 'צילום', 'מוזיקה'],
    occupation: 'שף',
    latitude: 31.8044,
    longitude: 34.6553,
  },
];

async function seedTestUsers() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!\n');

    console.log('Creating test users...\n');

    for (const user of testUsers) {
      try {
        await client.query(`
          INSERT INTO users (
            email, name, age, gender, looking_for, city, bio, photos,
            interests, occupation, latitude, longitude, is_active
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            age = EXCLUDED.age,
            bio = EXCLUDED.bio,
            photos = EXCLUDED.photos
        `, [
          user.email,
          user.name,
          user.age,
          user.gender,
          user.looking_for,
          user.city,
          user.bio,
          user.photos,
          user.interests,
          user.occupation,
          user.latitude,
          user.longitude,
        ]);

        console.log(`✅ Created: ${user.name} (${user.email})`);
      } catch (err) {
        console.log(`⚠️ Error creating ${user.name}: ${err.message}`);
      }
    }

    console.log('\n🎉 Done! Created', testUsers.length, 'test users');

    // Show user count
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\nTotal users in database: ${result.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

seedTestUsers();
