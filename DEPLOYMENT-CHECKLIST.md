# Environment Configuration Checklist

## Frontend Environment Variables (.env)
Create a `.env` file in the `frontend/` directory with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Production:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
```

## Backend Environment Variables (.env)
Ensure the `backend/.env` file includes:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=generate-a-strong-random-string
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=https://yourdomain.com
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm install` in both frontend and backend
- [ ] Test build: `cd frontend && npm run build`
- [ ] Verify `.env` files are NOT committed to git
- [ ] Ensure `.gitignore` includes `.env`
- [ ] Run taxonomy population: `node backend/dev-tools/populate-taxonomy.js`
- [ ] Create at least one admin user: `node backend/scripts/seed-admin.js`

### Database
- [ ] MongoDB connection string is correct
- [ ] Database is accessible from deployment server
- [ ] Indexes are created (run `node backend/dev-tools/setup-search-indexes.js`)
- [ ] Test connection: `node backend/dev-tools/check-db.js`

### Security
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS for production domain only
- [ ] Review admin access controls

### API Configuration
- [ ] Update VITE_API_URL in frontend to production API URL
- [ ] Ensure backend API is accessible
- [ ] Test API health: `curl https://api.yourdomain.com/health`

### Google OAuth Setup
- [ ] Add production URLs to Google Cloud Console:
  - Authorized JavaScript origins
  - Authorized redirect URIs
- [ ] Use production client ID/secret
- [ ] Test Google login flow

### Final Verification
- [ ] All pages load without errors
- [ ] User registration/login works
- [ ] Vendor registration works
- [ ] Search returns results
- [ ] Inquiry creation works
- [ ] Admin panel is accessible
- [ ] No console errors in browser
- [ ] API responds with correct data

## Common Issues

**Issue:** "Failed to fetch cities"
**Solution:** Ensure vendors exist in database, run populate script if needed

**Issue:** "Google OAuth not working"
**Solution:** Check authorized origins match exactly (including http/https)

**Issue:** "MongoDB connection failed"
**Solution:** Verify MONGODB_URI, check IP whitelist in MongoDB Atlas

**Issue:** "API returns 404"
**Solution:** Verify VITE_API_URL includes /api suffix, check backend is running

**Issue:** "Search returns no results"
**Solution:** Populate taxonomy data, ensure vendors are approved
