# Quick Start Guide for ERPNext with Jalali Calendar

This setup adds Persian (Jalali/Shamsi) calendar support to ERPNext v15 using Docker.

## 🚀 Quick Start

```bash
# Make the setup script executable
chmod +x setup-jalali.sh

# Run the setup
./setup-jalali.sh
```

## 📝 Manual Setup

### Step 1: Build Custom Image

```bash
docker compose -f docker-compose-jalali.yml build
```

### Step 2: Start Services

```bash
# Start database and Redis
docker compose -f docker-compose-jalali.yml up -d db redis-cache redis-queue

# Run configurator
docker compose -f docker-compose-jalali.yml up configurator

# Create site with Jalali app
docker compose -f docker-compose-jalali.yml up create-site

# Start all services
docker compose -f docker-compose-jalali.yml up -d
```

### Step 3: Enable Jalali Calendar

1. Open browser: `http://localhost:8080`
2. Login with:
   - Username: `Administrator`
   - Password: `admin`
3. Go to **Settings > System Settings**
4. Enable **Shamsi (Jalali) Calendar**
5. Choose **Date Storage Format**
6. Save and refresh

## 🔧 Useful Commands

```bash
# View logs
docker compose -f docker-compose-jalali.yml logs -f

# Stop services
docker compose -f docker-compose-jalali.yml down

# Restart services
docker compose -f docker-compose-jalali.yml restart

# Clear cache
docker compose -f docker-compose-jalali.yml exec backend bench --site frontend clear-cache

# Rebuild assets
docker compose -f docker-compose-jalali.yml exec backend bench build
```

## 📚 Files Created

- `custom_erpnext.Dockerfile` - Custom Docker image with Jalali app
- `docker-compose-jalali.yml` - Docker Compose configuration
- `setup-jalali.sh` - Automated setup script
- `JALALI_SETUP_FA.md` - Detailed Persian documentation

## 📖 Read More

See `JALALI_SETUP_FA.md` for detailed documentation in Persian.

**App Repository**: https://github.com/nidyasoft/jalali_shamsi_datepicker
