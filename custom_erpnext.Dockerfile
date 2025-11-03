# استفاده از image پایه ERPNext
FROM frappe/erpnext:v15.85.1

# تنظیم working directory
WORKDIR /home/frappe/frappe-bench

# تغییر به کاربر root
USER root

# کپی کردن اپلیکیشن Jalali از local به apps directory
COPY --chown=frappe:frappe ./jalali_shamsi_datepicker /home/frappe/frappe-bench/apps/jalali_shamsi_datepicker

# تغییر به کاربر frappe برای نصب
USER frappe

# نصب dependencies اپلیکیشن در virtual environment
RUN cd /home/frappe/frappe-bench && \
    . env/bin/activate && \
    pip install -e apps/jalali_shamsi_datepicker

# فقط rebuild کردن assets برای frappe و erpnext با اپلیکیشن جدید
RUN cd /home/frappe/frappe-bench && \
    bench build

WORKDIR /home/frappe/frappe-bench
#docker compose -f docker-compose-jalali.yml build --no-cache
