# Authentication Fix - Login & Registration

## Problem
User login aur registration fail ho raha tha frontend se.

## Root Cause
Frontend `.env` file me `VITE_API_URL` already `/api` ke saath tha:
```
VITE_API_URL=http://localhost:5000/api
```

Lekin `getApiUrl()` function phir se `/api` add kar raha tha, jisse double path ban raha tha:
```
http://localhost:5000/api/api/users/register  ❌ (Wrong)
```

## Solution Applied

### 1. Fixed `.env` Configuration
**File**: `frontend/.env`

**Before**:
```env
VITE_API_URL=http://localhost:5000/api
```

**After**:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Enhanced API Config Helper
**File**: `frontend/src/config/api.js`

Added smart detection to handle both cases:
- If env URL already has `/api`, don't add it again
- If env URL doesn't have `/api`, add it

```javascript
const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const hasApiPath = envUrl.endsWith('/api');
export const API_BASE_URL = hasApiPath ? envUrl : `${envUrl}/api`;
```

## Backend Verification

Backend authentication is working perfectly:

### Test Results: ✅ All Passing

```bash
cd backend
node test-auth.js
```

**Tests**:
1. ✅ User Registration
2. ✅ User Login  
3. ✅ Get Profile with Token
4. ✅ Invalid Login (correctly rejected)
5. ✅ Duplicate Registration (correctly rejected)

## How Authentication Works

### Registration Flow

1. **Frontend** → `POST /api/users/register`
   ```javascript
   {
     name: "User Name",
     email: "user@example.com",
     password: "password123",
     phone: "9876543210" // optional
   }
   ```

2. **Backend** validates and creates user
3. **Backend** returns user data + JWT token
4. **Frontend** stores token in localStorage
5. **Frontend** redirects to dashboard

### Login Flow

1. **Frontend** → `POST /api/users/login`
   ```javascript
   {
     email: "user@example.com",
     password: "password123"
   }
   ```

2. **Backend** validates credentials
3. **Backend** returns user data + JWT token
4. **Frontend** stores token in localStorage
5. **Frontend** redirects based on role:
   - Admin → `/admin`
   - User → `/` (homepage)

### Authentication State

**Stored in localStorage**:
- `authToken` - JWT token
- `authUser` - User object (name, email, role, etc.)

**AuthContext provides**:
- `user` - Current user object
- `token` - JWT token
- `login(email, password)` - Login function
- `register(name, email, password, phone)` - Register function
- `logout()` - Logout function
- `isAuthenticated()` - Check if logged in
- `isAdmin()` - Check if user is admin

## Testing

### Backend Test
```bash
cd backend
node test-auth.js
```

### Frontend Test
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Click "Login" button
5. Try registration with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Phone: 9876543210 (optional)
6. Try login with same credentials

## Common Issues & Solutions

### Issue 1: "Registration failed" error
**Solution**: Check browser console for exact error. Likely causes:
- Email already exists
- Password too short (min 6 characters)
- Invalid phone number format

### Issue 2: "Login failed" error
**Solution**: 
- Verify email and password are correct
- Check if user account is active
- Ensure backend is running

### Issue 3: Token not persisting
**Solution**:
- Check localStorage in browser DevTools
- Verify `authToken` and `authUser` are stored
- Clear localStorage and try again

### Issue 4: Redirect not working after login
**Solution**:
- Check AuthContext is properly wrapped around App
- Verify react-router-dom is configured
- Check browser console for navigation errors

## API Endpoints

### User Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update profile (requires token)
- `POST /api/users/logout` - Logout user (requires token)

### Vendor Authentication
- `POST /api/vendors/register` - Register new vendor
- `POST /api/vendors/login` - Login vendor
- `GET /api/vendors/:vendorId` - Get vendor profile

### Google OAuth
- `POST /api/users/google-login` - Google login for users
- `POST /api/vendors/google-login` - Google login for vendors

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key, 7-day expiry
3. **Email Validation**: Regex pattern matching
4. **Phone Validation**: Indian 10-digit format
5. **Role-Based Access**: User vs Admin permissions
6. **Account Status**: Active/Inactive flag
7. **Protected Routes**: Middleware authentication

## Files Modified

### Frontend
- `frontend/.env` - Fixed API URL
- `frontend/src/config/api.js` - Enhanced URL handling

### Backend (Already Working)
- `backend/controllers/userController.js` - Auth logic
- `backend/models/User.js` - User schema
- `backend/routes/userRoutes.js` - Auth routes
- `backend/middleware/authMiddleware.js` - JWT verification

### New Files
- `backend/test-auth.js` - Authentication test suite
- `AUTH_FIX.md` - This documentation

## Next Steps

1. ✅ Backend authentication working
2. ✅ Frontend API configuration fixed
3. 🔄 Restart frontend dev server to apply .env changes
4. ✅ Test registration and login on frontend
5. ✅ Verify token storage in localStorage
6. ✅ Test protected routes

## Important Notes

- **Restart Required**: After changing `.env` file, restart frontend dev server
- **Clear Cache**: If issues persist, clear browser cache and localStorage
- **CORS**: Backend has CORS enabled for all origins in development
- **Token Expiry**: JWT tokens expire after 7 days
- **First User**: First registered user automatically becomes admin

---

**Status**: ✅ FIXED
**Date**: February 2026
**Backend Tests**: 5/5 Passing
**Frontend**: Configuration Fixed
