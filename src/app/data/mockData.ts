export interface Horse {
  id: string;
  name: string;
  gender: 'stallion' | 'mare' | 'gelding';
  color: string;
  birthYear: number;
  country: string;
  breeder: string;
  owner: string;
  status: 'training' | 'rest' | 'stud' | 'sold' | 'retired' | 'for_sale' | 'reserved';
  photo: string;
  father: string;
  mother: string;
  fatherOfFather: string;
  motherOfFather: string;
  fatherOfMother: string;
  motherOfMother: string;
  starts: number;
  wins: number;
  places: number;
  totalEarnings: number;
  price?: number;
  forecastPrice?: [number, number];
  trainer?: string;
  jockey?: string;
}

export interface Race {
  id: string;
  name: string;
  date: string;
  hippodrome: string;
  distance: number;
  surface: string;
  prize: number;
  status: 'open' | 'closed' | 'finished';
  participants?: string[];
  category: string;
}

export interface RaceResult {
  raceId: string;
  raceName: string;
  date: string;
  hippodrome: string;
  distance: number;
  prize: number;
  results: {
    place: number;
    horseName: string;
    horseId: string;
    jockey: string;
    trainer: string;
    time: string;
    earnings: number;
  }[];
}

export interface BreedingRecord {
  id: string;
  mareId: string;
  mareName: string;
  stallionId: string;
  stallionName: string;
  plannedDate: string;
  status: 'planned' | 'completed' | 'confirmed_pregnancy' | 'not_confirmed';
  foalId?: string;
  foalName?: string;
  foalBirthDate?: string;
  foalGender?: 'colt' | 'filly';
  foalColor?: string;
}

export interface TrainingLog {
  id: string;
  horseId: string;
  horseName: string;
  date: string;
  type: string;
  duration: number;
  distance?: number;
  condition: 'excellent' | 'good' | 'satisfactory' | 'poor';
  notes: string;
}

export const horses: Horse[] = [
  {
    id: 'h1',
    name: 'Звёздный Султан',
    gender: 'stallion',
    color: 'Гнедой',
    birthYear: 2018,
    country: 'Россия',
    breeder: 'Конный завод «Золотой берег»',
    owner: 'Андреев А.В.',
    status: 'training',
    photo: 'https://images.unsplash.com/photo-1595253215356-7e3d520b2913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Galant Star',
    mother: 'Sultana Pride',
    fatherOfFather: 'Galileo',
    motherOfFather: 'Starlight',
    fatherOfMother: 'Dubai Gold',
    motherOfMother: 'Royal Pride',
    starts: 24,
    wins: 8,
    places: 14,
    totalEarnings: 3450000,
    trainer: 'Иванов С.П.',
    jockey: 'Кузнецов Д.А.',
  },
  {
    id: 'h2',
    name: 'Золотая Стрела',
    gender: 'mare',
    color: 'Рыжая',
    birthYear: 2019,
    country: 'Россия',
    breeder: 'Конный завод «Золотой берег»',
    owner: 'Петрова Н.К.',
    status: 'training',
    photo: 'https://images.unsplash.com/photo-1768685055538-42e59413e42c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Golden Arrow',
    mother: 'Swift Belle',
    fatherOfFather: 'Danehill Dancer',
    motherOfFather: 'Gold Ribbon',
    fatherOfMother: 'Storm Cat',
    motherOfMother: 'Bellagio',
    starts: 18,
    wins: 6,
    places: 11,
    totalEarnings: 2180000,
    trainer: 'Петрова О.С.',
    jockey: 'Морозов В.И.',
  },
  {
    id: 'h3',
    name: 'Северный Ветер',
    gender: 'gelding',
    color: 'Серый',
    birthYear: 2017,
    country: 'Россия',
    breeder: 'Племенной завод «Нева»',
    owner: 'Сидоров Г.Е.',
    status: 'rest',
    photo: 'https://images.unsplash.com/photo-1671435302799-35d7fde02b90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Northern Star',
    mother: 'Wind Dancer',
    fatherOfFather: 'Monsun',
    motherOfFather: 'Nordic Belle',
    fatherOfMother: 'Sadler\'s Wells',
    motherOfMother: 'Tempest',
    starts: 31,
    wins: 11,
    places: 20,
    totalEarnings: 5120000,
    trainer: 'Сидоров В.В.',
    jockey: 'Быков А.К.',
  },
  {
    id: 'h4',
    name: 'Чёрный Принц',
    gender: 'stallion',
    color: 'Вороной',
    birthYear: 2022,
    country: 'Россия',
    breeder: 'Конный завод «Золотой берег»',
    owner: 'Конный завод «Золотой берег»',
    status: 'for_sale',
    photo: 'https://images.unsplash.com/photo-1653832585575-b50bb86b2ad9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Звёздный Султан',
    mother: 'Midnight Dream',
    fatherOfFather: 'Galant Star',
    motherOfFather: 'Sultana Pride',
    fatherOfMother: 'Dark Angel',
    motherOfMother: 'Midnight Rose',
    starts: 0,
    wins: 0,
    places: 0,
    totalEarnings: 0,
    price: 1850000,
    forecastPrice: [1500000, 2200000],
  },
  {
    id: 'h5',
    name: 'Рассвет',
    gender: 'mare',
    color: 'Рыжая',
    birthYear: 2023,
    country: 'Россия',
    breeder: 'Конный завод «Золотой берег»',
    owner: 'Конный завод «Золотой берег»',
    status: 'for_sale',
    photo: 'https://images.unsplash.com/photo-1759082941698-28162423e188?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Звёздный Султан',
    mother: 'Золотая Стрела',
    fatherOfFather: 'Galant Star',
    motherOfFather: 'Sultana Pride',
    fatherOfMother: 'Golden Arrow',
    motherOfMother: 'Swift Belle',
    starts: 0,
    wins: 0,
    places: 0,
    totalEarnings: 0,
    price: 2200000,
    forecastPrice: [1800000, 2800000],
  },
  {
    id: 'h6',
    name: 'Жемчуг',
    gender: 'mare',
    color: 'Белая',
    birthYear: 2016,
    country: 'Россия',
    breeder: 'Племенной завод «Нева»',
    owner: 'Конный завод «Золотой берег»',
    status: 'stud',
    photo: 'https://images.unsplash.com/photo-1741604128722-0f50a3025132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Pearl King',
    mother: 'White Rose',
    fatherOfFather: 'Kingmambo',
    motherOfFather: 'Pearl Necklace',
    fatherOfMother: 'Sadler\'s Wells',
    motherOfMother: 'Rose Garden',
    starts: 27,
    wins: 9,
    places: 17,
    totalEarnings: 4230000,
    trainer: 'Иванов С.П.',
  },
  {
    id: 'h7',
    name: 'Заря',
    gender: 'mare',
    color: 'Гнедая',
    birthYear: 2023,
    country: 'Россия',
    breeder: 'Конный завод «Золотой берег»',
    owner: 'Конный завод «Золотой берег»',
    status: 'reserved',
    photo: 'https://images.unsplash.com/photo-1595253215356-7e3d520b2913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    father: 'Северный Ветер',
    mother: 'Жемчуг',
    fatherOfFather: 'Northern Star',
    motherOfFather: 'Wind Dancer',
    fatherOfMother: 'Pearl King',
    motherOfMother: 'White Rose',
    starts: 0,
    wins: 0,
    places: 0,
    totalEarnings: 0,
    price: 1500000,
    forecastPrice: [1200000, 1800000],
  },
];

export const upcomingRaces: Race[] = [
  {
    id: 'r1',
    name: 'Большой Московский Приз',
    date: '2026-04-15',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 2000,
    surface: 'Дёрн',
    prize: 5000000,
    status: 'open',
    category: 'Группа I',
    participants: ['h1', 'h2', 'h3'],
  },
  {
    id: 'r2',
    name: 'Кубок Весны',
    date: '2026-04-22',
    hippodrome: 'Пятигорский ипподром',
    distance: 1600,
    surface: 'Дёрн',
    prize: 2000000,
    status: 'open',
    category: 'Группа II',
    participants: ['h2', 'h6'],
  },
  {
    id: 'r3',
    name: 'Дерби Надежд',
    date: '2026-05-05',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 2400,
    surface: 'Дёрн',
    prize: 8000000,
    status: 'open',
    category: 'Группа I',
    participants: ['h1', 'h3'],
  },
  {
    id: 'r4',
    name: 'Приз Президента',
    date: '2026-05-18',
    hippodrome: 'Краснодарский ипподром',
    distance: 1800,
    surface: 'Дёрн',
    prize: 3500000,
    status: 'open',
    category: 'Группа II',
    participants: [],
  },
  {
    id: 'r5',
    name: 'Ростовский Приз',
    date: '2026-06-02',
    hippodrome: 'Ростовский ипподром',
    distance: 1200,
    surface: 'Дёрн',
    prize: 1500000,
    status: 'open',
    category: 'Группа III',
    participants: [],
  },
  {
    id: 'r6',
    name: 'Кубок Золотой Осени',
    date: '2026-09-12',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 2000,
    surface: 'Дёрн',
    prize: 4000000,
    status: 'closed',
    category: 'Группа I',
    participants: [],
  },
];

export const raceResults: RaceResult[] = [
  {
    raceId: 'res1',
    raceName: 'Зимний Кубок',
    date: '2026-01-15',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 1600,
    prize: 2500000,
    results: [
      { place: 1, horseName: 'Звёздный Султан', horseId: 'h1', jockey: 'Кузнецов Д.А.', trainer: 'Иванов С.П.', time: '1:39.42', earnings: 1250000 },
      { place: 2, horseName: 'Северный Ветер', horseId: 'h3', jockey: 'Быков А.К.', trainer: 'Сидоров В.В.', time: '1:39.87', earnings: 625000 },
      { place: 3, horseName: 'Золотая Стрела', horseId: 'h2', jockey: 'Морозов В.И.', trainer: 'Петрова О.С.', time: '1:40.13', earnings: 312500 },
      { place: 4, horseName: 'Буря', horseId: 'ext1', jockey: 'Романов П.К.', trainer: 'Козлов А.В.', time: '1:40.56', earnings: 125000 },
      { place: 5, horseName: 'Меридиан', horseId: 'ext2', jockey: 'Лебедев В.С.', trainer: 'Смирнов Д.Г.', time: '1:41.02', earnings: 62500 },
    ],
  },
  {
    raceId: 'res2',
    raceName: 'Приз Рождества',
    date: '2026-01-07',
    hippodrome: 'Пятигорский ипподром',
    distance: 1400,
    prize: 1800000,
    results: [
      { place: 1, horseName: 'Жемчуг', horseId: 'h6', jockey: 'Соколов Р.В.', trainer: 'Иванов С.П.', time: '1:23.71', earnings: 900000 },
      { place: 2, horseName: 'Золотая Стрела', horseId: 'h2', jockey: 'Морозов В.И.', trainer: 'Петрова О.С.', time: '1:24.15', earnings: 450000 },
      { place: 3, horseName: 'Алмаз', horseId: 'ext3', jockey: 'Никитин Е.П.', trainer: 'Орлов А.Н.', time: '1:24.38', earnings: 225000 },
      { place: 4, horseName: 'Вихрь', horseId: 'ext4', jockey: 'Волков С.В.', trainer: 'Зайцев М.К.', time: '1:24.89', earnings: 90000 },
    ],
  },
  {
    raceId: 'res3',
    raceName: 'Финал Осени',
    date: '2025-10-28',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 2000,
    prize: 4500000,
    results: [
      { place: 1, horseName: 'Северный Ветер', horseId: 'h3', jockey: 'Быков А.К.', trainer: 'Сидоров В.В.', time: '2:02.34', earnings: 2250000 },
      { place: 2, horseName: 'Звёздный Султан', horseId: 'h1', jockey: 'Кузнецов Д.А.', trainer: 'Иванов С.П.', time: '2:02.81', earnings: 1125000 },
      { place: 3, horseName: 'Легенда', horseId: 'ext5', jockey: 'Попов Д.Р.', trainer: 'Федоров К.А.', time: '2:03.17', earnings: 562500 },
      { place: 4, horseName: 'Жемчуг', horseId: 'h6', jockey: 'Соколов Р.В.', trainer: 'Иванов С.П.', time: '2:03.52', earnings: 225000 },
      { place: 5, horseName: 'Прибой', horseId: 'ext6', jockey: 'Тихонов М.В.', trainer: 'Власов Д.Е.', time: '2:03.98', earnings: 112500 },
    ],
  },
  {
    raceId: 'res4',
    raceName: 'Кубок Чемпионов',
    date: '2025-08-10',
    hippodrome: 'Центральный Московский Ипподром',
    distance: 2400,
    prize: 7000000,
    results: [
      { place: 1, horseName: 'Звёздный Султан', horseId: 'h1', jockey: 'Кузнецов Д.А.', trainer: 'Иванов С.П.', time: '2:28.55', earnings: 3500000 },
      { place: 2, horseName: 'Буревестник', horseId: 'ext7', jockey: 'Алексеев П.В.', trainer: 'Горбунов С.Н.', time: '2:29.01', earnings: 1750000 },
      { place: 3, horseName: 'Северный Ветер', horseId: 'h3', jockey: 'Быков А.К.', trainer: 'Сидоров В.В.', time: '2:29.44', earnings: 875000 },
    ],
  },
];

export const breedingRecords: BreedingRecord[] = [
  {
    id: 'b1',
    mareId: 'h2',
    mareName: 'Золотая Стрела',
    stallionId: 'h1',
    stallionName: 'Звёздный Султан',
    plannedDate: '2026-04-10',
    status: 'planned',
  },
  {
    id: 'b2',
    mareId: 'h6',
    mareName: 'Жемчуг',
    stallionId: 'h3',
    stallionName: 'Северный Ветер',
    plannedDate: '2026-03-15',
    status: 'confirmed_pregnancy',
    foalBirthDate: '2027-02-15',
  },
  {
    id: 'b3',
    mareId: 'ext_mare1',
    mareName: 'Лазурь',
    stallionId: 'h1',
    stallionName: 'Звёздный Султан',
    plannedDate: '2026-02-20',
    status: 'completed',
  },
  {
    id: 'b4',
    mareId: 'ext_mare2',
    mareName: 'Весенняя',
    stallionId: 'h1',
    stallionName: 'Звёздный Султан',
    plannedDate: '2025-03-10',
    status: 'confirmed_pregnancy',
    foalId: 'h5',
    foalName: 'Рассвет',
    foalBirthDate: '2026-01-20',
    foalGender: 'filly',
    foalColor: 'Рыжая',
  },
];

export const trainingLogs: TrainingLog[] = [
  {
    id: 't1',
    horseId: 'h1',
    horseName: 'Звёздный Султан',
    date: '2026-03-30',
    type: 'Галоп',
    duration: 45,
    distance: 2000,
    condition: 'excellent',
    notes: 'Отличный темп, лошадь в прекрасной форме. Готова к старту.',
  },
  {
    id: 't2',
    horseId: 'h1',
    horseName: 'Звёздный Султан',
    date: '2026-03-28',
    type: 'Рысь',
    duration: 60,
    distance: 3000,
    condition: 'good',
    notes: 'Умеренная нагрузка после выходного дня.',
  },
  {
    id: 't3',
    horseId: 'h2',
    horseName: 'Золотая Стрела',
    date: '2026-03-30',
    type: 'Спринт',
    duration: 30,
    distance: 1200,
    condition: 'excellent',
    notes: 'Великолепный результат — показала лучшее время в сезоне.',
  },
  {
    id: 't4',
    horseId: 'h2',
    horseName: 'Золотая Стрела',
    date: '2026-03-27',
    type: 'Галоп',
    duration: 50,
    distance: 2400,
    condition: 'good',
    notes: 'Небольшое беспокойство перед стартом, следить за психологическим состоянием.',
  },
];

export const stats = {
  totalHorses: 148,
  totalRaces: 312,
  totalVictories: 89,
  totalSales: 47,
  totalEarnings: 128500000,
  activeOwners: 34,
};
