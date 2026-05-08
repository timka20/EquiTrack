export type PlatformType = 'billboard' | 'digital_screen' | 'wall' | 'mall' | 'transport';

export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
  address: string;
  city: string;
  pricePerDay: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  description: string;
  specs: {
    size: string;
    format: string;
    illumination: boolean;
    traffic: string;
  };
  available: boolean;
  bookedDates: string[];
  ownerId: string;
}

export interface Review {
  id: string;
  platformId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Booking {
  id: string;
  platformId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  materialStatus: 'none' | 'pending' | 'approved' | 'rejected';
  materialUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'owner' | 'moderator' | 'admin';
  avatar?: string;
  phone?: string;
  company?: string;
  status?: 'active' | 'blocked';
}

export const platformTypeLabels: Record<PlatformType, string> = {
  billboard: 'Билборд',
  digital_screen: 'Цифровой экран',
  wall: 'Стена',
  mall: 'ТЦ',
  transport: 'Транспорт',
};

export const platformTypeIcons: Record<PlatformType, string> = {
  billboard: '',
  digital_screen: '',
  wall: '',
  mall: '',
  transport: '',
};

export const mockPlatforms: Platform[] = [
  {
    id: '1',
    name: 'Билборд на Тверской',
    type: 'billboard',
    address: 'ул. Тверская, 15',
    city: 'Москва',
    pricePerDay: 15000,
    rating: 4.8,
    reviewsCount: 24,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
    ],
    description: 'Премиальный билборд в центре Москвы с высоким трафиком. Отличная видимость с главной улицы города.',
    specs: {
      size: '6x3 м',
      format: 'Статичный баннер',
      illumination: true,
      traffic: '~50,000 авто/день',
    },
    available: true,
    bookedDates: ['2025-01-15', '2025-01-16', '2025-01-17'],
    ownerId: 'owner1',
  },
  {
    id: '2',
    name: 'LED-экран Арбат',
    type: 'digital_screen',
    address: 'Арбат, 24',
    city: 'Москва',
    pricePerDay: 25000,
    rating: 4.9,
    reviewsCount: 18,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&h=600&fit=crop',
    ],
    description: 'Современный LED-экран высокого разрешения на пешеходной улице Арбат. Идеально для видеорекламы.',
    specs: {
      size: '4x2.5 м',
      format: 'Видео, анимация',
      illumination: true,
      traffic: '~100,000 пешеходов/день',
    },
    available: true,
    bookedDates: [],
    ownerId: 'owner2',
  },
  {
    id: '3',
    name: 'Брандмауэр Невский',
    type: 'wall',
    address: 'Невский пр., 78',
    city: 'Санкт-Петербург',
    pricePerDay: 35000,
    rating: 4.7,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop',
    ],
    description: 'Масштабный брандмауэр на главной улице Санкт-Петербурга. Впечатляющий охват аудитории.',
    specs: {
      size: '15x10 м',
      format: 'Баннерная ткань',
      illumination: true,
      traffic: '~80,000 авто/день',
    },
    available: true,
    bookedDates: ['2025-01-20', '2025-01-21'],
    ownerId: 'owner1',
  },
  {
    id: '4',
    name: 'Экран ТЦ Галерея',
    type: 'mall',
    address: 'Лиговский пр., 30А',
    city: 'Санкт-Петербург',
    pricePerDay: 12000,
    rating: 4.5,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&h=600&fit=crop',
    ],
    description: 'Рекламный экран в фудкорте крупнейшего ТЦ города. Целевая аудитория — активные покупатели.',
    specs: {
      size: '2x1.5 м',
      format: 'Видео, статика',
      illumination: true,
      traffic: '~40,000 посетителей/день',
    },
    available: true,
    bookedDates: [],
    ownerId: 'owner2',
  },
  {
    id: '5',
    name: 'Реклама на автобусах',
    type: 'transport',
    address: 'Маршруты по центру',
    city: 'Казань',
    pricePerDay: 8000,
    rating: 4.3,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
    ],
    description: 'Размещение рекламы на бортах городских автобусов. 10 единиц транспорта.',
    specs: {
      size: '3x1 м (борт)',
      format: 'Оклейка',
      illumination: false,
      traffic: '~200,000 контактов/день',
    },
    available: true,
    bookedDates: [],
    ownerId: 'owner3',
  },
  {
    id: '6',
    name: 'Суперсайт МКАД',
    type: 'billboard',
    address: 'МКАД, 47 км',
    city: 'Москва',
    pricePerDay: 45000,
    rating: 4.6,
    reviewsCount: 8,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Гигантский суперсайт на МКАД. Максимальный охват автомобильной аудитории столицы.',
    specs: {
      size: '15x5 м',
      format: 'Статичный баннер',
      illumination: true,
      traffic: '~150,000 авто/день',
    },
    available: false,
    bookedDates: ['2025-01-10', '2025-01-11', '2025-01-12', '2025-01-13', '2025-01-14'],
    ownerId: 'owner1',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    platformId: '1',
    userId: 'u1',
    userName: 'Алексей К.',
    rating: 5,
    text: 'Отличная площадка! Конверсия превзошла ожидания. Рекомендую всем.',
    date: '2025-01-05',
  },
  {
    id: 'r2',
    platformId: '1',
    userId: 'u2',
    userName: 'Мария С.',
    rating: 4,
    text: 'Хорошее расположение, но цена немного завышена.',
    date: '2024-12-20',
  },
  {
    id: 'r3',
    platformId: '2',
    userId: 'u3',
    userName: 'Дмитрий П.',
    rating: 5,
    text: 'LED-экран высочайшего качества. Наша видеореклама смотрелась потрясающе!',
    date: '2025-01-02',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    platformId: '1',
    userId: 'user1',
    startDate: '2025-01-15',
    endDate: '2025-01-17',
    totalPrice: 45000,
    status: 'confirmed',
    materialStatus: 'approved',
    materialUrl: '/materials/banner1.jpg',
    createdAt: '2025-01-10',
  },
  {
    id: 'b2',
    platformId: '2',
    userId: 'user1',
    startDate: '2025-02-01',
    endDate: '2025-02-07',
    totalPrice: 175000,
    status: 'pending',
    materialStatus: 'pending',
    createdAt: '2025-01-08',
  },
];

export const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];
