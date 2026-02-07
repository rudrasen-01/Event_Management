const mongoose = require('mongoose');
const Taxonomy = require('../models/Taxonomy');
require('dotenv').config();

const categories = [
  { taxonomyId: 'venues-locations', name: 'Venues & Locations', icon: '🏛️', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'event-planning', name: 'Event Planning & Management', icon: '📋', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'decoration-design', name: 'Decoration & Design', icon: '🎨', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'photography-videography', name: 'Photography & Videography', icon: '📷', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'food-catering', name: 'Food & Catering', icon: '🍽️', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'makeup-beauty', name: 'Makeup, Beauty & Grooming', icon: '💄', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'music-entertainment', name: 'Music & Entertainment', icon: '🎵', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'anchors-hosts', name: 'Anchors, Hosts & Performers', icon: '🎤', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'dance-performance', name: 'Dance & Performance', icon: '💃', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'religious-ritual', name: 'Religious & Ritual Services', icon: '🕉️', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'rentals-infrastructure', name: 'Rentals & Infrastructure', icon: '⛺', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'transport-logistics', name: 'Transport & Logistics', icon: '🚗', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'invitations-printing', name: 'Invitations & Printing', icon: '💌', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'gifts-return-gifts', name: 'Gifts & Return Gifts', icon: '🎁', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'security-staffing', name: 'Security & Staffing', icon: '🛡️', type: 'category', parentId: null, isActive: true },
  { taxonomyId: 'miscellaneous-services', name: 'Miscellaneous Services', icon: '✨', type: 'category', parentId: null, isActive: true }
];

const subcategories = [
  { taxonomyId: 'banquet-halls', name: 'Banquet Halls', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'marriage-gardens', name: 'Marriage Gardens', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'wedding-lawns', name: 'Wedding Lawns', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'hotels', name: 'Hotels', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'resorts', name: 'Resorts', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'farmhouses', name: 'Farmhouses', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'community-halls', name: 'Community Halls', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'clubhouses', name: 'Clubhouses', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'conference-halls', name: 'Conference Halls', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'rooftop-venues', name: 'Rooftop Venues', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'party-plots', name: 'Party Plots', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'auditoriums', name: 'Auditoriums', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'beach-venues', name: 'Beach Venues', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'heritage-venues', name: 'Heritage Venues', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  { taxonomyId: 'destination-wedding-venues', name: 'Destination Wedding Venues', parentId: 'venues-locations', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-planners', name: 'Wedding Planners', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'birthday-planners', name: 'Birthday Planners', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'corporate-event-planners', name: 'Corporate Event Planners', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'destination-wedding-planners', name: 'Destination Wedding Planners', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'theme-event-planners', name: 'Theme Event Planners', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'exhibition-organizers', name: 'Exhibition Organizers', parentId: 'event-planning', type: 'subcategory', isActive: true },
  { taxonomyId: 'concert-show-organizers', name: 'Concert & Show Organizers', parentId: 'event-planning', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-decorators', name: 'Wedding Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'birthday-decorators', name: 'Birthday Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'balloon-decorators', name: 'Balloon Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'floral-decorators', name: 'Floral Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'theme-decorators', name: 'Theme Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'stage-decorators', name: 'Stage Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'mandap-decorators', name: 'Mandap Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  { taxonomyId: 'lighting-decorators', name: 'Lighting Decorators', parentId: 'decoration-design', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-photographers', name: 'Wedding Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  { taxonomyId: 'pre-wedding-photographers', name: 'Pre-Wedding Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  { taxonomyId: 'event-photographers', name: 'Event Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  { taxonomyId: 'corporate-photographers', name: 'Corporate Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  { taxonomyId: 'baby-shoot-photographers', name: 'Baby Shoot Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  { taxonomyId: 'commercial-photographers', name: 'Commercial Photographers', parentId: 'photography-videography', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-caterers', name: 'Wedding Caterers', parentId: 'food-catering', type: 'subcategory', isActive: true },
  { taxonomyId: 'party-caterers', name: 'Party Caterers', parentId: 'food-catering', type: 'subcategory', isActive: true },
  { taxonomyId: 'corporate-caterers', name: 'Corporate Caterers', parentId: 'food-catering', type: 'subcategory', isActive: true },
  { taxonomyId: 'outdoor-caterers', name: 'Outdoor Caterers', parentId: 'food-catering', type: 'subcategory', isActive: true },
  { taxonomyId: 'home-caterers', name: 'Home Caterers', parentId: 'food-catering', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'bridal-makeup-artists', name: 'Bridal Makeup Artists', parentId: 'makeup-beauty', type: 'subcategory', isActive: true },
  { taxonomyId: 'groom-makeup-artists', name: 'Groom Makeup Artists', parentId: 'makeup-beauty', type: 'subcategory', isActive: true },
  { taxonomyId: 'party-makeup-artists', name: 'Party Makeup Artists', parentId: 'makeup-beauty', type: 'subcategory', isActive: true },
  { taxonomyId: 'hairstylists', name: 'Hairstylists', parentId: 'makeup-beauty', type: 'subcategory', isActive: true },
  { taxonomyId: 'mehendi-artists', name: 'Mehendi Artists', parentId: 'makeup-beauty', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'djs', name: 'DJs', parentId: 'music-entertainment', type: 'subcategory', isActive: true },
  { taxonomyId: 'live-bands', name: 'Live Bands', parentId: 'music-entertainment', type: 'subcategory', isActive: true },
  { taxonomyId: 'singers', name: 'Singers', parentId: 'music-entertainment', type: 'subcategory', isActive: true },
  { taxonomyId: 'instrumentalists', name: 'Instrumentalists', parentId: 'music-entertainment', type: 'subcategory', isActive: true },
  { taxonomyId: 'orchestra-groups', name: 'Orchestra Groups', parentId: 'music-entertainment', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'event-anchors', name: 'Event Anchors', parentId: 'anchors-hosts', type: 'subcategory', isActive: true },
  { taxonomyId: 'wedding-anchors', name: 'Wedding Anchors', parentId: 'anchors-hosts', type: 'subcategory', isActive: true },
  { taxonomyId: 'corporate-hosts', name: 'Corporate Hosts', parentId: 'anchors-hosts', type: 'subcategory', isActive: true },
  { taxonomyId: 'emcees', name: 'Emcees', parentId: 'anchors-hosts', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'choreographers', name: 'Choreographers', parentId: 'dance-performance', type: 'subcategory', isActive: true },
  { taxonomyId: 'dance-groups', name: 'Dance Groups', parentId: 'dance-performance', type: 'subcategory', isActive: true },
  { taxonomyId: 'wedding-choreographers', name: 'Wedding Choreographers', parentId: 'dance-performance', type: 'subcategory', isActive: true },
  { taxonomyId: 'school-function-performers', name: 'School Function Performers', parentId: 'dance-performance', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'pandits-purohits', name: 'Pandits / Purohits', parentId: 'religious-ritual', type: 'subcategory', isActive: true },
  { taxonomyId: 'maulvis', name: 'Maulvis', parentId: 'religious-ritual', type: 'subcategory', isActive: true },
  { taxonomyId: 'pastors', name: 'Pastors', parentId: 'religious-ritual', type: 'subcategory', isActive: true },
  { taxonomyId: 'granthis', name: 'Granthis', parentId: 'religious-ritual', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'tent-houses', name: 'Tent Houses', parentId: 'rentals-infrastructure', type: 'subcategory', isActive: true },
  { taxonomyId: 'furniture-rentals', name: 'Furniture Rentals', parentId: 'rentals-infrastructure', type: 'subcategory', isActive: true },
  { taxonomyId: 'sound-system-providers', name: 'Sound System Providers', parentId: 'rentals-infrastructure', type: 'subcategory', isActive: true },
  { taxonomyId: 'lighting-rentals', name: 'Lighting Rentals', parentId: 'rentals-infrastructure', type: 'subcategory', isActive: true },
  { taxonomyId: 'generator-rentals', name: 'Generator Rentals', parentId: 'rentals-infrastructure', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-car-rentals', name: 'Wedding Car Rentals', parentId: 'transport-logistics', type: 'subcategory', isActive: true },
  { taxonomyId: 'bus-rentals', name: 'Bus Rentals', parentId: 'transport-logistics', type: 'subcategory', isActive: true },
  { taxonomyId: 'luxury-cars', name: 'Luxury Cars', parentId: 'transport-logistics', type: 'subcategory', isActive: true },
  { taxonomyId: 'guest-transport', name: 'Guest Transport', parentId: 'transport-logistics', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-card-designers', name: 'Wedding Card Designers', parentId: 'invitations-printing', type: 'subcategory', isActive: true },
  { taxonomyId: 'invitation-printers', name: 'Invitation Printers', parentId: 'invitations-printing', type: 'subcategory', isActive: true },
  { taxonomyId: 'digital-invite-designers', name: 'Digital Invite Designers', parentId: 'invitations-printing', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'wedding-gifts', name: 'Wedding Gifts', parentId: 'gifts-return-gifts', type: 'subcategory', isActive: true },
  { taxonomyId: 'corporate-gifts', name: 'Corporate Gifts', parentId: 'gifts-return-gifts', type: 'subcategory', isActive: true },
  { taxonomyId: 'return-gift-suppliers', name: 'Return Gift Suppliers', parentId: 'gifts-return-gifts', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'event-security', name: 'Event Security', parentId: 'security-staffing', type: 'subcategory', isActive: true },
  { taxonomyId: 'bouncers', name: 'Bouncers', parentId: 'security-staffing', type: 'subcategory', isActive: true },
  { taxonomyId: 'valet-parking', name: 'Valet Parking', parentId: 'security-staffing', type: 'subcategory', isActive: true },
  
  { taxonomyId: 'fireworks', name: 'Fireworks', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'cold-fire-machines', name: 'Cold Fire Machines', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'fog-machines', name: 'Fog Machines', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'red-carpet-setup', name: 'Red Carpet Setup', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'welcome-staff', name: 'Welcome Staff', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'event-volunteers', name: 'Event Volunteers', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true },
  { taxonomyId: 'cleaning-staff', name: 'Cleaning Staff', parentId: 'miscellaneous-services', type: 'subcategory', isActive: true }
];

const services = [
  { taxonomyId: 'banquet-hall-booking', name: 'Banquet Hall Booking', parentId: 'banquet-halls', type: 'service', keywords: ['banquet', 'hall', 'booking', 'shaadi hall', 'marriage hall', 'function hall', 'party hall', 'kalyanam hall'], isActive: true },
  { taxonomyId: 'ac-banquet-halls', name: 'AC Banquet Halls', parentId: 'banquet-halls', type: 'service', keywords: ['ac hall', 'air conditioned hall', 'ac banquet', 'centrally ac hall'], isActive: true },
  { taxonomyId: 'budget-banquet-halls', name: 'Budget Banquet Halls', parentId: 'banquet-halls', type: 'service', keywords: ['cheap hall', 'low cost hall', 'affordable hall', 'budget hall'], isActive: true },
  
  { taxonomyId: 'marriage-garden-booking', name: 'Marriage Garden Booking', parentId: 'marriage-gardens', type: 'service', keywords: ['marriage garden', 'shaadi garden', 'wedding garden', 'outdoor garden', 'lawn garden'], isActive: true },
  { taxonomyId: 'open-lawn-gardens', name: 'Open Lawn Gardens', parentId: 'marriage-gardens', type: 'service', keywords: ['open lawn', 'grass lawn', 'outdoor lawn', 'garden lawn'], isActive: true },
  
  { taxonomyId: 'wedding-lawn-rental', name: 'Wedding Lawn Rental', parentId: 'wedding-lawns', type: 'service', keywords: ['wedding lawn', 'shaadi lawn', 'grass lawn', 'outdoor wedding'], isActive: true },
  
  { taxonomyId: 'hotel-party-hall', name: 'Hotel Party Hall', parentId: 'hotels', type: 'service', keywords: ['hotel hall', 'hotel banquet', 'hotel party', 'hotel function hall'], isActive: true },
  { taxonomyId: 'hotel-accommodation', name: 'Hotel Accommodation for Events', parentId: 'hotels', type: 'service', keywords: ['hotel rooms', 'accommodation', 'guest rooms', 'hotel stay'], isActive: true },
  
  { taxonomyId: 'resort-wedding', name: 'Resort Wedding', parentId: 'resorts', type: 'service', keywords: ['resort shaadi', 'resort wedding', 'destination resort', 'resort party'], isActive: true },
  
  { taxonomyId: 'farmhouse-party', name: 'Farmhouse Party', parentId: 'farmhouses', type: 'service', keywords: ['farmhouse', 'farm party', 'outdoor farmhouse', 'private farmhouse'], isActive: true },
  
  { taxonomyId: 'community-hall-rental', name: 'Community Hall Rental', parentId: 'community-halls', type: 'service', keywords: ['samaj hall', 'community center', 'local hall', 'society hall'], isActive: true },
  
  { taxonomyId: 'club-party-hall', name: 'Club Party Hall', parentId: 'clubhouses', type: 'service', keywords: ['club hall', 'club venue', 'club party', 'club banquet'], isActive: true },
  
  { taxonomyId: 'conference-hall-rental', name: 'Conference Hall Rental', parentId: 'conference-halls', type: 'service', keywords: ['conference hall', 'meeting hall', 'seminar hall', 'corporate hall'], isActive: true },
  
  { taxonomyId: 'rooftop-party-venue', name: 'Rooftop Party Venue', parentId: 'rooftop-venues', type: 'service', keywords: ['rooftop', 'terrace party', 'rooftop wedding', 'open sky venue'], isActive: true },
  
  { taxonomyId: 'party-plot-rental', name: 'Party Plot Rental', parentId: 'party-plots', type: 'service', keywords: ['party plot', 'open plot', 'ground', 'maidan'], isActive: true },
  
  { taxonomyId: 'auditorium-booking', name: 'Auditorium Booking', parentId: 'auditoriums', type: 'service', keywords: ['auditorium', 'theater', 'stage hall', 'large hall'], isActive: true },
  
  { taxonomyId: 'beach-wedding-venue', name: 'Beach Wedding Venue', parentId: 'beach-venues', type: 'service', keywords: ['beach wedding', 'seaside wedding', 'beach party', 'coastal venue'], isActive: true },
  
  { taxonomyId: 'palace-wedding-venue', name: 'Palace Wedding Venue', parentId: 'heritage-venues', type: 'service', keywords: ['palace', 'heritage venue', 'fort', 'haveli', 'rajwada'], isActive: true },
  
  { taxonomyId: 'goa-destination-wedding', name: 'Goa Destination Wedding', parentId: 'destination-wedding-venues', type: 'service', keywords: ['goa wedding', 'destination wedding', 'beach destination'], isActive: true },
  { taxonomyId: 'jaipur-destination-wedding', name: 'Jaipur Destination Wedding', parentId: 'destination-wedding-venues', type: 'service', keywords: ['jaipur wedding', 'rajasthan wedding', 'palace wedding'], isActive: true },
  
  { taxonomyId: 'wedding-planning-full', name: 'Full Wedding Planning', parentId: 'wedding-planners', type: 'service', keywords: ['wedding planner', 'shaadi planner', 'event planner', 'marriage planner', 'wedding organizer'], isActive: true },
  { taxonomyId: 'wedding-coordination', name: 'Wedding Coordination', parentId: 'wedding-planners', type: 'service', keywords: ['wedding coordinator', 'shaadi coordinator', 'event coordinator'], isActive: true },
  
  { taxonomyId: 'birthday-party-planning', name: 'Birthday Party Planning', parentId: 'birthday-planners', type: 'service', keywords: ['birthday planner', 'birthday organizer', 'party planner', 'birthday event'], isActive: true },
  { taxonomyId: 'kids-birthday-planner', name: 'Kids Birthday Planner', parentId: 'birthday-planners', type: 'service', keywords: ['kids party', 'children birthday', 'kids birthday', 'bacchon ki party'], isActive: true },
  
  { taxonomyId: 'corporate-event-management', name: 'Corporate Event Management', parentId: 'corporate-event-planners', type: 'service', keywords: ['corporate event', 'office event', 'company event', 'business event'], isActive: true },
  { taxonomyId: 'conference-management', name: 'Conference Management', parentId: 'corporate-event-planners', type: 'service', keywords: ['conference', 'seminar', 'workshop', 'business meeting'], isActive: true },
  
  { taxonomyId: 'destination-wedding-planning', name: 'Destination Wedding Planning', parentId: 'destination-wedding-planners', type: 'service', keywords: ['destination planner', 'outstation wedding', 'travel wedding'], isActive: true },
  
  { taxonomyId: 'theme-party-planning', name: 'Theme Party Planning', parentId: 'theme-event-planners', type: 'service', keywords: ['theme party', 'themed event', 'costume party', 'fancy party'], isActive: true },
  
  { taxonomyId: 'exhibition-organization', name: 'Exhibition Organization', parentId: 'exhibition-organizers', type: 'service', keywords: ['exhibition', 'expo', 'trade show', 'business expo'], isActive: true },
  
  { taxonomyId: 'concert-organization', name: 'Concert Organization', parentId: 'concert-show-organizers', type: 'service', keywords: ['concert', 'show', 'musical show', 'live show'], isActive: true },
  
  { taxonomyId: 'wedding-decoration-full', name: 'Full Wedding Decoration', parentId: 'wedding-decorators', type: 'service', keywords: ['wedding decorator', 'shaadi decoration', 'marriage decoration', 'dulhan decoration', 'mandap decorator'], isActive: true },
  { taxonomyId: 'stage-shaadi-decoration', name: 'Wedding Stage Decoration', parentId: 'wedding-decorators', type: 'service', keywords: ['stage decoration', 'wedding stage', 'shaadi stage', 'mandap stage'], isActive: true },
  { taxonomyId: 'mehendi-decoration', name: 'Mehendi Decoration', parentId: 'wedding-decorators', type: 'service', keywords: ['mehendi decor', 'mehndi decoration', 'henna ceremony'], isActive: true },
  
  { taxonomyId: 'birthday-decoration', name: 'Birthday Decoration', parentId: 'birthday-decorators', type: 'service', keywords: ['birthday decor', 'party decoration', 'kids decoration', 'birthday setup'], isActive: true },
  
  { taxonomyId: 'balloon-decoration', name: 'Balloon Decoration', parentId: 'balloon-decorators', type: 'service', keywords: ['balloon', 'balloon decoration', 'balloon bouquet', 'balloon arch', 'gola decoration'], isActive: true },
  
  { taxonomyId: 'flower-decoration', name: 'Flower Decoration', parentId: 'floral-decorators', type: 'service', keywords: ['flower decoration', 'floral decor', 'phool decoration', 'fresh flowers'], isActive: true },
  { taxonomyId: 'rose-petal-decoration', name: 'Rose Petal Decoration', parentId: 'floral-decorators', type: 'service', keywords: ['rose petals', 'flower petals', 'gulab patti'], isActive: true },
  
  { taxonomyId: 'theme-decoration', name: 'Theme Decoration', parentId: 'theme-decorators', type: 'service', keywords: ['theme decor', 'themed decoration', 'concept decoration'], isActive: true },
  
  { taxonomyId: 'stage-decoration-service', name: 'Stage Decoration', parentId: 'stage-decorators', type: 'service', keywords: ['stage', 'platform decoration', 'stage setup'], isActive: true },
  
  { taxonomyId: 'mandap-decoration-hindu', name: 'Hindu Mandap Decoration', parentId: 'mandap-decorators', type: 'service', keywords: ['mandap', 'mandap decoration', 'vivah mandap', 'shaadi mandap'], isActive: true },
  
  { taxonomyId: 'event-lighting', name: 'Event Lighting', parentId: 'lighting-decorators', type: 'service', keywords: ['lighting', 'lights', 'led lights', 'decoration lights'], isActive: true },
  { taxonomyId: 'led-wall-decoration', name: 'LED Wall Decoration', parentId: 'lighting-decorators', type: 'service', keywords: ['led wall', 'led screen', 'digital wall'], isActive: true },
  
  { taxonomyId: 'traditional-wedding-photography', name: 'Traditional Wedding Photography', parentId: 'wedding-photographers', type: 'service', keywords: ['wedding photographer', 'shaadi photographer', 'marriage photographer', 'dulhan photographer', 'wedding photo', 'cameraman'], isActive: true },
  { taxonomyId: 'candid-wedding-photography', name: 'Candid Wedding Photography', parentId: 'wedding-photographers', type: 'service', keywords: ['candid photographer', 'candid photography', 'natural photography'], isActive: true },
  { taxonomyId: 'wedding-videography', name: 'Wedding Videography', parentId: 'wedding-photographers', type: 'service', keywords: ['wedding video', 'videographer', 'video shooting', 'wedding film', 'cinematic video'], isActive: true },
  { taxonomyId: 'drone-wedding-shoot', name: 'Drone Wedding Shoot', parentId: 'wedding-photographers', type: 'service', keywords: ['drone', 'aerial shoot', 'drone photography', 'drone video'], isActive: true },
  
  { taxonomyId: 'pre-wedding-shoot', name: 'Pre-Wedding Shoot', parentId: 'pre-wedding-photographers', type: 'service', keywords: ['pre wedding', 'pre-shaadi shoot', 'couple shoot', 'engagement shoot'], isActive: true },
  { taxonomyId: 'outdoor-pre-wedding', name: 'Outdoor Pre-Wedding Shoot', parentId: 'pre-wedding-photographers', type: 'service', keywords: ['outdoor shoot', 'location shoot', 'destination shoot'], isActive: true },
  
  { taxonomyId: 'birthday-photography', name: 'Birthday Photography', parentId: 'event-photographers', type: 'service', keywords: ['birthday photographer', 'party photographer', 'event photographer'], isActive: true },
  { taxonomyId: 'corporate-event-photography', name: 'Corporate Event Photography', parentId: 'event-photographers', type: 'service', keywords: ['corporate photographer', 'office event photographer'], isActive: true },
  
  { taxonomyId: 'conference-photography', name: 'Conference Photography', parentId: 'corporate-photographers', type: 'service', keywords: ['conference photographer', 'seminar photographer', 'business photographer'], isActive: true },
  
  { taxonomyId: 'newborn-photography', name: 'Newborn Photography', parentId: 'baby-shoot-photographers', type: 'service', keywords: ['newborn shoot', 'baby photography', 'infant shoot'], isActive: true },
  { taxonomyId: 'baby-portfolio-shoot', name: 'Baby Portfolio Shoot', parentId: 'baby-shoot-photographers', type: 'service', keywords: ['baby shoot', 'kids photography', 'children photography'], isActive: true },
  
  { taxonomyId: 'product-photography', name: 'Product Photography', parentId: 'commercial-photographers', type: 'service', keywords: ['product photographer', 'commercial shoot', 'ecommerce photography'], isActive: true },
  
  { taxonomyId: 'wedding-catering-full', name: 'Full Wedding Catering', parentId: 'wedding-caterers', type: 'service', keywords: ['wedding caterer', 'shaadi caterer', 'marriage caterer', 'khana caterer', 'food service'], isActive: true },
  { taxonomyId: 'vegetarian-catering', name: 'Vegetarian Catering', parentId: 'wedding-caterers', type: 'service', keywords: ['veg caterer', 'vegetarian food', 'shakahari khana'], isActive: true },
  { taxonomyId: 'non-veg-catering', name: 'Non-Vegetarian Catering', parentId: 'wedding-caterers', type: 'service', keywords: ['non veg caterer', 'non-veg food', 'chicken', 'mutton'], isActive: true },
  { taxonomyId: 'live-counter-catering', name: 'Live Counter Catering', parentId: 'wedding-caterers', type: 'service', keywords: ['live counter', 'live stall', 'live chaat', 'live food'], isActive: true },
  
  { taxonomyId: 'birthday-catering', name: 'Birthday Party Catering', parentId: 'party-caterers', type: 'service', keywords: ['birthday caterer', 'party food', 'snacks caterer'], isActive: true },
  
  { taxonomyId: 'corporate-lunch-catering', name: 'Corporate Lunch Catering', parentId: 'corporate-caterers', type: 'service', keywords: ['office catering', 'corporate lunch', 'business catering'], isActive: true },
  
  { taxonomyId: 'outdoor-event-catering', name: 'Outdoor Event Catering', parentId: 'outdoor-caterers', type: 'service', keywords: ['outdoor caterer', 'picnic catering', 'garden catering'], isActive: true },
  
  { taxonomyId: 'home-party-catering', name: 'Home Party Catering', parentId: 'home-caterers', type: 'service', keywords: ['home catering', 'house party caterer', 'ghar par khana'], isActive: true },
  
  { taxonomyId: 'bridal-makeup-traditional', name: 'Traditional Bridal Makeup', parentId: 'bridal-makeup-artists', type: 'service', keywords: ['bridal makeup', 'dulhan makeup', 'bride makeup', 'shaadi makeup', 'wedding makeup'], isActive: true },
  { taxonomyId: 'hd-bridal-makeup', name: 'HD Bridal Makeup', parentId: 'bridal-makeup-artists', type: 'service', keywords: ['hd makeup', 'high definition makeup', 'airbrush makeup'], isActive: true },
  { taxonomyId: 'airbrush-bridal-makeup', name: 'Airbrush Bridal Makeup', parentId: 'bridal-makeup-artists', type: 'service', keywords: ['airbrush', 'spray makeup', 'professional makeup'], isActive: true },
  
  { taxonomyId: 'groom-makeup', name: 'Groom Makeup', parentId: 'groom-makeup-artists', type: 'service', keywords: ['groom makeup', 'dulha makeup', 'male makeup'], isActive: true },
  
  { taxonomyId: 'party-makeup', name: 'Party Makeup', parentId: 'party-makeup-artists', type: 'service', keywords: ['party makeup', 'function makeup', 'occasion makeup'], isActive: true },
  
  { taxonomyId: 'hairstyling-bridal', name: 'Bridal Hairstyling', parentId: 'hairstylists', type: 'service', keywords: ['hair stylist', 'dulhan hairstyle', 'bridal hair', 'bun hairstyle'], isActive: true },
  
  { taxonomyId: 'bridal-mehendi', name: 'Bridal Mehendi', parentId: 'mehendi-artists', type: 'service', keywords: ['mehendi artist', 'mehndi', 'henna artist', 'dulhan mehendi', 'bridal mehndi'], isActive: true },
  { taxonomyId: 'arabic-mehendi', name: 'Arabic Mehendi', parentId: 'mehendi-artists', type: 'service', keywords: ['arabic mehndi', 'arabic design', 'mehndi design'], isActive: true },
  
  { taxonomyId: 'wedding-dj', name: 'Wedding DJ', parentId: 'djs', type: 'service', keywords: ['dj', 'disc jockey', 'shaadi dj', 'wedding music', 'party dj', 'music system'], isActive: true },
  { taxonomyId: 'party-dj', name: 'Party DJ', parentId: 'djs', type: 'service', keywords: ['party music', 'birthday dj', 'club dj'], isActive: true },
  
  { taxonomyId: 'bollywood-band', name: 'Bollywood Live Band', parentId: 'live-bands', type: 'service', keywords: ['live band', 'music band', 'bollywood band', 'orchestra'], isActive: true },
  
  { taxonomyId: 'bollywood-singer', name: 'Bollywood Singer', parentId: 'singers', type: 'service', keywords: ['singer', 'gayak', 'vocalist', 'live singer'], isActive: true },
  { taxonomyId: 'classical-singer', name: 'Classical Singer', parentId: 'singers', type: 'service', keywords: ['classical singer', 'shastriya sangeet'], isActive: true },
  
  { taxonomyId: 'dhol-player', name: 'Dhol Player', parentId: 'instrumentalists', type: 'service', keywords: ['dhol', 'dholki', 'dhol wala', 'dhol party'], isActive: true },
  { taxonomyId: 'shehnai-player', name: 'Shehnai Player', parentId: 'instrumentalists', type: 'service', keywords: ['shehnai', 'nadaswaram', 'traditional music'], isActive: true },
  
  { taxonomyId: 'wedding-orchestra', name: 'Wedding Orchestra', parentId: 'orchestra-groups', type: 'service', keywords: ['orchestra', 'band baja', 'baraat band'], isActive: true },
  
  { taxonomyId: 'birthday-anchor', name: 'Birthday Anchor', parentId: 'event-anchors', type: 'service', keywords: ['anchor', 'emcee', 'host', 'event host', 'party host'], isActive: true },
  
  { taxonomyId: 'wedding-anchor-services', name: 'Wedding Anchor', parentId: 'wedding-anchors', type: 'service', keywords: ['wedding anchor', 'shaadi anchor', 'marriage host'], isActive: true },
  
  { taxonomyId: 'corporate-anchor', name: 'Corporate Event Host', parentId: 'corporate-hosts', type: 'service', keywords: ['corporate host', 'conference host', 'seminar anchor'], isActive: true },
  
  { taxonomyId: 'emcee-services', name: 'Emcee Services', parentId: 'emcees', type: 'service', keywords: ['mc', 'master of ceremony', 'show host'], isActive: true },
  
  { taxonomyId: 'sangeet-choreography', name: 'Sangeet Choreography', parentId: 'choreographers', type: 'service', keywords: ['choreographer', 'dance choreographer', 'sangeet dance', 'wedding dance'], isActive: true },
  { taxonomyId: 'couple-dance-choreography', name: 'Couple Dance Choreography', parentId: 'choreographers', type: 'service', keywords: ['couple dance', 'first dance', 'romantic dance'], isActive: true },
  
  { taxonomyId: 'bollywood-dance-group', name: 'Bollywood Dance Group', parentId: 'dance-groups', type: 'service', keywords: ['dance troupe', 'dance group', 'bollywood dancers'], isActive: true },
  
  { taxonomyId: 'wedding-dance-teacher', name: 'Wedding Dance Teacher', parentId: 'wedding-choreographers', type: 'service', keywords: ['dance teacher', 'sangeet teacher', 'dance trainer'], isActive: true },
  
  { taxonomyId: 'school-dance-performance', name: 'School Dance Performance', parentId: 'school-function-performers', type: 'service', keywords: ['school performance', 'kids dance', 'annual day performance'], isActive: true },
  
  { taxonomyId: 'hindu-wedding-pandit', name: 'Hindu Wedding Pandit', parentId: 'pandits-purohits', type: 'service', keywords: ['pandit', 'purohit', 'priest', 'pujari', 'shaadi pandit', 'vivah pandit'], isActive: true },
  { taxonomyId: 'griha-pravesh-pandit', name: 'Griha Pravesh Pandit', parentId: 'pandits-purohits', type: 'service', keywords: ['griha pravesh', 'house warming', 'puja pandit'], isActive: true },
  { taxonomyId: 'pooja-pandit', name: 'Pooja Pandit', parentId: 'pandits-purohits', type: 'service', keywords: ['pooja', 'puja', 'ritual pandit', 'ceremony pandit'], isActive: true },
  
  { taxonomyId: 'muslim-wedding-maulvi', name: 'Muslim Wedding Maulvi', parentId: 'maulvis', type: 'service', keywords: ['maulvi', 'qazi', 'nikah', 'muslim priest', 'imam'], isActive: true },
  
  { taxonomyId: 'christian-wedding-pastor', name: 'Christian Wedding Pastor', parentId: 'pastors', type: 'service', keywords: ['pastor', 'priest', 'christian wedding', 'church wedding'], isActive: true },
  
  { taxonomyId: 'sikh-wedding-granthi', name: 'Sikh Wedding Granthi', parentId: 'granthis', type: 'service', keywords: ['granthi', 'sikh priest', 'anand karaj', 'gurudwara wedding'], isActive: true },
  
  { taxonomyId: 'wedding-tent-rental', name: 'Wedding Tent Rental', parentId: 'tent-houses', type: 'service', keywords: ['tent', 'shamiana', 'pandal', 'canopy', 'tent house'], isActive: true },
  { taxonomyId: 'german-tent-rental', name: 'German Tent Rental', parentId: 'tent-houses', type: 'service', keywords: ['german tent', 'pagoda tent', 'luxury tent'], isActive: true },
  
  { taxonomyId: 'chair-table-rental', name: 'Chair and Table Rental', parentId: 'furniture-rentals', type: 'service', keywords: ['chairs', 'tables', 'furniture rental', 'seating', 'kursi mez'], isActive: true },
  { taxonomyId: 'sofa-rental', name: 'Sofa Rental', parentId: 'furniture-rentals', type: 'service', keywords: ['sofa', 'couch', 'lounge furniture'], isActive: true },
  
  { taxonomyId: 'dj-sound-system', name: 'DJ Sound System', parentId: 'sound-system-providers', type: 'service', keywords: ['sound system', 'speakers', 'audio system', 'dj equipment'], isActive: true },
  { taxonomyId: 'pa-system-rental', name: 'PA System Rental', parentId: 'sound-system-providers', type: 'service', keywords: ['pa system', 'public address', 'mike', 'microphone'], isActive: true },
  
  { taxonomyId: 'event-lighting-rental', name: 'Event Lighting Rental', parentId: 'lighting-rentals', type: 'service', keywords: ['lighting rental', 'lights', 'led lights', 'stage lights'], isActive: true },
  
  { taxonomyId: 'generator-rental-service', name: 'Generator Rental', parentId: 'generator-rentals', type: 'service', keywords: ['generator', 'genset', 'power backup', 'electricity'], isActive: true },
  
  { taxonomyId: 'vintage-car-rental', name: 'Vintage Car Rental', parentId: 'wedding-car-rentals', type: 'service', keywords: ['vintage car', 'classic car', 'wedding car', 'shaadi car', 'dulhan car'], isActive: true },
  { taxonomyId: 'luxury-car-wedding', name: 'Luxury Car for Wedding', parentId: 'wedding-car-rentals', type: 'service', keywords: ['luxury car', 'premium car', 'bmw', 'mercedes', 'audi'], isActive: true },
  
  { taxonomyId: 'tourist-bus-rental', name: 'Tourist Bus Rental', parentId: 'bus-rentals', type: 'service', keywords: ['bus', 'coach', 'tourist bus', 'party bus'], isActive: true },
  
  { taxonomyId: 'luxury-car-hire', name: 'Luxury Car Hire', parentId: 'luxury-cars', type: 'service', keywords: ['luxury hire', 'premium car hire', 'chauffeur car'], isActive: true },
  
  { taxonomyId: 'guest-pickup-drop', name: 'Guest Pickup and Drop', parentId: 'guest-transport', type: 'service', keywords: ['guest transport', 'pickup drop', 'shuttle service'], isActive: true },
  
  { taxonomyId: 'custom-wedding-cards', name: 'Custom Wedding Cards', parentId: 'wedding-card-designers', type: 'service', keywords: ['wedding card', 'shaadi card', 'invitation card', 'marriage card', 'vivah card'], isActive: true },
  { taxonomyId: 'designer-wedding-cards', name: 'Designer Wedding Cards', parentId: 'wedding-card-designers', type: 'service', keywords: ['designer card', 'premium card', 'luxury invitation'], isActive: true },
  
  { taxonomyId: 'invitation-printing', name: 'Invitation Printing', parentId: 'invitation-printers', type: 'service', keywords: ['card printing', 'invitation print', 'offset printing'], isActive: true },
  
  { taxonomyId: 'e-invitation-design', name: 'E-Invitation Design', parentId: 'digital-invite-designers', type: 'service', keywords: ['e-invite', 'digital invitation', 'whatsapp invitation', 'video invitation'], isActive: true },
  
  { taxonomyId: 'wedding-gift-hampers', name: 'Wedding Gift Hampers', parentId: 'wedding-gifts', type: 'service', keywords: ['gift hamper', 'wedding gift', 'shaadi gift'], isActive: true },
  
  { taxonomyId: 'corporate-gift-items', name: 'Corporate Gift Items', parentId: 'corporate-gifts', type: 'service', keywords: ['corporate gifts', 'office gifts', 'business gifts'], isActive: true },
  
  { taxonomyId: 'return-gift-for-guests', name: 'Return Gifts for Guests', parentId: 'return-gift-suppliers', type: 'service', keywords: ['return gift', 'guest gift', 'favor', 'party favor'], isActive: true },
  
  { taxonomyId: 'event-security-service', name: 'Event Security Service', parentId: 'event-security', type: 'service', keywords: ['security', 'security guard', 'event security', 'bouncers'], isActive: true },
  
  { taxonomyId: 'bouncer-service', name: 'Bouncer Service', parentId: 'bouncers', type: 'service', keywords: ['bouncer', 'security bouncer', 'bodyguard'], isActive: true },
  
  { taxonomyId: 'valet-parking-service', name: 'Valet Parking Service', parentId: 'valet-parking', type: 'service', keywords: ['valet', 'parking', 'car parking', 'parking attendant'], isActive: true },
  
  { taxonomyId: 'wedding-fireworks', name: 'Wedding Fireworks', parentId: 'fireworks', type: 'service', keywords: ['fireworks', 'patakhe', 'crackers', 'aatishbazi'], isActive: true },
  
  { taxonomyId: 'cold-pyro-machine', name: 'Cold Pyro Machine', parentId: 'cold-fire-machines', type: 'service', keywords: ['cold fire', 'cold pyro', 'safe fireworks', 'indoor fireworks'], isActive: true },
  
  { taxonomyId: 'fog-machine-rental', name: 'Fog Machine Rental', parentId: 'fog-machines', type: 'service', keywords: ['fog machine', 'smoke machine', 'mist effect'], isActive: true },
  
  { taxonomyId: 'red-carpet-service', name: 'Red Carpet Service', parentId: 'red-carpet-setup', type: 'service', keywords: ['red carpet', 'vip carpet', 'entrance carpet'], isActive: true },
  
  { taxonomyId: 'welcome-hostess', name: 'Welcome Hostess', parentId: 'welcome-staff', type: 'service', keywords: ['welcome staff', 'hostess', 'reception staff', 'ushers'], isActive: true },
  
  { taxonomyId: 'event-volunteer-staff', name: 'Event Volunteer Staff', parentId: 'event-volunteers', type: 'service', keywords: ['volunteers', 'event staff', 'helpers'], isActive: true },
  
  { taxonomyId: 'post-event-cleaning', name: 'Post Event Cleaning', parentId: 'cleaning-staff', type: 'service', keywords: ['cleaning staff', 'housekeeping', 'cleanup service'], isActive: true }
];

async function populate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Taxonomy.deleteMany({});

    await Taxonomy.insertMany(categories);
    await Taxonomy.insertMany(subcategories);
    await Taxonomy.insertMany(services);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

populate();
