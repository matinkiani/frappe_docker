# استفاده از image پایه ERPNext
FROM frappe/erpnext:v15.85.1

# تغییر به کاربر root برای نصب
USER root

# نصب git (اگر نصب نیست)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# تغییر به کاربر frappe
USER frappe

# تنظیم working directory
WORKDIR /home/frappe/frappe-bench

# کلون کردن اپلیکیشن Jalali Shamsi Datepicker
RUN bench get-app --branch main https://github.com/nidyasoft/jalali_shamsi_datepicker.git

# بازگشت به root برای تنظیمات نهایی
USER root

# اجرای دستور build assets
RUN cd /home/frappe/frappe-bench && \
    sudo -u frappe bench build --apps jalali_shamsi_datepicker

# بازگشت به کاربر frappe
USER frappe

WORKDIR /home/frappe/frappe-bench
