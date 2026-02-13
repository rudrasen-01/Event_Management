# 🚀 Render Deployment Guide - Complete Fix for CORS Issues

## ⚠️ Problem Summary

**The Issue:**
Your production frontend was making API calls to `http://localhost:5000` instead of your Render backend, causing CORS errors:
```
Access to fetch at 'http://localhost:5000/api/users/login' from origin 'https://my-frontend-snt3.onrender.com' has been blocked by CORS policy
```

**Root Cause:**
- Hardcoded `localhost` URLs in frontend code
- `.env` file with `/api` suffix (incorrect format)
- Vite env variables not properly injected during build

---

## ✅ Solution Applied

### 1. **Centralized API Configuration**
Created `frontend/src/config/api.js` with helper functions:

```javascript
// Centralized API URL management
const normalizeBaseUrl = (input) => {
  if (!input) return 'http://localhost:5000';
  return input.trim().replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

// Helper to build API URLs
export const getApiUrl = (endpoint = '') => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${API_BASE_URL}/api${cleanEndpoint ? `/${cleanEndpoint}` : ''}`;
};
```

### 2. **Refactored All API Calls**
Replaced **every** hardcoded URL across:
- ✅ `AuthContext.jsx` - login, register, Google OAuth
- ✅ `VendorRegistrationMultiStep.jsx` - registration, payment
- ✅ `UserDashboardNew.jsx` - inquiries, profile
- ✅ `VendorDashboard.jsx` - vendor panel
- ✅ `InquiryModal.jsx` - inquiry submission
- ✅ `VendorLoginModal.jsx` - vendor auth
- ✅ `Contact.jsx` - contact form
- ✅ `api.js` - axios client
- ✅ `autocompleteService.js` - search suggestions
- ✅ `dynamicDataService.js` - filters
- ✅ `taxonomyService.js` - categories
- ✅ `VendorPaymentDashboard.jsx` - subscriptions
- ✅ `VendorProfileEditor.jsx` - profile editing

### 3. **Fixed Environment Variable Format**
Updated `frontend/.env`:

**❌ WRONG (old):**
```env
VITE_API_URL=http://localhost:5000/api  # Don't include /api suffix!
```

**✅ CORRECT (new):**
```env
VITE_API_URL=http://localhost:5000  # Base URL only, no /api
```

**Why?** The `getApiUrl()` helper automatically adds `/api` + endpoint.

---

## 🔧 Render Configuration

### **Backend Service (Node/Express)**

1. **Service Settings:**
   - **Type:** Web Service
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node 18+ (recommended: 20.x)

2. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000  # Render auto-assigns
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_secret
   # Add other backend env vars as needed
   ```

3. **Auto-Deploy:** ✅ Enabled (deploys on git push)

---

### **Frontend Service (Vite Static Site)**

1. **Service Settings:**
   - **Type:** Static Site
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

2. **Environment Variables (CRITICAL):**
   ```env
   # Replace with YOUR actual backend URL
   VITE_API_URL=https://your-backend-service-name.onrender.com
   
   # Google OAuth (same client ID as backend)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   
   # WhatsApp (optional)
   VITE_WHATSAPP_NUMBER=919220836393
   VITE_WHATSAPP_MESSAGE=Hello, I am interested in your services
   ```

   **⚠️ CRITICAL NOTES:**
   - **NO `/api` suffix** in `VITE_API_URL`
   - Use the **Render-provided backend URL** (check your backend service dashboard)
   - Format: `https://your-service-name.onrender.com` (NOT localhost!)

3. **Auto-Deploy:** ✅ Enabled

---

## 🔍 How Vite Environment Variables Work

### **Build-Time Injection**
Vite injects `import.meta.env.*` variables **at build time**, not runtime:

1. During `npm run build`, Vite:
   - Reads `.env` and Render's environment variables
   - Replaces `import.meta.env.VITE_API_URL` with the actual value
   - Bundles this into static JavaScript files

2. **Result:** Your `dist/` folder contains hardcoded URLs from build time

### **Why Your Old Build Still Had `localhost`**

**Scenario:**
1. You set `VITE_API_URL=https://backend.onrender.com` in Render dashboard
2. But your **cached build** was created when `.env` still had `localhost:5000/api`
3. Render served the **old build artifacts** with old URLs

**Fix:**
- After changing Render env vars, **manually redeploy** (click "Manual Deploy")
- Or push a new commit to trigger fresh build
- Clear Render's build cache if issues persist

---

## 📝 Deployment Checklist

### **Pre-Deployment**

- [x] All `localhost` references removed from frontend code
- [x] Centralized API helper (`config/api.js`) implemented
- [x] `.env` file uses correct format (no `/api` suffix)
- [x] Backend CORS configured (`app.use(cors())` in `server.js`)
- [x] Code committed to Git repository

### **Backend Deployment**

- [ ] Create Render account
- [ ] Create Web Service for backend
- [ ] Connect GitHub/GitLab repository
- [ ] Set root directory to `backend`
- [ ] Configure all environment variables
- [ ] Deploy and verify health check (`GET /health`)
- [ ] Copy the deployed backend URL (e.g., `https://event-backend-xyz.onrender.com`)

### **Frontend Deployment**

- [ ] Create Static Site service on Render
- [ ] Connect same repository
- [ ] Set root directory to `frontend`
- [ ] **CRITICAL:** Set `VITE_API_URL` to backend URL (without `/api`)
- [ ] Set other `VITE_*` environment variables
- [ ] Deploy and wait for build to complete
- [ ] Visit deployed frontend URL

### **Post-Deployment Verification**

- [ ] Open frontend URL in browser
- [ ] Open DevTools → Network tab
- [ ] Try to login/register
- [ ] **Verify:** API calls go to `https://your-backend.onrender.com/api/...` (NOT localhost)
- [ ] **Verify:** No CORS errors in console
- [ ] Test all critical flows:
  - [ ] User login/register
  - [ ] Vendor login/register
  - [ ] Send inquiry
  - [ ] Search vendors
  - [ ] Google OAuth

---

## 🐛 Troubleshooting

### **Issue 1: Still Getting `localhost` Errors**

**Symptoms:**
```
POST http://localhost:5000/api/users/login net::ERR_FAILED
```

**Solutions:**
1. **Check Render Environment Variables:**
   - Go to Render dashboard → Frontend service → Environment
   - Verify `VITE_API_URL` is set correctly (no `/api` suffix)
   - Format: `https://backend-name.onrender.com`

2. **Force Rebuild:**
   - Clear build cache: Dashboard → Settings → "Clear build cache"
   - Manual deploy: Dashboard → "Manual Deploy" → "Deploy latest commit"

3. **Verify Build Logs:**
   - Check "Building..." logs on Render
   - Search for `VITE_API_URL` - should show your production URL

### **Issue 2: CORS Errors with Correct URLs**

**Symptoms:**
```
Access to fetch at 'https://backend.onrender.com/api/users/login' 
from origin 'https://frontend.onrender.com' has been blocked by CORS
```

**Solutions:**
1. **Check Backend CORS Configuration:**
   ```javascript
   // backend/server.js
   const cors = require('cors');
   
   // Option 1: Allow all origins (development/testing)
   app.use(cors());
   
   // Option 2: Restrict to frontend (production recommended)
   app.use(cors({
     origin: ['https://your-frontend.onrender.com'],
     credentials: true
   }));
   ```

2. **Restart Backend Service** after CORS changes

### **Issue 3: 404 Errors on API Routes**

**Symptoms:**
```
GET https://backend.onrender.com/api/users/login 404 Not Found
```

**Solutions:**
1. Verify backend is running: `GET https://backend.onrender.com/health`
2. Check backend logs on Render dashboard
3. Verify route definitions in `backend/routes/`
4. Check `server.js` mounts routes correctly:
   ```javascript
   app.use('/api/users', userRoutes);
   ```

### **Issue 4: Environment Variables Not Loading**

**Symptoms:**
Console shows `undefined` for API URL

**Solutions:**
1. **Vite requires `VITE_` prefix:** 
   - ❌ `API_URL` won't work
   - ✅ `VITE_API_URL` works

2. **Set in Render Dashboard, not `.env` file:**
   - Render overrides `.env` with dashboard settings
   - Always set production values in Render UI

3. **Rebuild after changing env vars**

---

## 🎯 Quick Reference: URL Formats

| Environment | VITE_API_URL Value | Example API Call Result |
|-------------|-------------------|------------------------|
| **Local Dev** | `http://localhost:5000` | `http://localhost:5000/api/users/login` |
| **Render Prod** | `https://backend-abc.onrender.com` | `https://backend-abc.onrender.com/api/users/login` |

**Remember:** 
- ✅ Base URL only (no `/api`)
- ✅ No trailing slash
- ✅ HTTPS in production

---

## 📚 Understanding the Fix

### **Before (Broken):**
```javascript
// ❌ Hardcoded localhost - fails in production
const response = await fetch('http://localhost:5000/api/users/login', {...});
```

### **After (Fixed):**
```javascript
// ✅ Uses environment-aware helper
import { getApiUrl } from '../config/api';

const response = await fetch(getApiUrl('users/login'), {...});
// Development: http://localhost:5000/api/users/login
// Production:  https://backend.onrender.com/api/users/login
```

### **Why This Works:**

1. **Single Source of Truth:** All API calls use `getApiUrl()`
2. **Environment Awareness:** Automatically uses correct URL based on `VITE_API_URL`
3. **Build-Time Injection:** Vite replaces `import.meta.env.VITE_API_URL` during build
4. **No Runtime Dependency:** Bundled code has hardcoded production URLs (fast!)

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git:**
   ```bash
   # .gitignore should include:
   .env
   .env.local
   .env.production
   ```

2. **Use Render's Environment Variables:**
   - More secure than committed files
   - Easy to rotate secrets
   - Different values per environment

3. **Restrict CORS in Production:**
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend.onrender.com'],
     credentials: true
   }));
   ```

4. **Use HTTPS in Production:**
   - Render provides free SSL
   - Always use `https://` URLs for production

---

## 🚨 Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|----------|
| `VITE_API_URL=http://localhost:5000/api` | `VITE_API_URL=http://localhost:5000` |
| `fetch('http://localhost:5000/api/...')` | `fetch(getApiUrl('...'))` |
| `API_URL` (env var) | `VITE_API_URL` (Vite prefix required) |
| `https://backend.onrender.com/` (trailing slash) | `https://backend.onrender.com` |
| Forgot to redeploy after env var change | Always redeploy after env changes |

---

## 📞 Support

If issues persist after following this guide:

1. **Check Logs:**
   - Frontend: Browser DevTools Console + Network tab
   - Backend: Render Dashboard → Service → Logs

2. **Verify Environment:**
   - Run `console.log(import.meta.env.VITE_API_URL)` in browser console
   - Should show production URL, not localhost

3. **Test Backend Directly:**
   - Visit `https://your-backend.onrender.com/health`
   - Should return JSON with status OK

---

## ✅ Final Verification

Run this checklist to confirm everything works:

```bash
# 1. Check built frontend code
cd frontend/dist/assets
grep -r "localhost:5000" .  # Should return NO results

# 2. Test API from browser console (visit your frontend URL)
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log);  # Should see { status: 'OK' }

# 3. Test login flow
# - Fill login form
# - Submit
# - Check Network tab: POST should go to https://backend.onrender.com/api/users/login
# - Should NOT see localhost anywhere
```

---

## 🎉 Success!

You've successfully:
- ✅ Eliminated all hardcoded `localhost` URLs
- ✅ Centralized API configuration
- ✅ Set up proper environment variables
- ✅ Fixed CORS issues
- ✅ Deployed to Render with correct configuration

Your MERN app is now production-ready! 🚀
