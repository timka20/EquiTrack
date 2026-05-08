import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('=== Breeding Data ===');
const breedings = db.prepare('SELECT * FROM breedings ORDER BY id').all();
console.log('Total breedings:', breedings.length);
console.log('Sample breedings:', breedings.slice(0, 3));

console.log('\n=== Foals Data ===');
const foals = db.prepare('SELECT * FROM foals ORDER BY id').all();
console.log('Total foals:', foals.length);
console.log('Sample foals:', foals.slice(0, 3));

if (breedings.length === 0) {
  console.log('\nNo breedings found, adding sample data...');

  const mares = db.prepare('SELECT id, name FROM horses WHERE gender="mare" LIMIT 5').all();
  const stallions = db.prepare('SELECT id, name FROM horses WHERE gender="stallion" LIMIT 5').all();

  console.log('Available mares:', mares);
  console.log('Available stallions:', stallions);

  if (mares.length > 0 && stallions.length > 0) {

    const insertBreeding = db.prepare(`
      INSERT INTO breedings (mare_id, stallion_id, planned_date, actual_date, status, expected_foaling_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const breedingData = [
      [mares[0].id, stallions[0].id, '2026-02-09', '2026-02-09', 'pregnancy_confirmed', '2027-01-09', 'Многообещающая пара'],
      [mares[1].id, stallions[1].id, '2025-06-09', '2025-06-09', 'pregnancy_confirmed', '2026-05-09', 'Планчная вязка'],
      [mares[2].id, stallions[2].id, '2025-10-03', '2025-10-03', 'pregnancy_confirmed', '2026-09-03', 'Плановая вязка'],
      [mares[3].id, stallions[3].id, '2025-01-09', '2025-01-09', 'pregnancy_confirmed', '2026-12-09', 'Плановая вязка'],
    ];

    breedingData.forEach(data => {
      insertBreeding.run(...data);
    });

    console.log('Added sample breedings');
  }
}

const finalBreedings = db.prepare('SELECT b.*, m.name as mare_name, s.name as stallion_name FROM breedings b JOIN horses m ON b.mare_id = m.id JOIN horses s ON b.stallion_id = s.id').all();
console.log('\nFinal breedings count:', finalBreedings.length);
console.log('Breedings with names:', finalBreedings.slice(0, 3));

db.close();
