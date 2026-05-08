import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

const info = db.pragma('table_info(race_registrations)') as any[];
console.log('race_registrations columns:');
info.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

console.log('\nAdding pending race registrations...');

const horses = db.prepare('SELECT id FROM horses WHERE id >= 61 LIMIT 10').all() as any[];
const races = db.prepare('SELECT id FROM races LIMIT 5').all() as any[];
const owners = db.prepare("SELECT id FROM users WHERE role IN ('owner_private', 'owner_stud') LIMIT 10").all() as any[];

console.log(`Horses: ${horses.length}, Races: ${races.length}, Owners: ${owners.length}`);

if (horses.length > 0 && races.length > 0 && owners.length > 0) {
  const insertReg = db.prepare(`
    INSERT INTO race_registrations (race_id, horse_id, owner_id, status)
    VALUES (?, ?, ?, ?)
  `);

  let count = 0;
  for (let i = 0; i < Math.min(7, horses.length); i++) {
    for (let j = 0; j < Math.min(2, races.length); j++) {
      try {
        insertReg.run(
          races[j].id,
          horses[i].id,
          owners[i % owners.length].id,
          'pending'
        );
        count++;
      } catch (e: any) {
        console.log(`Skipped: ${e.message.split('\n')[0]}`);
      }
    }
  }

  console.log(`Added ${count} pending registrations`);
}

const final = db.prepare(`
  SELECT COUNT(*) as count, rr.status
  FROM race_registrations rr
  GROUP BY rr.status
`).all();

console.log('\nRace registrations by status:');
(final as any[]).forEach(row => {
  console.log(`  ${row.status}: ${row.count}`);
});

db.close();
