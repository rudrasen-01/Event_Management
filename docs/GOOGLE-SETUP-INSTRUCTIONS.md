# 🚀 Google OAuth Setup - Quick Guide

## ⚠️ Current Error
**Error 401: invalid_client** - This means you need to create and configure Google OAuth credentials.

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Google Cloud Console
Open this link: **https://console.cloud.google.com/apis/credentials**

### Step 2: Create a New Project (if needed)
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: **Event Management Platform**
4. Click "Create"

### Step 3: Enable Google+ API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 4: Create OAuth 2.0 Client ID
1. Go back to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**

### Step 5: Configure Consent Screen (First Time Only)
If prompted:
1. Choose **"External"** user type
2. Click "Create"
3. Fill in:
   - **App name**: Event Management Platform
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click "Save and Continue"
5. Click "Save and Continue" (skip scopes)
6. Click "Save and Continue" (skip test users)
7. Click "Back to Dashboard"

### Step 6: Create OAuth Client ID
1. Click **"Create Credentials"** → **"OAuth client ID"** again
2. Choose **"Web application"**
3. Name it: **Event Management Web Client**
4. Under **Authorized JavaScript origins**, click "Add URI":
   ```
   http://localhost:5173
   http://localhost:3000
   ```
5. Under **Authorized redirect URIs**, click "Add URI":
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. Click **"Create"**

### Step 7: Copy Your Client ID
1. A popup will show your Client ID - **COPY IT**
2. It looks like: `1234567890-abcdefghijk.apps.googleusercontent.com`
3. Click "OK"

### Step 8: Update Environment Files

#### Backend (.env)
Open: `backend/.env`

Replace this line:
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

With your actual Client ID:
```env
GOOGLE_CLIENT_ID=1234567890-abcdefghijk.apps.googleusercontent.com
```

#### Frontend (.env)
Open: `frontend/.env`

Replace this line:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

With the **SAME** Client ID:
```env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijk.apps.googleusercontent.com
```

⚠️ **IMPORTANT**: Use the SAME Client ID in both files!

### Step 9: Restart Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Step 10: Test Google Login
1. Open: http://localhost:5173 (or your frontend URL)
2. Click "Login" button
3. You should see "Sign in with Google" button
4. Click it - Google popup should open
5. Select your account
6. Should login successfully! ✅

---

## 🐛 Troubleshooting

### Still getting "invalid_client" error?
- Double-check Client ID matches in both `.env` files
- Make sure you copied the entire Client ID
- Restart both backend and frontend servers

### "Origin not authorized" error?
- Add your exact URL to "Authorized JavaScript origins" in Google Console
- Wait 5 minutes for Google to update settings

### Google popup doesn't open?
- Check browser console for errors
- Ensure both `.env` files have the Client ID
- Try clearing browser cache

---

## ✅ Success Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized origins (http://localhost:5173, http://localhost:3000)
- [ ] Copied Client ID
- [ ] Updated `backend/.env` with Client ID
- [ ] Updated `frontend/.env` with Client ID (SAME as backend)
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Tested Google login button

---

## 📞 Need Help?

If you're still facing issues:
1. Check Google Cloud Console credentials page
2. Verify the Client ID is for "Web application" type
3. Ensure authorized origins match your dev server URL
4. Check browser console for detailed error messages

---

**Once completed, delete this file and your Google Sign-In will work!** 🎉
