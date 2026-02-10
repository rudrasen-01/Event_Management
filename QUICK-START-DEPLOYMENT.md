# 🚀 QUICK START - Production Deployment

**Time Required:** 15-20 minutes  
**Prerequisite:** MongoDB database accessible

---

## STEP 1: Environment Setup (5 minutes)

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/event-management
JWT_SECRET=<generate-random-32-char-string>
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
PORT=5000
NODE_ENV=production
```

### Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` and set:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
```

---

## STEP 2: Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## STEP 3: Initialize Database (3 minutes)

⚠️ **CRITICAL - MUST RUN BEFORE FIRST USE**

```bash
cd backend

# Populate taxonomy data (categories, services)
node dev-tools/populate-taxonomy.js

# Create admin user
node scripts/seed-admin.js

# Setup search indexes (recommended)
node dev-tools/setup-search-indexes.js

# Verify database
node dev-tools/check-db.js
```

**Default Admin Credentials:**
- Email: `admin@eventvendor.com`
- Password: `admin123`
- ⚠️ **Change immediately after first login**

---

## STEP 4: Build Frontend (2 minutes)

```bash
cd frontend
npm run build
```

Output: `dist/` folder ready for deployment

---

## STEP 5: Start Backend (1 minute)

```bash
cd backend

# Production
npm start

# Or development with auto-reload
npm run dev
```

**Verify:**
```bash
curl http://localhost:5000/health
# Expected: {"status":"OK","timestamp":"..."}
```

---

## STEP 6: Deploy Frontend

### Option A: Vercel (Recommended - 5 minutes)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL
# VITE_GOOGLE_CLIENT_ID
```

### Option B: Netlify (5 minutes)
```bash
cd frontend

# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Option C: AWS S3 + CloudFront (10 minutes)
```bash
cd frontend/dist

# Upload to S3
aws s3 sync . s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## STEP 7: Deploy Backend

### Option A: Vercel Serverless (5 minutes)
```bash
cd backend

# Create vercel.json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option B: Heroku (5 minutes)
```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-connection-string
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-client-secret

# Deploy
git push heroku main
```

### Option C: AWS EC2 (10 minutes)
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name event-api

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

---

## STEP 8: Configure Google OAuth (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (if not exists)
3. Add Authorized JavaScript origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
4. Add Authorized redirect URIs:
   - `https://yourdomain.com`
5. Copy Client ID and Client Secret to .env files

---

## STEP 9: Verify Deployment (3 minutes)

### Health Check
```bash
curl https://api.yourdomain.com/health
```

### Test Endpoints
```bash
# Get categories
curl https://api.yourdomain.com/api/taxonomy/categories

# Get cities
curl https://api.yourdomain.com/api/dynamic/cities

# Get services
curl https://api.yourdomain.com/api/taxonomy/services/all
```

### Browser Tests
1. Visit `https://yourdomain.com`
2. Test search functionality
3. Try user registration
4. Test vendor registration
5. Login to admin panel:
   - URL: `https://yourdomain.com/admin`
   - Email: `admin@eventvendor.com`
   - Password: `admin123`

---

## STEP 10: Post-Deployment (5 minutes)

### Security
- [ ] Change admin password
- [ ] Verify HTTPS is working
- [ ] Test CORS (no errors in console)

### Monitoring
- [ ] Setup error tracking (Sentry/Rollbar)
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Enable database backups (MongoDB Atlas auto-backup)

### Performance
- [ ] Test page load times
- [ ] Verify API response times
- [ ] Check database query performance

---

## 🎉 DONE!

Your application is now live and ready for users.

### Next Steps:
1. Share the website URL
2. Monitor error logs
3. Collect user feedback
4. Add more vendors/services as needed

---

## 🆘 Troubleshooting

### Issue: "Failed to fetch cities"
**Fix:** Populate database:
```bash
cd backend
node dev-tools/populate-taxonomy.js
```

### Issue: "CORS errors"
**Fix:** Update `CORS_ORIGIN` in backend .env to match frontend domain

### Issue: "Google OAuth not working"
**Fix:** Verify authorized origins in Google Console match exactly (https vs http)

### Issue: "MongoDB connection failed"
**Fix:** 
1. Check MONGODB_URI in .env
2. Whitelist server IP in MongoDB Atlas

### Issue: "Empty search results"
**Fix:** Add vendors via admin panel or registration

---

## 📚 Full Documentation

For detailed information, see:
- [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md) - Complete guide
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Detailed checklist
- [PRODUCTION-READY-SUMMARY.md](./PRODUCTION-READY-SUMMARY.md) - Full refactoring report

---

**Support:** Check documentation files or review code comments for details.
