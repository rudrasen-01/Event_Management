# Live Search Autocomplete - Implementation Guide

## 🎯 Overview

Production-ready live search autocomplete system for your event marketplace with:
- ✅ Real-time suggestions as user types
- ✅ Searches Categories, Subcategories & Services
- ✅ Includes keyword matching (e.g., "cameraman" → "photographer")
- ✅ Debounced API calls (300ms)
- ✅ In-memory caching (5 min TTL)
- ✅ Intelligent highlighting of matches
- ✅ Keyboard navigation (↑↓ arrows, Enter, Esc)
- ✅ Mobile-friendly & accessible (ARIA)
- ✅ Edge case handling (empty, loading, errors)

---

## 📦 What Was Added

### Backend Enhancements

**File: `backend/services/searchNormalizationService.js`**
- Enhanced `getSearchSuggestions()` function
- Returns up to 12 suggestions (configurable)
- Includes matched keywords for highlighting
- Prevents duplicate suggestions
- Better scoring algorithm

**File: `backend/controllers/searchController.js`**
- Updated `getSearchSuggestions` endpoint
- Accepts `limit` query parameter
- Returns query string for frontend validation

### Frontend Components

**File: `frontend/src/components/SearchAutocomplete.jsx`** (NEW)
- Complete autocomplete component
- Debouncing, caching, highlighting
- Keyboard navigation
- Accessible (ARIA labels)

**File: `frontend/src/services/autocompleteService.js`** (NEW)
- API communication layer
- Request cancellation (AbortController)
- In-memory caching (5 min TTL)
- Error handling

---

## 🚀 Quick Start Usage

### Basic Example

```jsx
import SearchAutocomplete from '../components/SearchAutocomplete';

function MySearchPage() {
  const handleSelect = (suggestion) => {
    console.log('Selected:', suggestion);
    // Navigate to search results or filter page
    // suggestion = {
    //   type: 'service',
    //   taxonomyId: 'wedding-photographer',
    //   label: 'Wedding Photographer',
    //   icon: '📸',
    //   score: 95,
    //   matchedKeyword: 'photographer'
    // }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Find Event Services</h1>
      
      <SearchAutocomplete
        onSelect={handleSelect}
        placeholder="Search for photographers, venues, caterers..."
      />
    </div>
  );
}
```

### Advanced Example with Navigation

```jsx
import { useNavigate } from 'react-router-dom';
import SearchAutocomplete from '../components/SearchAutocomplete';

function SearchBar() {
  const navigate = useNavigate();

  const handleSelect = (suggestion) => {
    // Navigate to search results with selected taxonomy ID
    navigate(`/search?type=${suggestion.type}&id=${suggestion.taxonomyId}&q=${suggestion.label}`);
  };

  const handleInputChange = (value) => {
    console.log('User typing:', value);
    // Optional: Update URL query params or analytics
  };

  return (
    <SearchAutocomplete
      onSelect={handleSelect}
      onInputChange={handleInputChange}
      placeholder="Search for services..."
      debounceMs={300}
      minChars={1}
      maxSuggestions={15}
      autoFocus={true}
    />
  );
}
```

### Integration with Existing Search Page

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchAutocomplete from '../components/SearchAutocomplete';

function EventSearch() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  const handleAutocompleteSelect = (suggestion) => {
    setSelectedService(suggestion);
    
    // Option 1: Navigate to results immediately
    navigate(`/vendors?service=${suggestion.taxonomyId}`);
    
    // Option 2: Update filter state and show results below
    // setFilters({ serviceId: suggestion.taxonomyId });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-2xl">
        <h1 className="text-4xl font-bold text-white mb-6">
          Find Your Perfect Event Service
        </h1>
        
        {/* Autocomplete Search */}
        <SearchAutocomplete
          onSelect={handleAutocompleteSelect}
          placeholder="Try 'wedding photographer', 'DJ', 'banquet hall'..."
          className="max-w-3xl"
          showIcon={true}
        />

        {/* Selected Service Display */}
        {selectedService && (
          <div className="mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
            <span className="text-white text-sm">
              Selected: {selectedService.icon} {selectedService.label}
            </span>
          </div>
        )}
      </div>

      {/* Rest of your search page */}
    </div>
  );
}
```

---

## 🎛️ Component Props

### SearchAutocomplete Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `function` | - | Callback when suggestion is selected. Receives suggestion object. |
| `onInputChange` | `function` | - | Optional callback when input changes. Receives current value. |
| `placeholder` | `string` | `'Search for event services...'` | Input placeholder text |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `minChars` | `number` | `1` | Minimum characters before searching |
| `maxSuggestions` | `number` | `12` | Maximum suggestions to display |
| `className` | `string` | `''` | Additional CSS classes for container |
| `showIcon` | `boolean` | `true` | Show search icon in input |
| `autoFocus` | `boolean` | `false` | Auto-focus input on mount |

### Suggestion Object Structure

```typescript
{
  type: 'service' | 'subcategory' | 'category',
  id: string,              // Same as taxonomyId
  taxonomyId: string,      // e.g., 'wedding-photographer'
  label: string,           // Display name: 'Wedding Photographer'
  icon: string,            // Emoji: '📸'
  score: number,           // Relevance score: 0-100
  matchedKeyword: string | null,  // e.g., 'cameraman'
  parentId: string | null  // Parent taxonomy ID
}
```

---

## 🔌 API Endpoint

### Backend Endpoint

```
GET /api/search/suggestions?q={query}&limit={limit}
```

**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Max suggestions (default: 12)

**Response:**
```json
{
  "success": true,
  "query": "photographer",
  "count": 4,
  "data": [
    {
      "type": "service",
      "id": "wedding-photographer",
      "taxonomyId": "wedding-photographer",
      "label": "Wedding Photographer",
      "icon": "📸",
      "score": 95,
      "matchedKeyword": "photographer",
      "parentId": "wedding-photographers"
    },
    {
      "type": "service",
      "id": "drone-photographer",
      "taxonomyId": "drone-photographer",
      "label": "Drone Photography",
      "icon": "🚁",
      "score": 85,
      "matchedKeyword": "photographer",
      "parentId": "wedding-photographers"
    }
  ]
}
```

---

## 🎨 Styling Customization

### Tailwind CSS (Default)

The component uses Tailwind CSS classes. To customize:

```jsx
<SearchAutocomplete
  className="my-custom-class"
  // Override internal styles via CSS
/>
```

### Custom CSS Example

```css
/* styles/autocomplete-custom.css */

/* Input styling */
.search-autocomplete input {
  border-radius: 12px;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

/* Dropdown styling */
.search-autocomplete [role="listbox"] {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Suggestion hover */
.search-autocomplete [role="option"]:hover {
  background: linear-gradient(to right, #e3f2fd, #f3e5f5);
}

/* Highlight color */
.search-autocomplete mark {
  background-color: #ffeb3b;
  color: #000;
  font-weight: 600;
}
```

---

## ⚡ Performance Optimization

### 1. Caching Strategy

The service automatically caches results for 5 minutes:

```javascript
import { clearAutocompleteCache } from '../services/autocompleteService';

// Clear cache when taxonomy updates
function onTaxonomyUpdate() {
  clearAutocompleteCache();
}
```

### 2. Debouncing

Already implemented (300ms default). Adjust as needed:

```jsx
<SearchAutocomplete
  debounceMs={500}  // Wait 500ms after user stops typing
/>
```

### 3. Request Cancellation

Automatically cancels previous API calls when user types quickly.

### 4. Lazy Loading

Only show suggestions when input has focus:

```jsx
const [showSearch, setShowSearch] = useState(false);

{showSearch && (
  <SearchAutocomplete onSelect={handleSelect} />
)}
```

---

## 🧪 Testing the Feature

### 1. Start Backend Server

```bash
cd backend
npm start
```

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

### 3. Test Scenarios

**Basic Search:**
- Type "photographer" → Should show photography services
- Type "dj" → Should show DJ services
- Type "banquet" → Should show banquet halls

**Keyword Matching:**
- Type "cameraman" → Should match "photographer" (via keywords)
- Type "shaadi" → Should match "wedding" services (via keywords)
- Type "mehendi" → Should match "Mehendi Artist" (via keywords)

**Edge Cases:**
- Empty input → No dropdown
- Random text "xyz123" → "No results found" message
- Very fast typing → Only one API call made (debounced)
- Click outside → Dropdown closes
- Press Escape → Clears input

**Keyboard Navigation:**
- Type "photo" → Press ↓ arrow → Should highlight first result
- Press ↓ again → Should move to next result
- Press Enter → Should select highlighted result
- Press Escape → Should close dropdown

---

## 🐛 Troubleshooting

### Issue: No suggestions appearing

**Check:**
1. Backend server is running on correct port
2. `VITE_API_URL` is set correctly in `.env`
3. Taxonomy data exists in database (`node dev-tools/populate-taxonomy.js`)
4. Browser console for errors

**Fix:**
```bash
# Populate taxonomy if empty
cd backend
node dev-tools/populate-taxonomy.js

# Check environment variable
echo $VITE_API_URL  # Should be http://localhost:5000/api
```

### Issue: Slow performance

**Solutions:**
1. Increase debounce time: `debounceMs={500}`
2. Reduce max suggestions: `maxSuggestions={8}`
3. Add backend caching (Redis recommended)
4. Create database indexes:

```javascript
// In backend/models/Taxonomy.js
taxonomySchema.index({ name: 'text', keywords: 'text' });
```

### Issue: CORS errors

**Fix in backend/server.js:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

## 📊 Database Indexes (Production Optimization)

Add these indexes to MongoDB for better performance:

```javascript
// In MongoDB shell or via Mongoose
db.taxonomies.createIndex({ name: "text", keywords: "text" });
db.taxonomies.createIndex({ type: 1, isActive: 1 });
db.taxonomies.createIndex({ keywords: 1 });
db.taxonomies.createIndex({ type: 1, parentId: 1 });
```

Or via Mongoose migration:

```javascript
// backend/scripts/add-search-indexes.js
const mongoose = require('mongoose');
const Taxonomy = require('../models/Taxonomy');

async function addIndexes() {
  await Taxonomy.collection.createIndex({ name: 'text', keywords: 'text' });
  await Taxonomy.collection.createIndex({ type: 1, isActive: 1 });
  await Taxonomy.collection.createIndex({ keywords: 1 });
  console.log('Indexes created successfully');
  process.exit(0);
}

addIndexes();
```

---

## 🎯 Next Steps

1. **Add to Main Search Page:**
   - Replace current search input in `EventSearch.jsx`
   - Integrate with existing filter system

2. **Add to Header:**
   - Show autocomplete in navbar for quick access
   - Make it collapsible on mobile

3. **Analytics Integration:**
   ```jsx
   const handleSelect = (suggestion) => {
     // Track search selection
     analytics.track('autocomplete_select', {
       query: suggestion.label,
       type: suggestion.type,
       taxonomyId: suggestion.taxonomyId
     });
   };
   ```

4. **Recent Searches:**
   - Store recent searches in localStorage
   - Show them when input is empty

5. **Popular Searches:**
   - Create backend endpoint for trending searches
   - Show as default suggestions

---

## 📚 API Reference

### Frontend Service Functions

```javascript
import { 
  fetchAutocomplete, 
  clearAutocompleteCache, 
  getCacheStats 
} from './services/autocompleteService';

// Fetch suggestions
const results = await fetchAutocomplete('photographer', 10);

// Clear cache (e.g., after taxonomy update)
clearAutocompleteCache();

// Debug cache
console.log(getCacheStats());
// { size: 5, entries: ['autocomplete:photo:12', ...] }
```

### Backend Service Functions

```javascript
const { getSearchSuggestions } = require('./services/searchNormalizationService');

// Get suggestions (in controller)
const suggestions = await getSearchSuggestions('photographer', 12);
```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check backend server logs
4. Verify taxonomy data exists in database

---

**✅ Implementation Complete!**

Your live search autocomplete is now ready to use. Import `SearchAutocomplete` component and start using it in your pages!
