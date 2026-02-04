const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandlerAdvanced } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const serviceRoutes = require('./routes/serviceRoutes');
const searchRoutes = require('./routes/searchRoutes');
const vendorRoutes = require('./routes/vendorRoutesNew');
const inquiryRoutes = require('./routes/inquiryRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dynamicRoutes = require('./routes/dynamicRoutes');

// Use Routes
app.use('/api/services', serviceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dynamic', dynamicRoutes); // Dynamic data endpoints

// Detect service intent endpoint (special case - not under /services)
const { detectServiceIntent } = require('./controllers/serviceController');
app.post('/api/detect-service-intent', detectServiceIntent);

// Common filters endpoint
const { getCommonFilters } = require('./controllers/serviceController');
app.get('/api/common-filters', getCommonFilters);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Event Management API Server - Dynamic Architecture',
    version: '2.0.0',
    architecture: 'Service-Driven Dynamic Filters',
    endpoints: {
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        logout: 'POST /api/users/logout'
      },
      services: {
        getAll: 'GET /api/services',
        getFilters: 'GET /api/services/:serviceId/filters',
        detectIntent: 'POST /api/detect-service-intent',
        suggestions: 'GET /api/services/suggestions?q=query',
        commonFilters: 'GET /api/common-filters'
      },
      search: {
        search: 'POST /api/search',
        featured: 'GET /api/search/featured',
        byService: 'GET /api/search/by-service/:serviceType',
        vendorDetail: 'GET /api/search/vendor/:vendorId'
      },
      vendors: {
        register: 'POST /api/vendors/register',
        login: 'POST /api/vendors/login',
        get: 'GET /api/vendors/:vendorId',
        update: 'PUT /api/vendors/:vendorId',
        addReview: 'POST /api/vendors/:vendorId/review',
        admin: {
          getAll: 'GET /api/vendors/admin/all',
          approve: 'PUT /api/vendors/admin/approve/:vendorId',
          reject: 'PUT /api/vendors/admin/reject/:vendorId'
        }
      },
      inquiries: {
        create: 'POST /api/inquiries',
        getAll: 'GET /api/inquiries',
        getById: 'GET /api/inquiries/:inquiryId',
        getByVendor: 'GET /api/inquiries/vendor/:vendorId',
        updateStatus: 'PATCH /api/inquiries/:inquiryId/status',
        delete: 'DELETE /api/inquiries/:inquiryId',
        stats: 'GET /api/inquiries/stats'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandlerAdvanced);

// Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
