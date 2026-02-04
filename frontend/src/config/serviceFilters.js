/**
 * SERVICE-DRIVEN FILTER CONFIGURATION
 * 
 * Architecture:
 * - Each service has its own filter schema
 * - Common filters (location, budget, rating) are merged at runtime
 * - This config can move to backend/database without changing UI logic
 * - Filters are data-driven, not hardcoded in components
 * 
 * Backend-Ready Structure:
 * When backend is implemented, this becomes:
 * GET /api/services/{serviceId}/filters → Returns same JSON structure
 */

export const SERVICE_FILTER_CONFIG = {
  // ===========================================
  // SERVICE: PHOTOGRAPHY
  // ===========================================
  photography: {
    serviceId: 'photography',
    serviceName: 'Photography Services',
    keywords: ['photographer', 'photography', 'photo', 'candid', 'videography', 'videographer', 'camera'],
    icon: '📸',
    
    // Service-specific filters
    filters: [
      {
        id: 'photography_type',
        label: 'Photography Type',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'candid', label: 'Candid Photography', icon: '📷' },
          { value: 'traditional', label: 'Traditional Photography', icon: '📸' },
          { value: 'pre-wedding', label: 'Pre-Wedding Shoot', icon: '💑' },
          { value: 'videography', label: 'Videography', icon: '🎥' },
          { value: 'drone', label: 'Drone Coverage', icon: '🚁' },
          { value: 'album', label: 'Photo Album Design', icon: '📔' }
        ]
      },
      {
        id: 'coverage_duration',
        label: 'Coverage Duration',
        type: 'select',
        options: [
          { value: 'half-day', label: 'Half Day (4-6 hours)', priceMultiplier: 0.5 },
          { value: 'full-day', label: 'Full Day (8-12 hours)', priceMultiplier: 1.0 },
          { value: 'multi-day', label: 'Multi-Day Coverage', priceMultiplier: 2.0 }
        ]
      },
      {
        id: 'deliverables',
        label: 'Deliverables',
        type: 'multiselect',
        options: [
          { value: 'edited-photos', label: 'Edited Photos (Digital)' },
          { value: 'raw-files', label: 'RAW Files' },
          { value: 'highlight-video', label: 'Highlight Video (3-5 min)' },
          { value: 'full-video', label: 'Full Event Video' },
          { value: 'printed-album', label: 'Printed Photo Album' },
          { value: 'same-day-edit', label: 'Same Day Edit' }
        ]
      },
      {
        id: 'team_size',
        label: 'Team Size',
        type: 'range',
        min: 1,
        max: 10,
        unit: 'photographers',
        defaultValue: 2
      },
      {
        id: 'equipment',
        label: 'Equipment Requirements',
        type: 'multiselect',
        options: [
          { value: 'dslr', label: 'DSLR/Mirrorless' },
          { value: 'cinema-camera', label: 'Cinema Camera' },
          { value: 'drone', label: 'Drone' },
          { value: 'lighting', label: 'Professional Lighting' },
          { value: 'gimbal', label: 'Gimbal Stabilizer' }
        ]
      }
    ],
    
    // Typical budget range for this service
    budgetRange: {
      min: 15000,
      max: 500000,
      currency: 'INR',
      presets: [
        { label: '₹15K-₹30K', min: 15000, max: 30000, tag: 'Budget' },
        { label: '₹30K-₹75K', min: 30000, max: 75000, tag: 'Standard' },
        { label: '₹75K-₹1.5L', min: 75000, max: 150000, tag: 'Premium' },
        { label: '₹1.5L-₹5L', min: 150000, max: 500000, tag: 'Luxury' }
      ]
    },
    
    // How results should be sorted by default
    defaultSort: 'rating',
    
    // Recommended filters to show first
    priorityFilters: ['photography_type', 'coverage_duration', 'deliverables']
  },

  // ===========================================
  // SERVICE: TENT & DECORATION
  // ===========================================
  tent: {
    serviceId: 'tent',
    serviceName: 'Tent & Decoration',
    keywords: ['tent', 'decoration', 'decor', 'pandal', 'shamiana', 'canopy', 'marquee'],
    icon: '⛺',
    
    filters: [
      {
        id: 'tent_type',
        label: 'Tent Type',
        type: 'multiselect',
        options: [
          { value: 'ac-tent', label: 'AC Tent', icon: '❄️' },
          { value: 'non-ac-tent', label: 'Non-AC Tent', icon: '⛺' },
          { value: 'german-hangar', label: 'German Hangar', icon: '🏗️' },
          { value: 'pandal', label: 'Traditional Pandal', icon: '🎪' },
          { value: 'transparent-tent', label: 'Transparent Tent', icon: '🔮' }
        ]
      },
      {
        id: 'capacity',
        label: 'Guest Capacity',
        type: 'range',
        min: 50,
        max: 5000,
        step: 50,
        unit: 'guests',
        defaultValue: 200
      },
      {
        id: 'flooring',
        label: 'Flooring',
        type: 'multiselect',
        options: [
          { value: 'carpet', label: 'Carpet Flooring' },
          { value: 'wooden', label: 'Wooden Flooring' },
          { value: 'tiles', label: 'Tile Flooring' },
          { value: 'grass', label: 'Artificial Grass' }
        ]
      },
      {
        id: 'decoration_style',
        label: 'Decoration Style',
        type: 'multiselect',
        options: [
          { value: 'traditional', label: 'Traditional Indian', icon: '🪔' },
          { value: 'modern', label: 'Modern Minimalist', icon: '✨' },
          { value: 'floral', label: 'Floral Theme', icon: '🌸' },
          { value: 'vintage', label: 'Vintage/Rustic', icon: '🕰️' },
          { value: 'royal', label: 'Royal/Palace Theme', icon: '👑' },
          { value: 'beach', label: 'Beach/Tropical', icon: '🏖️' }
        ]
      },
      {
        id: 'lighting',
        label: 'Lighting Setup',
        type: 'multiselect',
        options: [
          { value: 'led', label: 'LED Strip Lights' },
          { value: 'chandelier', label: 'Chandeliers' },
          { value: 'festoon', label: 'Festoon Lights' },
          { value: 'uplighting', label: 'Uplighting' },
          { value: 'dj-lights', label: 'DJ/Party Lights' }
        ]
      },
      {
        id: 'furniture',
        label: 'Furniture Included',
        type: 'multiselect',
        options: [
          { value: 'chairs', label: 'Chairs' },
          { value: 'tables', label: 'Tables' },
          { value: 'stage', label: 'Stage Setup' },
          { value: 'sofa', label: 'Sofa Sets' },
          { value: 'throne', label: 'Wedding Throne' }
        ]
      }
    ],
    
    budgetRange: {
      min: 5000,
      max: 1000000,
      currency: 'INR',
      presets: [
        { label: '₹5K-₹25K', min: 5000, max: 25000, tag: 'Basic' },
        { label: '₹25K-₹1L', min: 25000, max: 100000, tag: 'Standard' },
        { label: '₹1L-₹3L', min: 100000, max: 300000, tag: 'Premium' },
        { label: '₹3L-₹10L', min: 300000, max: 1000000, tag: 'Luxury' }
      ]
    },
    
    defaultSort: 'capacity',
    priorityFilters: ['tent_type', 'capacity', 'decoration_style']
  },

  // ===========================================
  // SERVICE: PANDIT (PRIEST)
  // ===========================================
  pandit: {
    serviceId: 'pandit',
    serviceName: 'Pandit Services',
    keywords: ['pandit', 'priest', 'purohit', 'pujari', 'pooja', 'puja', 'brahmin'],
    icon: '🕉️',
    
    filters: [
      {
        id: 'pooja_type',
        label: 'Pooja/Ceremony Type',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'wedding', label: 'Wedding Ceremony', icon: '💍' },
          { value: 'griha-pravesh', label: 'Griha Pravesh', icon: '🏠' },
          { value: 'satyanarayan', label: 'Satyanarayan Katha', icon: '📿' },
          { value: 'navgraha', label: 'Navgraha Shanti', icon: '🌟' },
          { value: 'mundan', label: 'Mundan Ceremony', icon: '👶' },
          { value: 'thread-ceremony', label: 'Thread Ceremony', icon: '🧵' },
          { value: 'death-ritual', label: 'Last Rites/Shradh', icon: '🕯️' },
          { value: 'ganesh-pooja', label: 'Ganesh Pooja', icon: '🐘' }
        ]
      },
      {
        id: 'language',
        label: 'Language/Region',
        type: 'select',
        options: [
          { value: 'hindi', label: 'Hindi' },
          { value: 'sanskrit', label: 'Sanskrit' },
          { value: 'marathi', label: 'Marathi' },
          { value: 'gujarati', label: 'Gujarati' },
          { value: 'tamil', label: 'Tamil' },
          { value: 'telugu', label: 'Telugu' },
          { value: 'bengali', label: 'Bengali' }
        ]
      },
      {
        id: 'duration',
        label: 'Ceremony Duration',
        type: 'select',
        options: [
          { value: 'short', label: 'Short (1-2 hours)', priceMultiplier: 0.5 },
          { value: 'medium', label: 'Medium (2-4 hours)', priceMultiplier: 1.0 },
          { value: 'full-day', label: 'Full Day', priceMultiplier: 2.0 },
          { value: 'multi-day', label: 'Multi-Day Ceremony', priceMultiplier: 3.0 }
        ]
      },
      {
        id: 'includes',
        label: 'Includes',
        type: 'multiselect',
        options: [
          { value: 'samagri', label: 'Pooja Samagri (Materials)' },
          { value: 'assistant', label: 'Assistant Pandit' },
          { value: 'havan', label: 'Havan Setup' },
          { value: 'kundali', label: 'Kundali Matching' },
          { value: 'muhurat', label: 'Muhurat Consultation' }
        ]
      },
      {
        id: 'experience',
        label: 'Experience Level',
        type: 'select',
        options: [
          { value: 'experienced', label: '5-10 years' },
          { value: 'senior', label: '10-20 years' },
          { value: 'veteran', label: '20+ years' }
        ]
      }
    ],
    
    budgetRange: {
      min: 2000,
      max: 50000,
      currency: 'INR',
      presets: [
        { label: '₹2K-₹5K', min: 2000, max: 5000, tag: 'Basic' },
        { label: '₹5K-₹11K', min: 5000, max: 11000, tag: 'Standard' },
        { label: '₹11K-₹25K', min: 11000, max: 25000, tag: 'Premium' },
        { label: '₹25K-₹50K', min: 25000, max: 50000, tag: 'Senior' }
      ]
    },
    
    defaultSort: 'experience',
    priorityFilters: ['pooja_type', 'language', 'duration']
  },

  // ===========================================
  // SERVICE: CATERING
  // ===========================================
  catering: {
    serviceId: 'catering',
    serviceName: 'Catering Services',
    keywords: ['catering', 'caterer', 'food', 'menu', 'cuisine', 'chef', 'buffet'],
    icon: '🍽️',
    
    filters: [
      {
        id: 'cuisine_type',
        label: 'Cuisine Type',
        type: 'multiselect',
        options: [
          { value: 'north-indian', label: 'North Indian', icon: '🍛' },
          { value: 'south-indian', label: 'South Indian', icon: '🥘' },
          { value: 'chinese', label: 'Chinese', icon: '🥟' },
          { value: 'continental', label: 'Continental', icon: '🍝' },
          { value: 'gujarati', label: 'Gujarati', icon: '🥗' },
          { value: 'rajasthani', label: 'Rajasthani', icon: '🍲' },
          { value: 'bengali', label: 'Bengali', icon: '🍱' },
          { value: 'punjabi', label: 'Punjabi', icon: '🫓' }
        ]
      },
      {
        id: 'service_type',
        label: 'Service Type',
        type: 'multiselect',
        options: [
          { value: 'buffet', label: 'Buffet Service' },
          { value: 'plated', label: 'Plated Service' },
          { value: 'live-counter', label: 'Live Cooking Counter' },
          { value: 'family-style', label: 'Family Style' }
        ]
      },
      {
        id: 'guest_count',
        label: 'Guest Count',
        type: 'range',
        min: 10,
        max: 5000,
        step: 10,
        unit: 'guests',
        defaultValue: 100
      },
      {
        id: 'meal_type',
        label: 'Meal Type',
        type: 'multiselect',
        options: [
          { value: 'veg', label: 'Pure Vegetarian' },
          { value: 'non-veg', label: 'Non-Vegetarian' },
          { value: 'jain', label: 'Jain Food' },
          { value: 'vegan', label: 'Vegan Options' }
        ]
      },
      {
        id: 'courses',
        label: 'Number of Courses',
        type: 'select',
        options: [
          { value: 'snacks-only', label: 'Snacks Only', priceMultiplier: 0.3 },
          { value: '1-course', label: '1 Course Meal', priceMultiplier: 0.5 },
          { value: '2-course', label: '2 Course Meal', priceMultiplier: 0.7 },
          { value: '3-course', label: '3 Course Meal', priceMultiplier: 1.0 },
          { value: 'full-menu', label: 'Full Menu (5+ dishes)', priceMultiplier: 1.5 }
        ]
      },
      {
        id: 'beverages',
        label: 'Beverages',
        type: 'multiselect',
        options: [
          { value: 'soft-drinks', label: 'Soft Drinks' },
          { value: 'juices', label: 'Fresh Juices' },
          { value: 'mocktails', label: 'Mocktails' },
          { value: 'tea-coffee', label: 'Tea/Coffee' },
          { value: 'bar-service', label: 'Bar Service' }
        ]
      }
    ],
    
    budgetRange: {
      min: 200,
      max: 2000,
      currency: 'INR',
      unit: 'per plate',
      presets: [
        { label: '₹200-₹400/plate', min: 200, max: 400, tag: 'Budget' },
        { label: '₹400-₹700/plate', min: 400, max: 700, tag: 'Standard' },
        { label: '₹700-₹1200/plate', min: 700, max: 1200, tag: 'Premium' },
        { label: '₹1200-₹2000/plate', min: 1200, max: 2000, tag: 'Luxury' }
      ]
    },
    
    defaultSort: 'rating',
    priorityFilters: ['cuisine_type', 'service_type', 'guest_count']
  }
,
  // ===========================================
  // SERVICE: MUSIC & ENTERTAINMENT (lightweight configs)
  // Added to surface related professions when user searches for "music", "singer", "dance" etc.
  // These are intentionally minimal (only keywords + small filter sets) because they are used
  // primarily for intent detection and suggestion ranking on the frontend.
  music: {
    serviceId: 'music',
    serviceName: 'Music & Entertainment',
    keywords: ['music', 'singer', 'singers', 'band', 'dj', 'dj service', 'live music', 'live band', 'vocalist', 'playback singer', 'instrumental', 'musician', 'music classes'],
    icon: '🎵',
    filters: [
      { id: 'music_type', label: 'Music Type', type: 'multiselect', options: [
        { value: 'dj', label: 'DJ' },
        { value: 'live-band', label: 'Live Band' },
        { value: 'classical', label: 'Classical / Instrumental' },
        { value: 'playback', label: 'Playbacks / Vocalists' },
        { value: 'dhol', label: 'Dhol / Percussion' }
      ] }
    ],
    budgetRange: { min: 2000, max: 500000, currency: 'INR' },
    defaultSort: 'rating',
    priorityFilters: ['music_type']
  },

  dj: {
    serviceId: 'dj',
    serviceName: 'DJ Services',
    keywords: ['dj', 'disc jockey', 'party dj', 'wedding dj', 'club dj'],
    icon: '🎧',
    filters: [ { id: 'dj_style', label: 'DJ Style', type: 'multiselect', options: [ { value: 'bollywood', label: 'Bollywood' }, { value: 'edm', label: 'EDM' }, { value: 'retro', label: 'Retro/Oldies' } ] } ],
    budgetRange: { min: 3000, max: 200000, currency: 'INR' },
    defaultSort: 'rating'
  },

  live_singers: {
    serviceId: 'live_singers',
    serviceName: 'Live Singers / Vocalists',
    keywords: ['singer', 'live singer', 'vocalist', 'playback singer', 'live vocalist'],
    icon: '🎤',
    filters: [ { id: 'genre', label: 'Genre', type: 'multiselect', options: [ { value: 'bollywood', label: 'Bollywood' }, { value: 'pop', label: 'Pop' }, { value: 'classical', label: 'Classical' } ] } ],
    budgetRange: { min: 5000, max: 200000, currency: 'INR' }
  },

  music_band: {
    serviceId: 'music_band',
    serviceName: 'Music Bands',
    keywords: ['band', 'music band', 'live band', 'wedding band', 'party band'],
    icon: '🎸',
    filters: [ { id: 'band_size', label: 'Band Size', type: 'select', options: [ { value: 'duo', label: 'Duo' }, { value: 'trio', label: 'Trio' }, { value: 'band', label: 'Full Band' } ] } ],
    budgetRange: { min: 8000, max: 300000, currency: 'INR' }
  },

  choreographer: {
    serviceId: 'choreographer',
    serviceName: 'Choreographers & Dance',
    keywords: ['choreographer', 'dance', 'dancer', 'sangeet choreographer', 'dance performance'],
    icon: '💃',
    filters: [ { id: 'dance_style', label: 'Dance Style', type: 'multiselect', options: [ { value: 'bollywood', label: 'Bollywood' }, { value: 'classical', label: 'Classical' }, { value: 'folk', label: 'Folk' } ] } ],
    budgetRange: { min: 2000, max: 150000, currency: 'INR' }
  },

  emcee: {
    serviceId: 'emcee',
    serviceName: 'Emcee / Anchor',
    keywords: ['anchor', 'emcee', 'host', 'master of ceremonies', 'event anchor'],
    icon: '🎙️',
    filters: [],
    budgetRange: { min: 2000, max: 100000, currency: 'INR' }
  },

  instrument_dealers: {
    serviceId: 'instrument_dealers',
    serviceName: 'Musical Instrument Dealers',
    keywords: ['instrument', 'musical instrument', 'keyboard', 'guitar', 'drum', 'piano', 'violin'],
    icon: '🎹',
    filters: [],
    budgetRange: { min: 500, max: 500000, currency: 'INR' }
  }
};

/**
 * COMMON FILTERS
 * These apply to ALL services and are merged at runtime
 */
export const COMMON_FILTERS = {
  location: {
    id: 'location',
    label: 'Location',
    type: 'location',
    required: true,
    fields: {
      city: { type: 'text', placeholder: 'City' },
      area: { type: 'text', placeholder: 'Area (optional)' },
      radius: {
        type: 'select',
        options: [
          { value: '2', label: 'Within 2 km' },
          { value: '5', label: 'Within 5 km' },
          { value: '10', label: 'Within 10 km' },
          { value: '20', label: 'Within 20 km' },
          { value: '50', label: 'Within 50 km' },
          { value: 'city', label: 'Entire City' }
        ],
        default: '10'
      }
    }
  },
  
  budget: {
    id: 'budget',
    label: 'Budget',
    type: 'budget',
    required: false,
    note: 'Budget range varies by service. Leave empty to see all options.'
  },
  
  rating: {
    id: 'rating',
    label: 'Minimum Rating',
    type: 'rating',
    options: [
      { value: '4.5', label: '4.5+ Stars', icon: '⭐' },
      { value: '4.0', label: '4.0+ Stars', icon: '⭐' },
      { value: '3.5', label: '3.5+ Stars', icon: '⭐' },
      { value: '3.0', label: '3.0+ Stars', icon: '⭐' }
    ]
  },
  
  verified: {
    id: 'verified',
    label: 'Verified Only',
    type: 'boolean',
    default: false,
    icon: '✓'
  },
  
  availability: {
    id: 'availability',
    label: 'Availability',
    type: 'date',
    placeholder: 'Event Date (optional)'
  }
};

/**
 * Backend API Contract (Future)
 * 
 * When backend is ready, replace this config with:
 * 
 * GET /api/services
 * Response: [{ serviceId, serviceName, keywords, icon, ... }]
 * 
 * GET /api/services/{serviceId}/filters
 * Response: { filters: [...], budgetRange: {...}, defaultSort: '...' }
 * 
 * GET /api/common-filters
 * Response: { location: {...}, budget: {...}, rating: {...}, ... }
 * 
 * POST /api/search
 * Body: {
 *   serviceId: 'photography',
 *   location: { city: 'Indore', radius: 10 },
 *   filters: { photography_type: ['candid', 'videography'] },
 *   budget: { min: 30000, max: 75000 },
 *   sort: 'rating',
 *   page: 1,
 *   limit: 20
 * }
 */

export default SERVICE_FILTER_CONFIG;
