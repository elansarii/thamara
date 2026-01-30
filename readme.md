# Thamara - Farm Recovery App

**Offline-first app helping farmers in Gaza restart food production.**

LifeLines Hackathon 2026 | Team Gamma | Problem Statement #1

---

## 🌐 Live Demo

**https://thamara-lifelines.netlify.app**

### ⚠️ Get the Latest Version

Do ONE of these before testing:

| Method | How |
|--------|-----|
| **Incognito (Recommended)** | Chrome/Edge: `Ctrl+Shift+N` (Win) or `Cmd+Shift+N` (Mac) |
| **Clear Cache** | DevTools (F12) → Application → Storage → "Clear site data" |

---

## 🚀 Quick Start

### Online Demo
1. Open demo link in **incognito mode**
2. Browse all tabs (Map, Guide, Drops, Exchange, Water)
3. On Android: Menu (⋮) → "Add to Home Screen"

### Test Offline
1. Visit all tabs while online (~2 min)
2. Turn on **Airplane Mode**
3. App still works!

### Run Locally
```bash
npm install
npm run build
npm start
# Open http://localhost:3000
```

---

## ✨ Features

| Tab | What it does |
|-----|-------------|
| **Map** | Check if land is farmable, restorable, or damaged |
| **Guide** | Get crop recommendations for your conditions |
| **Drops** | Schedule harvest pickups (avoid spoilage) |
| **Exchange** | Find/offer seeds, tools, labor, transport |
| **Water** | Locate water sources with reliability scores |

### Also Included
- **OrgBridge**: NGO funding with audit trail (in Drops tab)
- **Arabic**: Full Arabic + RTL support (menu → language toggle)
- **Offline**: Everything works without internet## 📱 Key Features to Review

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
---

## 🌍 Languages

Switch via hamburger menu (☰):
- 🇬🇧 English (default)
- 🇸🇦 العربية (Arabic with RTL)

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

## 📁 Structure

```
src/
  app/        # Pages: map, guide, drops, exchange, water
  lib/        # Logic + i18n translations
  data/       # Crop database
public/
  agro-packs/ # Offline map data
  sw.js       # Service worker (offline)
```

---

## 🛠️ Tech

Next.js 16 • React 19 • TypeScript • MapLibre GL • IndexedDB • Service Workers

---

## 📖 Docs

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Feature details
- [CROP_PLAN_FEATURE.md](CROP_PLAN_FEATURE.md) - Crop logic
- [EXCHANGE_HUB_IMPLEMENTATION.md](EXCHANGE_HUB_IMPLEMENTATION.md) - Marketplace

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Old version showing | Use incognito or clear cache |
| Map not loading offline | Browse the map while online first |
| Features not working offline | Visit each tab while online first |
| Service worker issues | Use `npm run build && npm start`, not `npm run dev` |

---

**Built with love for the farmers of Gaza**

*Thamara (ثمرة) = "fruit" in Arabic*
