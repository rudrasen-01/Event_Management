# Hostinger Deployment Guide

## Quick Deployment Steps

### 1. Prepare Your Files
Your production-ready frontend is built and located in: `frontend/dist/`

### 2. Upload to Hostinger

1. **Login to Hostinger Control Panel**
   - Go to your Hostinger control panel
   - Navigate to File Manager or use FTP

2. **Upload Files**
   - Navigate to `public_html` directory (or your domain's root directory)
   - Upload ALL contents from `frontend/dist/` folder:
     - `index.html`
     - `assets/` folder
     - `.htaccess` file

3. **Important**: Upload the CONTENTS of the dist folder, not the dist folder itself
   - ✅ Correct: `public_html/index.html`, `public_html/assets/`, etc.
   - ❌ Wrong: `public_html/dist/index.html`

### 3. Configure Environment Variables

You need to set these environment variables in your .env file or Hostinger's environment settings:

```
VITE_API_URL=https://your-backend-api.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_WHATSAPP_NUMBER=919220836393
VITE_WHATSAPP_MESSAGE=Hello, I am interested in your services for an event.
```

**Note**: If you change environment variables, you must rebuild:
```bash
cd frontend
npm run build
```
Then re-upload the new dist/ contents.

### 4. Verify Deployment

1. Visit your domain (e.g., https://yourdomain.com)
2. Check that all pages load correctly
3. Test the routing (navigate to different pages)
4. Verify API calls are working

### 5. Troubleshooting

**If pages show 404 errors:**
- Ensure `.htaccess` file is uploaded
- Check that mod_rewrite is enabled in Hostinger

**If API calls fail:**
- Verify VITE_API_URL is correctly set
- Check CORS settings on your backend
- Ensure backend API is accessible

**If styling is broken:**
- Clear browser cache
- Check that `assets/` folder uploaded correctly

### 6. Backend Deployment (Separate)

Your backend needs to be deployed separately (e.g., Render, Railway, Heroku, or Hostinger's Node.js hosting).
Make sure to update `VITE_API_URL` to point to your backend URL.

## Files Structure After Deployment

```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

## Production Checklist

- ✅ Frontend built successfully
- ✅ .htaccess file included
- ✅ All files uploaded to public_html
- ✅ Environment variables configured
- ✅ Backend API URL updated
- ✅ Site tested and working

## Notes

- The build is optimized and minified for production
- All unnecessary files have been removed
- Source maps are disabled for better security
- GZIP compression and caching are configured via .htaccess
