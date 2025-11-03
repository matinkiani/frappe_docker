# استفاده از image پایه ERPNext
FROM frappe/erpnext:v15.85.1

# تنظیم working directory
WORKDIR /home/frappe/frappe-bench

# تغییر به کاربر root
USER root

# کپی کردن اپلیکیشن Jalali از local به apps directory
COPY --chown=frappe:frappe ./jalali_shamsi_datepicker /home/frappe/frappe-bench/apps/jalali_shamsi_datepicker

# تغییر به کاربر frappe
USER frappe

# اضافه کردن اپلیکیشن به لیست apps
RUN echo "jalali_shamsi_datepicker" >> /home/frappe/frappe-bench/sites/apps.txt

# Build کردن assets برای اپلیکیشن جدید
RUN bench build --app jalali_shamsi_datepicker

WORKDIR /home/frappe/frappe-bench
