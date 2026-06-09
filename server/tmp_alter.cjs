const Database = require('better-sqlite3');
const db = new Database('../base.db');
try {
  db.exec('ALTER TABLE race_results ADD COLUMN jockey_id INTEGER');
  console.log('Added jockey_id');
} catch (e) {
  console.log('jockey_id already exists or error:', e.message);
}
try {
  db.exec('ALTER TABLE race_results ADD COLUMN trainer_id INTEGER');
  console.log('Added trainer_id');
} catch (e) {
  console.log('trainer_id already exists or error:', e.message);
}
console.log('Done');
