#!/bin/bash

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🚀 TGCost Production Deployment                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Запуск без sudo. Nginx не будет настроен автоматически.${NC}"
    echo ""
fi

echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
npm install
cd server && npm install && cd ..

echo -e "${YELLOW}🗄️  Инициализация базы данных...${NC}"
cd server
npm run init-db 2>/dev/null || echo -e "${YELLOW}⚠️  База данных уже инициализирована${NC}"
cd ..

echo -e "${YELLOW}🏗️  Сборка фронтенда...${NC}"
npm run build

echo -e "${YELLOW}🏗️  Сборка бэкенда...${NC}"
cd server && npm run build && cd ..

if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}🌐 Настройка Nginx...${NC}"

    mkdir -p /var/www/tgcost/dist
    cp -r dist/* /var/www/tgcost/dist/
    chown -R www-data:www-data /var/www/tgcost

    cp nginx/tgcost.conf /etc/nginx/sites-available/tgcost

    if [ ! -L /etc/nginx/sites-enabled/tgcost ]; then
        ln -s /etc/nginx/sites-available/tgcost /etc/nginx/sites-enabled/tgcost
    fi

    if [ -L /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi

    if nginx -t; then
        systemctl restart nginx
        echo -e "${GREEN}✅ Nginx настроен${NC}"
    else
        echo -e "${RED}❌ Ошибка конфигурации Nginx${NC}"
    fi
fi

echo -e "${YELLOW}⚙️  Настройка PM2...${NC}"
if command -v pm2 &> /dev/null; then
    cd server
    pm2 delete tgcost-server 2>/dev/null || true
    pm2 start dist/index.js --name tgcost-server
    pm2 save
    cd ..
    echo -e "${GREEN}✅ PM2 настроен${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 не установлен. Установите: npm install -g pm2${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Деплой завершён!                       ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Сайт:     https://tgcost.timka20.ru                   ║${NC}"
echo -e "${GREEN}║  API:      https://tgcost.timka20.ru/api               ║${NC}"
echo -e "${GREEN}║  Health:   https://tgcost.timka20.ru/health            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}🔑 Тестовые аккаунты:${NC}"
echo -e "${BLUE}   Admin:    admin@tgcost.ru / admin123${NC}"
echo -e "${BLUE}   User:     test@mail.ru / test123${NC}"
echo -e "${BLUE}   Owner:    owner@mail.ru / test123${NC}"
echo -e "${BLUE}   Moderator: moderator@tgcost.ru / test123${NC}"
echo ""
