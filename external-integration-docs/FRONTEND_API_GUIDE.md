# Medication Search Gateway - Frontend Integration Guide

**API Base URL**: `https://api.invictushealth.tech/catalog/gateway`  
**Version**: 1.0.0  
**Last Updated**: November 17, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What You Can Build](#what-you-can-build)
3. [Core Features](#core-features)
4. [API Endpoints](#api-endpoints)
5. [Common UI Patterns](#common-ui-patterns)
6. [Request Examples](#request-examples)
7. [Response Structure](#response-structure)
8. [Displaying Results](#displaying-results)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Design Considerations](#design-considerations)

---

## Overview

The Medication Search Gateway is a unified API that searches multiple pharmacy providers (Pharmaplus, MyDawa) and returns aggregated medication results with pricing, availability, and location data.

**Key Benefits:**
- 🔍 **One API call** searches multiple pharmacies
- 💰 **Compare prices** across providers instantly
- 📍 **Find nearby stores** with distance calculations
- 🖼️ **Product images & links** ready for display
- ⚡ **Pre-ranked results** by relevance

**No API Key Required** - The service is publicly accessible.

---

## What You Can Build

### 1. **Medication Search Interface**
```
┌─────────────────────────────────────┐
│  Search: [Panadol 500mg        ] 🔍│
│  Quantity: [10] tablets             │
│  📍 Use my location                 │
└─────────────────────────────────────┘
```

### 2. **Price Comparison Cards**
```
╔═══════════════════════════════════╗
║ Panadol Advance 500mg Tablets     ║
║ [Product Image]                   ║
║ KES 550 (16 tablets)              ║
║ Unit Price: KES 34.38/tablet      ║
║ Provider: Pharmaplus              ║
║ Status: ✅ In Stock               ║
║ [View Product] [Find Store]       ║
╚═══════════════════════════════════╝
```

### 3. **Store Locator Map**
```
┌─────────────────────────────────────┐
│  📍 Your Location                   │
│  🏪 Shell Hillview - 2.08 km       │
│  🏪 Rubis Ojijo - 2.25 km          │
│  🏪 Nairobi West - 2.50 km         │
│                                     │
│  [Show on Map]                      │
└─────────────────────────────────────┘
```

### 4. **Prescription Cart**
Users can search multiple medications at once:
```
┌─────────────────────────────────────┐
│ Your Prescriptions:                 │
│ • Panadol - KES 550                │
│ • Amlodipine 5mg - KES 185          │
│ • Metformin 500mg - KES 320         │
│                                     │
│ Total: KES 1,055                    │
│ [Find Nearest Pharmacy]             │
└─────────────────────────────────────┘
```

---

## Advanced Features & Use Cases

The batch search with location context opens up powerful possibilities for your frontend application:

### 💊 **Prescription Management**
**Feature**: "Fill all my prescriptions at one pharmacy"

**User Flow:**
1. User uploads or enters their prescription list
2. App searches all medications with user's location
3. Display pharmacies that have ALL medications in stock
4. Show total cost per pharmacy
5. One-click navigation to chosen pharmacy

**Value Proposition:**
- Save time by visiting only one pharmacy
- Avoid "out of stock" surprises
- See complete prescription cost upfront

**UI Idea:**
```
┌─────────────────────────────────────┐
│ Your Prescriptions (3 items)        │
│                                     │
│ ✅ Complete at Shell Hillview       │
│    📍 2.08 km away                  │
│    💰 Total: KES 1,055              │
│    [Get Directions]                 │
│                                     │
│ ✅ Complete at Rubis Ojijo          │
│    📍 2.25 km away                  │
│    💰 Total: KES 1,120              │
│    [Get Directions]                 │
│                                     │
│ ⚠️ Partially available at 5 others  │
│    [Show All Options]               │
└─────────────────────────────────────┘
```

---

### 🗺️ **Smart Pharmacy Finder**
**Feature**: Find the closest pharmacy with everything in stock

**User Flow:**
1. Enter medication list
2. Enable location services
3. App finds pharmacies sorted by distance
4. Filter by "has all items" or "closest match"
5. Interactive map showing results

**Value Proposition:**
- Minimize travel distance
- Real-time stock availability
- See what's available nearby before leaving home

**UI Idea:**
```
┌─────────────────────────────────────┐
│        📍 Interactive Map           │
│  [Map showing pharmacy pins]        │
│                                     │
│  🟢 Has everything (3 pharmacies)   │
│  🟡 Has most items (8 pharmacies)   │
│  🔴 Has some items (12 pharmacies)  │
│                                     │
│  Filter by:                         │
│  ☑️ Complete stock only             │
│  ☑️ Within 5km                      │
│  ☐ Open now                         │
└─────────────────────────────────────┘
```

---

### 💰 **Cost Optimization & Comparison**
**Feature**: Compare total costs across different locations

**User Flow:**
1. Search prescription list
2. View cost breakdown per pharmacy
3. See savings comparison
4. Factor in travel distance vs. savings
5. Make informed decision

**Value Proposition:**
- Save money on prescriptions
- Transparent pricing comparison
- Balance cost vs. convenience (distance)

**UI Idea:**
```
┌─────────────────────────────────────┐
│ Best Value Analysis                 │
│                                     │
│ 💰 Cheapest Option:                 │
│    Nairobi West - KES 1,095         │
│    📍 2.50 km away                  │
│    Save KES 55 vs nearest           │
│                                     │
│ ⚡ Nearest Option:                  │
│    Shell Hillview - KES 1,150       │
│    📍 2.08 km away                  │
│    0.4km closer • +KES 55           │
│                                     │
│ Price Breakdown:                    │
│ • Panadol: KES 550 - 650           │
│ • Amlodipine: KES 185 - 240        │
│ • Metformin: KES 320 - 380          │
│                                     │
│ [Show All Comparisons]              │
└─────────────────────────────────────┘
```

---

### 🔔 **Smart Notifications & Alerts**
**Feature**: Notify users when better options become available

**Implementation Ideas:**
- **Stock Alerts**: "Amlodipine now in stock at your nearest pharmacy"
- **Price Drops**: "Panadol price reduced by 15% at Pharmaplus stores"
- **Distance-Based**: "You're near a pharmacy with your prescription items"

---

### 📊 **Prescription Analytics Dashboard**
**Feature**: Help users track medication costs over time

**Possibilities:**
- Monthly medication spending trends
- Price history charts per medication
- Preferred pharmacy recommendations based on history
- Refill reminders based on quantity purchased

**UI Idea:**
```
┌─────────────────────────────────────┐
│ Your Medication Insights            │
│                                     │
│ This Month: KES 3,450               │
│ ↓ 12% vs last month                │
│                                     │
│ [Cost Trend Chart]                  │
│                                     │
│ Top Savings:                        │
│ • Switched to Shell Hillview        │
│   Saved KES 420 this month          │
│                                     │
│ Upcoming Refills:                   │
│ • Amlodipine (5 days)               │
│ • Metformin (12 days)               │
│   [Set Reminders]                   │
└─────────────────────────────────────┘
```

---

### 👨‍⚕️ **Doctor Integration**
**Feature**: Doctors can see real-time availability and pricing

**Use Case:**
When prescribing medication, doctors can:
- Check if medication is available nearby
- See pricing to consider affordability
- Suggest alternatives if stock is low
- Print prescription with pharmacy recommendations

---

### 🏥 **Pharmacy Route Optimizer**
**Feature**: Plan optimal route to fill complex prescriptions

**For Cases Where No Single Pharmacy Has Everything:**
1. Calculate best 2-3 pharmacy combination
2. Optimize route to minimize total distance
3. Show estimated travel time and total cost
4. Generate shopping list per pharmacy

**UI Idea:**
```
┌─────────────────────────────────────┐
│ Optimized Pharmacy Route            │
│                                     │
│ Visit 2 pharmacies • 4.5 km total   │
│                                     │
│ 1️⃣ Shell Hillview (2.08 km)        │
│    ✓ Panadol                        │
│    ✓ Amlodipine                     │
│    Subtotal: KES 735                │
│    [Navigate]                       │
│         ↓ 2.4 km (8 min drive)     │
│                                     │
│ 2️⃣ Rubis Ojijo (2.25 km from you)  │
│    ✓ Metformin                      │
│    ✓ Ibuprofen                      │
│    Subtotal: KES 420                │
│    [Navigate]                       │
│                                     │
│ Total: KES 1,155 • 15 min total    │
│ [Start Route]                       │
└─────────────────────────────────────┘
```

---

### 🤖 **AI-Powered Recommendations**
**Feature**: Intelligent suggestions based on user behavior

**Possibilities:**
- "Based on your prescriptions, you might also need..."
- "Users with similar prescriptions also bought..."
- "Generic alternative available for 40% less"
- "This pharmacy usually has better stock of your medications"

---

### 📱 **Mobile App Features**

**Background Location Updates:**
- Receive notifications when passing near pharmacies with your medications

**QR Code Generation:**
- Generate prescription QR code
- Pharmacist scans to see full list
- Faster checkout process

**Voice Search:**
- "Hey app, where can I get Panadol within 5 kilometers?"
- Accessibility for elderly users

---

### 💡 **Feature Priority Recommendations**

**Phase 1 (MVP):**
1. ✅ Basic medication search
2. ✅ Location-based pharmacy finder
3. ✅ Price comparison cards

**Phase 2 (Enhanced):**
1. 💊 Prescription management (batch search with location)
2. 🗺️ Interactive map with pharmacy markers
3. 💰 Cost optimization comparison

**Phase 3 (Advanced):**
1. 🔔 Stock alerts and notifications
2. 📊 Spending analytics dashboard
3. 🏥 Multi-pharmacy route optimizer

**Phase 4 (Innovation):**
1. 🤖 AI recommendations
2. 👨‍⚕️ Doctor portal integration
3. 📱 Voice search and QR codes

---

## Core Features

### ✅ Available Features

1. **Basic Medication Search**
   - Search by medication name (brand or generic)
   - Search by strength (e.g., "100mg", "5mg")
   - Search by form (tablets, syrup, capsules, etc.)

2. **Location-Based Search**
   - Find pharmacies near user's location
   - See distance to each store
   - Filter by maximum distance radius

3. **Batch Search**
   - Search multiple medications in one request
   - Perfect for prescription lists
   - Shared location for all medications

4. **Rich Product Data**
   - Product images for visual display
   - Direct links to pharmacy websites
   - Detailed pricing (unit & pack prices)
   - Stock availability status

5. **Smart Ranking**
   - Results automatically ranked by relevance
   - Exact matches appear first
   - Generic alternatives included

---

## API Endpoints

### 1. Search Single Medication

**Endpoint**: `GET /v1/search`

**Use Cases:**
- User searches for a specific medication
- Quick price comparison
- Find nearest pharmacy with stock

**Parameters:**

| Parameter | Required | Type | Description | Example |
|-----------|----------|------|-------------|---------|
| `q` | ✅ Yes | string | Search query | `"Panadol"`, `"Amlodipine 5mg"` |
| `quantity` | ❌ No | number | Quantity needed | `30` |
| `latitude` | ❌ No | number | User's latitude | `-1.286389` |
| `longitude` | ❌ No | number | User's longitude | `36.817223` |
| `max_distance_km` | ❌ No | number | Maximum distance (km) | `5`, `10` |

---

### 2. Search Multiple Medications

**Endpoint**: `POST /v1/batch-search`

**Use Cases:**
- User has a prescription with multiple medications
- Compare total cost at different pharmacies
- Find one pharmacy that has everything in stock

**Request Format**: JSON body (two formats supported)

---

### 3. Health Check

**Endpoint**: `GET /v1/health`

**Use Cases:**
- Check if API is online
- Monitor service availability
- Implement retry logic

---

## Common UI Patterns

### Pattern 1: Simple Search Form

**UI Components:**
- Text input for medication name
- Optional quantity input (number)
- Search button

**Example:**
```html
<form>
  <input type="text" placeholder="Search medication..." name="q" required />
  <input type="number" placeholder="Quantity (optional)" name="quantity" />
  <button type="submit">Search</button>
</form>
```

**API Call:**
```javascript
const searchMedication = async (query, quantity) => {
  const url = new URL('https://api.invictushealth.tech/catalog/gateway/v1/search');
  url.searchParams.append('q', query);
  if (quantity) url.searchParams.append('quantity', quantity);
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
```

---

### Pattern 2: Location-Based Search

**UI Components:**
- Search input
- "Use my location" checkbox/button
- Distance filter dropdown (5km, 10km, 20km)
- Map view toggle

**Getting User Location:**
```javascript
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => reject(error.message)
    );
  });
};
```

**API Call with Location:**
```javascript
const searchNearby = async (query, location, maxDistance = 10) => {
  const url = new URL('https://api.invictushealth.tech/catalog/gateway/v1/search');
  url.searchParams.append('q', query);
  url.searchParams.append('latitude', location.latitude);
  url.searchParams.append('longitude', location.longitude);
  url.searchParams.append('max_distance_km', maxDistance);
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
```

---

### Pattern 3: Prescription Cart (Batch Search)

**UI Components:**
- List of medications in cart
- Shared location toggle
- "Find Pharmacy" button

**API Call:**
```javascript
const searchPrescription = async (medications, userLocation) => {
  const response = await fetch(
    'https://api.invictushealth.tech/catalog/gateway/v1/batch-search',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queries: medications.map(med => ({ 
          q: med.name, 
          quantity: med.quantity 
        })),
        context: userLocation ? {
          user_location: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          max_distance_km: 10
        } : undefined
      })
    }
  );
  
  const data = await response.json();
  return data;
};
```

---

## Request Examples

### Example 1: Basic Search

```javascript
// Search for Panadol
fetch('https://api.invictushealth.tech/catalog/gateway/v1/search?q=Panadol')
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.results.length} products`);
    data.results.forEach(product => {
      console.log(`${product.product_name} - KES ${product.pack_price}`);
    });
  });
```

### Example 2: Search with Location

```javascript
// Find Panadol within 5km
const params = new URLSearchParams({
  q: 'Panadol',
  latitude: -1.286389,
  longitude: 36.817223,
  max_distance_km: 5
});

fetch(`https://api.invictushealth.tech/catalog/gateway/v1/search?${params}`)
  .then(res => res.json())
  .then(data => {
    data.results.forEach(product => {
      if (product.stores && product.stores.length > 0) {
        console.log(`${product.product_name} available at:`);
        product.stores.forEach(store => {
          console.log(`  - ${store.store_name} (${store.distance_km}km away)`);
        });
      }
    });
  });
```

### Example 3: Batch Search (No Location)

```javascript
// Search for multiple medications
const prescriptionList = {
  queries: [
    { q: 'Panadol', quantity: 10 },
    { q: 'Amlodipine 5mg', quantity: 30 },
    { q: 'Metformin 500mg', quantity: 60 }
  ]
};

fetch('https://api.invictushealth.tech/catalog/gateway/v1/batch-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prescriptionList)
})
  .then(res => res.json())
  .then(data => {
    Object.keys(data.results).forEach(medicationName => {
      const medication = data.results[medicationName];
      console.log(`${medicationName}: ${medication.results.length} options found`);
    });
  });
```

### Example 4: Batch Search with Location Context

```javascript
// Search multiple medications with shared location
// Perfect for "Find pharmacy with all my prescriptions nearby"
const prescriptionWithLocation = {
  context: {
    user_location: {
      latitude: -1.286389,
      longitude: 36.817223
    },
    max_distance_km: 10,
    search_mode: 'nearest_pharmacies',
    sort_by: 'distance'
  },
  searches: [
    { medication_name: 'Panadol', quantity: 10 },
    { medication_name: 'Amlodipine 5mg', quantity: 30 },
    { medication_name: 'Metformin 500mg', quantity: 60 }
  ]
};

fetch('https://api.invictushealth.tech/catalog/gateway/v1/batch-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prescriptionWithLocation)
})
  .then(res => res.json())
  .then(data => {
    // Find pharmacies that have ALL medications
    const allStores = new Map(); // store_id -> {store, medications[]}
    
    Object.keys(data.results).forEach(medicationName => {
      const medication = data.results[medicationName];
      
      medication.results.forEach(product => {
        if (product.stores) {
          product.stores.forEach(store => {
            if (!allStores.has(store.store_id)) {
              allStores.set(store.store_id, {
                store: store,
                medications: []
              });
            }
            allStores.get(store.store_id).medications.push({
              name: medicationName,
              product: product.product_name,
              price: product.pack_price
            });
          });
        }
      });
    });
    
    // Find stores with all medications
    const numMedications = Object.keys(data.results).length;
    const completeStores = Array.from(allStores.values())
      .filter(s => s.medications.length === numMedications)
      .sort((a, b) => a.store.distance_km - b.store.distance_km);
    
    if (completeStores.length > 0) {
      console.log(`Found ${completeStores.length} pharmacies with all medications:`);
      completeStores.forEach(s => {
        const totalCost = s.medications.reduce((sum, m) => sum + m.price, 0);
        console.log(`- ${s.store.store_name} (${s.store.distance_km.toFixed(1)}km) - Total: KES ${totalCost}`);
      });
    } else {
      console.log('No single pharmacy has all medications. Showing closest options...');
    }
  });
```

---

## Response Structure

### Single Search Response

```javascript
{
  "query": "Panadol",              // Your search query
  "quantity_requested": 10,        // Quantity you requested (optional)
  "results": [                     // Array of medications
    {
      // Provider info
      "provider": "pharmaplus",    // "pharmaplus" or "mydawa"
      
      // Product details
      "product_name": "Panadol Advance 500mg Tablets 16's",
      "brand_name": "Panadol",
      "generic_name": "Paracetamol",
      "strength": "500mg",
      "strength_mg": 500,
      "dosage_form": "tablet",     // tablet, capsule, syrup, etc.
      
      // Pricing
      "pack_price": 550,           // Price for entire pack (KES)
      "pack_size": 16,             // Number of units in pack
      "unit_price": 34.38,         // Price per single unit (KES)
      "min_purchase_quantity": 16, // Minimum quantity to buy
      "supports_unit_purchase": false,
      
      // Availability
      "availability": "in_stock",  // "in_stock", "out_of_stock", "limited"
      
      // URLs for UI
      "product_url": "https://shop.pharmaplus.co.ke/products/...",
      "image_url": "https://api.pharmaplus.co.ke/images/...",
      
      // Location data (if location provided in request)
      "stores": [
        {
          "store_id": "HILLVIEW",
          "store_name": "Shell Hillview",
          "latitude": -1.2677,
          "longitude": 36.81737,
          "phone": "0725231507",
          "email": "hillview@pharmaplus.co.ke",
          "opening_hours": "08:00:00",
          "closing_hours": "22:00:00",
          "in_stock_quantity": 15,
          "distance_km": 2.08        // Distance from user
        }
      ],
      
      // Relevance score (0-1, higher is better match)
      "relevance_score": 0.95
    }
  ],
  "errors": []                     // Provider errors (usually empty)
}
```

### Batch Search Response

```javascript
{
  "results": {
    "Panadol": {                   // Key is the medication name you searched
      "query": "Panadol",
      "results": [/* array of products */],
      "errors": []
    },
    "Amlodipine 5mg": {
      "query": "Amlodipine 5mg",
      "results": [/* array of products */],
      "errors": []
    }
  }
}
```

---

## Displaying Results

### Product Card Component (React Example)

```jsx
const MedicationCard = ({ medication }) => {
  return (
    <div className="medication-card">
      {/* Product Image */}
      <img 
        src={medication.image_url || '/placeholder.png'} 
        alt={medication.product_name}
        onError={(e) => e.target.src = '/placeholder.png'}
      />
      
      {/* Product Name */}
      <h3>{medication.product_name}</h3>
      
      {/* Brand & Generic */}
      <p className="brand">{medication.brand_name}</p>
      {medication.generic_name && (
        <p className="generic">({medication.generic_name})</p>
      )}
      
      {/* Pricing */}
      <div className="pricing">
        <p className="pack-price">
          KES {medication.pack_price.toFixed(2)}
          <span className="pack-size">({medication.pack_size} units)</span>
        </p>
        <p className="unit-price">
          KES {medication.unit_price.toFixed(2)} per unit
        </p>
      </div>
      
      {/* Availability Badge */}
      <span className={`badge ${medication.availability}`}>
        {medication.availability === 'in_stock' ? '✅ In Stock' : 
         medication.availability === 'limited' ? '⚠️ Limited Stock' : 
         '❌ Out of Stock'}
      </span>
      
      {/* Provider */}
      <p className="provider">
        Sold by: {medication.provider}
      </p>
      
      {/* Action Buttons */}
      <div className="actions">
        {medication.product_url && (
          <a href={medication.product_url} target="_blank" rel="noopener noreferrer">
            View Product
          </a>
        )}
        {medication.stores && medication.stores.length > 0 && (
          <button onClick={() => showStoreLocations(medication.stores)}>
            Find Store ({medication.stores.length})
          </button>
        )}
      </div>
    </div>
  );
};
```

### Store List Component

```jsx
const StoreList = ({ stores }) => {
  // Sort by distance
  const sortedStores = [...stores].sort((a, b) => 
    (a.distance_km || Infinity) - (b.distance_km || Infinity)
  );
  
  return (
    <div className="store-list">
      <h4>Available at {stores.length} stores:</h4>
      {sortedStores.map(store => (
        <div key={store.store_id} className="store-item">
          <div className="store-info">
            <h5>{store.store_name}</h5>
            {store.distance_km && (
              <span className="distance">📍 {store.distance_km.toFixed(1)} km away</span>
            )}
          </div>
          
          <div className="store-details">
            {store.phone && <p>📞 {store.phone}</p>}
            {store.opening_hours && (
              <p>🕒 Open: {store.opening_hours} - {store.closing_hours}</p>
            )}
            <p>In Stock: {store.in_stock_quantity} units</p>
          </div>
          
          <a 
            href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
        </div>
      ))}
    </div>
  );
};
```

### Comparison Table

```jsx
const PriceComparisonTable = ({ medications }) => {
  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Provider</th>
          <th>Pack Size</th>
          <th>Pack Price</th>
          <th>Unit Price</th>
          <th>Availability</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {medications.map((med, index) => (
          <tr key={index}>
            <td>
              {med.image_url && (
                <img src={med.image_url} alt="" width="40" height="40" />
              )}
              <span>{med.product_name}</span>
            </td>
            <td>{med.provider}</td>
            <td>{med.pack_size} units</td>
            <td>KES {med.pack_price.toFixed(2)}</td>
            <td>KES {med.unit_price.toFixed(2)}</td>
            <td>
              <span className={`status ${med.availability}`}>
                {med.availability}
              </span>
            </td>
            <td>
              {med.product_url && (
                <a href={med.product_url}>View</a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Error Handling

### Response Validation

```javascript
const searchMedication = async (query) => {
  try {
    const response = await fetch(
      `https://api.invictushealth.tech/catalog/gateway/v1/search?q=${query}`
    );
    
    // Check HTTP status
    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(`Invalid request: ${error.details?.[0]?.message || error.error}`);
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for results
    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        message: 'No medications found. Try different search terms.',
        results: []
      };
    }
    
    // Check for partial failures
    if (data.errors && data.errors.length > 0) {
      console.warn('Some providers failed:', data.errors);
      // Still show results from successful providers
    }
    
    return {
      success: true,
      results: data.results,
      query: data.query
    };
    
  } catch (error) {
    console.error('Search failed:', error);
    return {
      success: false,
      message: error.message || 'Search failed. Please try again.',
      results: []
    };
  }
};
```

### User-Facing Error Messages

| Error | User Message | Action |
|-------|-------------|--------|
| No results | "We couldn't find any medications matching '{query}'. Try checking the spelling or using a generic name." | Show search suggestions |
| Invalid query | "Please enter a medication name to search." | Focus search input |
| Location denied | "We need your location to find nearby pharmacies. Please enable location access." | Show manual location entry |
| Invalid coordinates | "We couldn't get your location. Please try again or enter your location manually." | Provide address input |
| Network error | "Connection failed. Please check your internet and try again." | Retry button |
| 429 Rate limit | "You're searching too quickly. Please wait a moment." | Disable search for 10s |
| Provider errors | "Some pharmacies didn't respond, but here are available options." | Show partial results |

### Empty State UI

```jsx
const EmptyState = ({ searchQuery }) => (
  <div className="empty-state">
    <img src="/no-results.svg" alt="No results" />
    <h3>No medications found</h3>
    <p>We couldn't find any results for "{searchQuery}"</p>
    
    <div className="suggestions">
      <h4>Try these tips:</h4>
      <ul>
        <li>Check your spelling</li>
        <li>Try the generic name instead of brand name</li>
        <li>Search with less specific terms (e.g., "Panadol" instead of "Panadol Extra")</li>
        <li>Remove the dosage and search again</li>
      </ul>
    </div>
  </div>
);
```

---

## Best Practices

### 1. **Loading States**

```jsx
const [isSearching, setIsSearching] = useState(false);

// Show skeleton loaders or spinners
{isSearching ? (
  <LoadingSkeleton count={5} />
) : (
  <ResultsList results={results} />
)}
```

**Why:** Searches can take 5-6 seconds. Show loading indicators to improve perceived performance.

---

### 2. **Debounce Search Input**

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  searchMedication(query);
}, 500); // Wait 500ms after user stops typing

// In your input handler
onChange={(e) => debouncedSearch(e.target.value)}
```

**Why:** Prevents excessive API calls as user types.

---

### 3. **Cache Results**

```javascript
const searchCache = new Map();

const searchWithCache = async (query) => {
  // Check cache first
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }
  
  // Fetch and cache
  const results = await searchMedication(query);
  searchCache.set(query, results);
  
  // Expire after 5 minutes
  setTimeout(() => searchCache.delete(query), 5 * 60 * 1000);
  
  return results;
};
```

**Why:** Improves performance for repeated searches.

---

### 4. **Show Relevance**

```jsx
// Only show highly relevant results (score > 0.7)
const topResults = results.filter(med => med.relevance_score > 0.7);

// Or sort by relevance
const sorted = results.sort((a, b) => b.relevance_score - a.relevance_score);
```

**Why:** Results are pre-ranked, but you can filter further for better UX.

---

### 5. **Highlight Best Price**

```jsx
const findBestPrice = (medications) => {
  return medications.reduce((best, current) => 
    current.unit_price < best.unit_price ? current : best
  );
};

const bestDeal = findBestPrice(medications);

<div className={med === bestDeal ? 'best-price' : ''}>
  {med === bestDeal && <span className="badge">Best Price! 💰</span>}
  KES {med.unit_price.toFixed(2)} per unit
</div>
```

---

### 6. **Mobile-First Design**

```css
/* Stack cards on mobile */
@media (max-width: 768px) {
  .medication-grid {
    grid-template-columns: 1fr;
  }
  
  .store-list {
    max-height: 300px;
    overflow-y: auto;
  }
}
```

---

### 7. **Accessibility**

```jsx
<button 
  onClick={handleSearch}
  aria-label={`Search for ${query}`}
  disabled={!query || isSearching}
>
  {isSearching ? 'Searching...' : 'Search'}
</button>

<img 
  src={medication.image_url} 
  alt={`${medication.product_name} packaging`}
  role="img"
/>

// Announce results to screen readers
<div role="status" aria-live="polite">
  {results.length > 0 && `Found ${results.length} medications`}
</div>
```

---

## Design Considerations

### 1. **Visual Hierarchy**

**Priority Order:**
1. Product name & image (largest, most prominent)
2. Price (large, bold)
3. Availability badge (colored, eye-catching)
4. Brand/generic name (medium)
5. Provider (smallest)

---

### 2. **Color Coding**

**Availability Status:**
- 🟢 **In Stock**: Green (#4CAF50)
- 🟡 **Limited Stock**: Orange/Amber (#FF9800)
- 🔴 **Out of Stock**: Red (#F44336) or Gray

**Provider Branding:**
- Use provider logos when available
- Maintain consistent provider colors

---

### 3. **Responsive Image Handling**

```html
<!-- Use srcset for different screen sizes -->
<img 
  src={medication.image_url}
  srcset={`${medication.image_url}?w=300 300w, 
           ${medication.image_url}?w=600 600w`}
  sizes="(max-width: 768px) 100vw, 300px"
  alt={medication.product_name}
  loading="lazy"
/>
```

---

### 4. **Map Integration**

For store locations, consider integrating:
- **Google Maps** for directions
- **Mapbox** for custom styling
- **Leaflet** for open-source option

**Example Integration:**
```jsx
import { GoogleMap, Marker } from '@react-google-maps/api';

const StoreMap = ({ stores, userLocation }) => {
  return (
    <GoogleMap
      center={userLocation}
      zoom={12}
    >
      {/* User location */}
      <Marker 
        position={userLocation} 
        icon="/user-pin.svg"
        label="You"
      />
      
      {/* Store locations */}
      {stores.map(store => (
        <Marker
          key={store.store_id}
          position={{ lat: store.latitude, lng: store.longitude }}
          label={store.store_name}
          onClick={() => showStoreDetails(store)}
        />
      ))}
    </GoogleMap>
  );
};
```

---

### 5. **Smart Defaults**

```javascript
// Default distance filter
const DEFAULT_MAX_DISTANCE = 10; // km

// Default sort order
const DEFAULT_SORT = 'relevance'; // or 'price', 'distance'

// Default items per page
const DEFAULT_PAGE_SIZE = 20;
```

---

### 6. **Progressive Enhancement**

```jsx
// Basic search (works everywhere)
<form action="/search" method="get">
  <input name="q" placeholder="Search medication..." required />
  <button type="submit">Search</button>
</form>

// Enhanced with JavaScript
useEffect(() => {
  if (supportsGeolocation) {
    setShowLocationToggle(true);
  }
}, []);
```

---

## Quick Start Checklist

For your first integration:

- [ ] Test basic search: `GET /v1/search?q=Panadol`
- [ ] Display product name, price, and image
- [ ] Handle empty results gracefully
- [ ] Add loading indicator
- [ ] Test on mobile device
- [ ] Implement error handling
- [ ] Add "Use my location" feature
- [ ] Display nearby stores with distances
- [ ] Create batch search for prescriptions
- [ ] Test with slow network (throttle to 3G)
- [ ] Add accessibility attributes
- [ ] Test with screen reader

---

## Support & Resources

**API Base URL**: `https://api.invictushealth.tech/catalog/gateway`

**Technical Documentation**: See `README.md` for detailed technical specs

**Questions?** Contact the backend team for:
- Rate limiting adjustments
- New feature requests
- Bug reports

---

## Appendix: Complete Examples

### Complete Search Page (React)

```jsx
import React, { useState, useEffect } from 'react';

const MedicationSearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(10);

  // Get user location
  useEffect(() => {
    if (useLocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          setUseLocation(false);
        }
      );
    }
  }, [useLocation, userLocation]);

  // Search function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build URL
      const url = new URL('https://api.invictushealth.tech/catalog/gateway/v1/search');
      url.searchParams.append('q', query);
      
      if (useLocation && userLocation) {
        url.searchParams.append('latitude', userLocation.latitude);
        url.searchParams.append('longitude', userLocation.longitude);
        url.searchParams.append('max_distance_km', maxDistance);
      }

      // Fetch results
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        if (data.results.length === 0) {
          setError('No medications found. Try different search terms.');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-page">
      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for medication..."
          disabled={isLoading}
        />
        
        <div className="location-controls">
          <label>
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
            />
            Use my location
          </label>
          
          {useLocation && (
            <select 
              value={maxDistance} 
              onChange={(e) => setMaxDistance(e.target.value)}
            >
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>
          )}
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading">
          <p>Searching pharmacies...</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="results">
          <p>{results.length} medications found</p>
          
          <div className="results-grid">
            {results.map((med, index) => (
              <div key={index} className="medication-card">
                {med.image_url && (
                  <img 
                    src={med.image_url} 
                    alt={med.product_name}
                    onError={(e) => e.target.src = '/placeholder.png'}
                  />
                )}
                
                <h3>{med.product_name}</h3>
                <p className="brand">{med.brand_name}</p>
                
                <div className="pricing">
                  <p className="pack-price">
                    KES {med.pack_price.toFixed(2)}
                  </p>
                  <p className="unit-price">
                    KES {med.unit_price.toFixed(2)}/unit
                  </p>
                </div>
                
                <span className={`availability ${med.availability}`}>
                  {med.availability === 'in_stock' ? '✅ In Stock' : 
                   med.availability === 'limited' ? '⚠️ Limited' : 
                   '❌ Out of Stock'}
                </span>
                
                <p className="provider">Sold by: {med.provider}</p>
                
                {med.stores && med.stores.length > 0 && (
                  <div className="stores">
                    <p><strong>Available at {med.stores.length} stores</strong></p>
                    {med.stores.slice(0, 3).map(store => (
                      <p key={store.store_id}>
                        {store.store_name}
                        {store.distance_km && ` - ${store.distance_km.toFixed(1)}km`}
                      </p>
                    ))}
                  </div>
                )}
                
                {med.product_url && (
                  <a 
                    href={med.product_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-product"
                  >
                    View Product
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationSearchPage;
```

---

**End of Frontend Integration Guide**

For technical implementation details, refer to `README.md`.

