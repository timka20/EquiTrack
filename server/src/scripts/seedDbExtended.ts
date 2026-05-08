import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { UserRole, HorseStatus, HorseGender, RaceStatus, RegistrationStatus, BreedingStatus, FoalStatus } from '../types/index.js';

const horseNames = [
  'Звёздный Султан', 'Золотая Стрела', 'Северный Ветер', 'Чёрный Принц', 'Рассвет',
  'Жемчуг', 'Заря', 'Гром', 'Молния', 'Буря',
  'Ураган', 'Цунами', 'Аваланш', 'Вулкан', 'Орлёнок',
  'Сокол', 'Беркут', 'Кондор', 'Грация', 'Элеганс',
  'Мажор', 'Гранд', 'Премиум', 'Люкс', 'Вип',
  'Альфа', 'Омега', 'Дельта', 'Сигма', 'Тета',
  'Космос', 'Галактика', 'Вселенная', 'Планета', 'Метеор',
  'Комета', 'Астероид', 'Нebula', 'Квазар', 'Пульсар'
];

const colors = ['Гнедой', 'Вороной', 'Серый', 'Рыжая', 'Белая', 'Бурая', 'Соловой', 'Караковый', 'Буланый', 'Чалая'];
const countries = ['Россия', 'Ирландия', 'Великобритания', 'США', 'Франция', 'Германия', 'Австралия', 'Япония'];
const hippodromes = [
  'Центральный Московский Ипподром',
  'Пятигорский ипподром',
  'Краснодарский ипподром',
  'Ростовский ипподром',
  'Санкт-Петербургский ипподром'
];

const categories = ['Группа I', 'Группа II', 'Группа III'];

const photoUrls = [
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
  'https://images.unsplash.com/photo-1595253215356-7e3d520b2913?w=800',
  'https://images.unsplash.com/photo-1768685055538-42e59413e42c?w=800',
  'https://images.unsplash.com/photo-1671435302799-35d7fde02b90?w=800',
  'https://images.unsplash.com/photo-1653832585575-b50bb86b2ad9?w=800',
  'https://images.unsplash.com/photo-1759082941698-28162423e188?w=800',
  'https://images.unsplash.com/photo-1741604128722-0f50a3025132?w=800',
  'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800'
];

async function seedDatabaseExtended() {
  try {
    console.log('🔄 Starting EXTENDED database seeding...');

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
      { email: 'stud3@equipulse.com', password: defaultPassword, firstName: 'Георгий', lastName: 'Разводчиков', role: UserRole.OWNER_STUD, phone: '+7-999-200-00-03' },

      { email: 'owner1@equipulse.com', password: defaultPassword, firstName: 'Сергей', lastName: 'Владельцев', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-01' },
      { email: 'owner2@equipulse.com', password: defaultPassword, firstName: 'Дмитрий', lastName: 'Собственников', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-02' },
      { email: 'owner3@equipulse.com', password: defaultPassword, firstName: 'Андрей', lastName: 'Держателев', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-03' },
      { email: 'owner4@equipulse.com', password: defaultPassword, firstName: 'Владимир', lastName: 'Коневладов', role: UserRole.OWNER_PRIVATE, phone: '+7-999-300-00-04' },

      { email: 'trainer1@equipulse.com', password: defaultPassword, firstName: 'Иван', lastName: 'Тренеров', role: UserRole.TRAINER, phone: '+7-999-400-00-01' },
      { email: 'trainer2@equipulse.com', password: defaultPassword, firstName: 'Петр', lastName: 'Подготовщиков', role: UserRole.TRAINER, phone: '+7-999-400-00-02' },
      { email: 'trainer3@equipulse.com', password: defaultPassword, firstName: 'Николай', lastName: 'Дрессировщиков', role: UserRole.TRAINER, phone: '+7-999-400-00-03' },
      { email: 'trainer4@equipulse.com', password: defaultPassword, firstName: 'Анатолий', lastName: 'Скаковов', role: UserRole.TRAINER, phone: '+7-999-400-00-04' },

      { email: 'jockey1@equipulse.com', password: defaultPassword, firstName: 'Алексей', lastName: 'Нагайкин', role: UserRole.JOCKEY, phone: '+7-999-500-00-01' },
      { email: 'jockey2@equipulse.com', password: defaultPassword, firstName: 'Максим', lastName: 'Всадников', role: UserRole.JOCKEY, phone: '+7-999-500-00-02' },
      { email: 'jockey3@equipulse.com', password: defaultPassword, firstName: 'Кирилл', lastName: 'Скачков', role: UserRole.JOCKEY, phone: '+7-999-500-00-03' },
      { email: 'jockey4@equipulse.com', password: defaultPassword, firstName: 'Денис', lastName: 'Жокеев', role: UserRole.JOCKEY, phone: '+7-999-500-00-04' },

      { email: 'vet1@equipulse.com', password: defaultPassword, firstName: 'Елена', lastName: 'Ветеринарова', role: UserRole.VETERINARIAN, phone: '+7-999-600-00-01' },
      { email: 'vet2@equipulse.com', password: defaultPassword, firstName: 'Ольга', lastName: 'Лечебницева', role: UserRole.VETERINARIAN, phone: '+7-999-600-00-02' },
      { email: 'vet3@equipulse.com', password: defaultPassword, firstName: 'Марина', lastName: 'Докторова', role: UserRole.VETERINARIAN, phone: '+7-999-600-00-03' },
    ];

    const insertUser = db.prepare('INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)');
    const userIds: number[] = [];
    for (const user of users) {
      const result = insertUser.run(user.email, user.password, user.firstName, user.lastName, user.phone, user.role);
      userIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${users.length} users created`);

    const adminId = userIds[0];
    const studOwnerIds = [userIds[1], userIds[2], userIds[3]];
    const privateOwnerIds = [userIds[4], userIds[5], userIds[6], userIds[7]];
    const trainerIds = [userIds[8], userIds[9], userIds[10], userIds[11]];
    const jockeyIds = [userIds[12], userIds[13], userIds[14], userIds[15]];
    const vetIds = [userIds[16], userIds[17], userIds[18]];

    console.log('🔄 Creating ancestors...');
    const insertHorse = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, status, photos, wins, places, starts, total_earnings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const ancestors = [];
    for (let i = 0; i < 12; i++) {
      ancestors.push({
        name: `Легенда ${i + 1}`,
        gender: i % 2 === 0 ? HorseGender.STALLION : HorseGender.MARE,
        color: colors[i % colors.length],
        birthYear: 2008 + Math.floor(Math.random() * 5),
        birthCountry: countries[i % countries.length],
        wins: Math.floor(Math.random() * 15) + 5,
        places: Math.floor(Math.random() * 20) + 10,
        starts: Math.floor(Math.random() * 30) + 20,
        totalEarnings: Math.floor(Math.random() * 5000000) + 1000000
      });
    }

    const ancestorIds: number[] = [];
    for (const horse of ancestors) {
      const result = insertHorse.run(
        horse.name, horse.gender, horse.color, horse.birthYear, horse.birthCountry,
        studOwnerIds[0], HorseStatus.RETIRED, JSON.stringify([photoUrls[0]]),
        horse.wins, horse.places, horse.starts, horse.totalEarnings
      );
      ancestorIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${ancestors.length} ancestors created`);

    console.log('🔄 Creating parents...');
    const parents = [];
    for (let i = 0; i < 10; i++) {
      const fatherId = ancestorIds[Math.floor(Math.random() * ancestorIds.length / 2)];
      const motherId = ancestorIds[Math.floor(Math.random() * ancestorIds.length / 2) + ancestorIds.length / 2];
      parents.push({
        name: `Родитель ${i + 1}`,
        gender: i % 2 === 0 ? HorseGender.STALLION : HorseGender.MARE,
        color: colors[i % colors.length],
        birthYear: 2014 + Math.floor(Math.random() * 4),
        birthCountry: 'Россия',
        fatherId,
        motherId,
        wins: Math.floor(Math.random() * 10) + 2,
        places: Math.floor(Math.random() * 15) + 5,
        starts: Math.floor(Math.random() * 25) + 10,
        totalEarnings: Math.floor(Math.random() * 3000000) + 500000
      });
    }

    const parentIds: number[] = [];
    for (const horse of parents) {
      const result = insertHorse.run(
        horse.name, horse.gender, horse.color, horse.birthYear, horse.birthCountry,
        studOwnerIds[0], HorseStatus.IN_TRAINING, JSON.stringify([photoUrls[1]]),
        horse.wins, horse.places, horse.starts, horse.totalEarnings
      );
      parentIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${parents.length} parents created`);

    console.log('🔄 Creating active horses...');
    const insertActiveHorse = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, owner_id, trainer_id, jockey_id, father_id, mother_id, status, photos, price, wins, places, starts, total_earnings, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const activeHorses = [];
    const statuses = [HorseStatus.IN_TRAINING, HorseStatus.IN_TRAINING, HorseStatus.IN_TRAINING, HorseStatus.RESTING, HorseStatus.FOR_SALE, HorseStatus.BREEDING];

    for (let i = 0; i < 35; i++) {
      const gender = i % 3 === 0 ? HorseGender.STALLION : i % 3 === 1 ? HorseGender.MARE : HorseGender.GELDING;
      const ownerId = i % 2 === 0 ? studOwnerIds[i % studOwnerIds.length] : privateOwnerIds[i % privateOwnerIds.length];
      const trainerId = trainerIds[i % trainerIds.length];
      const jockeyId = i % 2 === 0 ? jockeyIds[i % jockeyIds.length] : null;
      const fatherId = parentIds[Math.floor(Math.random() * parentIds.length / 2)];
      const motherId = parentIds[Math.floor(Math.random() * parentIds.length / 2) + parentIds.length / 2];
      const status = statuses[i % statuses.length];
      const wins = Math.floor(Math.random() * 12);
      const places = Math.floor(Math.random() * 15) + wins;
      const starts = Math.floor(Math.random() * 20) + places + 5;
      const totalEarnings = Math.floor(Math.random() * 4000000) + (wins * 500000);
      const price = status === HorseStatus.FOR_SALE ? Math.floor(Math.random() * 3000000) + 1000000 : null;

      activeHorses.push({
        name: horseNames[i % horseNames.length],
        gender,
        color: colors[i % colors.length],
        birthYear: 2018 + Math.floor(Math.random() * 6),
        breederId: studOwnerIds[i % studOwnerIds.length],
        ownerId,
        trainerId,
        jockeyId,
        fatherId,
        motherId,
        status,
        photo: photoUrls[i % photoUrls.length],
        price,
        wins,
        places,
        starts,
        totalEarnings,
        description: `Прекрасный ${gender === HorseGender.STALLION ? 'жеребец' : gender === HorseGender.MARE ? 'кобыла' : 'мерин'} с отличной родословной.`
      });
    }

    const horseIds: number[] = [];
    for (const horse of activeHorses) {
      const result = insertActiveHorse.run(
        horse.name, horse.gender, horse.color, horse.birthYear, 'Россия',
        horse.breederId, horse.ownerId, horse.trainerId, horse.jockeyId,
        horse.fatherId, horse.motherId, horse.status,
        JSON.stringify([horse.photo]), horse.price, horse.wins, horse.places,
        horse.starts, horse.totalEarnings, horse.description
      );
      horseIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${activeHorses.length} active horses created`);

    const insertTrainerHorse = db.prepare('INSERT INTO trainer_horses (trainer_id, horse_id) VALUES (?, ?)');
    for (let i = 0; i < activeHorses.length; i++) {
      insertTrainerHorse.run(activeHorses[i].trainerId, horseIds[i]);
    }

    console.log('🔄 Creating races...');
    const insertRace = db.prepare(
      'INSERT INTO races (name, date, hippodrome, distance, surface, prize_fund, category, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const raceNames = [
      'Большой Всероссийский Приз', 'Приз Президента РФ', 'Зимний Дерби', 'Кубок Кремля',
      'Весенние Скачки', 'Открытие сезона', 'Дерби Надежд', 'Кубок Весны',
      'Большой Московский Приз', 'Приз Губернатора', 'Осенняя Classics', 'Зимний Кубок',
      'Всеобщий Приз', 'Гранд- Prix', 'Кубок Чемпионов', 'Приз Рождества',
      'Новогодние Скачки', 'Кубок Золотой Осень'
    ];

    const races = [];
    const now = new Date();

    for (let i = 0; i < 18; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + (i - 5) * 15); 

      races.push({
        name: raceNames[i % raceNames.length],
        date: date.toISOString().split('T')[0],
        hippodrome: hippodromes[i % hippodromes.length],
        distance: [1200, 1400, 1600, 1800, 2000, 2200, 2400][i % 7],
        surface: 'Дёрн',
        prizeFund: [1500000, 2000000, 2500000, 3500000, 5000000, 8000000, 10000000][i % 7],
        category: categories[i % 3],
        status: i < 5 ? RaceStatus.FINISHED : i < 8 ? RaceStatus.REGISTRATION_OPEN : RaceStatus.SCHEDULED,
        description: `Престижные скачки с большим призовым фондом.`
      });
    }

    const raceIds: number[] = [];
    for (const race of races) {
      const result = insertRace.run(
        race.name, race.date, race.hippodrome, race.distance, race.surface,
        race.prizeFund, race.category, race.status, race.description
      );
      raceIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${races.length} races created`);

    console.log('🔄 Creating registrations and results...');
    const insertRegistration = db.prepare(
      'INSERT INTO race_registrations (race_id, horse_id, owner_id, trainer_id, jockey_id, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertResult = db.prepare(
      'INSERT INTO race_results (race_id, horse_id, position, race_time, prize, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (let r = 0; r < 5; r++) {
      const raceHorseIds = new Set<number>();
      while (raceHorseIds.size < 8) {
        raceHorseIds.add(horseIds[Math.floor(Math.random() * horseIds.length)]);
      }

      const uniqueHorseIds = Array.from(raceHorseIds);
      uniqueHorseIds.sort(() => Math.random() - 0.5);

      for (let i = 0; i < uniqueHorseIds.length; i++) {
        const horseIdx = horseIds.indexOf(uniqueHorseIds[i]);
        const ownerId = activeHorses[horseIdx]?.ownerId || privateOwnerIds[0];
        const trainerId = activeHorses[horseIdx]?.trainerId || trainerIds[0];
        const jockeyId = jockeyIds[i % jockeyIds.length];
        const position = i + 1;

        const baseSeconds = 28 + i * 0.5;
        const raceTime = `2:${Math.floor(baseSeconds).toString().padStart(2, '0')}.${Math.floor((baseSeconds % 1) * 100).toString().padStart(2, '0')}`;

        const prize = i === 0 ? races[r].prizeFund * 0.5 : i === 1 ? races[r].prizeFund * 0.25 : i === 2 ? races[r].prizeFund * 0.125 : 0;

        insertRegistration.run(raceIds[r], uniqueHorseIds[i], ownerId, trainerId, jockeyId, RegistrationStatus.APPROVED);
        insertResult.run(raceIds[r], uniqueHorseIds[i], position, raceTime, prize, null);
      }
    }

    for (let r = 5; r < 8; r++) {
      const raceHorseIds = new Set<number>();
      while (raceHorseIds.size < 5) {
        raceHorseIds.add(horseIds[Math.floor(Math.random() * horseIds.length)]);
      }
      for (const horseId of raceHorseIds) {
        const horseIdx = horseIds.indexOf(horseId);
        insertRegistration.run(
          raceIds[r], horseId, activeHorses[horseIdx].ownerId,
          activeHorses[horseIdx].trainerId, null, RegistrationStatus.PENDING
        );
      }
    }
    console.log('✅ Registrations and results created');

    console.log('🔄 Creating breedings...');
    const insertBreeding = db.prepare(
      'INSERT INTO breedings (mare_id, stallion_id, planned_date, actual_date, status, expected_foaling_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const mares = parentIds.filter((_, i) => i % 2 === 1);
    const stallions = parentIds.filter((_, i) => i % 2 === 0);

    const breedings = [];
    for (let i = 0; i < 15; i++) {
      const mareId = mares[i % mares.length];
      const stallionId = stallions[i % stallions.length];
      const plannedDate = new Date(now);
      plannedDate.setMonth(plannedDate.getMonth() - i);
      const expectedDate = new Date(plannedDate);
      expectedDate.setMonth(expectedDate.getMonth() + 11);

      breedings.push({
        mareId,
        stallionId,
        plannedDate: plannedDate.toISOString().split('T')[0],
        actualDate: i < 10 ? plannedDate.toISOString().split('T')[0] : null,
        status: i < 8 ? BreedingStatus.PREGNANCY_CONFIRMED : i < 10 ? BreedingStatus.COMPLETED : BreedingStatus.PLANNED,
        expectedFoalingDate: expectedDate.toISOString().split('T')[0],
        notes: `Запланированная вязка ${i + 1}`
      });
    }

    const breedingIds: number[] = [];
    for (const breeding of breedings) {
      const result = insertBreeding.run(
        breeding.mareId, breeding.stallionId, breeding.plannedDate,
        breeding.actualDate, breeding.status, breeding.expectedFoalingDate, breeding.notes
      );
      breedingIds.push(result.lastInsertRowid as number);
    }
    console.log(`✅ ${breedings.length} breedings created`);

    console.log('🔄 Creating foals...');
    const insertFoal = db.prepare(
      'INSERT INTO foals (breeding_id, horse_id, status, price, reservation_date, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const foalStatuses = [FoalStatus.FOR_SALE, FoalStatus.FOR_SALE, FoalStatus.AT_STUD, FoalStatus.RESERVED, FoalStatus.SOLD];

    for (let i = 0; i < 20; i++) {
      const horseId = horseIds[i % horseIds.length];
      const status = foalStatuses[i % foalStatuses.length];
      const price = status === FoalStatus.FOR_SALE || status === FoalStatus.RESERVED ? Math.floor(Math.random() * 2500000) + 800000 : null;
      const reservationDate = status === FoalStatus.RESERVED || status === FoalStatus.SOLD ? new Date().toISOString().split('T')[0] : null;

      insertFoal.run(
        breedingIds[i % breedingIds.length], horseId, status, price, reservationDate,
        `Жеребёнок от ${i + 1} вязки`
      );
    }
    console.log('✅ 20 foals created');

    console.log('🔄 Creating trainings...');
    const insertTraining = db.prepare(
      'INSERT INTO trainings (horse_id, trainer_id, training_date, type, duration, intensity, horse_condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const trainingTypes = ['Галоп', 'Кантер', 'Рысь', 'Спринт', 'Выездка', 'Прыжки'];
    const intensities = ['low', 'medium', 'high'];

    for (let i = 0; i < 50; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));

      insertTraining.run(
        horseIds[i % horseIds.length],
        trainerIds[i % trainerIds.length],
        date.toISOString().split('T')[0],
        trainingTypes[i % trainingTypes.length],
        30 + Math.floor(Math.random() * 45),
        intensities[i % 3],
        ['Отличное', 'Хорошее', 'Удовлетворительное'][i % 3],
        `Тренировка ${i + 1}`
      );
    }
    console.log('✅ 50 trainings created');

    console.log('🔄 Creating medical records...');
    const insertMedicalRecord = db.prepare(
      'INSERT INTO medical_records (horse_id, veterinarian_id, record_date, type, description, diagnosis, treatment, restrictions, next_check_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const medicalTypes = ['Плановый осмотр', 'Вакцинация', 'Лечение', 'Реабилитация', 'Хирургия'];

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 30);

      insertMedicalRecord.run(
        horseIds[i % horseIds.length],
        vetIds[i % vetIds.length],
        date.toISOString().split('T')[0],
        medicalTypes[i % medicalTypes.length],
        `Медицинская запись ${i + 1}`,
        ['Здоров', 'На реабилитации', 'Выздоравливает'][i % 3],
        i % 3 === 1 ? 'Физиотерапия' : null,
        i % 3 === 1 ? 'Лёгкие нагрузки' : null,
        nextDate.toISOString().split('T')[0]
      );
    }
    console.log('✅ 30 medical records created');

    console.log('🔄 Creating vaccinations...');
    const insertVaccination = db.prepare(
      'INSERT INTO vaccinations (horse_id, name, vaccination_date, next_date, veterinarian_id, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const vacNames = ['Грипп + Герпес', 'Столбняк', 'Бешенство', 'Лептоспироз', 'Энцефалит'];

    for (let i = 0; i < 40; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
      const nextDate = new Date(date);
      nextDate.setFullYear(nextDate.getFullYear() + 1);

      insertVaccination.run(
        horseIds[i % horseIds.length],
        vacNames[i % vacNames.length],
        date.toISOString().split('T')[0],
        nextDate.toISOString().split('T')[0],
        vetIds[i % vetIds.length],
        `Вакцинация ${i + 1}`
      );
    }
    console.log('✅ 40 vaccinations created');

    console.log('🔄 Creating jockey reports...');
    const insertJockeyReport = db.prepare(
      'INSERT INTO jockey_reports (race_id, horse_id, jockey_id, start_behavior, distance_behavior, finish_behavior, finish_condition, equipment_notes, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < 25; i++) {
      insertJockeyReport.run(
        raceIds[i % 5], 
        horseIds[i % horseIds.length],
        jockeyIds[i % jockeyIds.length],
        ['Отличный старт', 'Средний старт', 'Небольшая задержка'][i % 3],
        ['Держал темп', 'Хорошо догонял', 'Отлично шел'][i % 3],
        ['Мощный финиш', 'Сильный рывок', 'Уверенная победа'][i % 3],
        ['Отличное', 'Хорошее', 'Удовлетворительное'][i % 3],
        'Всё в порядке',
        ['Можно увеличивать дистанцию', 'Работать над стартом', 'Готов к серьезным стартам'][i % 3]
      );
    }
    console.log('✅ 25 jockey reports created');

    console.log('🔄 Creating messages...');
    const insertMessage = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, subject, content, is_read) VALUES (?, ?, ?, ?, ?)'
    );

    const subjects = [
      'Подготовка к скачкам', 'Медицинские ограничения', 'Заявка на вязку',
      'Предложение о продаже', 'Тренировочный план', 'Результаты анализов'
    ];

    for (let i = 0; i < 50; i++) {
      insertMessage.run(
        userIds[i % userIds.length],
        userIds[(i + 1) % userIds.length],
        subjects[i % subjects.length],
        `Сообщение ${i + 1}: Подробная информация по теме.`,
        i % 3 === 0 ? 1 : 0
      );
    }
    console.log('✅ 50 messages created');

    console.log('🔄 Creating notifications...');
    const insertNotification = db.prepare(
      'INSERT INTO notifications (user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?)'
    );

    const notifTypes = ['race_result', 'registration_status', 'training_reminder', 'medical_alert', 'sale_inquiry'];
    const notifTitles = [
      'Ваш конь занял призовое место!',
      'Заявка одобрена',
      'Напоминание о тренировке',
      'Требуется вакцинация',
      'Новое предложение о покупке'
    ];

    for (let i = 0; i < 60; i++) {
      insertNotification.run(
        userIds[i % userIds.length],
        notifTypes[i % notifTypes.length],
        notifTitles[i % notifTitles.length],
        `Уведомление ${i + 1}: Подробности в личном кабинете.`,
        i % 4 === 0 ? 1 : 0
      );
    }
    console.log('✅ 60 notifications created');

    console.log('\n🎉 EXTENDED database seeding completed successfully!');
    console.log('\n📊 Statistics:');
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Horses: ${ancestors.length + parents.length + activeHorses.length}`);
    console.log(`  • Races: ${races.length}`);
    console.log(`  • Breedings: ${breedings.length}`);
    console.log(`  • Trainings: 50`);
    console.log(`  • Medical records: 30`);
    console.log(`  • Messages: 50`);
    console.log(`  • Notifications: 60`);

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

seedDatabaseExtended();
