const Database = require('better-sqlite3');
const db = new Database('../base.db');
const rows = db.prepare("SELECT * FROM race_results WHERE race_id = 15").all();
console.log(JSON.stringify(rows, null, 2));
