# 🔥 Quick Fix: Render Frontend Still Calling localhost

## ⚡ Immediate Action Required

### 1. Update Render Environment Variables

**Go to:** Render Dashboard → Your Frontend Service → Environment

**Set this variable:**
```env
VITE_API_URL=https://your-backend-name.onrender.com
```

**⚠️ CRITICAL:**
- Replace `your-backend-name` with YOUR actual backend service name
- **NO `/api` suffix** - just the base URL
- Use `https://` (not `http://`)
- No trailing slash

### 2. Force Rebuild

**Option A: Manual Deploy**
1. Render Dashboard → Frontend Service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

**Option B: Push Empty Commit**
```bash
cd frontend
git commit --allow-empty -m "Trigger rebuild with new env vars"
git push origin main
```

### 3. Verify the Fix

Open your live frontend → Browser DevTools Console:

```javascript
// Should print your backend URL, NOT localhost
console.log(import.meta.env.VITE_API_URL);
// Expected: https://your-backend.onrender.com
```

Try logging in and check Network tab:
- ✅ POST request should go to `https://your-backend.onrender.com/api/users/login`
- ❌ Should NOT see `http://localhost:5000` anywhere

---

## 🎯 What Was Fixed in Your Code

### Before (Broken):
```javascript
// ❌ Hardcoded localhost in 13+ files
fetch('http://localhost:5000/api/users/login', {...})
```

### After (Fixed):
```javascript
// ✅ Now uses centralized config
import { getApiUrl } from '../config/api';
fetch(getApiUrl('users/login'), {...})
```

**Result:** All API calls now adapt to the environment automatically.

---

## 🔍 Why Your Old Build Still Had localhost

**The Problem:**
- Vite injects environment variables **at build time** (not runtime)
- Your old build was created when `.env` still had `localhost:5000/api`
- Even after changing Render env vars, the cached build still used old URLs

**The Solution:**
- All hardcoded URLs removed from code ✅
- Centralized API config implemented ✅
- `.env` format corrected (no `/api` suffix) ✅
- **Rebuild required** to inject new env vars into bundle

---

## ✅ Expected Behavior Now

| Scenario | API Calls Go To |
|----------|----------------|
| **Local Dev** (`npm run dev`) | `http://localhost:5000/api/...` |
| **Render Production** | `https://your-backend.onrender.com/api/...` |

---

## 🚨 If Still Not Working

### Check 1: Verify Environment Variable is Set
Render Dashboard → Frontend → Environment → Should see:
```
VITE_API_URL = https://your-backend.onrender.com
```

### Check 2: Check Build Logs
Render Dashboard → Frontend → Logs (during build):
```
Search for: "VITE_API_URL"
Should show: Your production URL (not localhost)
```

### Check 3: Backend is Running
Visit: `https://your-backend.onrender.com/health`
Should return: `{"status":"OK"}`

### Check 4: CORS Configured
Backend `server.js` should have:
```javascript
app.use(cors()); // Or specific origin
```

---

## 📝 Files Modified

All API calls now use centralized config:

- [x] `frontend/src/config/api.js` - Centralized API helper
- [x] `frontend/src/contexts/AuthContext.jsx` 
- [x] `frontend/src/pages/VendorRegistrationMultiStep.jsx`
- [x] `frontend/src/pages/UserDashboardNew.jsx`
- [x] `frontend/src/pages/VendorDashboard.jsx`
- [x] `frontend/src/pages/Contact.jsx`
- [x] `frontend/src/components/InquiryModal.jsx`
- [x] `frontend/src/components/VendorLoginModal.jsx`
- [x] `frontend/src/components/vendor/VendorPaymentDashboard.jsx`
- [x] `frontend/src/components/vendor/VendorProfileEditor.jsx`
- [x] `frontend/src/services/api.js`
- [x] `frontend/src/services/autocompleteService.js`
- [x] `frontend/src/services/dynamicDataService.js`
- [x] `frontend/src/services/taxonomyService.js`
- [x] `frontend/.env` - Format corrected

---

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ No CORS errors in browser console
2. ✅ Network tab shows requests to your Render backend (not localhost)
3. ✅ Login/register works without errors
4. ✅ `console.log(import.meta.env.VITE_API_URL)` shows production URL

---

**Need detailed steps?** See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
