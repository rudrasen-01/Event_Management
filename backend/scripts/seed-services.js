const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/Service');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

// MASTER TAXONOMY - Single Source of Truth for entire platform
// This data drives: vendor registration, user search, filters, results
const MASTER_TAXONOMY = [
  // 1. Venues
  { 
    serviceId: 'banquet-hall', 
    serviceName: 'Banquet / Hall', 
    category: 'Venues',
    keywords: ['banquet', 'hall', 'venue', 'banquet hall', 'party hall', 'function hall', 'marriage hall'], 
    icon: '🏛️',
    description: 'Banquet halls and function venues for events and celebrations'
  },
  { 
    serviceId: 'lawn-garden', 
    serviceName: 'Lawn / Garden', 
    category: 'Venues',
    keywords: ['lawn', 'garden', 'outdoor venue', 'garden party', 'lawn venue', 'open air'], 
    icon: '🌳',
    description: 'Outdoor lawns and garden venues for events'
  },
  { 
    serviceId: 'hotel-resort', 
    serviceName: 'Hotel / Resort', 
    category: 'Venues',
    keywords: ['hotel', 'resort', 'destination venue', 'resort venue', 'hotel banquet'], 
    icon: '🏨',
    description: 'Hotels and resorts with event facilities'
  },
  { 
    serviceId: 'farmhouse', 
    serviceName: 'Farmhouse', 
    category: 'Venues',
    keywords: ['farmhouse', 'farm house', 'farm venue', 'outdoor farmhouse'], 
    icon: '🏡',
    description: 'Private farmhouses for exclusive events'
  },
  { 
    serviceId: 'party-conference-space', 
    serviceName: 'Party / Conference Space', 
    category: 'Venues',
    keywords: ['conference', 'party space', 'meeting room', 'conference hall', 'seminar hall'], 
    icon: '🏢',
    description: 'Commercial spaces for parties and conferences'
  },

  // 2. Event Planning
  { 
    serviceId: 'event-planner', 
    serviceName: 'Event Planner', 
    category: 'Event Planning',
    keywords: ['event planner', 'event management', 'planner', 'event organizer', 'event coordinator'], 
    icon: '📋',
    description: 'Professional event planning and management services'
  },
  { 
    serviceId: 'wedding-planner', 
    serviceName: 'Wedding Planner', 
    category: 'Event Planning',
    keywords: ['wedding planner', 'wedding planning', 'wedding', 'marriage planner', 'wedding organizer'], 
    icon: '💍',
    description: 'Specialized wedding planning and coordination'
  },
  { 
    serviceId: 'corporate-event-planner', 
    serviceName: 'Corporate Event Planner', 
    category: 'Event Planning',
    keywords: ['corporate planner', 'corporate event', 'business event', 'corporate organizer'], 
    icon: '💼',
    description: 'Corporate event planning and execution'
  },
  { 
    serviceId: 'birthday-private-planner', 
    serviceName: 'Birthday / Private Event Planner', 
    category: 'Event Planning',
    keywords: ['birthday planner', 'private event', 'birthday party', 'celebration planner'], 
    icon: '🎂',
    description: 'Birthday and private celebration planning'
  },

  // 3. Decor & Styling
  { 
    serviceId: 'event-decorator', 
    serviceName: 'Event Decorator', 
    category: 'Decor & Styling',
    keywords: ['decorator', 'event decor', 'decoration', 'event styling'], 
    icon: '🎨',
    description: 'Event decoration and styling services'
  },
  { 
    serviceId: 'wedding-decorator', 
    serviceName: 'Wedding Decorator', 
    category: 'Decor & Styling',
    keywords: ['wedding decorator', 'mandap', 'stage decor', 'wedding decoration'], 
    icon: '🎀',
    description: 'Wedding-specific decoration and mandap setup'
  },
  { 
    serviceId: 'floral-decor', 
    serviceName: 'Floral Decor', 
    category: 'Decor & Styling',
    keywords: ['floral', 'flowers', 'flower decor', 'floral arrangement'], 
    icon: '💐',
    description: 'Floral decoration and arrangements'
  },
  { 
    serviceId: 'stage-mandap-decor', 
    serviceName: 'Stage & Mandap Decor', 
    category: 'Decor & Styling',
    keywords: ['stage', 'mandap', 'decor', 'stage setup', 'mandap setup'], 
    icon: '🎭',
    description: 'Stage and mandap decoration services'
  },

  // 4. Photography & Videography
  { 
    serviceId: 'photographer', 
    serviceName: 'Photographer', 
    category: 'Photography & Videography',
    keywords: ['photographer', 'photography', 'photo', 'candid', 'photo shoot'], 
    icon: '📸',
    description: 'Professional photography services'
  },
  { 
    serviceId: 'videographer', 
    serviceName: 'Videographer', 
    category: 'Photography & Videography',
    keywords: ['videographer', 'videography', 'video', 'cinematography', 'video shoot'], 
    icon: '🎥',
    description: 'Professional videography and cinematography'
  },
  { 
    serviceId: 'wedding-photography', 
    serviceName: 'Wedding Photography', 
    category: 'Photography & Videography',
    keywords: ['wedding photography', 'pre-wedding', 'candid', 'wedding photo', 'bridal photography'], 
    icon: '💑',
    description: 'Specialized wedding photography'
  },
  { 
    serviceId: 'commercial-event-photography', 
    serviceName: 'Commercial / Event Photography', 
    category: 'Photography & Videography',
    keywords: ['commercial photography', 'event photography', 'corporate photography'], 
    icon: '📷',
    description: 'Commercial and corporate event photography'
  },

  // 5. Food & Catering
  { 
    serviceId: 'caterer', 
    serviceName: 'Caterer', 
    category: 'Food & Catering',
    keywords: ['caterer', 'catering', 'food', 'food service', 'catering service'], 
    icon: '🍽️',
    description: 'Catering and food services'
  },
  { 
    serviceId: 'live-food-counter', 
    serviceName: 'Live Food Counter', 
    category: 'Food & Catering',
    keywords: ['live counter', 'live food', 'food stall', 'live cooking'], 
    icon: '🍲',
    description: 'Live food counters and cooking stations'
  },
  { 
    serviceId: 'bartender-beverage', 
    serviceName: 'Bartender / Beverage Service', 
    category: 'Food & Catering',
    keywords: ['bartender', 'beverage', 'bar service', 'drinks'], 
    icon: '🍹',
    description: 'Bartending and beverage services'
  },
  { 
    serviceId: 'dessert-sweet', 
    serviceName: 'Dessert & Sweet Vendor', 
    category: 'Food & Catering',
    keywords: ['dessert', 'sweets', 'sweet shop', 'dessert counter'], 
    icon: '🎂',
    description: 'Desserts and sweet vendors'
  },

  // 6. Music & Entertainment
  { 
    serviceId: 'dj', 
    serviceName: 'DJ', 
    category: 'Music & Entertainment',
    keywords: ['dj', 'disc jockey', 'music', 'dj service'], 
    icon: '🎵',
    description: 'DJ and music services'
  },
  { 
    serviceId: 'live-band-singer', 
    serviceName: 'Live Band / Singer', 
    category: 'Music & Entertainment',
    keywords: ['band', 'singer', 'live music', 'musician', 'orchestra'], 
    icon: '🎤',
    description: 'Live bands and singers'
  },
  { 
    serviceId: 'anchor-emcee', 
    serviceName: 'Anchor / Emcee', 
    category: 'Music & Entertainment',
    keywords: ['anchor', 'emcee', 'host', 'mc', 'master of ceremony'], 
    icon: '🎙️',
    description: 'Event anchors and emcees'
  },
  { 
    serviceId: 'performer-artist', 
    serviceName: 'Performer / Artist', 
    category: 'Music & Entertainment',
    keywords: ['performer', 'artist', 'entertainer', 'performance', 'artist performance'], 
    icon: '🎪',
    description: 'Performers and entertainment artists'
  },

  // 7. Sound, Light & Technical
  { 
    serviceId: 'sound-system', 
    serviceName: 'Sound System', 
    category: 'Sound, Light & Technical',
    keywords: ['sound', 'audio', 'sound system', 'pa system', 'audio system'], 
    icon: '🔊',
    description: 'Sound and audio system services'
  },
  { 
    serviceId: 'lighting-setup', 
    serviceName: 'Lighting Setup', 
    category: 'Sound, Light & Technical',
    keywords: ['lighting', 'lights', 'light setup', 'stage lighting'], 
    icon: '💡',
    description: 'Professional lighting services'
  },
  { 
    serviceId: 'led-screen-setup', 
    serviceName: 'LED / Screen Setup', 
    category: 'Sound, Light & Technical',
    keywords: ['led', 'screen', 'projector', 'display', 'led screen'], 
    icon: '📺',
    description: 'LED screens and display setups'
  },
  { 
    serviceId: 'stage-truss', 
    serviceName: 'Stage & Truss', 
    category: 'Sound, Light & Technical',
    keywords: ['stage', 'truss', 'scaffolding', 'stage setup', 'platform'], 
    icon: '🏗️',
    description: 'Stage and truss setup'
  },

  // 8. Rentals & Infrastructure
  { 
    serviceId: 'tent-house', 
    serviceName: 'Tent House', 
    category: 'Rentals & Infrastructure',
    keywords: ['tent', 'pandal', 'canopy', 'tent house', 'shamiana'], 
    icon: '⛺',
    description: 'Tent and pandal rentals'
  },
  { 
    serviceId: 'furniture-rental', 
    serviceName: 'Furniture Rental', 
    category: 'Rentals & Infrastructure',
    keywords: ['furniture', 'chairs', 'tables', 'sofa', 'seating'], 
    icon: '🪑',
    description: 'Furniture rental services'
  },
  { 
    serviceId: 'ac-cooler-heater', 
    serviceName: 'AC / Cooler / Heater', 
    category: 'Rentals & Infrastructure',
    keywords: ['ac', 'cooler', 'heater', 'air conditioner', 'cooling'], 
    icon: '❄️',
    description: 'AC, cooler, and heater rentals'
  },
  { 
    serviceId: 'generator-power', 
    serviceName: 'Generator / Power Backup', 
    category: 'Rentals & Infrastructure',
    keywords: ['generator', 'power', 'electricity', 'backup', 'power backup'], 
    icon: '⚡',
    description: 'Generator and power backup services'
  },

  // 9. Beauty & Personal Services
  { 
    serviceId: 'bridal-makeup', 
    serviceName: 'Bridal Makeup', 
    category: 'Beauty & Personal Services',
    keywords: ['bridal makeup', 'makeup artist', 'bridal', 'bride makeup'], 
    icon: '💄',
    description: 'Bridal makeup services'
  },
  { 
    serviceId: 'hair-stylist', 
    serviceName: 'Hair Stylist', 
    category: 'Beauty & Personal Services',
    keywords: ['hair stylist', 'hairstyling', 'hair', 'salon'], 
    icon: '💇',
    description: 'Professional hair styling'
  },
  { 
    serviceId: 'mehndi-artist', 
    serviceName: 'Mehndi Artist', 
    category: 'Beauty & Personal Services',
    keywords: ['mehndi', 'henna', 'mehendi artist', 'henna artist'], 
    icon: '🖌️',
    description: 'Mehndi and henna artists'
  },
  { 
    serviceId: 'groom-styling', 
    serviceName: 'Groom Styling', 
    category: 'Beauty & Personal Services',
    keywords: ['groom', 'groom styling', 'male grooming', 'groom makeup'], 
    icon: '🤵',
    description: 'Groom styling and grooming'
  },

  // 10. Religious & Ritual Services
  { 
    serviceId: 'pandit-priest', 
    serviceName: 'Pandit / Priest', 
    category: 'Religious & Ritual Services',
    keywords: ['pandit', 'priest', 'puja', 'hindu priest', 'brahmin'], 
    icon: '🕉️',
    description: 'Pandit and Hindu priest services'
  },
  { 
    serviceId: 'maulvi', 
    serviceName: 'Maulvi', 
    category: 'Religious & Ritual Services',
    keywords: ['maulvi', 'muslim priest', 'islamic', 'nikah'], 
    icon: '☪️',
    description: 'Maulvi and Islamic priest services'
  },
  { 
    serviceId: 'granthi', 
    serviceName: 'Granthi', 
    category: 'Religious & Ritual Services',
    keywords: ['granthi', 'sikh priest', 'anand karaj', 'gurdwara'], 
    icon: '🪯',
    description: 'Granthi and Sikh priest services'
  },
  { 
    serviceId: 'puja-ritual', 
    serviceName: 'Puja & Ritual Services', 
    category: 'Religious & Ritual Services',
    keywords: ['puja', 'ritual', 'ceremony', 'pooja', 'religious ceremony'], 
    icon: '🙏',
    description: 'Puja and ritual ceremony services'
  },

  // 11. Invitations, Gifts & Printing
  { 
    serviceId: 'invitation-cards', 
    serviceName: 'Invitation Cards', 
    category: 'Invitations, Gifts & Printing',
    keywords: ['invitation', 'cards', 'wedding cards', 'invite'], 
    icon: '💌',
    description: 'Invitation card printing'
  },
  { 
    serviceId: 'digital-invites', 
    serviceName: 'Digital Invites', 
    category: 'Invitations, Gifts & Printing',
    keywords: ['digital invite', 'e-invite', 'online invitation', 'video invite'], 
    icon: '📱',
    description: 'Digital invitation services'
  },
  { 
    serviceId: 'return-gifts', 
    serviceName: 'Return Gifts', 
    category: 'Invitations, Gifts & Printing',
    keywords: ['return gifts', 'gifts', 'party favors', 'favors'], 
    icon: '🎁',
    description: 'Return gifts and party favors'
  },
  { 
    serviceId: 'custom-printing', 
    serviceName: 'Custom Printing', 
    category: 'Invitations, Gifts & Printing',
    keywords: ['printing', 'custom printing', 'banner', 'flex'], 
    icon: '🖨️',
    description: 'Custom printing services'
  },

  // 12. Logistics & Support Services
  { 
    serviceId: 'transport', 
    serviceName: 'Transport', 
    category: 'Logistics & Support Services',
    keywords: ['transport', 'car', 'vehicle', 'taxi', 'travel'], 
    icon: '🚗',
    description: 'Transportation services'
  },
  { 
    serviceId: 'valet-parking', 
    serviceName: 'Valet Parking', 
    category: 'Logistics & Support Services',
    keywords: ['valet', 'parking', 'car parking', 'valet service'], 
    icon: '🅿️',
    description: 'Valet parking services'
  },
  { 
    serviceId: 'security-bouncers', 
    serviceName: 'Security / Bouncers', 
    category: 'Logistics & Support Services',
    keywords: ['security', 'bouncers', 'guard', 'security guard'], 
    icon: '💂',
    description: 'Security and bouncer services'
  },
  { 
    serviceId: 'housekeeping-cleaning', 
    serviceName: 'Housekeeping / Cleaning', 
    category: 'Logistics & Support Services',
    keywords: ['housekeeping', 'cleaning', 'cleaner', 'sanitation'], 
    icon: '🧹',
    description: 'Housekeeping and cleaning services'
  },

  // 13. Others
  { 
    serviceId: 'other-event-services', 
    serviceName: 'Other Event Services', 
    category: 'Others',
    keywords: ['other', 'misc', 'miscellaneous', 'other services'], 
    icon: '🔧',
    description: 'Other event-related services'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const seedMasterTaxonomy = async () => {
  try {
    await connectDB();

    console.log('\n🌳 Seeding Master Taxonomy - Single Source of Truth\n');
    console.log('=' .repeat(60));

    let inserted = 0;
    let skipped = 0;

    for (const service of MASTER_TAXONOMY) {
      const exists = await Service.findOne({ serviceId: service.serviceId });
      
      if (exists) {
        console.log(`⏭️  Skipping: ${service.serviceName} (${service.serviceId})`);
        skipped++;
        continue;
      }

      const doc = await Service.create({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        keywords: service.keywords,
        icon: service.icon,
        filters: [],
        budgetRange: { 
          min: 1000, 
          max: 10000000, 
          currency: 'INR', 
          unit: 'per event', 
          presets: [
            { label: 'Budget Friendly', min: 1000, max: 50000 },
            { label: 'Mid Range', min: 50000, max: 200000 },
            { label: 'Premium', min: 200000, max: 500000 },
            { label: 'Luxury', min: 500000, max: 10000000 }
          ]
        },
        defaultSort: 'relevance',
        isActive: true,
        popularityScore: 0,
        totalVendors: 0
      });
      
      console.log(`✅ Inserted: ${doc.serviceName} (${doc.serviceId}) - ${service.category}`);
      inserted++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Inserted: ${inserted} services`);
    console.log(`   ⏭️  Skipped: ${skipped} services (already exist)`);
    console.log(`   📋 Total Services in Taxonomy: ${MASTER_TAXONOMY.length}`);
    console.log('\n✅ Master Taxonomy Seeding Complete!');
    console.log('\n🎯 Single Source of Truth established for:');
    console.log('   - Vendor Registration');
    console.log('   - User Search');
    console.log('   - Filters & Results');
    console.log('   - All Platform Features\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedMasterTaxonomy();
