import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

console.log('Checking and updating race_registrations table...');

const currentCols = db.pragma('table_info(race_registrations)') as any[];
console.log('Current columns:', currentCols.map(c => c.name).join(', '));

const hasOwnerId = currentCols.some(c => c.name === 'owner_id');

if (!hasOwnerId) {
  console.log('\nAdding owner_id column...');

  db.exec(`
    CREATE TABLE race_registrations_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id INTEGER NOT NULL,
      horse_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      trainer_id INTEGER,
      jockey_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
      FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (jockey_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(race_id, horse_id)
    );

    INSERT INTO race_registrations_new (id, race_id, horse_id, trainer_id, jockey_id, status, registered_at, created_at)
    SELECT id, race_id, horse_id, trainer_id, jockey_id, status, registered_at, CURRENT_TIMESTAMP FROM race_registrations;

    DROP TABLE race_registrations;

    ALTER TABLE race_registrations_new RENAME TO race_registrations;

    CREATE INDEX idx_reg_status ON race_registrations(status);
  `);

  console.log('✓ Table updated with owner_id column');
} else {
  console.log('✓ owner_id column already exists');
}

console.log('\nPopulating owner_id from horses...');
const updated = db.prepare(`
  UPDATE race_registrations 
  SET owner_id = (SELECT owner_id FROM horses WHERE horses.id = race_registrations.horse_id)
  WHERE owner_id IS NULL
`).run();

console.log(`Updated ${updated.changes} rows`);

console.log('\nAdding pending race registrations...');

const horses = db.prepare('SELECT id, owner_id FROM horses WHERE owner_id IS NOT NULL LIMIT 10').all() as any[];
const races = db.prepare('SELECT id FROM races LIMIT 5').all() as any[];

console.log(`Horses with owners: ${horses.length}, Races: ${races.length}`);

if (horses.length > 0 && races.length > 0) {
  const insertReg = db.prepare(`
    INSERT OR IGNORE INTO race_registrations (race_id, horse_id, owner_id, status)
    VALUES (?, ?, ?, ?)
  `);

  let count = 0;
  for (let i = 0; i < Math.min(7, horses.length); i++) {
    for (let j = 0; j < Math.min(2, races.length); j++) {
      try {
        const result = insertReg.run(
          races[j].id,
          horses[i].id,
          horses[i].owner_id,
          'pending'
        );
        if (result.changes > 0) count++;
      } catch ( e) {

      }
    }
  }

  console.log(`Added ${count} new pending registrations`);
}

const final = db.prepare(`
  SELECT COUNT(*) as count FROM race_registrations WHERE status = 'pending'
`).get() as any;

console.log(`\n✓ Total pending registrations: ${final.count}`);

db.close();
