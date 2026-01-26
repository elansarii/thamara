# PWA Setup Complete! ✓

Thamara is now a Progressive Web App with offline support and Android installation.

## What Was Added

1. **`public/manifest.json`** - PWA configuration (name, colors, icons)
2. **`public/sw.js`** - Service worker for offline caching
3. **`src/components/PWARegister.tsx`** - Auto-registers service worker
4. **`src/components/InstallPrompt.tsx`** - Install banner for Android
5. **Updated `src/app/layout.tsx`** - Integrated PWA components

## How to Test

### Test Locally

1. Build for production (service workers only work in production):
   ```bash
   npm run build
   npm start
   ```

2. Open `http://localhost:3000` in Chrome

3. Check service worker is running:
   - Open DevTools (F12)
   - Go to Application → Service Workers
   - Should see `/sw.js` registered

4. Test offline mode:
   - DevTools → Network tab → Check "Offline"
   - Refresh - app should still work!

### Test on Android Phone

1. Get your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Run dev server with network access:
   ```bash
   npm run build
   npm start -- -H 0.0.0.0
   ```

3. On Android (same WiFi):
   - Open Chrome
   - Visit `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)

4. Install the app:
   - Banner will appear asking to install
   - Or Menu (⋮) → "Add to Home Screen"

5. Test offline:
   - Turn on Airplane Mode
   - Open app from home screen
   - Should work completely offline!

## Generate Icons (Required)

You need to create these icon files:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

### Quick Option: Online Tool
Use https://progressier.com/pwa-icons-and-ios-splash-screen-generator
- Upload your logo
- Download generated icons
- Place in `public/` folder

### Command Line (ImageMagick)
```bash
# Install ImageMagick
brew install imagemagick  # macOS

# Convert logo to icons
convert public/thamara_logo.svg -resize 192x192 public/icon-192.png
convert public/thamara_logo.svg -resize 512x512 public/icon-512.png
```

## PWA Features

✓ **Offline Support** - Works without internet after first visit
✓ **Map Caching** - Map tiles and agro-pack data cached automatically
✓ **Installable** - Add to home screen on Android
✓ **Fast Loading** - Cached for instant load
✓ **Auto Updates** - Service worker updates automatically
✓ **App-like Feel** - Runs in standalone mode

## How Offline Maps Work

The service worker uses a smart caching strategy:

1. **Agro-pack data** - Pre-cached on install (manifest.json, plantability.geojson)
2. **Map tiles** - Cached as you browse the map (first visit)
3. **App pages** - Cached as you navigate

**To use the map offline:**
1. Open the map page while online (visit `/map`)
2. Pan around the area you want to cache
3. Zoom in/out to cache different zoom levels
4. Go offline - cached tiles will still display!

The more you explore the map while online, the more tiles are cached for offline use.

## Troubleshooting

**Service worker not registering?**
- Must use `npm run build` + `npm start` (production mode)
- Check browser console for errors

**Install prompt not showing?**
- Only works after service worker is registered
- Only on HTTPS or localhost
- Won't show if already installed

**Offline not working?**
- Visit pages first to cache them
- Check DevTools → Application → Cache Storage

## Deploy

Deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

Then test on your phone with the production URL!

---

**Next Step:** Generate the icon files (see above) and test on your Android device!
