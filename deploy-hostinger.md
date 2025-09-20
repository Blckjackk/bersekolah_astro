# Deploy to Hostinger - Update Guide

## ✅ Changes Made

### Frontend (Astro) Changes:
1. **.env** updated: `PUBLIC_API_BASE_URL=https://sandybrown-capybara-903436.hostingersite.com/api`
2. **url-helper.ts** updated: Production URLs now point to Hostinger
3. **All components** updated: Railway URLs replaced with Hostinger URLs
4. **astro.config.mjs** updated: Proxy target uses environment variable

### Backend (Laravel) Changes:
1. **.env** updated: `APP_URL=https://sandybrown-capybara-903436.hostingersite.com`
2. **Database config** updated: Ready for Hostinger database (needs password)
3. **All Models** updated: URL accessors now use Hostinger URLs
4. **Session domain** updated: `.hostingersite.com`

## 🚀 Next Steps:

### 1. Frontend Deployment:
```bash
# Build project
npm run build

# Deploy to Vercel
vercel --prod
```

### 2. Backend Deployment:
1. Upload Laravel files to Hostinger
2. Update database password in `.env`
3. Run migrations: `php artisan migrate`
4. Set proper file permissions for storage

### 3. Environment Variables in Vercel:
- `PUBLIC_API_BASE_URL=https://sandybrown-capybara-903436.hostingersite.com/api`
- `VITE_API_BASE_URL=https://sandybrown-capybara-903436.hostingersite.com/api`

### 4. Test URLs:
- API: https://sandybrown-capybara-903436.hostingersite.com/api
- Storage: https://sandybrown-capybara-903436.hostingersite.com/storage
- Documents: https://sandybrown-capybara-903436.hostingersite.com/storage/dokumen-wajib/photo/[filename]

## 🔧 Files Changed:
- Frontend: 8 files updated
- Backend: 4 models + .env updated
- All localhost:8000 references now use environment variables
- All Railway URLs replaced with Hostinger URLs
