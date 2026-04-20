# Code Changes Reference

All modifications made to implement PWA and export/import functionality.

---

## 1. index.html

### Added PWA Meta Tags
```html
<head>
  <!-- Existing tags above... -->
  
  <!-- ADD AFTER TITLE -->
  <link rel="manifest" href="/manifest.json" />
  
  <!-- ADD AFTER VIEWPORT -->
  <meta name="theme-color" content="#2196F3" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Golf Scorecard" />
  <link rel="apple-touch-icon" href="/golf-icon.jpg" />
  
  <!-- ADD BEFORE </head> -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  </script>
</head>
```

---

## 2. public/manifest.json (NEW FILE)

```json
{
  "name": "Red Tail Golf Scorecard",
  "short_name": "Golf Scorecard",
  "description": "Track your golf rounds with GPS distance measurement and detailed statistics",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/golf-icon.jpg",
      "sizes": "192x192",
      "type": "image/jpeg",
      "purpose": "any"
    },
    {
      "src": "/golf-icon.jpg",
      "sizes": "512x512",
      "type": "image/jpeg",
      "purpose": "any"
    },
    {
      "src": "/golf-icon.jpg",
      "sizes": "192x192",
      "type": "image/jpeg",
      "purpose": "maskable"
    }
  ],
  "categories": ["sports"],
  "screenshots": [
    {
      "src": "/golf-icon.jpg",
      "sizes": "540x720",
      "type": "image/jpeg",
      "form_factor": "narrow"
    },
    {
      "src": "/golf-icon.jpg",
      "sizes": "1280x720",
      "type": "image/jpeg",
      "form_factor": "wide"
    }
  ]
}
```

---

## 3. public/service-worker.js (NEW FILE)

```javascript
const CACHE_NAME = 'golf-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/golf-icon.jpg'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});

// Listen for sync events (background sync when connection restored)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rounds') {
    event.waitUntil(syncRounds());
  }
});

// Background sync - send pending round data to cloud
async function syncRounds() {
  try {
    const pendingRounds = await getPendingRounds();

    for (const round of pendingRounds) {
      await uploadRound(round);
    }
  } catch (error) {
    console.error('Sync failed:', error);
    throw error; // Retry sync
  }
}

async function getPendingRounds() {
  // This will be called from the app to get rounds waiting to sync
  return [];
}

async function uploadRound(round) {
  // This will be implemented in the app to upload to cloud
  return fetch('/api/sync-round', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(round)
  });
}
```

---

## 4. src/App.jsx

### Added Import Handler
```javascript
// ADD AFTER handleNewRound() function:

const handleImportRound = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result;
      const data = JSON.parse(content);

      // Validate imported round structure
      if (data.round && data.round.holes && data.round.setup) {
        setCompletedRound(data.round);
        setAppState('summary');
        console.log('Round imported successfully');
      } else {
        alert('Invalid round file format. Please make sure this is a valid exported round.');
      }
    } catch (error) {
      console.error('Failed to import round:', error);
      alert('Failed to import round. The file may be corrupted or in an incorrect format.');
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = '';
};
```

### Updated JSX Return
```javascript
// CHANGE THIS:
{appState === 'setup' && <CourseSetup onStart={handleStartRound} />}

// TO THIS:
{appState === 'setup' && (
  <CourseSetup onStart={handleStartRound} onImportRound={handleImportRound} />
)}
```

---

## 5. src/components/CourseSetup.jsx

### Updated Function Signature
```javascript
// CHANGE THIS:
export function CourseSetup({ onStart }) {

// TO THIS:
export function CourseSetup({ onStart, onImportRound }) {
```

### Added Import Section to JSX
```javascript
// ADD AFTER </form> (before closing </div>):

{/* Import Round Section */}
{onImportRound && (
  <div className="import-section">
    <p className="import-label">Or import a previous round:</p>
    <input
      type="file"
      id="import-round"
      accept=".json"
      onChange={onImportRound}
      style={{ display: 'none' }}
    />
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => document.getElementById('import-round')?.click()}
    >
      📂 Import Round
    </button>
  </div>
)}
```

---

## 6. src/components/RoundSummary.jsx

### Added Download Function
```javascript
// ADD AT START OF COMPONENT (after destructuring):

const downloadRound = (roundData) => {
  try {
    // Create JSON payload with all round data
    const roundJson = {
      round: roundData,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(roundJson, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with date
    const dateStr = new Date(completedAt || new Date()).toISOString().split('T')[0];
    const filename = `golf-round-${dateStr}-${Date.now()}.json`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Round downloaded:', filename);
  } catch (error) {
    console.error('Failed to download round:', error);
    alert('Failed to download round data. Please try again.');
  }
};
```

### Updated Download Button
```javascript
// CHANGE THIS:
<button className="btn btn-success" onClick={() => downloadRound(completedRound)}>
  ⬇️ Download Round
</button>

// TO THIS:
<button className="btn btn-success" onClick={() => downloadRound(round)}>
  ⬇️ Download Round
</button>
```

---

## 7. src/App.css

### Added Button Styles
```css
/* ADD AFTER .btn-success:hover SECTION: */

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
  transform: translateY(-2px);
}
```

### Added Import Section Styles
```css
/* ADD BEFORE /* Buttons */ SECTION: */

/* Import Section */
.import-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid var(--border);
  text-align: center;
}

.import-label {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}
```

---

## Files to Create/Copy

### 1. Copy Golf Icon
```bash
cp ~/Downloads/"golf app logo.jpg" /Users/ericweyhrich/golf-agent/public/golf-icon.jpg
```

### 2. Create New Files
- `public/manifest.json` - See section #2 above
- `public/service-worker.js` - See section #3 above

---

## Testing the Changes

### 1. Verify Installation
```bash
cd /Users/ericweyhrich/golf-agent
npm run dev
```

### 2. Check in Browser
1. Open http://localhost:5173/
2. Open DevTools (F12)
3. Go to Application tab
4. Check "Service Workers" - should show registered
5. Check "Manifest" - should show manifest.json contents

### 3. Test Download
1. Complete a round
2. Click "⬇️ Download Round"
3. Check Downloads folder for `golf-round-*.json` file

### 4. Test Import
1. From setup screen, click "📂 Import Round"
2. Select the JSON file
3. Should show the imported round in summary view

---

## Rollback Instructions

If anything goes wrong:

```bash
# Revert files (without modifying logic):
git checkout src/App.jsx
git checkout src/components/CourseSetup.jsx
git checkout src/components/RoundSummary.jsx
git checkout src/App.css
git checkout index.html

# Remove new files:
rm public/manifest.json
rm public/service-worker.js
rm public/golf-icon.jpg
```

---

## Summary

- ✅ 3 new files created
- ✅ 5 files modified
- ✅ 1 file copied (golf icon)
- ✅ ~150 lines of code added
- ✅ No breaking changes to existing functionality
