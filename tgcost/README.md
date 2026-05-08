# 🚀 TGCost

**TGCost** — это fullstack-платформа для поиска, сравнения и бронирования рекламных площадок (Telegram-каналов и других платформ). Проект представляет собой PWA-приложение с админ-панелью, системой избранного, уведомлений и бронирования.

---

## 📸 Стек технологий

### Фронтенд
| Технология | Назначение |
|------------|------------|
| **React 18** + **TypeScript** | UI-фреймворк |
| **Vite** | Сборщик и dev-сервер |
| **Tailwind CSS** | Утилитарный CSS |
| **shadcn/ui** + **Radix UI** | Компоненты интерфейса |
| **React Router DOM** | Маршрутизация |
| **TanStack Query** | Серверное состояние |
| **Zustand** | Клиентское состояние |
| **Framer Motion** | Анимации |
| **Recharts** | Графики и диаграммы |
| **React Hook Form** + **Zod** | Формы и валидация |

### Бэкенд
| Технология | Назначение |
|------------|------------|
| **Express.js** + **TypeScript** | REST API |
| **MySQL2** | Драйвер БД |
| **jsonwebtoken** | JWT-аутентификация |
| **bcryptjs** | Хеширование паролей |
| **multer** | Загрузка файлов |
| **express-validator** | Валидация запросов |

### Инфраструктура
- **Nginx** — reverse proxy и статика
- **PM2** — процесс-менеджер Node.js
- **MySQL** — реляционная база данных

---

## 🗂️ Структура проекта

```
tgcost/
│
├── 📁 src/                          # Фронтенд (React + Vite)
│   ├── components/                  # Компоненты
│   │   ├── layout/                  # Лейауты (Header, BottomNav, MainLayout)
│   │   ├── platform/                # Карточки и фильтры платформ
│   │   ├── notifications/           # Уведомления
│   │   └── ui/                      # shadcn/ui компоненты (50+)
│   ├── pages/                       # Страницы приложения
│   │   ├── Index.tsx                # Главная
│   │   ├── SearchPage.tsx           # Поиск
│   │   ├── PlatformDetail.tsx       # Детальная страница площадки
│   │   ├── Booking.tsx              # Бронирование
│   │   ├── Login.tsx / Register.tsx # Авторизация
│   │   ├── Profile.tsx              # Профиль
│   │   ├── AdminPanel.tsx           # Админ-панель
│   │   ├── Favorites.tsx            # Избранное
│   │   ├── Notifications.tsx        # Уведомления
│   │   └── ...                      # Остальные страницы
│   ├── store/                       # Zustand-сторы
│   ├── services/                    # API-клиент
│   ├── hooks/                       # Кастомные хуки
│   ├── data/                        # Статические данные
│   ├── App.tsx                      # Корневой компонент
│   └── main.tsx                     # Точка входа
│
├── 📁 server/                       # Бэкенд (Express + TS)
│   ├── src/
│   │   ├── config/                  # Конфиг БД и JWT
│   │   ├── controllers/             # Контроллеры
│   │   │   ├── authController.ts
│   │   │   ├── platformController.ts
│   │   │   ├── bookingController.ts
│   │   │   ├── adminController.ts
│   │   │   └── favoriteController.ts
│   │   ├── routes/                  # Роуты API
│   │   ├── models/                  # SQL-модели и запросы
│   │   ├── middleware/              # Auth middleware
│   │   ├── services/                # Бизнес-логика
│   │   ├── utils/                   # Инициализация БД и сиды
│   │   └── index.ts                 # Точка входа сервера
│   ├── uploads/                     # Загруженные файлы
│   │   ├── avatars/
│   │   └── materials/
│   ├── .env                         # ENV сервера
│   └── package.json
│
├── 📁 scripts/                      # Bash-скрипты деплоя
│   ├── start.sh                     # Локальный запуск (frontend + backend)
│   ├── deploy.sh                    # Production деплой
│   └── setup-nginx.sh               # Настройка Nginx
│
├── 📁 nginx/                        # Конфиги Nginx
│   ├── tgcost.conf
│   └── api.tgcost.conf
│
├── 📁 public/                       # Статика и иконки PWA
│   ├── icons/                       # Иконки приложения
│   ├── service-worker.js
│   └── content.js
│
├── .env                             # ENV фронтенда
├── vite.config.ts                   # Конфиг Vite
├── tailwind.config.ts               # Конфиг Tailwind
├── package.json                     # Зависимости фронта
└── manifest.json                    # PWA манифест
```

---

## ⚡ Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/timka20/tgCost.git
cd tgCost
```

### 2. Установка зависимостей

```bash
# Фронтенд
npm install

# Бэкенд
cd server
npm install
cd ..
```

### 3. Настройка MySQL

Убедитесь, что MySQL запущен, и создайте базу данных:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tgcost CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Инициализация базы данных

```bash
cd server
npm run init-db       # Создание таблиц
npm run seed-platforms # Заполнение тестовыми площадками
npm run seed-notifications # Заполнение уведомлениями
cd ..
```

### 5. Запуск разработки

**Вариант А — автоматический (рекомендуется):**

```bash
npm run start
# Запускает MySQL → Backend (64738) → Frontend (8382)
# Frontend: http://localhost:8382
# Backend:  http://localhost:64738
```

**Вариант Б — вручную (два терминала):**

```bash
# Терминал 1 — Backend
cd server
npm run dev

# Терминал 2 — Frontend
npm run dev
# Frontend: http://localhost:5173
```

---

## 🔐 Тестовые аккаунты

После инициализации БД доступны следующие пользователи:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@tgcost.ru` | `admin123` |
| Пользователь | `test@mail.ru` | `test123` |
| Владелец площадки | `owner@mail.ru` | `test123` |
| Модератор | `moderator@tgcost.ru` | `test123` |

---

## 🏗️ Production деплой

Для развёртывания на сервере с Ubuntu/Debian + Nginx + PM2:

```bash
npm run deploy
```

Скрипт выполнит:
1. Установку зависимостей
2. Инициализацию БД
3. Сборку фронтенда и бэкенда
4. Копирование статики в `/var/www/tgcost`
5. Настройку Nginx
6. Запуск бэкенда через PM2

---

## 🔌 API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/platforms` | Список площадок |
| GET | `/api/platforms/:id` | Детали площадки |
| POST | `/api/bookings` | Создать бронирование |
| GET | `/api/bookings` | Мои бронирования |
| POST | `/api/favorites` | Добавить в избранное |
| GET | `/api/favorites` | Список избранного |
| GET | `/api/admin/users` | Управление пользователями (admin) |
| GET | `/api/admin/platforms` | Управление площадками (admin) |
| GET | `/api/notifications` | Уведомления пользователя |
| GET | `/health` | Healthcheck |

---

## 🛠️ Полезные команды

```bash
# Сборка фронтенда
npm run build

# Сборка бэкенда
cd server && npm run build

# Запуск бэкенда в продакшене
cd server && npm start

# Инициализация БД
cd server && npm run init-db

# Настройка Nginx (требуется sudo)
sudo bash scripts/setup-nginx.sh

# Линтинг
npm run lint

# Превью продакшен-сборки
npm run preview
```

---

## 📱 PWA

Приложение поддерживает установку на мобильные устройства как Progressive Web App:
- Service Worker для кэширования
- Web App Manifest
- Адаптивная вёрстка под мобильные устройства
- Bottom Navigation для мобильного UX

---

## 📄 Лицензия

Проект создан для личного/коммерческого использования.

---

**Автор:** [timka20](https://github.com/timka20)
