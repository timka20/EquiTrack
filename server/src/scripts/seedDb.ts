import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { UserRole, HorseStatus, HorseGender, RaceStatus, RegistrationStatus, BreedingStatus, FoalStatus } from '../types/index.js';

async function seedDatabase() {
  try {
    console.log('🔄 Starting database seeding...');

    console.log('🔄 Clearing existing data...');
    const tables = [
      'activity_logs', 'notifications', 'messages', 'jockey_reports', 'trainings',
      'vaccinations', 'medical_records', 'foals', 'breedings', 'race_results',
      'race_registrations', 'races', 'trainer_horses', 'jockey_assignments',
      'veterinarian_assignments', 'horses', 'users'
    ];

    db.exec('PRAGMA foreign_keys = OFF');

    for (const table of tables) {
      db.exec(`DELETE FROM ${table}`);
    }

    db.exec('PRAGMA foreign_keys = ON');
    console.log('✅ Data cleared');

    const defaultPassword = await bcrypt.hash('password123', 10);

    console.log('🔄 Creating users...');
    const users = [

      { email: 'admin@equipulse.com', password: defaultPassword, firstName: 'Александр', lastName: 'Администраторов', role: UserRole.ADMIN, phone: '+7-999-100-00-01' },

      { email: 'stud1@equipulse.com', password: defaultPassword, firstName: 'Виктор', lastName: 'Заводчиков', role: UserRole.OWNER_STUD, phone: '+7-999-200-00-01' },
      { email: 'stud2@equipulse.com', password: defaultPassword, firstName: 'Михаил', lastName: 'Коннозаводов', role: UserRole.OWNER_STUD, phone: '+7-999-200-00-02' },

      { email: 'owner1@equipulse.com', password: defaultPassword, firstName: 'Сергей', lastName: 'Владельцев', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-01' },
      { email: 'owner2@equipulse.com', password: defaultPassword, firstName: 'Дмитрий', lastName: 'Собственников', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-02' },
      { email: 'owner3@equipulse.com', password: defaultPassword, firstName: 'Андрей', lastName: 'Держателев', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-03' },

      { email: 'trainer1@equipulse.com', password: defaultPassword, firstName: 'Иван', lastName: 'Тренеров', role: UserRole.TRAINER, phone: '+7-999-400-00-01' },
      { email: 'trainer2@equipulse.com', password: defaultPassword, firstName: 'Петр', lastName: 'Подготовщиков', role: UserRole.TRAINER, phone: '+7-999-400-00-02' },
      { email: 'trainer3@equipulse.com', password: defaultPassword, firstName: 'Николай', lastName: 'Дрессировщиков', role: UserRole.TRAINER, phone: '+7-999-400-00-03' },

      { email: 'jockey1@equipulse.com', password: defaultPassword, firstName: 'Алексей', lastName: 'Нагайкин', role: UserRole.JOCKEY, phone: '+7-999-500-00-01' },
      { email: 'jockey2@equipulse.com', password: defaultPassword, firstName: 'Максим', lastName: 'Всадников', role: UserRole.JOCKEY, phone: '+7-999-500-00-02' },
      { email: 'jockey3@equipulse.com', password: defaultPassword, firstName: 'Кирилл', lastName: 'Скачков', role: UserRole.JOCKEY, phone: '+7-999-500-00-03' },

      { email: 'vet1@equipulse.com', password: defaultPassword, firstName: 'Елена', lastName: 'Ветеринарова', role: UserRole.VETERINARIAN, phone: '+7-999-600-00-01' },
      { email: 'vet2@equipulse.com', password: defaultPassword, firstName: 'Ольга', lastName: 'Лечебницева', role: UserRole.VETERINARIAN, phone: '+7-999-600-00-02' },
    ];

    const insertUser = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const userIds: number[] = [];
    for (const user of users) {
      const result = insertUser.run(user.email, user.password, user.firstName, user.lastName, user.phone, user.role);
      userIds.push(result.lastInsertRowid as number);
    }
    console.log('✅ Users created');

    const adminId = userIds[0];
    const studOwnerIds = [userIds[1], userIds[2]];
    const privateOwnerIds = [userIds[3], userIds[4], userIds[5]];
    const trainerIds = [userIds[6], userIds[7], userIds[8]];
    const jockeyIds = [userIds[9], userIds[10], userIds[11]];
    const vetIds = [userIds[12], userIds[13]];

    console.log('🔄 Creating ancestor horses...');
    const ancestors = [
      { name: 'Громовержец', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2010, birthCountry: 'Ирландия' },
      { name: 'Ветерокрылая', gender: HorseGender.MARE, color: 'Гнедая', birthYear: 2012, birthCountry: 'Великобритания' },
      { name: 'Буревестник', gender: HorseGender.STALLION, color: 'Серый', birthYear: 2011, birthCountry: 'США' },
      { name: 'Звездопад', gender: HorseGender.MARE, color: 'Рыжая', birthYear: 2013, birthCountry: 'Франция' },
      { name: 'Громовой', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2012, birthCountry: 'Германия' },
      { name: 'Лунная', gender: HorseGender.MARE, color: 'Бурая', birthYear: 2014, birthCountry: 'Япония' },
      { name: 'Вихрь', gender: HorseGender.STALLION, color: 'Гнедая', birthYear: 2011, birthCountry: 'Австралия' },
      { name: 'Рассветная', gender: HorseGender.MARE, color: 'Серая', birthYear: 2013, birthCountry: 'Новая Зеландия' },
    ];

    const insertHorse = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, status, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const ancestorIds: number[] = [];
    for (const horse of ancestors) {
      const result = insertHorse.run(horse.name, horse.gender, horse.color, horse.birthYear, horse.birthCountry, studOwnerIds[0], HorseStatus.RETIRED, JSON.stringify([]));
      ancestorIds.push(result.lastInsertRowid as number);
    }

    const insertParent = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, owner_id, father_id, mother_id, status, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const parents = [
      { name: 'Громовой Наследник', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2015, birthCountry: 'Россия', fatherId: ancestorIds[0], motherId: ancestorIds[1] },
      { name: 'Ветреная Красавица', gender: HorseGender.MARE, color: 'Гнедая', birthYear: 2016, birthCountry: 'Россия', fatherId: ancestorIds[2], motherId: ancestorIds[3] },
      { name: 'Бурный', gender: HorseGender.STALLION, color: 'Серый', birthYear: 2015, birthCountry: 'Россия', fatherId: ancestorIds[4], motherId: ancestorIds[5] },
      { name: 'Звездная', gender: HorseGender.MARE, color: 'Рыжая', birthYear: 2017, birthCountry: 'Россия', fatherId: ancestorIds[6], motherId: ancestorIds[7] },
      { name: 'Громовой Принц', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2016, birthCountry: 'Россия', fatherId: ancestorIds[0], motherId: ancestorIds[3] },
      { name: 'Лунная Дева', gender: HorseGender.MARE, color: 'Бурая', birthYear: 2018, birthCountry: 'Россия', fatherId: ancestorIds[2], motherId: ancestorIds[5] },
    ];

    const parentIds: number[] = [];
    for (const horse of parents) {
      const result = insertParent.run(horse.name, horse.gender, horse.color, horse.birthYear, horse.birthCountry, studOwnerIds[0], studOwnerIds[0], horse.fatherId, horse.motherId, HorseStatus.IN_TRAINING, JSON.stringify(['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800']));
      parentIds.push(result.lastInsertRowid as number);
    }

    console.log('🔄 Creating active horses...');
    const insertActiveHorse = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, owner_id, trainer_id, father_id, mother_id, status, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const activeHorses = [
      { name: 'Гроза', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2020, owner: studOwnerIds[0], trainer: trainerIds[0], father: parentIds[0], mother: parentIds[1], status: HorseStatus.IN_TRAINING },
      { name: 'Ураган', gender: HorseGender.GELDING, color: 'Гнедая', birthYear: 2019, owner: privateOwnerIds[0], trainer: trainerIds[0], father: parentIds[2], mother: parentIds[3], status: HorseStatus.IN_TRAINING },
      { name: 'Ветер', gender: HorseGender.STALLION, color: 'Серый', birthYear: 2020, owner: studOwnerIds[1], trainer: trainerIds[1], father: parentIds[4], mother: parentIds[5], status: HorseStatus.IN_TRAINING },
      { name: 'Молния', gender: HorseGender.MARE, color: 'Рыжая', birthYear: 2021, owner: privateOwnerIds[1], trainer: trainerIds[1], father: parentIds[0], mother: parentIds[3], status: HorseStatus.IN_TRAINING },
      { name: 'Гром', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2019, owner: privateOwnerIds[2], trainer: trainerIds[2], father: parentIds[2], mother: parentIds[1], status: HorseStatus.IN_TRAINING },
      { name: 'Брызги', gender: HorseGender.MARE, color: 'Гнедая', birthYear: 2021, owner: studOwnerIds[0], trainer: trainerIds[0], father: parentIds[4], mother: parentIds[5], status: HorseStatus.IN_TRAINING },
      { name: 'Туман', gender: HorseGender.GELDING, color: 'Серый', birthYear: 2020, owner: privateOwnerIds[0], trainer: trainerIds[1], father: parentIds[0], mother: parentIds[5], status: HorseStatus.RESTING },
      { name: 'Рассвет', gender: HorseGender.MARE, color: 'Рыжая', birthYear: 2022, owner: studOwnerIds[1], trainer: trainerIds[2], father: parentIds[2], mother: parentIds[1], status: HorseStatus.FOR_SALE },
      { name: 'Заря', gender: HorseGender.MARE, color: 'Бурая', birthYear: 2022, owner: privateOwnerIds[1], trainer: trainerIds[0], father: parentIds[4], mother: parentIds[3], status: HorseStatus.IN_TRAINING },
      { name: 'Шторм', gender: HorseGender.STALLION, color: 'Вороной', birthYear: 2023, owner: studOwnerIds[0], trainer: trainerIds[1], father: parentIds[0], mother: parentIds[1], status: HorseStatus.IN_TRAINING },
    ];

    const horseIds: number[] = [];
    for (const horse of activeHorses) {
      const result = insertActiveHorse.run(horse.name, horse.gender, horse.color, horse.birthYear, 'Россия', horse.owner, horse.owner, horse.trainer, horse.father, horse.mother, horse.status, JSON.stringify(['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800']));
      horseIds.push(result.lastInsertRowid as number);
    }

    const insertTrainerHorse = db.prepare('INSERT INTO trainer_horses (trainer_id, horse_id) VALUES (?, ?)');
    for (let i = 0; i < activeHorses.length; i++) {
      insertTrainerHorse.run(activeHorses[i].trainer, horseIds[i]);
    }
    console.log('✅ Horses created');

    console.log('🔄 Creating races...');
    const insertRace = db.prepare(
      'INSERT INTO races (name, date, hippodrome, distance, prize_fund, status) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const races = [
      { name: 'Большой Всероссийский Приз', date: '2024-12-20', hippodrome: 'Московский ипподром', distance: 2400, prizeFund: 5000000, status: RaceStatus.FINISHED },
      { name: 'Приз Президента РФ', date: '2024-11-15', hippodrome: 'Московский ипподром', distance: 2000, prizeFund: 10000000, status: RaceStatus.FINISHED },
      { name: 'Зимний Дербри', date: '2025-01-25', hippodrome: 'Санкт-Петербургский ипподром', distance: 1600, prizeFund: 3000000, status: RaceStatus.REGISTRATION_OPEN },
      { name: 'Кубок Кремля', date: '2025-02-14', hippodrome: 'Московский ипподром', distance: 1800, prizeFund: 4000000, status: RaceStatus.SCHEDULED },
      { name: 'Весенние Скачки', date: '2025-03-20', hippodrome: 'Пятигорский ипподром', distance: 2200, prizeFund: 2500000, status: RaceStatus.SCHEDULED },
      { name: 'Открытие сезона', date: '2025-04-05', hippodrome: 'Ростовский ипподром', distance: 1600, prizeFund: 1500000, status: RaceStatus.SCHEDULED },
    ];

    const raceIds: number[] = [];
    for (const race of races) {
      const result = insertRace.run(race.name, race.date, race.hippodrome, race.distance, race.prizeFund, race.status);
      raceIds.push(result.lastInsertRowid as number);
    }
    console.log('✅ Races created');

    console.log('🔄 Creating race registrations and results...');

    const insertRegistration = db.prepare(
      'INSERT INTO race_registrations (race_id, horse_id, owner_id, trainer_id, jockey_id, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertResult = db.prepare(
      'INSERT INTO race_results (race_id, horse_id, position, race_time, prize) VALUES (?, ?, ?, ?, ?)'
    );

    const race1Results = [
      { horseId: horseIds[0], position: 1, time: '2:28.45', prize: 2500000 },
      { horseId: horseIds[1], position: 2, time: '2:28.89', prize: 1500000 },
      { horseId: horseIds[2], position: 3, time: '2:29.12', prize: 750000 },
      { horseId: horseIds[3], position: 4, time: '2:29.56', prize: 0 },
      { horseId: horseIds[4], position: 5, time: '2:30.01', prize: 0 },
    ];

    for (const result of race1Results) {
      const ownerId = activeHorses.find(h => h.name === activeHorses[horseIds.indexOf(result.horseId)]?.name)?.owner || privateOwnerIds[0];
      insertRegistration.run(raceIds[0], result.horseId, ownerId, trainerIds[0], jockeyIds[0], RegistrationStatus.APPROVED);
      insertResult.run(raceIds[0], result.horseId, result.position, result.time, result.prize);
    }

    const race2Results = [
      { horseId: horseIds[2], position: 1, time: '2:02.15', prize: 5000000 },
      { horseId: horseIds[0], position: 2, time: '2:02.34', prize: 3000000 },
      { horseId: horseIds[4], position: 3, time: '2:02.67', prize: 1500000 },
      { horseId: horseIds[5], position: 4, time: '2:03.12', prize: 0 },
      { horseId: horseIds[1], position: 5, time: '2:03.45', prize: 0 },
    ];

    for (const result of race2Results) {
      const horseIndex = horseIds.indexOf(result.horseId);
      const ownerId = activeHorses[horseIndex]?.owner || privateOwnerIds[0];
      const trainerId = activeHorses[horseIndex]?.trainer || trainerIds[0];
      insertRegistration.run(raceIds[1], result.horseId, ownerId, trainerId, jockeyIds[1], RegistrationStatus.APPROVED);
      insertResult.run(raceIds[1], result.horseId, result.position, result.time, result.prize);
    }

    const upcomingRegistrations = [
      { raceId: raceIds[2], horseId: horseIds[0], owner: activeHorses[0].owner, trainer: activeHorses[0].trainer },
      { raceId: raceIds[2], horseId: horseIds[2], owner: activeHorses[2].owner, trainer: activeHorses[2].trainer },
      { raceId: raceIds[2], horseId: horseIds[4], owner: activeHorses[4].owner, trainer: activeHorses[4].trainer },
    ];

    for (const reg of upcomingRegistrations) {
      insertRegistration.run(reg.raceId, reg.horseId, reg.owner, reg.trainer, null, RegistrationStatus.PENDING);
    }
    console.log('✅ Race registrations and results created');

    console.log('🔄 Creating breedings...');
    const insertBreeding = db.prepare(
      'INSERT INTO breedings (mare_id, stallion_id, planned_date, actual_date, status, expected_foaling_date) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const breedings = [
      { mareId: parentIds[1], stallionId: parentIds[0], plannedDate: '2024-05-15', actualDate: '2024-05-18', status: BreedingStatus.PREGNANCY_CONFIRMED, expectedFoalingDate: '2025-05-01' },
      { mareId: parentIds[3], stallionId: parentIds[2], plannedDate: '2024-06-01', actualDate: '2024-06-03', status: BreedingStatus.COMPLETED, expectedFoalingDate: '2025-05-15' },
      { mareId: parentIds[5], stallionId: parentIds[4], plannedDate: '2025-03-01', status: BreedingStatus.PLANNED, expectedFoalingDate: '2026-02-15' },
    ];

    const breedingIds: number[] = [];
    for (const breeding of breedings) {
      const result = insertBreeding.run(breeding.mareId, breeding.stallionId, breeding.plannedDate, breeding.actualDate || null, breeding.status, breeding.expectedFoalingDate);
      breedingIds.push(result.lastInsertRowid as number);
    }
    console.log('✅ Breedings created');

    console.log('🔄 Creating foals...');
    const insertFoal = db.prepare(
      'INSERT INTO foals (breeding_id, horse_id, status, price) VALUES (?, ?, ?, ?)'
    );

    const foals = [
      { breedingId: breedingIds[0], horseId: horseIds[7], status: FoalStatus.FOR_SALE, price: 1500000 },
      { breedingId: breedingIds[1], horseId: horseIds[8], status: FoalStatus.AT_STUD, price: 2000000 },
    ];

    for (const foal of foals) {
      insertFoal.run(foal.breedingId, foal.horseId, foal.status, foal.price);
    }
    console.log('✅ Foals created');

    console.log('🔄 Creating trainings...');
    const insertTraining = db.prepare(
      'INSERT INTO trainings (horse_id, trainer_id, training_date, type, duration, intensity, horse_condition) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const trainings = [
      { horseId: horseIds[0], trainerId: trainerIds[0], date: '2024-12-10', type: 'Галоп', duration: 45, intensity: 'high', condition: 'Отличное' },
      { horseId: horseIds[0], trainerId: trainerIds[0], date: '2024-12-12', type: 'Кантер', duration: 30, intensity: 'medium', condition: 'Хорошее' },
      { horseId: horseIds[1], trainerId: trainerIds[0], date: '2024-12-11', type: 'Галоп', duration: 40, intensity: 'high', condition: 'Отличное' },
      { horseId: horseIds[2], trainerId: trainerIds[1], date: '2024-12-10', type: 'Рысь', duration: 35, intensity: 'low', condition: 'Хорошее' },
      { horseId: horseIds[3], trainerId: trainerIds[1], date: '2024-12-13', type: 'Галоп', duration: 50, intensity: 'high', condition: 'Отличное' },
    ];

    for (const training of trainings) {
      insertTraining.run(training.horseId, training.trainerId, training.date, training.type, training.duration, training.intensity, training.condition);
    }
    console.log('✅ Trainings created');

    console.log('🔄 Creating medical records...');
    const insertMedicalRecord = db.prepare(
      'INSERT INTO medical_records (horse_id, veterinarian_id, record_date, type, description, diagnosis, restrictions, next_check_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const medicalRecords = [
      { horseId: horseIds[0], vetId: vetIds[0], date: '2024-11-01', type: 'Плановый осмотр', description: 'Общий осмотр перед сезоном', diagnosis: 'Здоров', restrictions: null },
      { horseId: horseIds[1], vetId: vetIds[0], date: '2024-10-15', type: 'Лечение', description: 'Небольшое растяжение сухожилия', diagnosis: 'Растяжение', restrictions: 'Легкие тренировки 2 недели', nextCheckDate: '2024-10-29' },
      { horseId: horseIds[2], vetId: vetIds[1], date: '2024-12-01', type: 'Вакцинация', description: 'Ежегодная вакцинация', diagnosis: 'Здоров', restrictions: null },
    ];

    for (const record of medicalRecords) {
      insertMedicalRecord.run(record.horseId, record.vetId, record.date, record.type, record.description, record.diagnosis, record.restrictions, record.nextCheckDate || null);
    }
    console.log('✅ Medical records created');

    console.log('🔄 Creating vaccinations...');
    const insertVaccination = db.prepare(
      'INSERT INTO vaccinations (horse_id, name, vaccination_date, next_date, veterinarian_id) VALUES (?, ?, ?, ?, ?)'
    );

    const vaccinations = [
      { horseId: horseIds[0], name: 'Грипп + Герпес', date: '2024-03-15', nextDate: '2025-03-15', vetId: vetIds[0] },
      { horseId: horseIds[0], name: 'Столбняк', date: '2024-04-01', nextDate: '2026-04-01', vetId: vetIds[0] },
      { horseId: horseIds[1], name: 'Грипп + Герпес', date: '2024-03-20', nextDate: '2025-03-20', vetId: vetIds[1] },
    ];

    for (const vac of vaccinations) {
      insertVaccination.run(vac.horseId, vac.name, vac.date, vac.nextDate, vac.vetId);
    }
    console.log('✅ Vaccinations created');

    console.log('🔄 Creating jockey reports...');
    const insertJockeyReport = db.prepare(
      'INSERT INTO jockey_reports (race_id, horse_id, jockey_id, start_behavior, distance_behavior, finish_behavior, finish_condition, equipment_notes, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const jockeyReports = [
      { raceId: raceIds[0], horseId: horseIds[0], jockeyId: jockeyIds[0], startBehavior: 'Отличный старт, сразу занял лидирующую позицию', distanceBehavior: 'Держал темп, контролировал ситуацию', finishBehavior: 'Мощный финиш, уверенная победа', condition: 'Отличное', equipmentNotes: 'Всё в порядке', recommendations: 'Можно увеличивать дистанцию' },
      { raceId: raceIds[0], horseId: horseIds[1], jockeyId: jockeyIds[0], startBehavior: 'Небольшая задержка на старте', distanceBehavior: 'Хорошо догонял соперников', finishBehavior: 'Сильный рывок на финише', condition: 'Хорошее', equipmentNotes: 'Уздечка требует подтяжки', recommendations: 'Работать над стартом' },
      { raceId: raceIds[1], horseId: horseIds[2], jockeyId: jockeyIds[1], startBehavior: 'Средний старт', distanceBehavior: 'Отлично шел вторым эшелоном', finishBehavior: 'Феноменальный финиш', condition: 'Отличное', equipmentNotes: 'Всё отлично', recommendations: 'Готов к более серьезным стартам' },
    ];

    for (const report of jockeyReports) {
      insertJockeyReport.run(report.raceId, report.horseId, report.jockeyId, report.startBehavior, report.distanceBehavior, report.finishBehavior, report.condition, report.equipmentNotes, report.recommendations);
    }
    console.log('✅ Jockey reports created');

    console.log('🔄 Creating messages...');
    const insertMessage = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES (?, ?, ?, ?)'
    );

    const messages = [
      { senderId: trainerIds[0], receiverId: privateOwnerIds[0], subject: 'Подготовка к скачкам', content: 'Гроза отлично готовится к предстоящим скачкам. Рекомендую заявить его на Кубок Кремля.' },
      { senderId: privateOwnerIds[0], receiverId: trainerIds[0], subject: 'Re: Подготовка к скачкам', content: 'Отлично! Подайте заявку, пожалуйста.' },
      { senderId: vetIds[0], receiverId: trainerIds[0], subject: 'Медицинские ограничения', content: 'Урагану нужно еще неделю легких тренировок после растяжения.' },
    ];

    for (const message of messages) {
      insertMessage.run(message.senderId, message.receiverId, message.subject, message.content);
    }
    console.log('✅ Messages created');

    console.log('🔄 Creating notifications...');
    const insertNotification = db.prepare(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)'
    );

    const notifications = [
      { userId: privateOwnerIds[0], type: 'race_result', title: 'Ваш конь занял призовое место!', message: 'Гроза занял 2-е место в Призе Президента РФ' },
      { userId: studOwnerIds[0], type: 'registration_status', title: 'Заявка одобрена', message: 'Ваша заявка на участие в Зимнем Дерби одобрена' },
      { userId: trainerIds[0], type: 'training_reminder', title: 'Напоминание о тренировке', message: 'Запланирована тренировка для Грома в 10:00' },
    ];

    for (const notification of notifications) {
      insertNotification.run(notification.userId, notification.type, notification.title, notification.message);
    }
    console.log('✅ Notifications created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test accounts:');
    console.log('  Admin: admin@equipulse.com / password123');
    console.log('  Stud Owner: stud1@equipulse.com / password123');
    console.log('  Private Owner: owner1@equipulse.com / password123');
    console.log('  Trainer: trainer1@equipulse.com / password123');
    console.log('  Jockey: jockey1@equipulse.com / password123');
    console.log('  Vet: vet1@equipulse.com / password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
