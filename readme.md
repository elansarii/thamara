# Thamara - Farm Recovery & Coordination Platform

**An offline-first Progressive Web App for small farmers in Gaza to restart food production under severe constraints.**

Built for the LifeLines Hackathon 2026 - Problem Statement #1

---

## 🔴 LIVE DEMO - TEST NOW

### 🌐 **[YOUR_NETLIFY_URL_HERE](https://thamara-lifelines.netlify.app)**

**📱 For full experience:** Open the link on your Android phone and install the PWA!

**💻 Quick browser test:** Visit the link in Chrome/Edge - works immediately!

**✈️ Test offline:** Use the app for 2 minutes, enable Airplane Mode, reopen - still works!

---

## 🎯 What is Thamara?

Thamara is a mobile-first web application designed for **zero-connectivity environments** that helps farmers:

- ✅ **Assess farmland plantability** - Check if land can be farmed after damage
- ✅ **Get crop recommendations** - Find suitable crops for salinity, water constraints, and fast harvest
- ✅ **Calculate seed needs** - Convert plot size to seed quantities
- ✅ **Find water sources** - Locate and track reliability of water points
- ✅ **Exchange resources** - Coordinate seeds, tools, labor, and transport
- ✅ **Work completely offline** - All features work without internet after first visit

**Key Innovation:** Complete offline functionality with map tiles, agro-pack data, and local storage for a population with unreliable connectivity.

---

## 🚀 Quick Start for Judges

### Option 1: Use the Hosted Version (Recommended)

1. **Open the Netlify URL** in Chrome or Edge
2. **Browse the app** - All features work immediately
3. **Install on Android:**
   - Open the URL on your Android phone
   - Chrome will show "Add to Home Screen" banner
   - Or tap Menu (⋮) → "Add to Home Screen"
4. **Test offline:**
   - Use the app for 2-3 minutes (visit all features)
   - Enable Airplane Mode
   - Reopen the app - everything still works!

### Option 2: Run Locally (Alternative)

If you prefer to run the app locally:

**Prerequisites:**
- Node.js 18+ installed
- Modern web browser (Chrome/Edge recommended)

**Installation:**

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start the server
npm start
```

The app will be available at **http://localhost:3000**

---

## 📱 Key Features to Review

### 1. Plot Assessment & Plantability Map
- Navigate to `/map`
- Click anywhere on the map to assess a location
- View plantability status: **Farmable**, **Restorable**, or **Damaged**
- See confidence levels and explanations

**What to notice:**
- Map works offline (tiles cached as you browse)
- Agro-pack data (plantability zones) pre-cached
- Transparent scoring with "why this result" explanations

### 2. Crop Recommendations
- Navigate to `/crop-plan`
- Enter water availability and salinity level
- Get tailored crop suggestions optimized for:
  - Fast harvest cycles
  - Low water needs
  - Salinity/heat tolerance
  - High caloric efficiency

**What to notice:**
- 30+ crops in offline database
- Results prioritize resource efficiency
- Includes planting calendar and yield estimates

### 3. Seed Calculator
- From crop recommendations, select a crop
- Enter plot size
- Get precise seed quantity and spacing guide

**What to notice:**
- Supports multiple plot size units (m², hectares, dunums)
- Shows seeding rate and spacing
- Works completely offline

### 4. Water Point Finder
- Navigate to `/water`
- View map of water sources
- Check reliability scores
- Filter by status (available, limited, unavailable)

**What to notice:**
- Water points stored in IndexedDB (offline database)
- Reliability scoring based on community reports
- Can add new water points offline

### 5. Exchange Hub (Marketplace)
- Navigate to `/exchange`
- Browse listings for:
  - Seeds
  - Tools & Equipment
  - Fertilizer
  - Day Labor
  - Transport
  - Harvest Aggregation

**What to notice:**
- Listings stored in localStorage (works offline)
- AI-powered matching shows relevant listings
- Create requests and offers offline
- Data syncs when connection returns

### 6. Complete Offline Functionality
- Use any feature online first
- Turn on Airplane Mode or disconnect internet
- Navigate through the app
- **Everything continues to work!**

**What to notice:**
- Pages load instantly from cache
- Map tiles display (for browsed areas)
- All data accessible offline
- New entries saved locally

---

## 🧪 Testing Offline Mode

### Quick Offline Test (Recommended)

**On Desktop Browser:**
1. Visit the **[Netlify URL](https://thamara-lifelines.netlify.app)**
2. Click through all features (map, crop-plan, exchange, water)
3. Open DevTools (F12) → Network tab → Check "Offline"
4. Navigate through the app - everything still works!

**On Android Phone:**
1. Visit the **[Netlify URL](https://thamara-lifelines.netlify.app)** on your phone
2. Install PWA: Chrome banner or Menu → "Add to Home Screen"
3. Use the app for 2-3 minutes (visit all features)
4. Enable **Airplane Mode**
5. Open the app from home screen
6. **Everything works offline!**

### Detailed Verification (Optional)

**Check Service Worker (Chrome DevTools):**

1. **Open DevTools** (F12 or Right-click → Inspect)

2. **Check Service Worker:**
   - Application tab → Service Workers
   - Should show service worker "Activated and running"

3. **View Cached Resources:**
   - Application tab → Cache Storage
   - Expand caches to see:
     - `thamara-v1` - App pages and assets
     - `thamara-runtime-v1` - Dynamic routes
     - `thamara-map-tiles-v1` - Map tiles

4. **Test Offline:**
   - Network tab → Check "Offline" checkbox
   - Navigate through the app
   - Confirm all features work

**What Should Work Offline:**
- ✅ Map displays with cached tiles
- ✅ Can log new plots (saved to localStorage)
- ✅ Can create crop plans
- ✅ Can browse exchange listings
- ✅ Can view and add water points (IndexedDB)
- ✅ All navigation and UI interactions

---

## 📊 Demo Flow for Presentation

### Scenario: Farmer Returns to Damaged Land

**Live at: [\[YOUR_NETLIFY_URL_HERE\]](https://thamara-lifelines.netlify.app)**

1. **Open Map** (Click "Map" in bottom navigation)
   - Show plantability overlay for Gaza region
   - Click on a "Restorable" zone (amber/yellow color)
   - Explain assessment: moderate damage, needs soil preparation

2. **Log a Plot** (Click "Log plot here" button)
   - Auto-fills location from map click
   - Set constraints (water: limited, salinity: high)
   - View assessment results with recommendations

3. **Get Crop Recommendations** (Click "Guide" in bottom nav)
   - Select "Limited water" and "High salinity"
   - Choose "Fast harvest" (30-60 days)
   - View recommended crops (e.g., Radish, Turnip, Spinach)
   - Show why each crop fits the constraints

4. **Calculate Seeds Needed**
   - Select Radish from recommendations
   - Enter plot size: 50 m²
   - Get result: 25g seeds, 3cm spacing

5. **Find Water Source** (Click "Water" in bottom nav)
   - Show nearby water points on map
   - Check reliability scores (color-coded circles)
   - Explain community-verified status

6. **Exchange Resources** (Click "Exchange" in bottom nav)
   - Search for radish seeds in listings
   - Show available suppliers with reliability scores
   - Demonstrate listing details and contact info

7. **Test Offline** (Enable Airplane Mode on phone)
   - Repeat above steps
   - Show everything works without internet
   - Emphasize data persistence in localStorage/IndexedDB

**Key Message:** All features demonstrated work completely offline after the first visit!

---

## 🏗️ Technical Architecture

### Stack
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Maps:** MapLibre GL (offline-capable)
- **Database:** Dexie.js (IndexedDB wrapper)
- **Storage:** localStorage + IndexedDB
- **PWA:** Service Workers (Cache API)

### Offline Strategy
1. **Service Worker** caches all pages and assets on first visit
2. **3-tier cache:**
   - App shell (pre-cached)
   - Runtime cache (pages as you visit)
   - Map tiles (as you browse)
3. **Local data storage:**
   - Water points → IndexedDB
   - Plots & exchange → localStorage
   - Crop data → bundled in app

### Key Design Decisions
- **Mobile-first:** 440px max-width enforced
- **Zero backend:** Fully client-side (deployable anywhere)
- **Cache-first:** Instant loads, network fallback
- **Progressive enhancement:** Works basic without JS, better with it

---

## 📁 Project Structure

```
/src
  /app              # Next.js pages (routes)
    /map            # Plantability map
    /crop-plan      # Crop recommender
    /exchange       # Marketplace
    /water          # Water point finder
    /log-plot       # Plot logging form
    /assessment     # Assessment results
  /components       # React components
  /lib              # Business logic
    assessment.ts   # Plantability scoring
    cropEnrichment.ts  # Crop recommendations
    seedCalc.ts     # Seed calculations
    waterPointsDb.ts   # Water points database
    exchangeStorage.ts # Exchange listings
  /data             # Static data
    crops.ts        # 30+ crop database
    seedSources.ts  # Seed supplier data

/public
  /agro-packs       # Offline data bundles
    /demo-v1        # Gaza demo pack
      manifest.json
      plantability.geojson
  sw.js             # Service worker
  manifest.json     # PWA manifest
```

---

## 🎨 Design Principles

1. **Offline-first by default** - All core actions work without internet
2. **Minimum input, maximum output** - 30-60 second workflows
3. **Defensible guidance** - Transparent scoring with confidence levels
4. **Low-literacy friendly** - Icon-first, minimal text
5. **Coordination over prediction** - Focus on connecting resources

---

## 📖 Additional Documentation

- **PROJECT_DOCUMENTATION.md** - Detailed problem analysis and feature logic
- **CROP_PLAN_FEATURE.md** - Crop recommendation system details
- **EXCHANGE_HUB_IMPLEMENTATION.md** - Marketplace architecture

---

## 🌍 Impact & Context

### Problem Statement (SPS#1)
Food production capacity is severely reduced because farmland and assets are damaged. Households cannot determine what production is possible given soil damage, salinity, water scarcity, and climate stress, and cannot access guidance or coordination channels reliably.

### Operating Constraints
- ❌ No reliable extension services
- ❌ No internet + low battery + limited devices
- ❌ High salinity + damaged soils + limited clean irrigation
- ❌ Restricted movement and insecurity
- ✅ Solution must work completely offline

### Thamara's Approach
Instead of requiring constant connectivity, Thamara packages expert guidance into offline "Agro Packs" that work on any phone with a browser. Farmers get immediate answers about plantability, crop selection, and resource coordination without waiting for network access or experts.

---

## 🚢 Deployment

### Live Deployment
**Currently deployed on Netlify:** [YOUR_NETLIFY_URL_HERE](https://thamara-lifelines.netlify.app)

### Deployment Details
- Builds to static HTML/CSS/JS
- No server required (JAMstack architecture)
- Automatic deploys from Git repository
- HTTPS enabled for PWA requirements
- Service worker activated for offline functionality

### Deploy Your Own Copy

The app can be deployed to any static hosting:

```bash
# Build the app
npm run build

# Deploy to Netlify (if not already connected)
# Option 1: Drag & drop the 'out' or '.next' folder to Netlify
# Option 2: Connect GitHub repo to Netlify dashboard
# Option 3: Use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🔧 Troubleshooting

### Service Worker Not Working
- **Cause:** Service workers only work in production mode
- **Fix:** Always use `npm run build && npm start`, not `npm run dev`

### Map Not Loading Offline
- **Cause:** Tiles not cached yet
- **Fix:** Pan around the map while online to cache tiles for that area

### Features Not Working Offline
- **Cause:** Page not visited while online
- **Fix:** Visit each feature once while online to cache it

### Android Install Not Showing
- **Cause:** PWA requirements not met or already installed
- **Fix:** Clear browser data and revisit, or check manifest is valid

---

## 🏆 Hackathon Submission

**Team:** Gamma
**Hackathon:** LifeLines 2026
**Problem Statement:** SPS#1 - Farm Recovery & Coordination

**Key Innovations:**
1. Complete offline functionality for zero-connectivity environments
2. Transparent plantability assessment with confidence scoring
3. Resource-efficient crop recommendations (water, salinity, speed)
4. Peer-to-peer marketplace that works offline
5. Mobile-first PWA installable on any Android device

---

## 📄 License



---

**Built with ❤️ for the farmers of Gaza**

*Thamara (ثمرة) means "fruit" or "outcome" in Arabic - representing the harvest that comes from coordinated effort and resilient farming.*
