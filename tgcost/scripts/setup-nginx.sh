#!/bin/bash

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🌐 TGCost Nginx Setup                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Пожалуйста, запустите скрипт с sudo${NC}"
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx не установлен. Устанавливаем...${NC}"
    apt-get update
    apt-get install -y nginx
fi

mkdir -p /var/www/tgcost/dist

echo -e "${YELLOW}⚙️  Настройка Nginx...${NC}"
cp nginx/tgcost.conf /etc/nginx/sites-available/tgcost

if [ ! -L /etc/nginx/sites-enabled/tgcost ]; then
    ln -s /etc/nginx/sites-available/tgcost /etc/nginx/sites-enabled/tgcost
fi

if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

echo -e "${YELLOW}🧪 Проверка конфигурации Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Конфигурация Nginx валидна${NC}"
else
    echo -e "${RED}❌ Ошибка в конфигурации Nginx${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️  Сборка фронтенда...${NC}"
cd /root/Sites/tgcost
npm install
npm run build

echo -e "${YELLOW}📂 Копирование файлов...${NC}"
cp -r dist/* /var/www/tgcost/dist/
chown -R www-data:www-data /var/www/tgcost

echo -e "${YELLOW}🔄 Перезапуск Nginx...${NC}"
systemctl restart nginx

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Nginx настроен!                        ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Сайт доступен по адресам:                             ║${NC}"
echo -e "${GREEN}║  - http://tgcost.timka20.ru                            ║${NC}"
echo -e "${GREEN}║  - API: http://tgcost.timka20.ru/api                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  Для HTTPS настройте SSL сертификаты:${NC}"
echo -e "${BLUE}   certbot --nginx -d tgcost.timka20.ru${NC}"
echo ""
