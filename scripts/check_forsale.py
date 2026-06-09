import sqlite3
conn = sqlite3.connect('base.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, status FROM horses WHERE status = 'for_sale'")
for r in cursor.fetchall():
    print(r)
conn.close()
