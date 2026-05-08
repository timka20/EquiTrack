import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../../base.db');

function initDatabase() {
  try {
    console.log('🔄 Initializing SQLite database...');

    if (fs.existsSync(dbPath)) {
      console.log('🔄 Removing existing database...');
      fs.unlinkSync(dbPath);
    }

    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Creating tables...');

    db.exec(schemaSql);

    db.close();
    console.log('✅ Database initialization completed!');
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initDatabase();
