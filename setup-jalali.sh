#!/bin/bash

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}راه‌اندازی ERPNext با تقویم شمسی${NC}"
echo -e "${GREEN}================================${NC}\n"

# بررسی وجود docker و docker compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}خطا: Docker نصب نیست!${NC}"
    exit 1
fi

echo -e "${YELLOW}مرحله 1: Build کردن Image سفارشی...${NC}"
docker compose -f docker-compose-jalali.yml build

if [ $? -ne 0 ]; then
    echo -e "${RED}خطا در build کردن image!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Build موفقیت‌آمیز بود!${NC}\n"

echo -e "${YELLOW}مرحله 2: راه‌اندازی دیتابیس و Redis...${NC}"
docker compose -f docker-compose-jalali.yml up -d db redis-cache redis-queue

echo -e "\n${YELLOW}در حال انتظار برای آماده شدن دیتابیس...${NC}"
sleep 15

echo -e "\n${YELLOW}مرحله 3: اجرای Configurator...${NC}"
docker compose -f docker-compose-jalali.yml up configurator

if [ $? -ne 0 ]; then
    echo -e "${RED}خطا در configurator!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Configurator موفقیت‌آمیز بود!${NC}\n"

echo -e "${YELLOW}مرحله 4: ایجاد سایت با اپلیکیشن جلالی...${NC}"
docker compose -f docker-compose-jalali.yml up create-site

if [ $? -ne 0 ]; then
    echo -e "${RED}خطا در ایجاد سایت!${NC}"
    echo -e "${YELLOW}احتمالاً سایت قبلاً ایجاد شده است.${NC}"
fi

echo -e "\n${YELLOW}مرحله 5: راه‌اندازی تمام سرویس‌ها...${NC}"
docker compose -f docker-compose-jalali.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}خطا در راه‌اندازی سرویس‌ها!${NC}"
    exit 1
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ راه‌اندازی با موفقیت انجام شد!${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${YELLOW}برای دسترسی به ERPNext:${NC}"
echo -e "  آدرس: ${GREEN}http://localhost:8080${NC}"
echo -e "  نام کاربری: ${GREEN}Administrator${NC}"
echo -e "  رمز عبور: ${GREEN}admin${NC}\n"

echo -e "${YELLOW}مراحل فعال‌سازی تقویم شمسی:${NC}"
echo -e "  1. وارد سیستم شوید"
echo -e "  2. به Settings > System Settings بروید"
echo -e "  3. گزینه 'Enable Shamsi (Jalali) Calendar' را فعال کنید"
echo -e "  4. روی Save کلیک کنید\n"

echo -e "${YELLOW}دستورات مفید:${NC}"
echo -e "  مشاهده لاگ‌ها: ${GREEN}docker compose -f docker-compose-jalali.yml logs -f${NC}"
echo -e "  توقف سرویس‌ها: ${GREEN}docker compose -f docker-compose-jalali.yml down${NC}"
echo -e "  راه‌اندازی مجدد: ${GREEN}docker compose -f docker-compose-jalali.yml restart${NC}\n"
