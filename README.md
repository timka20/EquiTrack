# 🐴 EquiTrack — Конный портал

Полноценная веб-платформа для управления конным спортом: учёт лошадей, скачки, разведение, медицинские карты, тренировки, сообщения и аналитика. Реализована ролевая система (владелец, тренер, жокей, ветеринар, администратор).

---

## 📦 Стек технологий

### Frontend
| Технология | Назначение |
|------------|------------|
| **React 18** + **TypeScript** | UI и логика |
| **Vite** | Сборка и dev-сервер |
| **Tailwind CSS 4** + **@tailwindcss/vite** | Стилизация |
| **Radix UI** (`@radix-ui/*`) | Базовые примитивы интерфейса (аккордеоны, диалоги, дропдауны и т.д.) |
| **shadcn/ui** (кастомные компоненты в `src/app/components/ui`) | Готовые UI-компоненты |
| **React Router 7** (`react-router`) | Маршрутизация |
| **Recharts** | Графики и аналитика |
| **Lucide React** | Иконки |
| **date-fns** | Работа с датами |
| **React Hook Form** | Формы |
| **Zod** | Валидация (на клиенте и сервере) |
| **Emotion** + **MUI** | Дополнительные UI-блоки |
| **React DnD** | Drag-and-drop |

### Backend
| Технология | Назначение |
|------------|------------|
| **Fastify 4** | HTTP-сервер |
| **TypeScript** + **tsx** | Запуск и сборка |
| **SQLite** (`better-sqlite3`) | Файловая база данных |
| **@fastify/jwt** | Авторизация по JWT |
| **@fastify/cors** | CORS |
| **@fastify/multipart** | Загрузка файлов |
| **@fastify/swagger** + **swagger-ui** | Документация API |
| **bcryptjs** | Хеширование паролей |
| **pino-pretty** | Логирование |

---

## 🗂️ Дерево проекта

```
EquiTrack/
├── .gitignore              # Исключения Git
├── .vscode/                # Настройки VS Code
├── index.html              # Точка входа HTML (Vite)
├── package.json            # Зависимости и скрипты фронтенда
├── postcss.config.mjs      # PostCSS
├── vite.config.ts          # Конфиг Vite (порт 27435, proxy /api → localhost:49375)
├── README.md               # Этот файл
│
├── public/                 # Статические ассеты
│   ├── hero-bg.jpg
│   ├── hero-horse.jpg
│   └── stud-farm.jpg
│
├── src/                    # Исходники фронтенда
│   ├── main.tsx            # Точка входа React
│   └── app/
│       ├── App.tsx         # Корневой компонент
│       ├── routes.tsx      # Маршруты приложения
│       ├── pages/          # Страницы
│       │   ├── Home.tsx
│       │   ├── Races.tsx
│       │   ├── Results.tsx
│       │   ├── Catalog.tsx
│       │   ├── Breeding.tsx
│       │   ├── Dashboard.tsx
│       │   ├── HorseDetail.tsx
│       │   ├── Favorites.tsx
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── components/
│       │   ├── layout/     # Header, Footer
│       │   ├── ui/         # shadcn/ui компоненты (button, card, dialog и т.д.)
│       │   ├── figma/      # ImageWithFallback
│       │   └── ProtectedRoute.tsx
│       └── data/           # Цвета, константы
│
└── server/                 # 🔧 Backend (отдельный Node-модуль)
    ├── package.json        # Зависимости бэкенда
    ├── tsconfig.json       # TS-конфиг сервера
    ├── .env                # Переменные окружения (порт, JWT, БД)
    ├── .env.example        # Пример .env
    ├── src/
    │   ├── server.ts       # 🚀 Главный файл: инициализация Fastify, маршруты, запуск
    │   ├── config/
    │   │   ├── env.ts      # Переменные окружения с дефолтами
    │   │   └── database.ts # Подключение SQLite
    │   ├── middleware/
    │   │   └── auth.ts     # Плагин аутентификации JWT
    │   ├── controllers/    # Обработчики маршрутов
    │   │   ├── authController.ts
    │   │   ├── userController.ts
    │   │   ├── horseController.ts
    │   │   ├── raceController.ts
    │   │   ├── breedingController.ts
    │   │   ├── medicalController.ts
    │   │   ├── trainingController.ts
    │   │   ├── messageController.ts
    │   │   └── analyticsController.ts
    │   ├── services/       # Бизнес-логика и работа с БД
    │   │   ├── authService.ts
    │   │   ├── userService.ts
    │   │   ├── horseService.ts
    │   │   ├── raceService.ts
    │   │   ├── breedingService.ts
    │   │   ├── medicalService.ts
    │   │   ├── trainingService.ts
    │   │   ├── messageService.ts
    │   │   ├── notificationService.ts
    │   │   └── analyticsService.ts
    │   ├── types/
    │   │   ├── index.ts    # Общие типы (UserRole и т.д.)
    │   │   └── fastify.d.ts # Расширение типов Fastify
    │   ├── utils/
    │   │   └── helpers.ts  # Вспомогательные функции
    │   └── scripts/
    │       ├── initDb.ts   # Инициализация таблиц
    │       └── seedDb.ts   # Наполнение тестовыми данными
    ├── database/
    │   └── schema.sql      # Полная SQL-схема БД
    └── scripts/            # Вспомогательные скрипты
        ├── addFoals.ts
        ├── checkBreedingData.ts
        ├── checkFoalsTable.ts
        ├── fixBreedingData.ts
        ├── migrateRaceRegistrations.ts
        ├── setupRaceRegistrations.ts
        ├── updateAllPedigree.ts
        └── updateHorsePedigree.ts
```

---

## ⚙️ Где что находится

| Что искать | Где искать |
|------------|------------|
| **Сервер** | `server/src/server.ts` — запуск Fastify, регистрация плагинов и всех маршрутов |
| **База данных** | `server/database/schema.sql` + `server/src/config/database.ts` (SQLite-файл `base.db` в корне) |
| **API-маршруты** | `server/src/server.ts` (строки 80–170) и `server/src/controllers/` |
| **Фронтенд-страницы** | `src/app/pages/` |
| **UI-компоненты** | `src/app/components/ui/` |
| **Роутинг** | `src/app/routes.tsx` |
| **Переменные окружения** | `server/.env` |

---

## 🚀 Как запускать

### 1. Установка зависимостей

```bash
# Установка фронтенда + бэкенда разом
npm run install:all

# Или по отдельности:
npm install
cd server && npm install
```

### 2. Инициализация базы данных

```bash
# Создаёт таблицы по schema.sql
npm run db:init

# Заполняет тестовыми данными (лошади, пользователи, скачки и т.д.)
npm run db:seed
```

> База данных — файл `base.db` в корне проекта (SQLite).

### 3. Режим разработки (одновременно клиент + сервер)

```bash
npm run dev
```

| Сервис | URL | Описание |
|--------|-----|----------|
| Фронтенд | http://localhost:27435 | React-приложение (Vite dev) |
| Бэкенд | http://localhost:12344 | Fastify API (берёт PORT из `.env`) |
| API-документация | http://localhost:12344/documentation | Swagger UI |

> Если `.env` не задан, fallback-порт сервера = `49375`.

### 4. Запуск отдельно

```bash
# Только сервер
npm run dev:server

# Только клиент
npm run dev:client
```

### 5. Сборка для продакшена

```bash
# Сборка фронтенда в dist/
npm run build

# Предпросмотр собранного фронтенда + сервер
npm run start
```

---

## 🔐 Роли пользователей

| Роль | Ключ | Что доступно |
|------|------|--------------|
| Гость | `guest` | Просмотр каталога, скачек, результатов |
| Частный владелец | `owner_private` | Управление своими лошадьми, заявки на скачки, аналитика |
| Владелец конюшни | `owner_stud` | Разведение, жеребята, продажа |
| Тренер | `trainer` | Тренировки, назначение жокеев, отчёты |
| Жокей | `jockey` | Отчёты после заездов, тактическая информация |
| Ветеринар | `veterinarian` | Медкарты, вакцинации, ограничения |
| Администратор | `admin` | Полный доступ, управление пользователями, модерация заявок |

---

## 📡 Ключевые API-ендпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/register` | Регистрация |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/horses` | Список лошадей |
| GET | `/api/horses/:id` | Карточка лошади |
| GET | `/api/horses/:id/pedigree` | Родословная |
| GET | `/api/races` | Календарь скачек |
| POST | `/api/races/:id/register` | Подать заявку на скачку |
| GET | `/api/breedings` | Список случек |
| GET | `/api/trainings` | Журнал тренировок |
| GET | `/api/analytics/dashboard` | Дашборд-статистика |
| GET | `/api/admin/stats` | Админ-статистика |

Полный список маршрутов см. в `server/src/server.ts` или Swagger UI (`/documentation`).

---

## 🛠️ Дополнительные скрипты

| Скрипт | Команда | Назначение |
|--------|---------|------------|
| Инициализация БД | `npm run db:init` | Создание таблиц |
| Сид БД | `npm run db:seed` | Тестовые данные |
| Расширенный сид | `cd server && npm run db:seed:extended` | Больше тестовых данных |

---

## 📝 Примечания

- **База данных** — файловая SQLite (`base.db`). Для бэкапа просто скопируйте файл.
- **JWT-секрет** и настройки берутся из `server/.env`. Для локального запуска изменения не требуются.
- **Vite-прокси**: все запросы с фронтенда на `/api` автоматически проксируются на сервер.
- В корне лежит файл `gdysd.tsx` — служебный/временный, не используется в основном билде.
