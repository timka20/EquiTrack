import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

const foalsInfo = db.pragma('table_info(foals)') as any[];
console.log('Foals table columns:');
foalsInfo.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

try {
  const result = db.prepare(`
    INSERT INTO foals (breeding_id, horse_id, status)
    VALUES (?, ?, ?)
  `).run(1, 61, 'for_sale');

  console.log('\nInsert successful:', result);
} catch (e: any) {
  console.log('\nInsert failed:', e.message);
}

db.close();
