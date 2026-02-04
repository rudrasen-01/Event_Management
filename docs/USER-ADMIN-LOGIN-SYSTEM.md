# Unified User/Admin Login System

## Overview

A complete authentication system for **Users** and **Administrators** with a unified login entry point positioned at the top-right corner of the website, following UX patterns from platforms like Flipkart and Justdial.

**Key Features:**
- Single login button for both users and administrators
- Role-based authentication with JWT tokens
- Automatic redirection based on user role
- Protected routes with role-based access control
- Completely separate from vendor authentication flow
- Professional, modern UI with responsive design

---

## Architecture

### Backend Components

#### 1. **User Model** (`backend/models/User.js`)
- User schema with email, password, name, role, and preferences
- Password hashing with bcrypt
- JWT token generation
- Role-based methods (user/admin)

**Fields:**
- `name`: User's full name
- `email`: Unique email address (login credential)
- `password`: Hashed password
- `role`: 'user' or 'admin' (default: 'user')
- `phone`: Optional phone number
- `isActive`: Account status
- `preferences`: User preferences and favorite vendors
- `bookings`: Booking history

#### 2. **User Controller** (`backend/controllers/userController.js`)
- `registerUser`: Create new user account
- `loginUser`: Authenticate user/admin
- `getProfile`: Get current user profile
- `updateProfile`: Update user information
- `logoutUser`: Logout (client-side token removal)

#### 3. **Authentication Middleware** (`backend/middleware/authMiddleware.js`)
- `protect`: Verify JWT token and authenticate requests
- `authorize`: Role-based authorization
- Token validation and expiry checking

#### 4. **User Routes** (`backend/routes/userRoutes.js`)
```
POST   /api/users/register   - Register new user
POST   /api/users/login      - Login user/admin
GET    /api/users/profile    - Get user profile (protected)
PUT    /api/users/profile    - Update profile (protected)
POST   /api/users/logout     - Logout user (protected)
```

---

### Frontend Components

#### 1. **AuthContext** (`frontend/src/contexts/AuthContext.jsx`)
Global authentication state management:
- `user`: Current user object
- `token`: JWT authentication token
- `login()`: Login function
- `register()`: Registration function
- `logout()`: Logout function
- `isAdmin()`: Check if user is admin
- `isAuthenticated()`: Check authentication status
- `getAuthHeader()`: Get authorization header for API calls

#### 2. **UserLoginModal** (`frontend/src/components/UserLoginModal.jsx`)
Beautiful modal with:
- Login/Register tabs
- Form validation
- Email and password authentication
- Error handling
- Loading states
- Responsive design

#### 3. **ProtectedRoute** (`frontend/src/components/ProtectedRoute.jsx`)
Route wrapper for protected pages:
- Authentication checking
- Role-based access control
- Automatic redirection for unauthorized access

#### 4. **Updated Header** (`frontend/src/components/Header.jsx`)
- Login button in top-right corner (when not authenticated)
- User profile dropdown (when authenticated)
- Role-based menu items:
  - **Admin**: Admin Panel, Settings, Logout
  - **User**: My Dashboard, Settings, Logout
- Mobile-responsive menu
- Visual role indicator (Admin badge)

---

## User Flow

### 1. **User Registration**
```
User clicks "Login" → Selects "Register" tab →
Fills name, email, password →
System creates account with 'user' role →
Auto-login with JWT token →
Redirects to /dashboard
```

### 2. **User Login**
```
User clicks "Login" → Enters credentials →
Backend validates and returns JWT →
Frontend stores token and user data →
Redirects to /dashboard
```

### 3. **Admin Login**
```
Admin clicks "Login" → Enters credentials →
Backend identifies 'admin' role →
Frontend stores token and user data →
Redirects to /admin panel
```

### 4. **Role-Based Redirection**
- **User role**: Redirected to `/dashboard`
- **Admin role**: Redirected to `/admin`
- Protected routes check authentication and role

---

## Protected Routes

### User Routes (Requires 'user' or 'admin' role)
- `/dashboard` - User dashboard with bookings, favorites

### Admin Routes (Requires 'admin' role only)
- `/admin` - Admin panel with elevated permissions

### Public Routes (No authentication required)
- `/` - Home page
- `/search` - Search events
- `/about`, `/contact`, `/faq`, etc.

### Vendor Routes (Separate authentication)
- `/vendor-registration` - Vendor signup
- `/vendor-dashboard` - Vendor management

---

## Setup & Installation

### 1. Backend Setup

**Install dependencies:**
```bash
cd backend
npm install
```

**Required packages:**
- `jsonwebtoken` - JWT token generation/verification
- `bcryptjs` - Password hashing
- `express` - Web framework
- `mongoose` - MongoDB ODM

**Environment variables (`.env`):**
```env
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
```

**Seed admin user:**
```bash
node seed-admin.js
```

This creates:
- **Admin**: admin@ais.com / admin123
- **Test User**: user@ais.com / user123

**Start backend:**
```bash
npm run dev
```

### 2. Frontend Setup

**Install dependencies:**
```bash
cd frontend
npm install
```

**Start frontend:**
```bash
npm run dev
```

---

## API Endpoints

### User Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

#### Login User/Admin
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@ais.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@ais.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectTo": "/admin"
  },
  "message": "Login successful"
}
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "9876543210",
    "createdAt": "2026-02-02T..."
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "9876543211"
}
```

#### Logout
```http
POST /api/users/logout
Authorization: Bearer <token>
```

---

## Security Features

### 1. **Password Security**
- Passwords hashed with bcrypt (10 salt rounds)
- Never returned in API responses
- Minimum 6 characters required

### 2. **JWT Tokens**
- Signed with secret key
- 7-day expiration (configurable)
- Includes user ID, email, and role
- Verified on every protected request

### 3. **Role-Based Access**
- Routes protected by role
- Admin-only routes enforced
- Automatic redirection for unauthorized access

### 4. **Input Validation**
- Email format validation
- Password strength requirements
- Phone number format (Indian 10-digit)
- XSS protection via input sanitization

---

## Testing

### Test Accounts

**Admin Account:**
- Email: `admin@ais.com`
- Password: `admin123`
- Access: Admin Panel + All user features

**Test User:**
- Email: `user@ais.com`
- Password: `user123`
- Access: User Dashboard only

### Test Scenarios

1. **User Registration**
   - Click "Login" → "Register"
   - Fill form and submit
   - Should redirect to `/dashboard`

2. **User Login**
   - Click "Login"
   - Use test credentials
   - Should redirect to appropriate page

3. **Admin Access**
   - Login as admin
   - Should redirect to `/admin`
   - Try accessing `/dashboard` - should still work

4. **Protected Routes**
   - Without login, access `/dashboard` → redirected to `/`
   - Without login, access `/admin` → redirected to `/`
   - As user, access `/admin` → redirected to `/dashboard`

5. **Logout**
   - Click user menu → Logout
   - Should redirect to home
   - Try accessing protected route → redirected

---

## Key Differences: User/Admin vs Vendor

| Feature | User/Admin Login | Vendor Login |
|---------|------------------|--------------|
| **Entry Point** | Top-right "Login" button | "Vendor Dashboard" button |
| **UI Component** | UserLoginModal | VendorLoginModal |
| **Authentication** | JWT tokens, role-based | Separate vendor auth |
| **Backend Model** | User model | VendorNew model |
| **API Routes** | `/api/users/*` | `/api/vendors/*` |
| **Protected Access** | User Dashboard, Admin Panel | Vendor Dashboard |
| **Registration** | In login modal | Separate vendor registration page |

---

## Troubleshooting

### "Invalid token" error
- Check JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Check token expiration

### User not redirecting after login
- Check AuthContext is wrapping App
- Verify navigate() is working
- Check console for errors

### Protected routes not working
- Ensure ProtectedRoute is wrapping the route
- Check if AuthProvider is in App.jsx
- Verify token is stored in localStorage

### Admin can't access admin panel
- Check user role is 'admin' in database
- Verify allowedRoles=['admin'] on route
- Check authorization middleware

---

## Future Enhancements

1. **Email Verification**
   - Send verification email on registration
   - Verify email before full access

2. **Password Reset**
   - Forgot password functionality
   - Email-based password reset

3. **Two-Factor Authentication**
   - SMS or email OTP
   - Enhanced security for admin accounts

4. **Social Login**
   - Google OAuth
   - Facebook Login

5. **User Profile Page**
   - Complete profile management
   - Avatar upload
   - Booking history

6. **Admin Features**
   - User management
   - Analytics dashboard
   - System settings

---

## Code Examples

### Using Auth in Components

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated()) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {isAdmin() && <p>You have admin privileges</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected API Calls

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { getAuthHeader } = useAuth();

  const fetchData = async () => {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const data = await response.json();
    console.log(data);
  };

  return <button onClick={fetchData}>Get Profile</button>;
}
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check backend logs
4. Verify environment variables
5. Test with provided test accounts

---

**Implementation Date:** February 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
