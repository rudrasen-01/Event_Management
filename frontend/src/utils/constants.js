// Event type mappings
export const EVENT_TYPES = {
  'Personal & Social': {
    icon: '🎉',
    color: 'from-pink-500 to-rose-500',
    subTypes: [
      'Wedding & Pre-Wedding',
      'Birthday Party', 
      'Anniversary',
      'Engagement',
      'Baby Shower',
      'Reunion'
    ]
  },
  'Corporate': {
    icon: '💼', 
    color: 'from-blue-500 to-indigo-500',
    subTypes: [
      'Corporate Meeting',
      'Conference',
      'Team Building', 
      'Product Launch',
      'Award Ceremony',
      'Trade Show'
    ]
  },
  'Public & Entertainment': {
    icon: '🎭',
    color: 'from-purple-500 to-pink-500', 
    subTypes: [
      'Concert',
      'Festival',
      'Exhibition',
      'Sports Event',
      'Charity Event',
      'Community Event'
    ]
  },
  'Religious & Cultural': {
    icon: '🕉️',
    color: 'from-orange-500 to-red-500',
    subTypes: [
      'Religious Ceremony',
      'Cultural Festival',
      'Temple Event', 
      'Church Event',
      'Mosque Event',
      'Traditional Celebration'
    ]
  },
  'Digital/Hybrid': {
    icon: '💻',
    color: 'from-teal-500 to-green-500',
    subTypes: [
      'Virtual Event',
      'Webinar',
      'Hybrid Conference',
      'Online Workshop', 
      'Live Streaming Event',
      'Digital Product Launch'
    ]
  }
};

// Vendor service categories (matching backend serviceIds)
export const VENDOR_SERVICES = [
  // 1. Venues
  { value: 'banquet-hall', label: 'Banquet / Hall', icon: '🏛️', category: 'Venues' },
  { value: 'lawn-garden', label: 'Lawn / Garden', icon: '🌳', category: 'Venues' },
  { value: 'hotel-resort', label: 'Hotel / Resort', icon: '🏨', category: 'Venues' },
  { value: 'farmhouse', label: 'Farmhouse', icon: '🏡', category: 'Venues' },
  { value: 'party-conference-space', label: 'Party / Conference Space', icon: '🏢', category: 'Venues' },

  // 2. Event Planning
  { value: 'event-planner', label: 'Event Planner', icon: '📋', category: 'Event Planning' },
  { value: 'wedding-planner', label: 'Wedding Planner', icon: '💍', category: 'Event Planning' },
  { value: 'corporate-event-planner', label: 'Corporate Event Planner', icon: '💼', category: 'Event Planning' },
  { value: 'birthday-private-planner', label: 'Birthday / Private Event Planner', icon: '🎂', category: 'Event Planning' },

  // 3. Decor & Styling
  { value: 'event-decorator', label: 'Event Decorator', icon: '🎨', category: 'Decor & Styling' },
  { value: 'wedding-decorator', label: 'Wedding Decorator', icon: '🎀', category: 'Decor & Styling' },
  { value: 'floral-decor', label: 'Floral Decor', icon: '💐', category: 'Decor & Styling' },
  { value: 'stage-mandap-decor', label: 'Stage & Mandap Decor', icon: '🎭', category: 'Decor & Styling' },

  // 4. Photography & Videography
  { value: 'photographer', label: 'Photographer', icon: '📸', category: 'Photography & Videography' },
  { value: 'videographer', label: 'Videographer', icon: '🎥', category: 'Photography & Videography' },
  { value: 'wedding-photography', label: 'Wedding Photography', icon: '💑', category: 'Photography & Videography' },
  { value: 'commercial-event-photography', label: 'Commercial / Event Photography', icon: '📷', category: 'Photography & Videography' },

  // 5. Food & Catering
  { value: 'caterer', label: 'Caterer', icon: '🍽️', category: 'Food & Catering' },
  { value: 'live-food-counter', label: 'Live Food Counter', icon: '🍲', category: 'Food & Catering' },
  { value: 'bartender-beverage', label: 'Bartender / Beverage Service', icon: '🍹', category: 'Food & Catering' },
  { value: 'dessert-sweet', label: 'Dessert & Sweet Vendor', icon: '🎂', category: 'Food & Catering' },

  // 6. Music & Entertainment
  { value: 'dj', label: 'DJ', icon: '🎵', category: 'Music & Entertainment' },
  { value: 'live-band-singer', label: 'Live Band / Singer', icon: '🎤', category: 'Music & Entertainment' },
  { value: 'anchor-emcee', label: 'Anchor / Emcee', icon: '🎙️', category: 'Music & Entertainment' },
  { value: 'performer-artist', label: 'Performer / Artist', icon: '🎪', category: 'Music & Entertainment' },

  // 7. Sound, Light & Technical
  { value: 'sound-system', label: 'Sound System', icon: '🔊', category: 'Sound, Light & Technical' },
  { value: 'lighting-setup', label: 'Lighting Setup', icon: '💡', category: 'Sound, Light & Technical' },
  { value: 'led-screen-setup', label: 'LED / Screen Setup', icon: '📺', category: 'Sound, Light & Technical' },
  { value: 'stage-truss', label: 'Stage & Truss', icon: '🏗️', category: 'Sound, Light & Technical' },

  // 8. Rentals & Infrastructure
  { value: 'tent-house', label: 'Tent House', icon: '⛺', category: 'Rentals & Infrastructure' },
  { value: 'furniture-rental', label: 'Furniture Rental', icon: '🪑', category: 'Rentals & Infrastructure' },
  { value: 'ac-cooler-heater', label: 'AC / Cooler / Heater', icon: '❄️', category: 'Rentals & Infrastructure' },
  { value: 'generator-power', label: 'Generator / Power Backup', icon: '⚡', category: 'Rentals & Infrastructure' },

  // 9. Beauty & Personal Services
  { value: 'bridal-makeup', label: 'Bridal Makeup', icon: '💄', category: 'Beauty & Personal Services' },
  { value: 'hair-stylist', label: 'Hair Stylist', icon: '💇', category: 'Beauty & Personal Services' },
  { value: 'mehndi-artist', label: 'Mehndi Artist', icon: '🖌️', category: 'Beauty & Personal Services' },
  { value: 'groom-styling', label: 'Groom Styling', icon: '🤵', category: 'Beauty & Personal Services' },

  // 10. Religious & Ritual Services
  { value: 'pandit-priest', label: 'Pandit / Priest', icon: '🕉️', category: 'Religious & Ritual Services' },
  { value: 'maulvi', label: 'Maulvi', icon: '☪️', category: 'Religious & Ritual Services' },
  { value: 'granthi', label: 'Granthi', icon: '🪯', category: 'Religious & Ritual Services' },
  { value: 'puja-ritual', label: 'Puja & Ritual Services', icon: '🙏', category: 'Religious & Ritual Services' },

  // 11. Invitations, Gifts & Printing
  { value: 'invitation-cards', label: 'Invitation Cards', icon: '💌', category: 'Invitations, Gifts & Printing' },
  { value: 'digital-invites', label: 'Digital Invites', icon: '📱', category: 'Invitations, Gifts & Printing' },
  { value: 'return-gifts', label: 'Return Gifts', icon: '🎁', category: 'Invitations, Gifts & Printing' },
  { value: 'custom-printing', label: 'Custom Printing', icon: '🖨️', category: 'Invitations, Gifts & Printing' },

  // 12. Logistics & Support Services
  { value: 'transport', label: 'Transport', icon: '🚗', category: 'Logistics & Support Services' },
  { value: 'valet-parking', label: 'Valet Parking', icon: '🅿️', category: 'Logistics & Support Services' },
  { value: 'security-bouncers', label: 'Security / Bouncers', icon: '💂', category: 'Logistics & Support Services' },
  { value: 'housekeeping-cleaning', label: 'Housekeeping / Cleaning', icon: '🧹', category: 'Logistics & Support Services' },

  // 13. Others
  { value: 'other-event-services', label: 'Other Event Services', icon: '🔧', category: 'Others' }
];

// Legacy array for backward compatibility
export const VENDOR_SERVICES_LEGACY = [
  'Venue & Location',
  'Catering & Food',
  'Photography & Videography',
  'Decoration & Flowers',
  'Music & Entertainment', 
  'Transportation',
  'Event Planning',
  'Audio/Visual Equipment',
  'Security Services',
  'Cleaning Services'
];

// Inquiry status options
export const INQUIRY_STATUS = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  sent: {
    label: 'Sent to Vendor', 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  responded: {
    label: 'Vendor Responded',
    color: 'green', 
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  closed: {
    label: 'Closed',
    color: 'gray',
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200'
  }
};

// Vendor approval status
export const VENDOR_STATUS = {
  pending: {
    label: 'Pending Approval',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800', 
    borderColor: 'border-yellow-200'
  },
  approved: {
    label: 'Approved',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200' 
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  }
};

// Indian cities with coordinates 
export const CITIES = [
  // Madhya Pradesh
  { name: 'Indore', state: 'Madhya Pradesh', coords: [22.7196, 75.8577] },
  { name: 'Bhopal', state: 'Madhya Pradesh', coords: [23.2599, 77.4126] },
  { name: 'Jabalpur', state: 'Madhya Pradesh', coords: [23.1815, 79.9864] },
  { name: 'Gwalior', state: 'Madhya Pradesh', coords: [26.2183, 78.1828] },
  { name: 'Ujjain', state: 'Madhya Pradesh', coords: [23.1765, 75.7885] },
  
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', coords: [19.0760, 72.8777] },
  { name: 'Pune', state: 'Maharashtra', coords: [18.5204, 73.8567] },
  { name: 'Nagpur', state: 'Maharashtra', coords: [21.1458, 79.0882] },
  { name: 'Nashik', state: 'Maharashtra', coords: [19.9975, 73.7898] },
  { name: 'Aurangabad', state: 'Maharashtra', coords: [19.8762, 75.3433] },
  
  // Delhi & NCR
  { name: 'Delhi', state: 'Delhi', coords: [28.7041, 77.1025] },
  { name: 'Noida', state: 'Uttar Pradesh', coords: [28.5355, 77.3910] },
  { name: 'Gurgaon', state: 'Haryana', coords: [28.4595, 77.0266] },
  { name: 'Faridabad', state: 'Haryana', coords: [28.4089, 77.3178] },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', coords: [28.6692, 77.4538] },
  
  // Karnataka
  { name: 'Bangalore', state: 'Karnataka', coords: [12.9716, 77.5946] },
  { name: 'Mysore', state: 'Karnataka', coords: [12.2958, 76.6394] },
  { name: 'Hubli', state: 'Karnataka', coords: [15.3647, 75.1240] },
  { name: 'Mangalore', state: 'Karnataka', coords: [12.9141, 74.8560] },
  
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', coords: [13.0827, 80.2707] },
  { name: 'Coimbatore', state: 'Tamil Nadu', coords: [11.0168, 76.9558] },
  { name: 'Madurai', state: 'Tamil Nadu', coords: [9.9252, 78.1198] },
  
  // Telangana & Andhra Pradesh
  { name: 'Hyderabad', state: 'Telangana', coords: [17.3850, 78.4867] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', coords: [16.5062, 80.6480] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', coords: [17.6868, 83.2185] },
  
  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', coords: [23.0225, 72.5714] },
  { name: 'Surat', state: 'Gujarat', coords: [21.1702, 72.8311] },
  { name: 'Vadodara', state: 'Gujarat', coords: [22.3072, 73.1812] },
  { name: 'Rajkot', state: 'Gujarat', coords: [22.3039, 70.8022] },
  
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', coords: [26.9124, 75.7873] },
  { name: 'Jodhpur', state: 'Rajasthan', coords: [26.2389, 73.0243] },
  { name: 'Udaipur', state: 'Rajasthan', coords: [24.5854, 73.7125] },
  
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', coords: [22.5726, 88.3639] },
  
  // Kerala
  { name: 'Kochi', state: 'Kerala', coords: [9.9312, 76.2673] },
  { name: 'Thiruvananthapuram', state: 'Kerala', coords: [8.5241, 76.9366] },
  { name: 'Kozhikode', state: 'Kerala', coords: [11.2588, 75.7804] },
  
  // Punjab
  { name: 'Chandigarh', state: 'Chandigarh', coords: [30.7333, 76.7794] },
  { name: 'Ludhiana', state: 'Punjab', coords: [30.9010, 75.8573] },
  { name: 'Amritsar', state: 'Punjab', coords: [31.6340, 74.8723] },
  
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: [26.8467, 80.9462] },
  { name: 'Kanpur', state: 'Uttar Pradesh', coords: [26.4499, 80.3319] },
  { name: 'Agra', state: 'Uttar Pradesh', coords: [27.1767, 78.0081] },
  { name: 'Varanasi', state: 'Uttar Pradesh', coords: [25.3176, 82.9739] },
  
  // Other States
  { name: 'Patna', state: 'Bihar', coords: [25.5941, 85.1376] },
  { name: 'Ranchi', state: 'Jharkhand', coords: [23.3441, 85.3096] },
  { name: 'Bhubaneswar', state: 'Odisha', coords: [20.2961, 85.8245] },
  { name: 'Dehradun', state: 'Uttarakhand', coords: [30.3165, 78.0322] }
];

// Areas by city
export const AREAS_BY_CITY = {
  'Indore': [
    'Vijay Nagar', 'Bhanwarkuan', 'Saket', 'Palasia', 'AB Road', 'MG Road', 'Rau', 'Ujjain Road',
    'Bypass Road', 'Super Corridor', 'Nipania', 'Aerodrome Road', 'Kanadiya Road', 'Race Course Road',
    'Old Palasia', 'New Palasia', 'Scheme No. 54', 'Scheme No. 78', 'Scheme No. 114', 'Geeta Bhawan',
    'Rajwada', 'Khajrana', 'Silicon City', 'Mangliya', 'Bhawrasla'
  ],
  'Bhopal': [
    'Arera Colony', 'MP Nagar', 'Kolar Road', 'Hoshangabad Road', 'Bittan Market', 'New Market',
    'Shahpura', 'Ayodhya Bypass', 'Raisen Road', 'Barkheda', 'Katara Hills', 'Bawadiya Kalan',
    'Airport Road', 'People Mall Area', 'DB Mall Area', 'Habibganj', 'Govindpura', 'Ashoka Garden'
  ],
  'Jabalpur': [
    'Napier Town', 'Civil Lines', 'Wright Town', 'Gokalpur', 'Vijay Nagar', 'Adhartal', 'Bargi Hills',
    'Garha', 'Hanumantal', 'Madhotal', 'Shankar Nagar'
  ],
  'Gwalior': [
    'Lashkar', 'Morar', 'City Center', 'Jhansi Road', 'Residency Area', 'Jayendra Ganj', 'Thatipur',
    'Maharaj Bada', 'Hazira'
  ],
  'Ujjain': [
    'Freeganj', 'Mahakal Road', 'Dewas Road', 'Indore Road', 'Nanakheda', 'Agar Road', 'University Road'
  ],
  'Mumbai': [
    'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West', 'Juhu', 'Powai', 'Malad East',
    'Malad West', 'Goregaon East', 'Goregaon West', 'Borivali East', 'Borivali West', 'Dadar East',
    'Dadar West', 'Worli', 'Lower Parel', 'BKC', 'Colaba', 'Fort', 'Churchgate', 'Marine Drive',
    'Navi Mumbai', 'Thane', 'Mulund', 'Bhandup', 'Vikhroli', 'Ghatkopar', 'Kurla', 'Santacruz',
    'Vile Parle', 'Kandivali', 'Dahisar'
  ],
  'Pune': [
    'Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Kothrud', 'Aundh', 'Baner', 'Wakad',
    'Pimpri Chinchwad', 'Hadapsar', 'Magarpatta', 'Kalyani Nagar', 'Shivajinagar', 'FC Road',
    'Camp', 'Kharadi', 'Wagholi', 'Deccan', 'Sadashiv Peth', 'Karve Nagar', 'Pashan', 'Bavdhan'
  ],
  'Nagpur': [
    'Sitabuldi', 'Dharampeth', 'Civil Lines', 'Sadar', 'Ramdaspeth', 'Wardha Road', 'Kamptee Road',
    'Hingna', 'MIHAN', 'CA Road'
  ],
  'Nashik': [
    'College Road', 'Mumbai Naka', 'Gangapur Road', 'Sharanpur Road', 'Indira Nagar', 'Panchavati',
    'Cidco', 'Satpur'
  ],
  'Aurangabad': [
    'Cidco', 'Jalna Road', 'Airport Road', 'Town Center', 'Beed Bypass', 'Cantonment', 'Garkheda'
  ],
  'Delhi': [
    'Connaught Place', 'Karol Bagh', 'Nehru Place', 'Saket', 'Vasant Kunj', 'Dwarka', 'Rohini',
    'Pitampura', 'Janakpuri', 'Lajpat Nagar', 'South Extension', 'Greater Kailash', 'Defence Colony',
    'Hauz Khas', 'Chandni Chowk', 'Rajouri Garden', 'Paschim Vihar', 'Preet Vihar', 'Mayur Vihar',
    'Noida Sector 18', 'Vasundhara', 'Dilshad Garden', 'Shahdara', 'Model Town', 'Kamla Nagar'
  ],
  'Noida': [
    'Sector 18', 'Sector 62', 'Sector 63', 'Sector 16', 'Sector 15', 'Sector 50', 'Sector 76',
    'Sector 137', 'Greater Noida', 'Noida Extension'
  ],
  'Gurgaon': [
    'Cyber City', 'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'Golf Course Road',
    'Sohna Road', 'MG Road', 'Udyog Vihar', 'Sector 14', 'Sector 29', 'Sector 56'
  ],
  'Faridabad': [
    'Sector 16', 'Sector 21', 'NIT', 'Old Faridabad', 'Neelam Bata Road', 'Ballabhgarh', 'Sector 15'
  ],
  'Ghaziabad': [
    'Indirapuram', 'Vaishali', 'Raj Nagar', 'Kaushambi', 'Vasundhara', 'Crossings Republik', 'Mohan Nagar'
  ],
  'Bangalore': [
    'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout', 'BTM Layout',
    'Jayanagar', 'Marathahalli', 'MG Road', 'Brigade Road', 'Malleshwaram', 'Rajajinagar',
    'Banashankari', 'JP Nagar', 'Sarjapur Road', 'Bellandur', 'Yelahanka', 'Hebbal', 'Bannerghatta Road'
  ],
  'Mysore': [
    'Gokulam', 'Jayalakshmipuram', 'Kuvempunagar', 'VV Mohalla', 'Saraswathipuram', 'Alanahalli', 'Hebbal'
  ],
  'Hubli': [
    'Vidyanagar', 'Gokul Road', 'Keshwapur', 'Unkal', 'Deshpande Nagar', 'Old Hubli'
  ],
  'Mangalore': [
    'Kadri', 'Hampankatta', 'Balmatta', 'Kodialbail', 'Bejai', 'Kankanady', 'Bondel', 'Thokkottu'
  ],
  'Chennai': [
    'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'OMR', 'Porur', 'Tambaram', 'Mylapore',
    'Nungambakkam', 'Egmore', 'Guindy', 'Vadapalani', 'Besant Nagar', 'Thoraipakkam', 'Sholinganallur',
    'Perungudi', 'Chromepet', 'Pallavaram'
  ],
  'Coimbatore': [
    'RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Town Hall', 'Race Course', 'Singanallur',
    'Ganapathy', 'Saravanampatti'
  ],
  'Madurai': [
    'Anna Nagar', 'SS Colony', 'KK Nagar', 'Goripalayam', 'Alagar Kovil Road', 'Bypass Road', 'Villapuram'
  ],
  'Hyderabad': [
    'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Hitech City', 'Madhapur', 'Kondapur',
    'Kukatpally', 'Miyapur', 'Secunderabad', 'Ameerpet', 'Begumpet', 'Nampally', 'Somajiguda',
    'LB Nagar', 'Dilsukhnagar', 'Malakpet', 'Uppal', 'ECIL'
  ],
  'Vijayawada': [
    'Benz Circle', 'MG Road', 'Governorpet', 'Labbipet', 'Auto Nagar', 'Patamata', 'Bhavanipuram'
  ],
  'Visakhapatnam': [
    'Dwaraka Nagar', 'MVP Colony', 'Madhurawada', 'Gajuwaka', 'Rushikonda', 'Beach Road', 'Siripuram'
  ],
  'Ahmedabad': [
    'Vastrapur', 'Satellite', 'Bodakdev', 'Prahlad Nagar', 'Ambawadi', 'Navrangpura', 'SG Highway',
    'Ashram Road', 'CG Road', 'Maninagar', 'Nikol', 'Chandkheda', 'Thaltej'
  ],
  'Surat': [
    'Adajan', 'Vesu', 'Pal', 'Athwa', 'Nanpura', 'Rander', 'Varachha', 'Udhna', 'Piplod'
  ],
  'Vadodara': [
    'Alkapuri', 'Fatehgunj', 'Sayajigunj', 'Race Course', 'Manjalpur', 'Gotri', 'Akota', 'Vasna'
  ],
  'Rajkot': [
    'Raiya Road', 'Kalawad Road', 'University Road', '150 Feet Ring Road', 'Mavdi', 'Gondal Road'
  ],
  'Jaipur': [
    'C Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Jagatpura', 'Bani Park',
    'Civil Lines', 'Raja Park', 'Tonk Road', 'Ajmer Road', 'JLN Marg'
  ],
  'Jodhpur': [
    'Paota', 'Shastri Nagar', 'Ratanada', 'Sardarpura', 'Chopasni', 'Residency Road', 'Circuit House'
  ],
  'Udaipur': [
    'Fateh Sagar', 'Hiran Magri', 'Sector 14', 'Sukhadia Circle', 'Bhuwana', 'University Road'
  ],
  'Kolkata': [
    'Park Street', 'Salt Lake', 'New Town', 'Behala', 'Jadavpur', 'Ballygunge', 'Alipore',
    'Rajarhat', 'Dum Dum', 'Howrah', 'Esplanade', 'Gariahat', 'Lake Town'
  ],
  'Kochi': [
    'Marine Drive', 'MG Road', 'Kakkanad', 'Palarivattom', 'Edappally', 'Vyttila', 'Fort Kochi',
    'Kaloor', 'Panampilly Nagar'
  ],
  'Thiruvananthapuram': [
    'Vazhuthacaud', 'Kowdiar', 'Pattom', 'Statue', 'Kazhakuttom', 'Technopark', 'Ulloor', 'Sasthamangalam'
  ],
  'Kozhikode': [
    'Mavoor Road', 'Calicut Beach', 'Palazhi', 'West Hill', 'Medical College', 'Nadakkave'
  ],
  'Chandigarh': [
    'Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 8', 'Sector 9', 'Sector 26',
    'Sector 34', 'Sector 44', 'Industrial Area'
  ],
  'Ludhiana': [
    'Civil Lines', 'Model Town', 'Sarabha Nagar', 'PAU', 'BRS Nagar', 'Dugri', 'Ferozepur Road'
  ],
  'Amritsar': [
    'Ranjit Avenue', 'Lawrence Road', 'Mall Road', 'Majitha Road', 'GT Road', 'Chheharta'
  ],
  'Lucknow': [
    'Hazratganj', 'Gomti Nagar', 'Aliganj', 'Indira Nagar', 'Alambagh', 'Mahanagar', 'Chowk',
    'Aminabad', 'Vikas Nagar'
  ],
  'Kanpur': [
    'Civil Lines', 'Swaroop Nagar', 'Kakadeo', 'Kidwai Nagar', 'Govind Nagar', 'Kalyanpur'
  ],
  'Agra': [
    'Sanjay Place', 'Civil Lines', 'Kamla Nagar', 'Sikandra', 'Dayal Bagh', 'Tajganj'
  ],
  'Varanasi': [
    'Sigra', 'Lanka', 'Cantt', 'Bhelupur', 'Nadesar', 'Sarnath', 'Godowlia'
  ],
  'Patna': [
    'Boring Road', 'Kankarbagh', 'Patliputra', 'Raja Bazar', 'Fraser Road', 'Anisabad', 'Danapur'
  ],
  'Ranchi': [
    'Main Road', 'Lalpur', 'Doranda', 'Harmu', 'Hinoo', 'Kanke Road', 'Ratu Road'
  ],
  'Bhubaneswar': [
    'Bapuji Nagar', 'Kharavel Nagar', 'Saheed Nagar', 'Jayadev Vihar', 'Patia', 'Chandrasekharpur',
    'Old Town', 'Nayapalli'
  ],
  'Dehradun': [
    'Rajpur Road', 'Clock Tower', 'Ballupur', 'Saharanpur Road', 'Patel Nagar', 'Dalanwala', 'GMS Road'
  ]
};

// Budget ranges for filters
export const BUDGET_RANGES = [
  { label: 'Under ₹25K', min: 0, max: 25000 },
  { label: '₹25K - ₹50K', min: 25000, max: 50000 },
  { label: '₹50K - ₹1L', min: 50000, max: 100000 },
  { label: '₹1L - ₹2L', min: 100000, max: 200000 },
  { label: '₹2L - ₹5L', min: 200000, max: 500000 },
  { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
  { label: '₹10L - ₹25L', min: 1000000, max: 2500000 },
  { label: '₹25L - ₹50L', min: 2500000, max: 5000000 },
  { label: '₹50L+', min: 5000000, max: 50000000 }
];

// Radius options for location search  
export const RADIUS_OPTIONS = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 }
];

// Popular search scenarios
export const POPULAR_SCENARIOS = [
  {
    emoji: '💍',
    title: 'Wedding under ₹10 Lakhs',
    eventType: 'Personal & Social',
    subType: 'Wedding & Pre-Wedding', 
    budget: { min: 500000, max: 1000000 }
  },
  {
    emoji: '🎂', 
    title: 'Birthday party at home',
    eventType: 'Personal & Social',
    subType: 'Birthday Party',
    budget: { min: 10000, max: 50000 }
  },
  {
    emoji: '🏢',
    title: 'Corporate conference in Indore', 
    eventType: 'Corporate',
    subType: 'Conference',
    budget: { min: 100000, max: 500000 }
  },
  {
    emoji: '🏊',
    title: 'Pool party for 20 people',
    eventType: 'Personal & Social', 
    subType: 'Birthday Party',
    budget: { min: 25000, max: 100000 }
  },
  {
    emoji: '💐',
    title: 'Engagement ceremony', 
    eventType: 'Personal & Social',
    subType: 'Engagement',
    budget: { min: 50000, max: 200000 }
  },
  {
    emoji: '💻',
    title: 'Virtual product launch',
    eventType: 'Digital/Hybrid',
    subType: 'Digital Product Launch', 
    budget: { min: 50000, max: 300000 }
  },
  {
    emoji: '🕉️',
    title: 'Temple festival event',
    eventType: 'Religious & Cultural',
    subType: 'Religious Ceremony',
    budget: { min: 100000, max: 500000 }
  },
  {
    emoji: '🎉', 
    title: 'Anniversary celebration',
    eventType: 'Personal & Social',
    subType: 'Anniversary',
    budget: { min: 25000, max: 150000 }
  }
];