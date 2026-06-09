import sqlite3
import json
import urllib.request
import os
import random
from datetime import datetime, timedelta

DB_PATH = 'base.db'
PHOTO_DIR = 'public/images/horses'

def download_photo(url, filename):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
            with open(filename, 'wb') as f:
                f.write(data)
        return True
    except Exception as e:
        print(f'Failed to download {url}: {e}')
        return False

def update_photos():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, photos FROM horses WHERE photos IS NOT NULL AND photos != "[]"')
    rows = cursor.fetchall()

    url_map = {}
    for horse_id, photos_raw in rows:
        try:
            photos = json.loads(photos_raw)
            if isinstance(photos, list) and len(photos) > 0:
                url = photos[0]
                if url not in url_map:
                    ext = '.jpg'
                    if '.png' in url.lower():
                        ext = '.png'
                    fname = f'horse_{len(url_map)+1}{ext}'
                    fpath = os.path.join(PHOTO_DIR, fname)
                    if download_photo(url, fpath):
                        url_map[url] = f'/images/horses/{fname}'
                    else:
                        url_map[url] = url
        except Exception as e:
            print(f'Error parsing photos for horse {horse_id}: {e}')

    for horse_id, photos_raw in rows:
        try:
            photos = json.loads(photos_raw)
            if isinstance(photos, list) and len(photos) > 0:
                new_photos = [url_map.get(photos[0], photos[0])]
                cursor.execute('UPDATE horses SET photos = ? WHERE id = ?', (json.dumps(new_photos), horse_id))
        except Exception as e:
            print(f'Error updating horse {horse_id}: {e}')

    conn.commit()
    conn.close()
    print('Photos updated')

def add_races_and_results():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get existing horse ids and users
    cursor.execute('SELECT id FROM horses')
    horse_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute('SELECT id FROM users WHERE role = "owner_private" OR role = "owner_stud"')
    owner_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute('SELECT id FROM users WHERE role = "trainer"')
    trainer_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute('SELECT id FROM users WHERE role = "jockey"')
    jockey_ids = [r[0] for r in cursor.fetchall()]

    if not horse_ids or not owner_ids:
        print('No horses or owners found')
        conn.close()
        return

    hippodromes = ['Центральный Московский Ипподром', 'Пятигорский ипподром', 'Краснодарский ипподром', 'Ростовский ипподром']
    race_names = [
        'Весенний Дерби', 'Кубок Москвы', 'Приз Губернатора', 'Большой Всероссийский Приз',
        'Летние Скачки', 'Открытие сезона 2026', 'Дерби Надежд', 'Кубок Весны',
        'Осенний Гранд-При', 'Зимний Кубок 2026', 'Приз Президента РФ', 'Новогодние Скачки',
        'Гранд- Prix России', 'Кубок Чемпионов', 'Всеобщий Приз'
    ]
    categories = ['Группа I', 'Группа II', 'Группа III']

    # Add 15 races for 2026
    base_date = datetime(2026, 1, 15)
    race_ids = []
    for i in range(15):
        date = base_date + timedelta(days=i * 14)
        name = race_names[i % len(race_names)]
        hippodrome = hippodromes[i % len(hippodromes)]
        distance = [1200, 1400, 1600, 1800, 2000, 2200, 2400][i % 7]
        prize_fund = [1500000, 2000000, 2500000, 3500000, 5000000, 8000000, 10000000][i % 7]
        category = categories[i % 3]
        # First 8 finished, next 3 registration_open, rest scheduled
        if i < 8:
            status = 'finished'
        elif i < 11:
            status = 'registration_open'
        else:
            status = 'scheduled'

        cursor.execute(
            'INSERT INTO races (name, date, hippodrome, distance, surface, prize_fund, category, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (name, date.strftime('%Y-%m-%d'), hippodrome, distance, 'Дёрн', prize_fund, category, status, 'Престижные скачки сезона 2026')
        )
        race_ids.append(cursor.lastrowid)

    # Add results for finished races
    for race_idx, race_id in enumerate(race_ids[:8]):
        cursor.execute('SELECT prize_fund FROM races WHERE id = ?', (race_id,))
        prize_fund = cursor.fetchone()[0]
        selected_horses = random.sample(horse_ids, min(8, len(horse_ids)))
        random.shuffle(selected_horses)
        for pos, horse_id in enumerate(selected_horses, start=1):
            owner_id = random.choice(owner_ids)
            trainer_id = random.choice(trainer_ids) if trainer_ids else None
            jockey_id = random.choice(jockey_ids) if jockey_ids else None
            # Time: base 2:00 + position*0.5
            base_seconds = 28 + pos * 0.5
            race_time = f'2:{int(base_seconds):02d}.{int((base_seconds % 1) * 100):02d}'
            # Prize distribution
            if pos == 1:
                prize = prize_fund * 0.5
            elif pos == 2:
                prize = prize_fund * 0.25
            elif pos == 3:
                prize = prize_fund * 0.125
            else:
                prize = 0

            cursor.execute(
                'INSERT INTO race_results (race_id, horse_id, position, race_time, prize, notes) VALUES (?, ?, ?, ?, ?, ?)',
                (race_id, horse_id, pos, race_time, prize, None)
            )
            # Also add approved registration
            cursor.execute(
                'INSERT OR IGNORE INTO race_registrations (race_id, horse_id, owner_id, trainer_id, jockey_id, status) VALUES (?, ?, ?, ?, ?, ?)',
                (race_id, horse_id, owner_id, trainer_id, jockey_id, 'approved')
            )

    conn.commit()
    conn.close()
    print('Races and results added')

if __name__ == '__main__':
    os.makedirs(PHOTO_DIR, exist_ok=True)
    update_photos()
    add_races_and_results()
