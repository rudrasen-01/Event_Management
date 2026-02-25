# Event Management Platform

Modern event planning platform with vendor marketplace, search functionality, and user authentication.

## 🚀 Quick Deployment to Hostinger

Your frontend is **production-ready** and built in `frontend/dist/`

**📖 See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for complete deployment guide**

### Quick Steps:
1. Upload all contents from `frontend/dist/` to Hostinger's `public_html`
2. Update environment variables in `.env` file
3. Done! Your site is live

## 🛠️ Development

### Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
```

### Backend  
```bash
cd backend
npm install
npm run dev     # http://localhost:5000
```

## 📁 Project Structure

```
├── frontend/
│   ├── dist/              # ✅ Production build (ready to deploy)
│   ├── src/              # React source code
│   └── package.json
│
├── backend/
│   ├── controllers/      # API logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # Database utilities
│   └── server.js        # Entry point
│
└── HOSTINGER_DEPLOYMENT.md  # Deployment guide
```

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_WHATSAPP_NUMBER=919220836393
```

### Backend (.env)
Configure database connection, JWT secret, Google OAuth, etc.

## ✨ Features

- 🔍 Advanced vendor search with filters
- 📍 Location-based search
- 👤 User authentication (Google OAuth)
- 💼 Vendor profiles and management
- 📱 Responsive design
- ⚡ Optimized production build

## 📦 Technologies

**Frontend:** React 18, Vite, Tailwind CSS, React Router  
**Backend:** Node.js, Express, MongoDB, JWT

---

**Ready to deploy?** Check [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)

