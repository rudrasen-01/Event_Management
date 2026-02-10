# 🚀 Quick Setup Guide - Google Sign-In

## ⚡ Express Setup (5 Minutes)

### 1. Get Google Client ID

1. Visit: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add origin: `http://localhost:5173`
4. Copy the Client ID

### 2. Configure Backend

```bash
cd backend
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
EOF
```

### 3. Configure Frontend

```bash
cd frontend
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
EOF
```

**⚠️ IMPORTANT**: Use the SAME Client ID in both files!

### 4. Restart Servers

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

### 5. Test It!

1. Open http://localhost:5173
2. Click "Login"
3. Click "Sign in with Google" button
4. Select a Google account that's already registered
5. ✅ Should login successfully!

---

## 📋 What Was Changed?

### Backend (3 files)
- ✅ Created: `controllers/googleAuthController.js`
- ✅ Modified: `routes/userRoutes.js` (added google-login endpoint)
- ✅ Modified: `routes/vendorRoutesNew.js` (added google-login endpoint)

### Frontend (5 files)
- ✅ Modified: `main.jsx` (added GoogleOAuthProvider)
- ✅ Modified: `contexts/AuthContext.jsx` (added googleLogin function)
- ✅ Modified: `components/UserLoginModal.jsx` (added Google button)
- ✅ Modified: `components/VendorLoginModal.jsx` (added Google button)
- ✅ Created: `.env.example`

---

## 🔐 Security Notes

✅ **Email must be verified by Google**  
✅ **Account must exist in database first**  
✅ **No automatic account creation**  
✅ **Backend verifies Google ID token**  
✅ **Role-based access control maintained**  
✅ **Existing login flows unchanged**

---

## 🎯 Key Features

### For Users/Admin
- One-click login with Google account
- Automatic email verification
- Same JWT token mechanism as email/password login
- Admin role automatically detected from database

### For Vendors
- One-click login with Google account
- Must be activated by admin first (`isActive: true`)
- Automatic email verification
- Redirects to vendor dashboard

---

## ❓ Common Issues

### "Invalid Google token"
→ Check both `.env` files have the SAME Client ID

### "No account found with this email"
→ User must register via email/password first, then can use Google

### Google button not showing
→ Check `frontend/.env` exists with `VITE_GOOGLE_CLIENT_ID`

### CORS error
→ Add `http://localhost:5173` to Google Cloud Console authorized origins

---

## 📖 Full Documentation

See [GOOGLE-SIGNIN-IMPLEMENTATION.md](./GOOGLE-SIGNIN-IMPLEMENTATION.md) for:
- Complete setup guide
- Security details
- Testing scenarios
- Troubleshooting
- Code examples
- Flow diagrams

---

## ✅ Testing Checklist

- [ ] Backend has `.env` with GOOGLE_CLIENT_ID
- [ ] Frontend has `.env` with VITE_GOOGLE_CLIENT_ID
- [ ] Both use the SAME Client ID
- [ ] Google Cloud Console has authorized origin configured
- [ ] User can login with Google (if registered)
- [ ] Vendor can login with Google (if registered & active)
- [ ] Admin redirects to admin panel after Google login
- [ ] Error shown if email not registered
- [ ] Existing email/password login still works
- [ ] No breaking changes to any existing flows

---

**Ready to use! 🎉**

All changes are backward compatible. Your existing authentication flows work exactly as before.
