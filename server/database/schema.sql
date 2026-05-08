
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('guest', 'owner_private', 'owner_stud', 'trainer', 'jockey', 'veterinarian', 'admin')) DEFAULT 'guest',
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER users_updated_at AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Таблица лошадей
CREATE TABLE horses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('stallion', 'mare', 'gelding')) NOT NULL,
  color TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  birth_country TEXT NOT NULL,
  breeder_id INTEGER,
  owner_id INTEGER,
  trainer_id INTEGER,
  jockey_id INTEGER,
  father_id INTEGER,
  mother_id INTEGER,
  status TEXT CHECK(status IN ('in_training', 'resting', 'breeding', 'for_sale', 'sold', 'retired')) DEFAULT 'in_training',
  photos TEXT, -- JSON stored as text
  description TEXT,
  price REAL, -- Цена для продажи
  total_earnings REAL DEFAULT 0, -- Общий заработок
  wins INTEGER DEFAULT 0, -- Победы
  places INTEGER DEFAULT 0, -- Призовые места (1-3)
  starts INTEGER DEFAULT 0, -- Старты
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breeder_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (father_id) REFERENCES horses(id) ON DELETE SET NULL,
  FOREIGN KEY (mother_id) REFERENCES horses(id) ON DELETE SET NULL
);

CREATE INDEX idx_name ON horses(name);
CREATE INDEX idx_status ON horses(status);
CREATE INDEX idx_owner ON horses(owner_id);
CREATE INDEX idx_trainer ON horses(trainer_id);

CREATE TRIGGER horses_updated_at AFTER UPDATE ON horses
BEGIN
  UPDATE horses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Таблица скачек
CREATE TABLE races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date DATETIME NOT NULL,
  hippodrome TEXT NOT NULL,
  distance INTEGER NOT NULL, -- Дистанция в метрах
  surface TEXT DEFAULT 'Дёрн', -- Покрытие
  prize_fund REAL NOT NULL,
  category TEXT DEFAULT 'Группа III', -- Категория (Группа I, II, III)
  status TEXT CHECK(status IN ('scheduled', 'registration_open', 'registration_closed', 'in_progress', 'finished', 'cancelled')) DEFAULT 'scheduled',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_date ON races(date);
CREATE INDEX idx_race_status ON races(status);

CREATE TRIGGER races_updated_at AFTER UPDATE ON races
BEGIN
  UPDATE races SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Таблица регистраций на скачки
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

-- Таблица результатов скачек
CREATE TABLE race_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  position INTEGER NOT NULL, -- Место (1, 2, 3...)
  race_time TEXT, -- Время в формате ММ:СС.мс
  prize REAL, -- Выигрыш
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  UNIQUE(race_id, horse_id)
);

CREATE INDEX idx_position ON race_results(position);

-- Таблица случек (разведение)
CREATE TABLE breedings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mare_id INTEGER NOT NULL,
  stallion_id INTEGER NOT NULL,
  planned_date DATE NOT NULL,
  actual_date DATE,
  status TEXT CHECK(status IN ('planned', 'completed', 'pregnancy_confirmed', 'not_confirmed')) DEFAULT 'planned',
  expected_foaling_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mare_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (stallion_id) REFERENCES horses(id) ON DELETE CASCADE
);

CREATE INDEX idx_breeding_status ON breedings(status);
CREATE INDEX idx_planned_date ON breedings(planned_date);

-- Таблица жеребят
CREATE TABLE foals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  breeding_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('at_stud', 'for_sale', 'reserved', 'sold')) DEFAULT 'at_stud',
  price REAL,
  reservation_date DATE,
  buyer_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breeding_id) REFERENCES breedings(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_foal_status ON foals(status);

-- Таблица медицинских записей
CREATE TABLE medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  horse_id INTEGER NOT NULL,
  veterinarian_id INTEGER NOT NULL,
  record_date DATE NOT NULL,
  type TEXT NOT NULL, -- Тип записи (осмотр, лечение, травма и т.д.)
  description TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  restrictions TEXT, -- Ограничения для тренировок
  attachments TEXT, -- JSON stored as text (Ссылки на файлы)
  next_check_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_med_horse_date ON medical_records(horse_id, record_date);
CREATE INDEX idx_med_next_check ON medical_records(next_check_date);

-- Таблица вакцинаций
CREATE TABLE vaccinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  horse_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  vaccination_date DATE NOT NULL,
  next_date DATE,
  veterinarian_id INTEGER NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vac_horse ON vaccinations(horse_id);
CREATE INDEX idx_vac_next_date ON vaccinations(next_date);

-- Таблица тренировок
CREATE TABLE trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  horse_id INTEGER NOT NULL,
  trainer_id INTEGER NOT NULL,
  training_date DATE NOT NULL,
  type TEXT NOT NULL, -- Вид нагрузки
  duration INTEGER NOT NULL, -- Длительность в минутах
  intensity TEXT CHECK(intensity IN ('low', 'medium', 'high')) NOT NULL,
  horse_condition TEXT NOT NULL, -- Самочувствие лошади
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_train_horse_date ON trainings(horse_id, training_date);

-- Таблица отчетов жокеев
CREATE TABLE jockey_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  jockey_id INTEGER NOT NULL,
  start_behavior TEXT NOT NULL, -- Поведение на старте
  distance_behavior TEXT NOT NULL, -- Поведение на дистанции
  finish_behavior TEXT NOT NULL, -- Поведение на финише
  finish_condition TEXT NOT NULL, -- Самочувствие после заезда
  equipment_notes TEXT, -- Замечания по снаряжению
  recommendations TEXT, -- Рекомендации тренеру
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (jockey_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(race_id, horse_id)
);

-- Таблица сообщений
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_receiver ON messages(receiver_id);
CREATE INDEX idx_sender ON messages(sender_id);

-- Таблица уведомлений
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(created_at);

-- Таблица логов активности
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- Тип сущности (horse, race, user и т.д.)
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_log_user ON activity_logs(user_id);
CREATE INDEX idx_log_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_log_created ON activity_logs(created_at);

-- Таблица отношений тренер-лошадь (дополнительная для многие-ко-многим)
CREATE TABLE trainer_horses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trainer_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  UNIQUE(trainer_id, horse_id)
);

-- Таблица жокей-лошадь назначения
CREATE TABLE jockey_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jockey_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  assigned_by INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (jockey_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(jockey_id, horse_id, is_active)
);

-- Таблица ветеринарных назначений
CREATE TABLE veterinarian_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  veterinarian_id INTEGER NOT NULL,
  horse_id INTEGER NOT NULL,
  assigned_by INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(veterinarian_id, horse_id, is_active)
);
