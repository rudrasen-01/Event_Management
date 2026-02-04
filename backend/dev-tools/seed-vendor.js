const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/VendorNew');

// DEV ONLY - For testing purposes
dotenv.config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Dummy vendor data
const dummyVendor = {
  name: "Royal Wedding Planners",
  serviceType: "wedding_planner",
  location: {
    type: "Point",
    coordinates: [75.8577, 22.7196] // Indore coordinates [longitude, latitude]
  },
  city: "Indore",
  area: "Vijay Nagar",
  address: "123 AB Road, Vijay Nagar, Indore, Madhya Pradesh",
  pincode: "452010",
  pricing: {
    min: 50000,
    max: 500000,
    average: 200000,
    currency: "INR",
    unit: "per event"
  },
  filters: {
    wedding_type: ["traditional", "destination"],
    services_offered: ["decoration", "catering", "photography"],
    specialization: "luxury_weddings"
  },
  contact: {
    phone: "9876543210",
    email: "vendor@test.com",
    whatsapp: "9876543210",
    website: "www.royalweddings.com",
    socialMedia: {
      instagram: "@royalweddings",
      facebook: "royalweddingsindore"
    }
  },
  password: "vendor123", // Will be hashed automatically
  businessName: "Royal Wedding Planners Pvt Ltd",
  yearsInBusiness: 8,
  description: "Premium wedding planning services with expertise in traditional and destination weddings. We provide end-to-end solutions for your dream wedding.",
  portfolio: [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552",
      caption: "Luxury Wedding Setup",
      eventType: "Wedding",
      isPrimary: true
    },
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
      caption: "Traditional Wedding Decor",
      eventType: "Wedding",
      isPrimary: false
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
      caption: "Destination Wedding",
      eventType: "Wedding",
      isPrimary: false
    }
  ],
  featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
  serviceAreas: [
    { city: "Indore", radius: 50 },
    { city: "Bhopal", radius: 30 },
    { city: "Ujjain", radius: 20 }
  ],
  availability: {
    status: "available",
    bookedDates: [],
    blockedDates: []
  },
  rating: 4.7,
  reviewCount: 25,
  verified: true,
  isActive: true, // Active for testing
  isFeatured: true,
  responseTime: "within 1 hour",
  yearsOfExperience: 8,
  totalBookings: 150,
  completedBookings: 145,
  responseRate: 95,
  popularityScore: 85,
  searchKeywords: ["wedding planner", "wedding decoration", "luxury wedding", "destination wedding"]
};

// Seed function
const seedVendor = async () => {
  try {
    await connectDB();
    
    // Delete existing vendor with same email
    await Vendor.deleteOne({ 'contact.email': dummyVendor.contact.email });
    console.log('🗑️  Removed existing vendor with email:', dummyVendor.contact.email);
    
    // Create new vendor
    const vendor = await Vendor.create(dummyVendor);
    
    console.log('\n✅ Dummy vendor created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    vendor@test.com');
    console.log('Password: vendor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 VENDOR DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Vendor ID:     ', vendor.vendorId);
    console.log('Name:          ', vendor.name);
    console.log('Business Name: ', vendor.businessName);
    console.log('Service Type:  ', vendor.serviceType);
    console.log('City:          ', vendor.city);
    console.log('Area:          ', vendor.area);
    console.log('Phone:         ', vendor.contact.phone);
    console.log('Rating:        ', vendor.rating, '⭐');
    console.log('Reviews:       ', vendor.reviewCount);
    console.log('Verified:      ', vendor.verified ? '✅' : '❌');
    console.log('Active:        ', vendor.isActive ? '✅' : '❌');
    console.log('Featured:      ', vendor.isFeatured ? '✅' : '❌');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vendor:', error);
    process.exit(1);
  }
};

// Run seeding
seedVendor();
