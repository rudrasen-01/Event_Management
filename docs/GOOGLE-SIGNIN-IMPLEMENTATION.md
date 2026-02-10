# Google Sign-In Implementation Guide

## 🎯 Overview

This implementation adds **Google OAuth authentication** to the Event Management Platform for Users, Vendors, and Admin without impacting existing email/password authentication flows.

### ✅ Key Features

- **Email-based authentication**: Only registered users can login with Google
- **No automatic account creation**: Google login requires pre-existing account
- **Role-based access**: Backend handles role detection (user/vendor/admin)
- **Backward compatibility**: Existing login flows work unchanged
- **Security**: Google ID token verification on backend
- **Email verification**: Automatic email verification for Google-authenticated users

---

## 📋 Implementation Summary

### Backend Changes

#### 1. **New Dependencies**
```bash
npm install google-auth-library
```

#### 2. **New Files Created**
- `backend/controllers/googleAuthController.js` - Google authentication logic
- `backend/.env.example` - Environment configuration template

#### 3. **Modified Files**
- `backend/routes/userRoutes.js` - Added `/google-login` endpoint
- `backend/routes/vendorRoutesNew.js` - Added `/google-login` endpoint

#### 4. **New Endpoints**

##### User/Admin Google Login
```
POST /api/users/google-login
Body: { token: "google-id-token" }
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user|admin",
      "isEmailVerified": true
    },
    "token": "jwt-token"
  },
  "message": "Google login successful"
}
```

**Response (User Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "No account found with this email. Please register first."
  }
}
```

##### Vendor Google Login
```
POST /api/vendors/google-login
Body: { token: "google-id-token" }
```

**Response (Success)**:
```json
{
  "success": true,
  "token": "jwt-token",
  "data": {
    "vendorId": "...",
    "_id": "...",
    "name": "...",
    "businessName": "...",
    "email": "...",
    "role": "vendor"
  },
  "message": "Google login successful"
}
```

**Response (Vendor Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_NOT_FOUND",
    "message": "No vendor account found with this email. Please register first."
  }
}
```

---

### Frontend Changes

#### 1. **New Dependencies**
```bash
npm install @react-oauth/google
```

#### 2. **Modified Files**
- `frontend/src/main.jsx` - Added GoogleOAuthProvider wrapper
- `frontend/src/contexts/AuthContext.jsx` - Added `googleLogin()` function
- `frontend/src/components/UserLoginModal.jsx` - Added Google Sign-In button
- `frontend/src/components/VendorLoginModal.jsx` - Added Google Sign-In button
- `frontend/.env.example` - Environment configuration template

#### 3. **New Context Function**

```javascript
// AuthContext.jsx
googleLogin(idToken, userType = 'user')
```

**Parameters**:
- `idToken` (string): Google ID token from frontend
- `userType` (string): `'user'` or `'vendor'`

**Usage**:
```javascript
const { googleLogin } = useAuth();
await googleLogin(googleIdToken, 'user'); // For users/admin
await googleLogin(googleIdToken, 'vendor'); // For vendors
```

---

## 🔧 Setup Instructions

### Prerequisites
1. A Google Cloud Console project
2. OAuth 2.0 Client ID credentials

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure consent screen:
   - Application name: "Event Management Platform"
   - Support email: Your email
   - Authorized domains: `localhost` (for development)
6. Application type: **Web application**
7. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if using CRA)
   - Add production domain when deploying
8. Add **Authorized redirect URIs**:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - Add production domain when deploying
9. Click **Create** and copy the **Client ID**

### Step 2: Configure Backend

1. Create `.env` file in `backend/` directory:
```bash
cp .env.example .env
```

2. Add your Google Client ID:
```env
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Google OAuth - CRITICAL: Use the SAME Client ID as frontend
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Step 3: Configure Frontend

1. Create `.env` file in `frontend/` directory:
```bash
cp .env.example .env
```

2. Add your Google Client ID (MUST be the same as backend):
```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000

# Google OAuth - CRITICAL: Use the SAME Client ID as backend
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Step 4: Restart Servers

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

---

## 🔒 Security Features

### Backend Security

1. **Google ID Token Verification**
   ```javascript
   const { OAuth2Client } = require('google-auth-library');
   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
   
   // Verifies token signature and audience
   const ticket = await client.verifyIdToken({
     idToken: token,
     audience: process.env.GOOGLE_CLIENT_ID,
   });
   ```

2. **Email Verification Check**
   - Google token payload includes `email_verified` field
   - Backend only accepts tokens with verified emails

3. **Account Existence Validation**
   - Checks if user/vendor exists in database before login
   - Prevents unauthorized access from unregistered emails

4. **Role-Based Access Control**
   - User model has `role` field (user/admin)
   - Vendor accounts have separate collection
   - JWT token includes role information

5. **Account Status Checks**
   - Users: `isActive` check
   - Vendors: `isActive` check (admin approval required)

### Frontend Security

1. **Authorization Code Flow**
   - Uses `flow: 'auth-code'` for enhanced security
   - Exchanges auth code for ID token on frontend
   - Backend verifies ID token independently

2. **Token Storage**
   - JWT tokens stored in localStorage
   - Same storage mechanism as email/password login
   - Consistent session management

---

## 🧪 Testing Guide

### Test Scenario 1: User Google Login (Success)

1. **Prerequisite**: User exists in database with email `test@example.com`
2. Click "Login" in header → Opens UserLoginModal
3. Click "Sign in with Google" button
4. Select Google account with `test@example.com`
5. **Expected**: Redirects to homepage, user logged in
6. **Verify**: Check localStorage for `authToken` and `authUser`

### Test Scenario 2: User Google Login (Email Not Registered)

1. **Prerequisite**: Use Google account NOT in database
2. Click "Login" → "Sign in with Google"
3. Select unregistered Google account
4. **Expected**: Error message: "No account found with this email. Please register first."
5. **Verify**: User NOT logged in, registration link visible

### Test Scenario 3: Vendor Google Login (Success)

1. **Prerequisite**: Vendor exists with `vendor@example.com` and `isActive: true`
2. Navigate to vendor login page
3. Click "Sign in with Google"
4. Select `vendor@example.com` account
5. **Expected**: Redirects to vendor dashboard
6. **Verify**: Vendor data in localStorage

### Test Scenario 4: Vendor Google Login (Pending Approval)

1. **Prerequisite**: Vendor exists but `isActive: false`
2. Click "Sign in with Google"
3. **Expected**: Error: "Your account is pending admin approval..."
4. **Verify**: Vendor NOT logged in

### Test Scenario 5: Admin Google Login

1. **Prerequisite**: User exists with `role: 'admin'`
2. Use UserLoginModal (same as regular user)
3. Click "Sign in with Google"
4. Select admin account
5. **Expected**: Redirects to `/admin` panel
6. **Verify**: Admin privileges active

### Test Scenario 6: Backward Compatibility

1. Test existing email/password login for users
2. Test existing email/password login for vendors
3. Test existing email/password login for admin
4. **Expected**: All work exactly as before
5. **Verify**: No breaking changes to existing flows

---

## 🐛 Troubleshooting

### Issue: "Invalid Google token" Error

**Cause**: Backend cannot verify ID token

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` matches in both backend and frontend
2. Check Google Cloud Console credentials are for "Web application"
3. Ensure authorized origins include your dev server URL

### Issue: "No account found with this email"

**Cause**: User/Vendor not registered in database

**Solution**:
1. User must first register via email/password
2. Then they can login via Google with same email
3. This is by design - no automatic account creation

### Issue: Google Sign-In button not appearing

**Cause**: GoogleOAuthProvider not configured

**Solution**:
1. Check `frontend/.env` has `VITE_GOOGLE_CLIENT_ID`
2. Verify `main.jsx` wraps app with `<GoogleOAuthProvider>`
3. Check browser console for errors

### Issue: "CORS error" when calling Google OAuth

**Cause**: Unauthorized origin

**Solution**:
1. Add `http://localhost:5173` to Google Cloud Console
2. Under "Authorized JavaScript origins"
3. Save and wait 5 minutes for Google to propagate changes

### Issue: Email not verified after Google login

**Cause**: Google account email not verified

**Solution**:
1. User must verify email with Google first
2. Backend checks `email_verified` field in Google token
3. Unverified emails are rejected

---

## 📊 Database Changes

### User Model

**No schema changes required**. Existing fields used:

```javascript
{
  email: String,        // Matched with Google email
  isEmailVerified: Boolean,  // Set to true after Google login
  profileImage: String, // Updated with Google profile picture (if empty)
  lastLogin: Date       // Updated on each login
}
```

### Vendor Model

**No schema changes required**. Existing fields used:

```javascript
{
  contact: {
    email: String,           // Matched with Google email
    emailVerified: Boolean   // Set to true after Google login
  },
  images: {
    logo: String  // Updated with Google profile picture (if empty)
  },
  isActive: Boolean  // Must be true for login
}
```

---

## 🔄 Authentication Flow Diagrams

### User Google Login Flow

```
┌─────────────┐
│   User      │
│Clicks Google│
│ Sign-In Btn │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Google OAuth    │
│ Popup Opens     │
│ User Selects    │
│ Google Account  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Google Returns  │
│ Auth Code       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Frontend        │
│ Exchanges Code  │
│ for ID Token    │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /api/users/google-login│
│ { token: "id_token" }       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Backend Verifies Token      │
│ with Google                 │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Check User Exists           │
│ in Database by Email        │
└──────┬──────────────────────┘
       │
       ├─── User Found
       │    ├─ Check isActive
       │    ├─ Update email verified
       │    ├─ Generate JWT token
       │    └─ Return user + token
       │
       └─── User NOT Found
            └─ Return 401 error
```

### Vendor Google Login Flow

```
┌─────────────┐
│   Vendor    │
│Clicks Google│
│ Sign-In Btn │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /api/vendors/google    │
│ (Same OAuth flow as user)   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Check Vendor Exists         │
│ by contact.email            │
└──────┬──────────────────────┘
       │
       ├─── Vendor Found
       │    ├─ Check isActive = true
       │    │  (Admin approval required)
       │    ├─ Update email verified
       │    ├─ Generate JWT token
       │    └─ Return vendor + token
       │
       ├─── Vendor Inactive
       │    └─ Return 403: Pending approval
       │
       └─── Vendor NOT Found
            └─ Return 401: Register first
```

---

## 📝 Code Examples

### Backend: Verify Google Token

```javascript
// backend/controllers/googleAuthController.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  if (!payload.email_verified) {
    throw new Error('Email not verified by Google');
  }
  
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  };
}
```

### Frontend: Call Google Login

```javascript
// In UserLoginModal or VendorLoginModal
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const { googleLogin } = useAuth();

const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    // Exchange code for ID token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: tokenResponse.code,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: window.location.origin,
        grant_type: 'authorization_code',
      }),
    });
    
    const data = await response.json();
    
    // Send ID token to backend
    await googleLogin(data.id_token, 'user'); // or 'vendor'
  },
  flow: 'auth-code',
});
```

---

## ✨ Benefits

1. **Enhanced UX**: One-click login for users with Google accounts
2. **Improved Security**: Leverages Google's authentication infrastructure
3. **Email Verification**: Automatic email verification via Google
4. **No Breaking Changes**: Existing auth flows unaffected
5. **Future-Proof**: Easy to extend for additional OAuth providers (Facebook, GitHub, etc.)

---

## 🚀 Production Deployment

### Additional Steps for Production

1. **Update Google Cloud Console**:
   - Add production domain to authorized origins
   - Add production domain to redirect URIs

2. **Environment Variables**:
   ```bash
   # Production backend .env
   GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
   NODE_ENV=production
   ```

3. **HTTPS Required**:
   - Google OAuth requires HTTPS in production
   - Ensure SSL certificate is configured

4. **Error Monitoring**:
   - Add logging for Google auth failures
   - Monitor for token verification errors

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review Google OAuth [official documentation](https://developers.google.com/identity/protocols/oauth2)
- Check browser console for detailed error messages

---

## 🎉 Implementation Complete!

All files modified, Google OAuth integrated successfully. No breaking changes to existing authentication flows.

**Total Changes**:
- ✅ Backend: 3 files created/modified
- ✅ Frontend: 5 files created/modified
- ✅ Dependencies: 2 packages installed
- ✅ Documentation: Complete setup guide
- ✅ Security: Google token verification implemented
- ✅ Testing: Comprehensive test scenarios provided
