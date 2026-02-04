const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/VendorNew');

// DEV ONLY - Sample vendors for testing
dotenv.config({ path: '../.env' });

// Safety: only run this seeder when the env flag is explicitly set
if (process.env.SEED_COMPASS_VENDORS !== 'true') {
  console.log('\n⚠️  SEED_COMPASS_VENDORS not enabled. To run this seeder set SEED_COMPASS_VENDORS=true in your environment.');
  process.exit(0);
}

// Official Compass Vendors - Production Ready
const COMPASS_VENDORS = [
  // PHOTOGRAPHERS
  {
    name: 'PixelPerfect Studios',
    businessName: 'PixelPerfect Photography Studios Pvt Ltd',
    contactPerson: 'Arjun Mehta',
    serviceType: 'photographer',
    location: {
      type: 'Point',
      coordinates: [75.8577, 22.7196] // Indore
    },
    city: 'Indore',
    area: 'Vijay Nagar',
    address: '23-B, Treasure Island Mall, Vijay Nagar, Indore',
    pincode: '452010',
    pricing: {
      min: 35000,
      max: 150000,
      average: 75000,
      currency: 'INR',
      unit: 'per event',
      customPackages: [
        {
          name: 'Basic Wedding Package',
          price: 35000,
          description: '1 Photographer, 300 edited photos',
          features: ['Single Day Coverage', '300 Edited Photos', 'Online Gallery', 'Basic Album']
        },
        {
          name: 'Premium Wedding Package',
          price: 85000,
          description: '2 Photographers + Cinematographer, 600 edited photos + Video',
          features: ['2-Day Coverage', '600 Edited Photos', 'Cinematic Video', 'Premium Album', 'Pre-wedding Shoot']
        }
      ]
    },
    contact: {
      phone: '9876501234',
      email: 'hello@pixelperfect.com',
      whatsapp: '9876501234',
      website: 'www.pixelperfectstudios.in',
      socialMedia: {
        instagram: '@pixelperfectstudios',
        facebook: 'pixelperfectstudiosindore'
      }
    },
    password: 'compass2024',
    description: 'Award-winning wedding photography with expertise in candid, traditional, and destination weddings. We capture emotions, not just moments. 12+ years of creating timeless memories.',
    portfolio: [
      {
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866',
        caption: 'Candid Wedding Moments',
        eventType: 'Wedding',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
        caption: 'Traditional Wedding Photography',
        eventType: 'Wedding',
        isPrimary: false
      }
    ],
    featuredImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866',
    searchKeywords: ['wedding photographer', 'candid photography', 'pre-wedding shoot', 'destination wedding photographer', 'cinematography'],
    yearsInBusiness: 12,
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 450,
    completedBookings: 445,
    responseRate: 98,
    popularityScore: 95
  },

  {
    name: 'Frames & Stories',
    businessName: 'Frames & Stories Photography',
    contactPerson: 'Neha Kapoor',
    serviceType: 'photographer',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi
    },
    city: 'Delhi',
    area: 'Connaught Place',
    address: '45, Janpath, Connaught Place, New Delhi',
    pincode: '110001',
    pricing: {
      min: 50000,
      max: 200000,
      average: 100000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876501235',
      email: 'book@framesandstories.in',
      whatsapp: '9876501235',
      website: 'www.framesandstories.in',
      socialMedia: {
        instagram: '@framesandstories',
        facebook: 'framesandstoriesphotography'
      }
    },
    password: 'compass2024',
    description: 'Delhi\'s premier photography studio specializing in wedding, pre-wedding, and corporate event photography. We blend traditional artistry with modern techniques.',
    searchKeywords: ['delhi photographer', 'wedding photography delhi', 'pre-wedding photographer', 'corporate events'],
    yearsInBusiness: 8,
    rating: 4.7,
    reviewCount: 89,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 280,
    completedBookings: 275,
    responseRate: 96,
    popularityScore: 88
  },

  // CATERERS
  {
    name: 'Spice Symphony Caterers',
    businessName: 'Spice Symphony Catering Services Pvt Ltd',
    contactPerson: 'Chef Rajesh Kumar',
    serviceType: 'caterer',
    location: {
      type: 'Point',
      coordinates: [75.8600, 22.7250] // Indore
    },
    city: 'Indore',
    area: 'South Tukoganj',
    address: '12, Food Plaza Complex, South Tukoganj, Indore',
    pincode: '452001',
    pricing: {
      min: 450,
      max: 2000,
      average: 950,
      currency: 'INR',
      unit: 'per plate',
      customPackages: [
        {
          name: 'Vegetarian Premium',
          price: 650,
          description: '4 Starters + 6 Main Course + Desserts',
          features: ['Live Counters', 'Traditional Thali', 'Dessert Bar', 'Welcome Drinks']
        },
        {
          name: 'Royal Multi-Cuisine',
          price: 1200,
          description: 'North Indian, South Indian, Continental, Chinese',
          features: ['8 Starters', '10 Main Course', 'Live Pasta Station', 'Ice Cream Counter', 'Mocktail Bar']
        }
      ]
    },
    contact: {
      phone: '9876502345',
      email: 'catering@spicesymphony.com',
      whatsapp: '9876502345',
      website: 'www.spicesymphony.in',
      socialMedia: {
        instagram: '@spicesymphonycaterers',
        facebook: 'spicesymphonycatering'
      }
    },
    password: 'compass2024',
    description: 'Premium catering services with 15+ years of expertise in wedding, corporate, and social events. Specializing in North Indian, South Indian, Continental, and fusion cuisines. Certified by FSSAI with world-class hygiene standards.',
    searchKeywords: ['wedding catering', 'catering service indore', 'buffet catering', 'multi-cuisine caterer', 'corporate catering'],
    yearsInBusiness: 15,
    rating: 4.8,
    reviewCount: 210,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 820,
    completedBookings: 815,
    responseRate: 99,
    popularityScore: 92
  },

  {
    name: 'Royal Feast Caterers',
    businessName: 'Royal Feast Catering & Events',
    contactPerson: 'Vikram Singh',
    serviceType: 'caterer',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai
    },
    city: 'Mumbai',
    area: 'Andheri West',
    address: '78, Veera Desai Road, Andheri West, Mumbai',
    pincode: '400053',
    pricing: {
      min: 800,
      max: 3500,
      average: 1500,
      currency: 'INR',
      unit: 'per plate'
    },
    contact: {
      phone: '9876502346',
      email: 'events@royalfeast.in',
      whatsapp: '9876502346',
      website: 'www.royalfeast.in'
    },
    password: 'compass2024',
    description: 'Mumbai\'s finest catering service for luxury weddings and high-profile events. Expert in traditional Maharashtrian, Punjabi, and International cuisines.',
    searchKeywords: ['mumbai caterer', 'luxury catering', 'wedding food mumbai', 'party catering'],
    yearsInBusiness: 10,
    rating: 4.6,
    reviewCount: 156,
    verified: true,
    isActive: true,
    isFeatured: false,
    responseTime: 'within 2 hours',
    totalBookings: 480,
    completedBookings: 472,
    responseRate: 94,
    popularityScore: 85
  },

  // WEDDING PLANNERS
  {
    name: 'Dream Events & Weddings',
    businessName: 'Dream Events & Weddings Pvt Ltd',
    contactPerson: 'Priya Sharma',
    serviceType: 'wedding_planner',
    location: {
      type: 'Point',
      coordinates: [75.8700, 22.7300] // Indore
    },
    city: 'Indore',
    area: 'Palasia',
    address: '5th Floor, Siyag Tower, RNT Marg, Indore',
    pincode: '452001',
    pricing: {
      min: 100000,
      max: 1000000,
      average: 350000,
      currency: 'INR',
      unit: 'per event',
      customPackages: [
        {
          name: 'Basic Wedding Planning',
          price: 100000,
          description: 'Coordination for single-day wedding',
          features: ['Vendor Coordination', 'Timeline Management', 'Day-of Coordination', 'Basic Decor Guidance']
        },
        {
          name: 'Full Wedding Planning',
          price: 350000,
          description: 'Complete 3-day wedding planning',
          features: ['Complete Vendor Management', 'Decor Design & Execution', 'Guest Management', 'Budget Planning', 'Multiple Event Coordination']
        },
        {
          name: 'Destination Wedding',
          price: 750000,
          description: 'Full-service destination wedding',
          features: ['All Planning Services', 'Travel Arrangements', 'Accommodation Management', 'Local Vendor Coordination', 'On-site Management Team']
        }
      ]
    },
    contact: {
      phone: '9876503456',
      email: 'info@dreamevents.in',
      whatsapp: '9876503456',
      website: 'www.dreamevents.in',
      socialMedia: {
        instagram: '@dreameventsweddings',
        facebook: 'dreameventsweddings'
      }
    },
    password: 'compass2024',
    description: 'Full-service wedding planning company specializing in traditional Indian weddings, destination weddings, and themed celebrations. We turn your dreams into reality with meticulous planning and flawless execution.',
    searchKeywords: ['wedding planner', 'destination wedding planner', 'event management', 'wedding coordinator', 'theme wedding'],
    yearsInBusiness: 9,
    rating: 4.9,
    reviewCount: 94,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 215,
    completedBookings: 213,
    responseRate: 97,
    popularityScore: 93
  },

  // DECORATORS
  {
    name: 'Elegance Decorators',
    businessName: 'Elegance Event Decorators',
    contactPerson: 'Anil Joshi',
    serviceType: 'decorator',
    location: {
      type: 'Point',
      coordinates: [75.8650, 22.7180] // Indore
    },
    city: 'Indore',
    area: 'Rau',
    address: '34, Bypass Road, Rau, Indore',
    pincode: '453446',
    pricing: {
      min: 50000,
      max: 500000,
      average: 180000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876504567',
      email: 'decor@elegancedecorators.in',
      whatsapp: '9876504567',
      website: 'www.elegancedecorators.in',
      socialMedia: {
        instagram: '@elegancedecorators',
        facebook: 'eleganceeventdecorators'
      }
    },
    password: 'compass2024',
    description: 'Premium event decoration services specializing in traditional and contemporary designs. From intimate gatherings to grand celebrations, we create stunning visual experiences.',
    searchKeywords: ['wedding decoration', 'event decorator', 'stage decoration', 'theme decoration', 'floral decoration'],
    yearsInBusiness: 11,
    rating: 4.7,
    reviewCount: 152,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 2 hours',
    totalBookings: 380,
    completedBookings: 375,
    responseRate: 95,
    popularityScore: 87
  },

  {
    name: 'Floral Fantasia',
    businessName: 'Floral Fantasia Decorations',
    contactPerson: 'Meera Patel',
    serviceType: 'decorator',
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225] // Ahmedabad
    },
    city: 'Ahmedabad',
    area: 'Satellite',
    address: '102, Jodhpur Cross Roads, Satellite, Ahmedabad',
    pincode: '380015',
    pricing: {
      min: 40000,
      max: 400000,
      average: 150000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876504568',
      email: 'hello@floralfantasia.in',
      whatsapp: '9876504568',
      website: 'www.floralfantasia.in'
    },
    password: 'compass2024',
    description: 'Specializing in luxury floral decorations and themed setups for weddings and corporate events. We bring nature\'s beauty to your celebrations.',
    searchKeywords: ['floral decorator ahmedabad', 'wedding flowers', 'theme decoration', 'mandap decoration'],
    yearsInBusiness: 7,
    rating: 4.8,
    reviewCount: 98,
    verified: true,
    isActive: true,
    isFeatured: false,
    responseTime: 'within 4 hours',
    totalBookings: 240,
    completedBookings: 238,
    responseRate: 93,
    popularityScore: 82
  },

  // VENUES
  {
    name: 'Grand Horizon Banquets',
    businessName: 'Grand Horizon Banquets & Convention',
    contactPerson: 'Rajat Verma',
    serviceType: 'venue',
    location: {
      type: 'Point',
      coordinates: [75.8750, 22.7400] // Indore
    },
    city: 'Indore',
    area: 'Scheme 54',
    address: 'Plot 45, Scheme 54, Vijay Nagar, Indore',
    pincode: '452010',
    pricing: {
      min: 150000,
      max: 800000,
      average: 350000,
      currency: 'INR',
      unit: 'per day',
      customPackages: [
        {
          name: 'Basic Hall Rental',
          price: 150000,
          description: 'Hall only, capacity 500 guests',
          features: ['AC Hall', 'Basic Lighting', 'Seating Arrangement', 'Parking Space']
        },
        {
          name: 'Premium Package',
          price: 450000,
          description: 'Hall + Decor + Sound, capacity 1000 guests',
          features: ['Premium Decor', 'Sound System', 'LED Screens', 'Green Room', 'Valet Parking']
        }
      ]
    },
    contact: {
      phone: '9876505678',
      email: 'bookings@grandhorizon.in',
      whatsapp: '9876505678',
      website: 'www.grandhorizonbanquets.in',
      socialMedia: {
        facebook: 'grandhorizonbanquets'
      }
    },
    password: 'compass2024',
    description: 'State-of-the-art banquet hall with modern amenities, perfect for weddings, receptions, and corporate events. Multiple halls available with capacity ranging from 200 to 2000 guests.',
    searchKeywords: ['banquet hall indore', 'wedding venue', 'party hall', 'convention center', 'marriage hall'],
    yearsInBusiness: 6,
    rating: 4.6,
    reviewCount: 84,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 2 hours',
    totalBookings: 320,
    completedBookings: 318,
    responseRate: 96,
    popularityScore: 88
  },

  // DJs / MUSIC
  {
    name: 'Beats & Rhythms DJ',
    businessName: 'Beats & Rhythms Entertainment',
    contactPerson: 'DJ Karan',
    serviceType: 'dj',
    location: {
      type: 'Point',
      coordinates: [75.8450, 22.7100] // Indore
    },
    city: 'Indore',
    area: 'MG Road',
    address: '67, MG Road, Near GPO, Indore',
    pincode: '452001',
    pricing: {
      min: 25000,
      max: 150000,
      average: 60000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876506789',
      email: 'dj@beatsrhythms.in',
      whatsapp: '9876506789',
      website: 'www.beatsrhythms.in',
      socialMedia: {
        instagram: '@djkaranbeats',
        facebook: 'beatsrhythmsdj'
      }
    },
    password: 'compass2024',
    description: 'Professional DJ services with extensive music library covering Bollywood, EDM, Retro, and International hits. Premium sound and lighting equipment for unforgettable celebrations.',
    searchKeywords: ['wedding dj', 'dj service', 'party dj', 'sangeet dj', 'bollywood dj'],
    yearsInBusiness: 8,
    rating: 4.7,
    reviewCount: 165,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 520,
    completedBookings: 518,
    responseRate: 97,
    popularityScore: 90
  },

  // MAKEUP ARTISTS
  {
    name: 'Glamour Studio',
    businessName: 'Glamour Bridal Makeup Studio',
    contactPerson: 'Ritu Malhotra',
    serviceType: 'makeup_artist',
    location: {
      type: 'Point',
      coordinates: [75.8680, 22.7220] // Indore
    },
    city: 'Indore',
    area: 'Sapna Sangeeta',
    address: '3rd Floor, 89, Sapna Sangeeta Road, Indore',
    pincode: '452001',
    pricing: {
      min: 15000,
      max: 80000,
      average: 35000,
      currency: 'INR',
      unit: 'per session',
      customPackages: [
        {
          name: 'Bridal Makeup',
          price: 35000,
          description: 'Full bridal makeup with hairstyling',
          features: ['HD Makeup', 'Hair Styling', 'Draping', 'Touch-ups']
        },
        {
          name: 'Complete Bridal Package',
          price: 65000,
          description: 'Multiple session package',
          features: ['Engagement Makeup', 'Mehendi Makeup', 'Wedding Day Makeup', 'Reception Makeup', 'Trial Session']
        }
      ]
    },
    contact: {
      phone: '9876507890',
      email: 'book@glamourstudio.in',
      whatsapp: '9876507890',
      website: 'www.glamourstudio.in',
      socialMedia: {
        instagram: '@glamourstudioindore',
        facebook: 'glamourbridalmakeup'
      }
    },
    password: 'compass2024',
    description: 'Professional bridal makeup artist with expertise in HD makeup, airbrush makeup, and traditional looks. Trained internationally with MAC and Lakme Academy. Creating stunning bridal looks for over 10 years.',
    searchKeywords: ['bridal makeup', 'makeup artist', 'wedding makeup', 'hd makeup', 'airbrush makeup'],
    yearsInBusiness: 10,
    rating: 4.9,
    reviewCount: 198,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 1 hour',
    totalBookings: 650,
    completedBookings: 648,
    responseRate: 99,
    popularityScore: 96
  },

  {
    name: 'Blush & Glow Studio',
    businessName: 'Blush & Glow Makeup Studio',
    contactPerson: 'Shreya Desai',
    serviceType: 'makeup_artist',
    location: {
      type: 'Point',
      coordinates: [72.8311, 18.9388] // Mumbai
    },
    city: 'Mumbai',
    area: 'Bandra West',
    address: '12, Linking Road, Bandra West, Mumbai',
    pincode: '400050',
    pricing: {
      min: 25000,
      max: 120000,
      average: 55000,
      currency: 'INR',
      unit: 'per session'
    },
    contact: {
      phone: '9876507891',
      email: 'contact@blushandglow.in',
      whatsapp: '9876507891',
      website: 'www.blushandglow.in'
    },
    password: 'compass2024',
    description: 'Mumbai\'s premium bridal makeup studio known for natural, elegant looks and celebrity-style makeovers. Specializing in airbrush and HD makeup.',
    searchKeywords: ['mumbai makeup artist', 'bridal makeup mumbai', 'celebrity makeup', 'airbrush makeup'],
    yearsInBusiness: 7,
    rating: 4.8,
    reviewCount: 142,
    verified: true,
    isActive: true,
    isFeatured: false,
    responseTime: 'within 1 hour',
    totalBookings: 420,
    completedBookings: 418,
    responseRate: 97,
    popularityScore: 89
  },

  // MEHENDI ARTISTS
  {
    name: 'Mehendi Magic',
    businessName: 'Mehendi Magic Arts',
    contactPerson: 'Kavita Sharma',
    serviceType: 'mehendi_artist',
    location: {
      type: 'Point',
      coordinates: [75.8620, 22.7150] // Indore
    },
    city: 'Indore',
    area: 'Bengali Square',
    address: '45, Bengali Square, Indore',
    pincode: '452001',
    pricing: {
      min: 5000,
      max: 50000,
      average: 18000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876508901',
      email: 'book@mehendimagic.in',
      whatsapp: '9876508901',
      socialMedia: {
        instagram: '@mehendimagicarts'
      }
    },
    password: 'compass2024',
    description: 'Expert mehendi artist specializing in traditional, Arabic, and contemporary designs. Bridal mehendi specialist with intricate detailing and guaranteed dark color.',
    searchKeywords: ['mehendi artist', 'bridal mehendi', 'henna artist', 'arabic mehendi', 'wedding mehendi'],
    yearsInBusiness: 9,
    rating: 4.8,
    reviewCount: 187,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 2 hours',
    totalBookings: 580,
    completedBookings: 578,
    responseRate: 98,
    popularityScore: 91
  },

  // CHOREOGRAPHER
  {
    name: 'Dance Dynamics',
    businessName: 'Dance Dynamics Entertainment',
    contactPerson: 'Rohit Kapoor',
    serviceType: 'choreographer',
    location: {
      type: 'Point',
      coordinates: [75.8580, 22.7240] // Indore
    },
    city: 'Indore',
    area: 'Vijay Nagar',
    address: '78, Star Mall Complex, Vijay Nagar, Indore',
    pincode: '452010',
    pricing: {
      min: 15000,
      max: 100000,
      average: 40000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876509012',
      email: 'info@dancedynamics.in',
      whatsapp: '9876509012',
      website: 'www.dancedynamics.in',
      socialMedia: {
        instagram: '@dancedynamicsindia',
        facebook: 'dancedynamicsentertainment'
      }
    },
    password: 'compass2024',
    description: 'Professional choreography for sangeet, wedding entries, and special performances. Expert in Bollywood, contemporary, and fusion dance styles.',
    searchKeywords: ['wedding choreographer', 'sangeet choreographer', 'dance choreographer', 'bollywood choreographer'],
    yearsInBusiness: 6,
    rating: 4.7,
    reviewCount: 93,
    verified: true,
    isActive: true,
    isFeatured: false,
    responseTime: 'within 4 hours',
    totalBookings: 280,
    completedBookings: 278,
    responseRate: 95,
    popularityScore: 84
  },

  // PANDIT (PRIEST)
  {
    name: 'Vedic Rituals',
    businessName: 'Vedic Rituals & Ceremonies',
    contactPerson: 'Pandit Ramesh Shastri',
    serviceType: 'pandit',
    location: {
      type: 'Point',
      coordinates: [75.8500, 22.7050] // Indore
    },
    city: 'Indore',
    area: 'Rajwada',
    address: 'Near Rajwada, Indore',
    pincode: '452002',
    pricing: {
      min: 5000,
      max: 50000,
      average: 15000,
      currency: 'INR',
      unit: 'per ceremony'
    },
    contact: {
      phone: '9876500123',
      email: 'pandit@vedicrituals.in',
      whatsapp: '9876500123'
    },
    password: 'compass2024',
    description: 'Experienced pandit for Hindu wedding ceremonies, griha pravesh, satyanarayan puja, and all religious rituals. Well-versed in Vedic traditions with clear explanations in Hindi and English.',
    searchKeywords: ['wedding pandit', 'hindu priest', 'marriage pandit', 'vedic ceremony', 'puja services'],
    yearsInBusiness: 20,
    rating: 4.9,
    reviewCount: 156,
    verified: true,
    isActive: true,
    isFeatured: true,
    responseTime: 'within 4 hours',
    totalBookings: 720,
    completedBookings: 720,
    responseRate: 92,
    popularityScore: 87
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding official Compass vendors');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Seed official Compass vendors
const seedCompassVendors = async () => {
  try {
    await connectDB();
    
    console.log('\n🗑️  Clearing existing vendors from database...\n');
    const deleteResult = await Vendor.deleteMany({});
    console.log(`✅ Removed ${deleteResult.deletedCount} existing vendors\n`);
    
    console.log('🌱 Creating official Compass vendors...\n');
    
    const createdVendors = [];
    for (const vendorData of COMPASS_VENDORS) {
      try {
        const vendor = await Vendor.create(vendorData);
        createdVendors.push(vendor);
        console.log(`✅ Created: ${vendor.name} (${vendor.serviceType}) - ${vendor.city}`);
      } catch (error) {
        console.error(`❌ Error creating ${vendorData.name}:`, error.message);
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 COMPASS VENDORS SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Total vendors created: ${createdVendors.length}`);
    console.log('\n📋 VENDOR SUMMARY BY CATEGORY:\n');
    
    const categories = {};
    createdVendors.forEach(v => {
      if (!categories[v.serviceType]) {
        categories[v.serviceType] = 0;
      }
      categories[v.serviceType]++;
    });
    
    Object.entries(categories).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(20)} : ${count} vendor(s)`);
    });
    
    console.log('\n📍 VENDORS BY CITY:\n');
    const cities = {};
    createdVendors.forEach(v => {
      if (!cities[v.city]) {
        cities[v.city] = 0;
      }
      cities[v.city]++;
    });
    
    Object.entries(cities).forEach(([city, count]) => {
      console.log(`   ${city.padEnd(20)} : ${count} vendor(s)`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 DEFAULT LOGIN CREDENTIALS (All Vendors):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Password: compass2024');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ All vendors are VERIFIED and ACTIVE');
    console.log('🌟 Featured vendors are marked with isFeatured: true');
    console.log('\n💡 Test the search by querying:');
    console.log('   - By city: Indore, Mumbai, Delhi, Ahmedabad');
    console.log('   - By service: photographer, caterer, decorator, etc.');
    console.log('   - By keyword: wedding, candid, luxury, etc.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
    process.exit(1);
  }
};

// Run seeding
seedCompassVendors();
