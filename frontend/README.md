# FilterPanel Component Documentation

## Overview

A professional, feature-rich React filter panel component for event vendor discovery, built with Tailwind CSS and inspired by JustDial and WeddingWire UX patterns.

## Features

### ✨ Core Functionality
- **5 Main Event Categories**: Personal & Social, Corporate, Public & Entertainment, Religious & Cultural, Digital/Hybrid
- **Dynamic Sub-Services**: 12+ vendor categories that populate based on main category selection
- **Budget Range Control**: Dual input (slider + number fields) for flexible budget selection
- **Geolocation-Based Search**: Radius filter (1-50 km) from user location
- **Responsive Design**: Collapsible panel for mobile, always-visible on desktop
- **Real-time Filtering**: Instant callback to parent component with filter values

### 🎨 Design Highlights
- Clean, modern UI with subtle shadows and rounded corners
- Color-coded filter sections for visual hierarchy
- Smooth animations and transitions
- Professional gradient buttons
- Mobile-first responsive layout

## Installation

### 1. Install Dependencies

```bash
npm install lucide-react
# or
yarn add lucide-react
```

### 2. Ensure Tailwind CSS is configured

If not already set up, install Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to your `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Usage

### Basic Implementation

```jsx
import React, { useState } from 'react';
import FilterPanel from './components/FilterPanel';

function App() {
  const [userLocation, setUserLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060
  });

  const handleFilter = (filterData) => {
    console.log('Filter data:', filterData);
    // Make API call with filter data
    // filterData includes: mainCategory, subService, budgetMin, budgetMax, radius, latitude, longitude
  };

  return (
    <FilterPanel 
      onFilter={handleFilter}
      userLocation={userLocation}
    />
  );
}
```

### Complete Dashboard Example

See `Dashboard.jsx` for a full implementation with:
- Geolocation detection
- API integration
- Vendor results display
- Loading states
- Error handling

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onFilter` | Function | Yes | Callback function receiving filter values when search is triggered |
| `userLocation` | Object | No | User's current location `{ latitude, longitude }` |

### Filter Data Structure

The `onFilter` callback receives an object with the following structure:

```js
{
  mainCategory: "Personal & Social",
  subService: "Wedding & Pre-Wedding",
  vendorCategory: "Photography & Videography",
  budgetMin: 5000,
  budgetMax: 50000,
  radius: 15,
  latitude: 40.7128,
  longitude: -74.0060
}
```

## Event Categories Structure

### Main Categories (5 Buckets)

1. **Personal & Social**
   - Wedding & Pre-Wedding
   - Birthday Party
   - Anniversary
   - Engagement
   - Baby Shower
   - Reunion

2. **Corporate**
   - Corporate Meeting
   - Conference
   - Team Building
   - Product Launch
   - Award Ceremony
   - Trade Show

3. **Public & Entertainment**
   - Concert
   - Festival
   - Exhibition
   - Sports Event
   - Charity Event
   - Community Event

4. **Religious & Cultural**
   - Religious Ceremony
   - Cultural Festival
   - Temple Event
   - Church Event
   - Mosque Event
   - Traditional Celebration

5. **Digital/Hybrid**
   - Virtual Event
   - Webinar
   - Hybrid Conference
   - Online Workshop
   - Live Streaming Event
   - Digital Product Launch

### Vendor Categories (12 Services)

- All Services
- Catering
- Decoration
- Photography & Videography
- Entertainment & DJ
- Technical & AV Equipment
- Venue
- Event Planning
- Transportation
- Invitations & Printing
- Makeup & Styling
- Security Services
- Gift & Favors

## Customization

### Styling

The component uses Tailwind CSS classes. You can customize by:

1. **Modifying Colors**: Change color classes (e.g., `indigo-600` to `blue-600`)
2. **Adjusting Spacing**: Modify padding/margin classes
3. **Custom Animations**: Edit `FilterPanel.css` for animation tweaks

### Budget Range

Adjust default budget values:

```jsx
const [filters, setFilters] = useState({
  budgetMin: 10000,      // Change default min
  budgetMax: 200000,     // Change default max
  // ...
});
```

Change slider range:

```jsx
<input
  type="range"
  min="0"
  max="1000000"  // Adjust max budget
  step="10000"   // Adjust step size
  // ...
/>
```

### Radius Range

Modify search radius limits:

```jsx
<input
  type="range"
  min="1"
  max="100"  // Increase max radius
  value={filters.radius}
  // ...
/>
```

## API Integration Example

```jsx
const handleFilter = async (filterData) => {
  try {
    const params = new URLSearchParams({
      latitude: filterData.latitude,
      longitude: filterData.longitude,
      radius: filterData.radius,
      budgetMin: filterData.budgetMin,
      budgetMax: filterData.budgetMax,
      eventType: filterData.subService
    });

    const response = await fetch(
      `http://localhost:5000/api/vendors/search?${params}`
    );
    const data = await response.json();
    
    console.log('Vendors found:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Responsive Behavior

- **Desktop (≥768px)**: Panel always visible, sticky positioning
- **Mobile (<768px)**: Collapsible panel with toggle button
- **Tablet**: Smooth transitions between layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 16.8+ (hooks support required)
- lucide-react (for icons)
- Tailwind CSS 3.0+

## Performance Tips

1. Use `React.memo()` if filter panel doesn't need frequent re-renders
2. Debounce search calls if implementing live filtering
3. Consider virtualizing vendor results for large datasets

## Accessibility

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators on inputs

## License

MIT

## Support

For issues or questions, please refer to the main project documentation.
