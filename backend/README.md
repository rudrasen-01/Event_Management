# Event Management Backend API

A Node.js Express backend for managing vendors and inquiries for event management services.

## Features

- **Vendor Management**: CRUD operations for vendors with location-based search
- **Inquiry Management**: Handle customer inquiries with vendor matching
- **GeoJSON Support**: Location-based queries using MongoDB's geospatial features
- **RESTful API**: Clean and intuitive API endpoints

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- dotenv for environment variables

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
```

3. Make sure MongoDB is running locally or update the connection string

## Running the Server

Development mode with nodemon:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Vendor Routes

- **POST** `/api/vendors` - Create a new vendor
- **GET** `/api/vendors` - Get all vendors
- **GET** `/api/vendors/search` - Search vendors by location, budget, and event type
- **GET** `/api/vendors/:id` - Get vendor by ID
- **PUT** `/api/vendors/:id` - Update vendor
- **DELETE** `/api/vendors/:id` - Delete vendor

### Inquiry Routes

- **POST** `/api/inquiries` - Create a new inquiry
- **GET** `/api/inquiries` - Get all inquiries (admin)
- **GET** `/api/inquiries/:id` - Get inquiry by ID
- **GET** `/api/inquiries/vendor/:vendorId` - Get inquiries for a specific vendor
- **PATCH** `/api/inquiries/:id/status` - Update inquiry status
- **DELETE** `/api/inquiries/:id` - Delete inquiry

## Example Usage

### Create Vendor
```json
POST /api/vendors
{
  "name": "Elite Catering Services",
  "category": "Catering",
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "budgetMin": 5000,
  "budgetMax": 20000,
  "eventTypes": ["wedding", "corporate", "birthday"],
  "contact": "+1234567890"
}
```

### Search Vendors
```
GET /api/vendors/search?longitude=-73.935242&latitude=40.730610&radius=10&budgetMin=5000&budgetMax=15000&eventType=wedding
```

### Create Inquiry
```json
POST /api/inquiries
{
  "userName": "John Doe",
  "userContact": "+1987654321",
  "budget": 10000,
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "eventType": "wedding",
  "vendorID": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

## Project Structure

```
Event/
├── controllers/
│   ├── vendorController.js
│   └── inquiryController.js
├── models/
│   ├── Vendor.js
│   └── Inquiry.js
├── routes/
│   ├── vendorRoutes.js
│   └── inquiryRoutes.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## License

ISC
