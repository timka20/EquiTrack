import sqlite3
conn = sqlite3.connect('base.db')
cursor = conn.cursor()

cursor.execute("SELECT id, photos FROM horses WHERE photos IS NOT NULL AND photos != '[]' LIMIT 5")
print('Photos sample:')
for r in cursor.fetchall():
    print(r)

print('--- races 2026 ---')
cursor.execute("SELECT id, name, date, status FROM races WHERE date >= '2026-01-01' ORDER BY date")
for r in cursor.fetchall():
    print(r)

print('--- results ---')
cursor.execute("SELECT COUNT(*) FROM race_results")
print('total race_results:', cursor.fetchone()[0])

conn.close()
