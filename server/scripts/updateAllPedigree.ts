import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../base.db');
const db = new Database(dbPath);

const stallions = db.prepare(`
  SELECT id, name FROM horses 
  WHERE gender='stallion'
  ORDER BY id
`).all();

const mares = db.prepare(`
  SELECT id, name FROM horses 
  WHERE gender='mare'
  ORDER BY id
`).all();

console.log('Available Stallions:', stallions.map(s => `${s.id}: ${s.name}`));
console.log('Available Mares:', mares.map(m => `${m.id}: ${m.name}`));

const uraganFather = stallions.find(s => s.id !== 71);
const uraganMother = mares.find(m => m.id !== 75);

if (uraganFather && uraganMother) {
  db.prepare('UPDATE horses SET father_id = ?, mother_id = ? WHERE id = 71').run(uraganFather.id, uraganMother.id);
  console.log(`\nUpdated horse 71 (Ураган 11) with father_id=${uraganFather.id} (${uraganFather.name}), mother_id=${uraganMother.id} (${uraganMother.name})`);
}

const vesnaFather = stallions.find(s => s.id !== 71 && s.id !== uraganFather?.id);
const vesnaMother = mares.find(m => m.id !== 75 && m.id !== uraganMother?.id);

if (vesnaFather && vesnaMother) {
  db.prepare('UPDATE horses SET father_id = ?, mother_id = ? WHERE id = 75').run(vesnaFather.id, vesnaMother.id);
  console.log(`Updated horse 75 (Весна 15) with father_id=${vesnaFather.id} (${vesnaFather.name}), mother_id=${vesnaMother.id} (${vesnaMother.name})`);
}

console.log('\nVerifying updates:');
const updated71 = db.prepare('SELECT id, name, father_id, mother_id FROM horses WHERE id = 71').get();
const updated75 = db.prepare('SELECT id, name, father_id, mother_id FROM horses WHERE id = 75').get();
const updated61 = db.prepare('SELECT id, name, father_id, mother_id FROM horses WHERE id = 61').get();

console.log('Horse 61 (Сказка 1):', updated61);
console.log('Horse 71 (Ураган 11):', updated71);
console.log('Horse 75 (Весна 15):', updated75);

db.close();
