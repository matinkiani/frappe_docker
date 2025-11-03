# راهنمای نصب تقویم شمسی (جلالی) در ERPNext با Docker

## 📝 مقدمه

این راهنما برای اضافه کردن اپلیکیشن تقویم شمسی (جلالی) به ERPNext نسخه 15 با استفاده از Docker نوشته شده است.

اپلیکیشن استفاده شده: [jalali_shamsi_datepicker](https://github.com/nidyasoft/jalali_shamsi_datepicker)

---

## 🚀 مراحل نصب

### روش ۱: نصب در پروژه جدید (توصیه می‌شود)

#### مرحله ۱: Build کردن Image سفارشی

```bash
# Build کردن image با اپلیکیشن جلالی
docker compose -f docker-compose-jalali.yml build
```

این فرآیند ممکن است چند دقیقه طول بکشد.

#### مرحله ۲: اجرای سرویس‌ها

```bash
# اجرای configurator
docker compose -f docker-compose-jalali.yml up -d db redis-cache redis-queue
docker compose -f docker-compose-jalali.yml up configurator

# ایجاد سایت جدید با اپلیکیشن جلالی
docker compose -f docker-compose-jalali.yml up create-site

# اجرای تمام سرویس‌ها
docker compose -f docker-compose-jalali.yml up -d
```

#### مرحله ۳: فعال‌سازی تقویم شمسی

1. به آدرس `http://localhost:8080` بروید
2. با نام کاربری `Administrator` و رمز عبور `admin` وارد شوید
3. به **Settings > System Settings** بروید
4. در بخش **Custom Fields** که توسط اپلیکیشن اضافه شده:
   - گزینه **Enable Shamsi (Jalali) Calendar** را فعال کنید
   - در **Date Storage Format** گزینه دلخواه خود را انتخاب کنید:
     - **Persian (شمسی)**: ذخیره تاریخ به صورت شمسی
     - **Gregorian (میلادی)**: نمایش شمسی ولی ذخیره میلادی
5. روی **Save** کلیک کنید
6. صفحه را Refresh کنید

✅ حالا تمام فیلدهای تاریخ در ERPNext به صورت شمسی نمایش داده می‌شوند!

---

### روش ۲: اضافه کردن به سایت موجود

اگر قبلاً یک سایت ERPNext داشتید و می‌خواهید اپلیکیشن جلالی را به آن اضافه کنید:

#### مرحله ۱: Build کردن Image

```bash
docker compose -f docker-compose-jalali.yml build
```

#### مرحله ۲: Stop کردن سرویس‌های قبلی

```bash
docker compose -f pwd.yml down
```

#### مرحله ۳: نصب اپلیکیشن در سایت موجود

```bash
# اجرای container backend به صورت موقت
docker compose -f docker-compose-jalali.yml run --rm backend bash

# در داخل container:
bench --site frontend install-app jalali_shamsi_datepicker
bench --site frontend migrate
exit
```

#### مرحله ۴: راه‌اندازی مجدد

```bash
docker compose -f docker-compose-jalali.yml up -d
```

#### مرحله ۵: فعال‌سازی

مانند روش ۱، به System Settings رفته و تقویم شمسی را فعال کنید.

---

## 🔧 دستورات مفید

### مشاهده لاگ‌ها

```bash
# لاگ تمام سرویس‌ها
docker compose -f docker-compose-jalali.yml logs -f

# لاگ یک سرویس خاص
docker compose -f docker-compose-jalali.yml logs -f backend
```

### ورود به container

```bash
# ورود به backend container
docker compose -f docker-compose-jalali.yml exec backend bash

# لیست اپلیکیشن‌های نصب شده
bench --site frontend list-apps
```

### Rebuild کردن assets

```bash
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend clear-cache
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend clear-website-cache
docker compose -f docker-compose-jalali.yml exec backend bench build
```

### پشتیبان‌گیری

```bash
# Backup از سایت
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend backup

# Backup فایل‌ها در مسیر زیر ذخیره می‌شوند:
# /home/frappe/frappe-bench/sites/frontend/private/backups/
```

---

## 📱 امکانات اپلیکیشن

- ✅ نمایش تاریخ شمسی در تمام فیلدهای Date و Datetime
- ✅ نمایش معادل میلادی زیر هر فیلد تاریخ
- ✅ پشتیبانی از دو حالت ذخیره‌سازی (شمسی یا میلادی)
- ✅ تبدیل خودکار تاریخ‌ها
- ✅ سازگار با تمام ماژول‌های ERPNext

---

## ⚠️ نکات مهم

1. **نسخه ERPNext**: این اپلیکیشن برای نسخه 15 طراحی شده است
2. **پشتیبان‌گیری**: قبل از نصب حتماً از دیتابیس خود backup بگیرید
3. **حالت ذخیره‌سازی**: 
   - حالت **Persian** برای شرکت‌های ایرانی که فقط با تاریخ شمسی کار می‌کنند
   - حالت **Gregorian** اگر نیاز به integration با سیستم‌های خارجی دارید
4. **Clear Cache**: پس از فعال‌سازی، cache را پاک کنید

---

## 🐛 عیب‌یابی

### مشکل: تقویم شمسی نمایش داده نمی‌شود

```bash
# پاک کردن cache
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend clear-cache
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend clear-website-cache

# Restart کردن سرویس‌ها
docker compose -f docker-compose-jalali.yml restart
```

### مشکل: خطا در migrate

```bash
# اجرای مجدد migrate
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend migrate
```

### مشکل: Assets لود نمی‌شوند

```bash
# Build مجدد assets
docker compose -f docker-compose-jalali.yml exec backend bench build --force
```

---

## 📞 پشتیبانی

- **مستندات ERPNext**: https://docs.erpnext.com
- **ریپوزیتوری اپلیکیشن**: https://github.com/nidyasoft/jalali_shamsi_datepicker
- **Frappe Docker**: https://github.com/frappe/frappe_docker

---

## 📄 لایسنس

این اپلیکیشن تحت لایسنس MIT منتشر شده است.

---

**نکته**: برای به‌روزرسانی ERPNext، فایل `custom_erpnext.Dockerfile` را با نسخه جدید به‌روز کنید و مجدداً build کنید.
