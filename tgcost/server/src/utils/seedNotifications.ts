import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dbName = process.env.DB_NAME || 'tgcost';

const notifications = [
  {
    userId: 'user-001',
    title: 'Добро пожаловать!',
    message: 'Спасибо за регистрацию в TGCost. Начните искать площадки для рекламы прямо сейчас!',
    type: 'system',
    read: false,
  },
  {
    userId: 'user-001',
    title: 'Новая площадка доступна',
    message: 'В вашем городе появилась новая рекламная площадка. Проверьте раздел поиска!',
    type: 'platform',
    read: false,
  },
  {
    userId: 'user-001',
    title: 'Бронирование подтверждено',
    message: 'Ваше бронирование площадки "Билборд на Тверской" подтверждено.',
    type: 'booking',
    read: true,
  },
];

async function seedNotifications() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    });

    console.log('🔔 Seeding notifications...');

    for (const notification of notifications) {
      const id = uuidv4();
      await connection.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, \`read\`)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=title`,
        [
          id,
          notification.userId,
          notification.title,
          notification.message,
          notification.type,
          notification.read,
        ]
      );
      console.log(`  ✅ ${notification.title}`);
    }

    await connection.end();
    console.log('');
    console.log('🎉 Notifications seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
