import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, process.env.NODE_ENV === 'production' ? '../../../../base.db' : '../../../base.db');

export const db: Database.Database = new Database(dbPath);

 db.pragma('journal_mode = WAL');

export function testConnection(): boolean {
  try {
    db.prepare('SELECT 1').get();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default db;
