# ============================================================================
# GOOGLE OAUTH 2.0 - PROFESSIONAL SETUP GUIDE
# ============================================================================

## OVERVIEW
This guide provides professional instructions for configuring Google OAuth 2.0
authentication for the Event Management Platform.

## PREREQUISITE
- Google Account with access to Google Cloud Console
- Node.js and npm installed
- Backend and Frontend servers running

## ============================================================================
## STEP 1: ACCESS GOOGLE CLOUD CONSOLE
## ============================================================================

1. Navigate to: https://console.cloud.google.com/

2. Sign in with your Google account

## ============================================================================
## STEP 2: CREATE/SELECT PROJECT
## ============================================================================

### Option A: Create New Project
1. Click the project dropdown (top navigation bar)
2. Click "NEW PROJECT"
3. Enter project details:
   - Project name: `Event Management Platform`
   - Organization: Leave as default (if applicable)
4. Click "CREATE"
5. Wait for project creation (15-30 seconds)

### Option B: Use Existing Project
1. Click the project dropdown
2. Select your existing project

## ============================================================================
## STEP 3: ENABLE REQUIRED APIs
## ============================================================================

1. Navigate to: https://console.cloud.google.com/apis/library

2. Search for "Google+ API"

3. Click on "Google+ API" from results

4. Click "ENABLE" button

5. Wait for API to enable (5-10 seconds)

## ============================================================================
## STEP 4: CONFIGURE OAUTH CONSENT SCREEN (First Time Only)
## ============================================================================

1. Navigate to: https://console.cloud.google.com/apis/credentials/consent

2. Select User Type:
   - Choose "External" for development
   - Click "CREATE"

3. Fill OAuth Consent Screen (Page 1):
   ```
   App name: Event Management Platform
   User support email: [Your email]
   App logo: [Optional - Skip for now]
   Application home page: http://localhost:5173
   Application privacy policy: [Optional - Skip for now]
   Application terms of service: [Optional - Skip for now]
   Authorized domains: [Leave empty for localhost]
   Developer contact: [Your email]
   ```
   Click "SAVE AND CONTINUE"

4. Scopes (Page 2):
   - Click "SAVE AND CONTINUE" (no additional scopes needed)

5. Test Users (Page 3):
   - Click "ADD USERS"
   - Add your test email addresses (optional)
   - Click "SAVE AND CONTINUE"

6. Summary (Page 4):
   - Review configuration
   - Click "BACK TO DASHBOARD"

## ============================================================================
## STEP 5: CREATE OAUTH 2.0 CLIENT ID
## ============================================================================

1. Navigate to: https://console.cloud.google.com/apis/credentials

2. Click "CREATE CREDENTIALS" → "OAuth client ID"

3. Select Application Type:
   - Choose "Web application"

4. Configure Client:
   ```
   Name: Event Management Web Client
   
   Authorized JavaScript origins:
   - http://localhost:5173  [Frontend Vite dev server]
   - http://localhost:3000  [Alternative frontend port]
   
   Authorized redirect URIs:
   - http://localhost:5173  [Frontend Vite dev server]
   - http://localhost:3000  [Alternative frontend port]
   ```

5. Click "CREATE"

6. **IMPORTANT**: Copy the Client ID from the popup
   - Format: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`
   - Click "OK" to close popup

## ============================================================================
## STEP 6: UPDATE ENVIRONMENT VARIABLES
## ============================================================================

### Backend Configuration

1. Open file: `backend/.env`

2. Locate the line:
   ```env
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

3. Replace with your actual Client ID:
   ```env
   GOOGLE_CLIENT_ID=1234567890-abcdefg123456.apps.googleusercontent.com
   ```

4. Save the file

### Frontend Configuration

1. Open file: `frontend/.env`

2. Locate the line:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

3. Replace with the **SAME** Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=1234567890-abcdefg123456.apps.googleusercontent.com
   ```

4. Save the file

⚠️ **CRITICAL**: Both files MUST use the identical Client ID

## ============================================================================
## STEP 7: VALIDATE CONFIGURATION
## ============================================================================

Run the validation script from the backend directory:

```bash
cd backend
npm run validate:google
```

**Expected Output (Success):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Google OAuth Configuration Validator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ [Backend] GOOGLE_CLIENT_ID is configured
✓ [Frontend] VITE_GOOGLE_CLIENT_ID is configured
✓ [Sync Check] Backend and Frontend Client IDs match

✓ All configurations are valid!
🚀 You can now use Google Sign-In
```

**If validation fails**, follow the error messages to fix issues.

## ============================================================================
## STEP 8: RESTART SERVERS
## ============================================================================

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## ============================================================================
## STEP 9: TEST GOOGLE SIGN-IN
## ============================================================================

1. Open browser: http://localhost:5173

2. Click "Login" button in header

3. Verify "Sign in with Google" button appears

4. Click "Sign in with Google"

5. Google OAuth popup should open

6. Select your Google account

7. Grant permissions (if prompted)

8. Verify successful login and redirect

## ============================================================================
## PRODUCTION DEPLOYMENT CHECKLIST
## ============================================================================

Before deploying to production:

### 1. Update Google Cloud Console

Add production domains to OAuth Client:
```
Authorized JavaScript origins:
- https://yourdomain.com
- https://www.yourdomain.com

Authorized redirect URIs:
- https://yourdomain.com
- https://www.yourdomain.com
```

### 2. Update Environment Variables

Backend (Production):
```env
NODE_ENV=production
GOOGLE_CLIENT_ID=[your-client-id].apps.googleusercontent.com
```

Frontend (Production):
```env
VITE_GOOGLE_CLIENT_ID=[your-client-id].apps.googleusercontent.com
```

### 3. OAuth Consent Screen

- Change user type from "Testing" to "In Production"
- Add Privacy Policy URL
- Add Terms of Service URL
- Submit for Google verification (if needed)

### 4. Security Best Practices

- Never commit `.env` files to version control
- Use different Client IDs for dev/staging/production
- Regularly rotate Client Secrets
- Monitor OAuth usage in Google Cloud Console
- Enable audit logging

## ============================================================================
## TROUBLESHOOTING
## ============================================================================

### Error: "invalid_client" (401)
**Cause**: Client ID not configured or incorrect
**Solution**: 
- Verify Client ID in both `.env` files
- Ensure Client ID format is correct
- Check for trailing spaces or quotes

### Error: "redirect_uri_mismatch"
**Cause**: URL not in authorized list
**Solution**:
- Add exact URL to Google Cloud Console
- Wait 5 minutes for changes to propagate
- Clear browser cache

### Error: "access_denied"
**Cause**: User cancelled or permissions denied
**Solution**:
- Normal user behavior, no action needed
- Ensure consent screen is properly configured

### Google Sign-In Button Not Appearing
**Cause**: Frontend Client ID not loaded
**Solution**:
- Check `frontend/.env` file exists
- Verify `VITE_` prefix is used
- Restart frontend dev server

### Error: "Email not verified"
**Cause**: User's Google account email not verified
**Solution**:
- User must verify email with Google first
- This is a security feature

## ============================================================================
## SECURITY NOTES
## ============================================================================

1. **Client ID is Public**: Safe to expose in frontend code
2. **Client Secret**: NOT used in this implementation (authorization code flow)
3. **ID Token Verification**: Backend validates all tokens with Google
4. **Email Verification**: Only verified emails from Google are accepted
5. **Account Existence**: No automatic account creation via Google login
6. **Role Detection**: Backend determines user role after authentication

## ============================================================================
## SUPPORT
## ============================================================================

For additional help:
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Google Cloud Console Support: https://console.cloud.google.com/support
- Review implementation: GOOGLE-SIGNIN-IMPLEMENTATION.md

## ============================================================================
## COMPLETION
## ============================================================================

Once setup is complete:
✓ Delete this file or keep for future reference
✓ Test login with multiple Google accounts
✓ Document Client ID in your password manager
✓ Set up monitoring in Google Cloud Console
✓ Plan for production deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
