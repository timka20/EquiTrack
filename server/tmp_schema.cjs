const Database = require('better-sqlite3');
const db = new Database('../base.db');
const rows = db.prepare("PRAGMA table_info(race_results)").all();
console.log(JSON.stringify(rows, null, 2));
