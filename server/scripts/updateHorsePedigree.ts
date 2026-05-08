import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

const stallions = db.prepare(`
  SELECT id, name, gender FROM horses 
  WHERE gender='stallion' AND id != 61
  ORDER BY birth_year DESC 
  LIMIT 1
`).all();

const mares = db.prepare(`
  SELECT id, name, gender FROM horses 
  WHERE gender='mare' AND id != 61
  ORDER BY birth_year DESC 
  LIMIT 2
`).all();

console.log('Available Stallions:', stallions);
console.log('Available Mares:', mares);

if (stallions.length > 0 && mares.length >= 1) {
  const fatherId = stallions[0].id;
  const motherId = mares[0].id;

  const result = db.prepare(`
    UPDATE horses 
    SET father_id = ?, mother_id = ?
    WHERE id = 61
  `).run(fatherId, motherId);

  console.log(`Updated horse 61 with father_id=${fatherId}, mother_id=${motherId}`);
  console.log('Changes made:', result.changes);
} else {
  console.log('Not enough horses to set as parents');
}

const updated = db.prepare(`
  SELECT id, name, father_id, mother_id FROM horses WHERE id = 61
`).get();

console.log('Updated horse:', updated);

db.close();
