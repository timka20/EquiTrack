import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('Adding sample foals...');

const breedings = db.prepare('SELECT * FROM breedings LIMIT 5').all() as any[];
console.log(`Found ${breedings.length} breedings`);

if (breedings.length > 0) {

  const availableHorses = db.prepare(`
    SELECT id, name, gender, color, birth_year 
    FROM horses 
    WHERE id NOT IN (SELECT horse_id FROM foals)
    LIMIT 10
  `).all() as any[];

  console.log(`Found ${availableHorses.length} available horses to use as foals`);

  if (availableHorses.length > 0) {
    const insertFoal = db.prepare(`
      INSERT INTO foals (breeding_id, horse_id, status)
      VALUES (?, ?, ?)
    `);

    const statuses = ['at_stud', 'for_sale', 'reserved', 'sold'];

    let count = 0;
    for (let i = 0; i < Math.min(breedings.length, availableHorses.length); i++) {
      const breeding = breedings[i];
      const foal = availableHorses[i];
      const status = statuses[i % statuses.length];

      try {
        insertFoal.run(breeding.id, foal.id, status);
        count++;
        console.log(`✓ Added foal: ${foal.name} (${status})`);
      } catch (e: any) {
        console.log(`✗ Failed to add foal ${foal.name}: ${e.message.split('\n')[0]}`);
      }
    }

    console.log(`\nAdded ${count} foals`);
  }
}

const finalFoals = db.prepare(`
  SELECT f.*, h.name as horse_name, h.gender, h.color, h.birth_year,
    b.mare_id, b.stallion_id, m.name as mare_name, s.name as stallion_name
  FROM foals f
  JOIN horses h ON f.horse_id = h.id
  JOIN breedings b ON f.breeding_id = b.id
  JOIN horses m ON b.mare_id = m.id
  JOIN horses s ON b.stallion_id = s.id
  LIMIT 5
`).all();

console.log(`\nTotal foals in database: ${db.prepare('SELECT COUNT(*) as count FROM foals').get()}`);
console.log('Sample foals:');
(finalFoals as any[]).forEach(f => {
  console.log(`  ✓ ${f.horse_name} (${f.gender}) - ${f.mare_name} x ${f.stallion_name}`);
});

db.close();
console.log('\n✓ Done');
