// Comprehensive event taxonomy to surface professions and services in search
// Structure: [{ id, title, vendors: [labels], services: [labels] }, ...]
export const EVENT_TAXONOMY = [
  {
    id: 'event_planning',
    title: 'Event Planning & Management',
    vendors: [
      'Event Planner', 'Wedding Planner', 'Birthday Planner', 'Corporate Event Planner', 'Destination Wedding Planner', 'Budget Event Planner', 'End-to-End Event Management Company'
    ],
    services: [
      'Event concept & theme planning', 'Budget planning & allocation', 'Vendor coordination', 'Timeline & scheduling', 'On-ground event execution', 'Guest flow management', 'Emergency handling', 'Post-event wrap-up'
    ]
  },
  {
    id: 'venues_spaces',
    title: 'Venues & Spaces',
    vendors: ['Banquet Hall','Marriage Garden','Lawn / Party Plot','Hotel / Resort','Farmhouse','Club / Rooftop Venue','Community Hall','Convention Centre','Exhibition Hall','Private Villa'],
    services: ['Venue booking','Seating layout','Parking arrangement','Power & generator access','AC / non-AC setup','Stage space allocation']
  },
  {
    id: 'catering_food',
    title: 'Catering & Food Services',
    vendors: ['Caterer','Wedding Caterer','Jain Caterer','Pure Veg Caterer','Non-Veg Caterer','Live Food Counter Vendor','Bakery','Bartender'],
    services: ['Buffet setup','Live cooking counters','Chaat counter','Sweet counter','Beverage counter','Mocktail bar','Cocktail bar','Wedding cake','Theme cake','Dessert table','Menu planning','Food tasting']
  },
  {
    id: 'decoration_floral',
    title: 'Decoration & Floral',
    vendors: ['Event Decorator','Wedding Decorator','Floral Decorator','Balloon Decorator','Theme Decorator'],
    services: ['Stage decoration','Mandap decoration','Entry gate decoration','Flower decoration','Artificial flowers','Balloon decoration','Backdrop design','Ceiling decoration','Table centerpieces','Car decoration']
  },
  {
    id: 'photography_video',
    title: 'Photography & Videography',
    vendors: ['Event Photographer','Wedding Photographer','Videographer','Drone Operator','Album Designer'],
    services: ['Candid photography','Traditional photography','Cinematic videography','Drone shoot','Pre-wedding shoot','Post-wedding shoot','Event reels','Album designing','Live streaming','LED screen live feed']
  },
  {
    id: 'music_entertainment',
    title: 'Music, DJ & Entertainment',
    vendors: ['DJ','Sound System Provider','Live Band','Singer','Orchestra Group'],
    services: ['DJ setup','Sound system rental','Mic setup','Speaker setup','Live music performance','Karaoke setup','Playlist curation']
  },
  {
    id: 'anchors_artists',
    title: 'Anchors & Artists',
    vendors: ['Event Anchor / Emcee','Stand-up Comedian','Mimicry Artist','Magician','Game Host','Kids Entertainer'],
    services: ['Crowd engagement','Game coordination','Stage hosting','Scripted announcements','Kids games & activities','Comedy performance']
  },
  {
    id: 'religious_rituals',
    title: 'Religious & Ritual Services',
    vendors: ['Pandit / Purohit','Maulvi','Pastor','Astrologer','Vastu Consultant'],
    services: ['Wedding rituals','Engagement puja','Havan','Satyanarayan katha','Grah pravesh','Naamkaran','Muhurat fixing','Vastu consultation']
  },
  {
    id: 'tents_rentals',
    title: 'Tent, Rentals & Infrastructure',
    vendors: ['Tent House','Furniture Rental','Stage Setup Vendor','Generator Provider'],
    services: ['Tent setup','Shamiyana','Chairs & tables','Sofa & lounge seating','Stage fabrication','Truss setup','Generator rental','Power backup']
  },
  {
    id: 'lighting_effects',
    title: 'Lighting & Special Effects',
    vendors: ['Lighting Vendor','Special Effects Provider'],
    services: ['Decorative lights','LED lights','Laser lights','Cold fireworks','Fog machine','Smoke machine','Sparkler effects']
  },
  {
    id: 'beauty_personal',
    title: 'Beauty & Personal Care',
    vendors: ['Bridal Makeup Artist','Groom Makeup Artist','Hairstylist','Mehndi Artist'],
    services: ['Bridal makeup','Party makeup','Hair styling','Saree draping','Mehndi design','Touch-up services']
  },
  {
    id: 'invitation_print',
    title: 'Invitation & Printing',
    vendors: ['Card Printer','Digital Invite Designer','Printing Press'],
    services: ['Wedding cards','Invitation printing','Video invitation','Digital invites','Banners & flex','Standee printing']
  },
  {
    id: 'logistics_support',
    title: 'Logistics & Support',
    vendors: ['Security Agency','Bouncer Service','Valet Parking','Housekeeping Staff'],
    services: ['Event security','Crowd control','Parking management','Cleaning staff','Event helpers']
  },
  {
    id: 'micro_services',
    title: 'Small & Micro Services',
    vendors: ['Anchor under 5000','Pandit under 2000','Balloon decoration under 3000','DJ under 8000','Photographer under 5000','Tent chair rental','Plate & glass rental','Water can supply','Cooler / fan rental','Generator fuel supply','Flower mala vendor','Pooja samagri supplier'],
    services: ['Budget micro-services for small events and add-ons']
  }
];

export default EVENT_TAXONOMY;
