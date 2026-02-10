# Production Deployment Guide

## System Architecture

### Database Layer
- **MongoDB Atlas** (Production) or **Local MongoDB** (Development)
- Collections: Users, Vendors, Inquiries, Taxonomy, Services
- Indexes: Search performance critical

### Backend API (Node.js/Express)
- REST API on port 5000 (configurable)
- JWT-based authentication
- Role-based access control (user, vendor, admin)
- Dynamic data endpoints (cities, services, areas)

### Frontend (React + Vite)
- Static site generation
- Environment-based API configuration
- Google OAuth integration
- Responsive design (Tailwind CSS)

---

## Quick Start Deployment

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/event-management
JWT_SECRET=change-to-strong-random-string-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Initialize Database

```bash
cd backend

# Populate taxonomy (categories, services)
node dev-tools/populate-taxonomy.js

# Create admin user
node scripts/seed-admin.js

# Optional: Setup search indexes
node dev-tools/setup-search-indexes.js

# Verify database
node dev-tools/check-db.js
```

### 4. Build and Deploy

**Frontend Build:**
```bash
cd frontend
npm run build
# Output: dist/ folder
```

**Backend Start:**
```bash
cd backend
npm start
# Or for development:
npm run dev
```

---

## Hosting Options

### Option 1: Vercel + MongoDB Atlas
**Frontend (Vercel):**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`

**Backend (Vercel Serverless):**
1. Add `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
2. Deploy: `vercel --prod`

### Option 2: AWS (EC2 + S3)
**Backend (EC2):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo-url>
cd backend
npm install
npm install -g pm2

# Start with PM2
pm2 start server.js --name event-api
pm2 startup
pm2 save
```

**Frontend (S3 + CloudFront):**
```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option 3: Heroku + MongoDB Atlas
```bash
# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id

# Deploy
git push heroku main
```

---

## Database Seeding (Required)

### Taxonomy Data
**MUST run before first use:**
```bash
node backend/dev-tools/populate-taxonomy.js
```

This creates:
- 16 categories (Venues, Event Planning, Decoration, etc.)
- 100+ subcategories
- 300+ services with keywords

### Admin User
```bash
node backend/scripts/seed-admin.js

# Default credentials:
# Email: admin@eventvendor.com
# Password: admin123
# ⚠️ CHANGE IMMEDIATELY IN PRODUCTION
```

---

## Security Configuration

### 1. JWT Secret
Generate strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. CORS Policy
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### 3. Google OAuth
Configure in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- Authorized JavaScript origins: 
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`
- Authorized redirect URIs:
  - `https://yourdomain.com`
  - `https://www.yourdomain.com/callback`

---

## Monitoring & Maintenance

### Health Check
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"OK","timestamp":"..."}
```

### Database Backup
```bash
# MongoDB Atlas: Automatic backups enabled
# Manual backup:
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)
```

### Logs
```bash
# PM2 logs
pm2 logs event-api

# View last 100 lines
pm2 logs event-api --lines 100

# Error logs only
pm2 logs event-api --err
```

### Performance Monitoring
- MongoDB Atlas: Built-in performance monitoring
- New Relic / Datadog integration
- PM2 Monitoring:
  ```bash
  pm2 monit
  ```

---

## Scaling Considerations

### Horizontal Scaling
```bash
# PM2 Cluster mode
pm2 start server.js -i max --name event-api

# Or specify instances
pm2 start server.js -i 4 --name event-api
```

### Database Indexing
Critical indexes for performance:
```javascript
// Already in models, but verify:
VendorNew.index({ serviceType: 1, city: 1, rating: -1 });
VendorNew.index({ 'location.coordinates': '2dsphere' });
Taxonomy.index({ type: 1, taxonomyId: 1 });
```

### Caching Strategy
Consider Redis for:
- Dynamic API responses ( `/api/dynamic/*`)
- Search results
- Taxonomy data (rarely changes)

### CDN Integration
- Serve static assets through CDN
- Cache API responses at edge (CloudFlare)
- Optimize images (compress, WebP format)

---

## Troubleshooting

### Issue: API returns empty arrays
**Cause:** No data in database
**Fix:**
```bash
node backend/dev-tools/populate-taxonomy.js
node backend/dev-tools/check-vendor-data.js
```

### Issue: CORS errors
**Cause:** Incorrect origin configuration
**Fix:** Update `CORS_ORIGIN` in backend `.env`

### Issue: MongoDB connection timeout
**Cause:** IP not whitelisted in MongoDB Atlas
**Fix:** Add `0.0.0.0/0` (all IPs) or server IP in Atlas Network Access

### Issue: Google OAuth fails
**Cause:** Client ID mismatch or unauthorized origin
**Fix:** Verify `VITE_GOOGLE_CLIENT_ID` matches Google Console configuration

---

## Environment Variables Reference

### Backend Required
| Variable | Example | Description |
|----------|---------|-------------|
| NODE_ENV | `production` | Environment mode |
| PORT | `5000` | Server port |
| MONGODB_URI | `mongodb+srv://...` | Database connection |
| JWT_SECRET | `random-32-char-string` | Token signing key |
| GOOGLE_CLIENT_ID | `xxx.apps.googleusercontent.com` | OAuth client ID |
| GOOGLE_CLIENT_SECRET | `xxx` | OAuth secret |

### Frontend Required
| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_URL | `https://api.domain.com/api` | Backend API URL |
| VITE_GOOGLE_CLIENT_ID | `xxx.apps.googleusercontent.com` | OAuth client ID |

---

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Database is populated with taxonomy
- [ ] Admin user created and tested
- [ ] Google OAuth tested (login/register)
- [ ] Search returns results
- [ ] Vendor registration works
- [ ] Inquiry submission works
- [ ] Admin panel accessible
- [ ] SSL certificate installed (HTTPS)
- [ ] Custom domain configured
- [ ] Email notifications working (if enabled)
- [ ] Backup strategy in place
- [ ] Monitoring tools configured

---

**For Support:** Check [REFACTORING-SUMMARY.md](./REFACTORING-SUMMARY.md) and [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
