import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('Creating race_registrations table...');

const tableExists = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='race_registrations'
`).get();

if (!tableExists) {

  db.exec(`
    CREATE TABLE race_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id INTEGER NOT NULL,
      horse_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      trainer_id INTEGER,
      jockey_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
      FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (jockey_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(race_id, horse_id)
    );

    CREATE INDEX idx_reg_status ON race_registrations(status);
  `);

  console.log('✓ race_registrations table created');
} else {
  console.log('✓ race_registrations table already exists');
}

const races = db.prepare('SELECT id FROM races LIMIT 1').get();
if (!races) {
  console.log('\n! No races found. Please seed race data first.');
  db.close();
  process.exit(0);
}

const existingRegs = db.prepare('SELECT COUNT(*) as count FROM race_registrations').get() as any;
console.log(`\nCurrent registrations: ${existingRegs.count}`);

if (existingRegs.count === 0) {
  console.log('\nAdding pending race registrations...');

  const horses = db.prepare("SELECT id FROM horses LIMIT 10").all() as any[];
  const races = db.prepare("SELECT id FROM races LIMIT 5").all() as any[];
  const owners = db.prepare("SELECT id FROM users WHERE role IN ('owner_private', 'owner_stud') LIMIT 10").all() as any[];

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

        }
      }
    }

    console.log(`Added ${count} pending race registrations`);
  }
}

console.log('\nVerifying pending registrations:');
const verified = db.prepare(`
  SELECT rr.id, 
    h.name as horse_name,
    r.name as race_name, r.date,
    u.first_name || ' ' || u.last_name as owner_name
  FROM race_registrations rr
  JOIN horses h ON rr.horse_id = h.id
  JOIN races r ON rr.race_id = r.id
  JOIN users u ON rr.owner_id = u.id
  WHERE rr.status = 'pending'
  LIMIT 5
`).all();

console.log(`Found ${verified.length} pending registrations`);
(verified as any[]).forEach(v => {
  console.log(`  ✓ reg #${v.id}: ${v.owner_name} - ${v.horse_name} → ${v.race_name} (${v.date})`);
});

db.close();
console.log('\n✓ Done');
