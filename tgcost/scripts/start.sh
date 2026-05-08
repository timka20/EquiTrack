#!/bin/bash

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🚀 TGCost Full Stack Startup                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL не запущен. Запускаем...${NC}"
    sudo systemctl start mysql
    sleep 2
fi

if mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL подключен${NC}"
else
    echo -e "${RED}❌ Не удалось подключиться к MySQL${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Запуск бэкенда (порт 64738)...${NC}"
cd server
npm run build > /dev/null 2>&1
npm start &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Бэкенд запущен (PID: $BACKEND_PID)${NC}"
echo -e "${BLUE}   API: http://localhost:64738/api${NC}"
echo -e "${BLUE}   Health: http://localhost:64738/health${NC}"

echo ""
echo -e "${YELLOW}⏳ Ожидание готовности бэкенда...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:64738/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Бэкенд готов!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

echo ""
echo -e "${YELLOW}🎨 Запуск фронтенда...${NC}"
npm run build > /dev/null 2>&1
npx vite preview --host :: --port 8382 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Фронтенд запущен (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}   URL: http://localhost:8382${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 Все сервисы запущены!                  ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend: http://localhost:8382                       ║${NC}"
echo -e "${GREEN}║  Backend:  http://localhost:64738                      ║${NC}"
echo -e "${GREEN}║  API:      http://localhost:64738/api                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Нажмите Ctrl+C для остановки всех сервисов${NC}"
echo ""

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Остановка сервисов...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Все сервисы остановлены${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
