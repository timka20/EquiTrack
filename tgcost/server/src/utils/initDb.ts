import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'tgcost';

async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('🔧 Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${dbName}`);

    console.log('📋 Creating tables...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('advertiser', 'owner', 'moderator', 'admin') DEFAULT 'advertiser',
        avatar VARCHAR(500),
        phone VARCHAR(50),
        company VARCHAR(255),
        status ENUM('active', 'blocked') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS platforms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('billboard', 'digital_screen', 'wall', 'mall', 'transport') NOT NULL,
        address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        price_per_day INT NOT NULL,
        rating DECIMAL(2,1) DEFAULT 5.0,
        reviews_count INT DEFAULT 0,
        image VARCHAR(500) NOT NULL,
        images JSON,
        description TEXT,
        size VARCHAR(100),
        format VARCHAR(100),
        illumination BOOLEAN DEFAULT false,
        traffic VARCHAR(100),
        available BOOLEAN DEFAULT true,
        owner_id VARCHAR(36) NOT NULL,
        status ENUM('active', 'pending', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_coordinates (latitude, longitude),
        INDEX idx_city (city)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        platform_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price INT NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        material_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
        material_url VARCHAR(500),
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        platform_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        text TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS booked_dates (
        id VARCHAR(36) PRIMARY KEY,
        platform_id VARCHAR(36) NOT NULL,
        booking_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        UNIQUE KEY unique_platform_date (platform_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        platform_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_platform (user_id, platform_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('booking', 'material', 'system', 'platform') DEFAULT 'system',
        \`read\` BOOLEAN DEFAULT false,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, \`read\`),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    try {
      const [columns] = await connection.query(`SHOW COLUMNS FROM platforms LIKE 'latitude'`);
      if ((columns as any[]).length === 0) {
        await connection.query(`ALTER TABLE platforms ADD COLUMN latitude DECIMAL(10, 8)`);
        await connection.query(`ALTER TABLE platforms ADD COLUMN longitude DECIMAL(11, 8)`);
        await connection.query(`ALTER TABLE platforms ADD INDEX idx_coordinates (latitude, longitude)`);
        await connection.query(`ALTER TABLE platforms ADD INDEX idx_city (city)`);
        console.log('📍 Added coordinate columns to platforms table');
      }
    } catch (e) {
    }

    console.log('✅ Tables created successfully');

    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password, name, role, status)
       VALUES ('admin-001', 'admin@tgcost.ru', ?, 'Администратор', 'admin', 'active')`,
      [adminPassword]
    );

    const testPassword = await bcrypt.hash('test123', 10);

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password, name, role, status)
       VALUES ('user-001', 'test@mail.ru', ?, 'Тестовый Пользователь', 'advertiser', 'active')`,
      [testPassword]
    );

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password, name, role, status)
       VALUES ('owner-001', 'owner@mail.ru', ?, 'Владелец Площадок', 'owner', 'active')`,
      [testPassword]
    );

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password, name, role, status)
       VALUES ('moderator-001', 'moderator@tgcost.ru', ?, 'Модератор', 'moderator', 'active')`,
      [testPassword]
    );

    console.log('✅ Default users created');
    console.log('');
    console.log('🔑 Default credentials:');
    console.log('   Admin: admin@tgcost.ru / admin123');
    console.log('   User: test@mail.ru / test123');
    console.log('   Owner: owner@mail.ru / test123');
    console.log('   Moderator: moderator@tgcost.ru / test123');

    await connection.end();
    console.log('');
    console.log('🎉 Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
