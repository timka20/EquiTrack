import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('=== Checking Horse IDs ===');

const breedings = db.prepare('SELECT DISTINCT mare_id, stallion_id FROM breedings').all();
console.log('Unique horse IDs in breedings:', breedings);

const horses = db.prepare('SELECT DISTINCT id FROM horses').all();
const horseIds = new Set((horses as any[]).map(h => h.id));
console.log('Total horses in DB:', horseIds.size);
console.log('Horse ID range:', Math.min(...horseIds), 'to', Math.max(...horseIds));

const missingIds = new Set();
(breedings as any[]).forEach(b => {
  if (!horseIds.has(b.mare_id)) missingIds.add(b.mare_id);
  if (!horseIds.has(b.stallion_id)) missingIds.add(b.stallion_id);
});

console.log('Missing horse IDs:', Array.from(missingIds));

const maxHorseId = db.prepare('SELECT MAX(id) as max_id FROM horses').get() as any;
console.log('Max horse ID in DB:', maxHorseId.max_id);

const mares = db.prepare("SELECT id, name FROM horses WHERE gender='mare' ORDER BY id LIMIT 5").all();
const stallions = db.prepare("SELECT id, name FROM horses WHERE gender='stallion' ORDER BY id LIMIT 5").all();

console.log('\nAvailable mares:', mares);
console.log('Available stallions:', stallions);

if (mares.length > 0 && stallions.length > 0) {
  console.log('\nUpdating breedings to use actual horses...');

  db.prepare('DELETE FROM breedings').run();

  const insertBreeding = db.prepare(`
    INSERT INTO breedings (mare_id, stallion_id, planned_date, actual_date, status, expected_foaling_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const dates = [
    ['2026-02-09', '2026-02-09', 'pregnancy_confirmed', '2027-01-09'],
    ['2025-06-09', '2025-06-09', 'pregnancy_confirmed', '2026-05-09'],
    ['2025-10-09', '2025-10-09', 'pregnancy_confirmed', '2026-09-09'],
    ['2026-01-09', '2026-01-09', 'pregnancy_confirmed', '2026-12-09'],
    ['2026-03-15', '2026-03-15', 'pregnancy_confirmed', '2027-02-15'],
  ];

  let idx = 0;
  for (let m = 0; m < mares.length; m++) {
    for (let s = 0; s < stallions.length && idx < 10; s++) {
      const d = dates[idx % dates.length];
      insertBreeding.run(mares[m].id, stallions[s].id, d[0], d[1], d[2], d[3], 'Плановая вязка');
      idx++;
    }
  }

  console.log(`Added ${idx} new breeding records`);
}

const finalCheck = db.prepare(`
  SELECT b.id, 
    CASE WHEN m.id IS NULL THEN 'missing_mare' ELSE m.name END as mare_name,
    CASE WHEN s.id IS NULL THEN 'missing_stallion' ELSE s.name END as stallion_name
  FROM breedings b
  LEFT JOIN horses m ON b.mare_id = m.id
  LEFT JOIN horses s ON b.stallion_id = s.id
`).all();

console.log('\nFinal breeding records:');
finalCheck.forEach(b => {
  console.log(`  ${b.id}: ${b.mare_name} x ${b.stallion_name}`);
});

db.close();
