import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('=== Race Registrations Status ===');

const registrations = db.prepare('SELECT * FROM race_registrations').all();
console.log('Total race registrations:', registrations.length);

const byStatus = db.prepare(`
  SELECT status, COUNT(*) as count 
  FROM race_registrations 
  GROUP BY status
`).all();

console.log('Registrations by status:');
(byStatus as any[]).forEach(s => {
  console.log(`  ${s.status}: ${s.count}`);
});

console.log('\nPending applications:');
const pending = db.prepare(`
  SELECT rr.*, 
    h.name as horse_name, h.color as horse_color,
    r.name as race_name, r.date as race_date, r.hippodrome,
    u.first_name as owner_first_name, u.last_name as owner_last_name
  FROM race_registrations rr
  JOIN horses h ON rr.horse_id = h.id
  JOIN races r ON rr.race_id = r.id
  JOIN users u ON rr.owner_id = u.id
  WHERE rr.status = 'pending'
  ORDER BY r.date ASC
`).all();

console.log(`Found ${pending.length} pending applications`);
if (pending.length > 0) {
  (pending as any[]).slice(0, 3).forEach(p => {
    console.log(`  - ${p.owner_first_name} ${p.owner_last_name}: ${p.horse_name} in ${p.race_name} (${p.race_date})`);
  });
} else {

  if (registrations.length === 0) {
    console.log('No race registrations found. Creating sample pending registrations...');

    const horses = db.prepare("SELECT id FROM horses LIMIT 5").all() as any[];
    const races = db.prepare("SELECT id FROM races LIMIT 3").all() as any[];
    const users = db.prepare("SELECT id FROM users WHERE role='owner_private' LIMIT 5").all() as any[];

    if (horses.length > 0 && races.length > 0 && users.length > 0) {
      const insertReg = db.prepare(`
        INSERT INTO race_registrations (horse_id, race_id, owner_id, status)
        VALUES (?, ?, ?, ?)
      `);

      let count = 0;
      for (let i = 0; i < Math.min(5, horses.length); i++) {
        for (let j = 0; j < Math.min(2, races.length); j++) {
          insertReg.run(
            horses[i].id,
            races[j].id,
            users[i % users.length].id,
            'pending'
          );
          count++;
        }
      }

      console.log(`Added ${count} pending race registrations`);

      const verify = db.prepare(`
        SELECT rr.*, 
          h.name as horse_name,
          r.name as race_name,
          u.first_name as owner_first_name, u.last_name as owner_last_name
        FROM race_registrations rr
        JOIN horses h ON rr.horse_id = h.id
        JOIN races r ON rr.race_id = r.id
        JOIN users u ON rr.owner_id = u.id
        WHERE rr.status = 'pending'
      `).all();

      console.log(`\nVerified ${verify.length} pending registrations:`);
      (verify as any[]).forEach(v => {
        console.log(`  - ${v.owner_first_name} ${v.owner_last_name}: ${v.horse_name} → ${v.race_name}`);
      });
    }
  }
}

db.close();
