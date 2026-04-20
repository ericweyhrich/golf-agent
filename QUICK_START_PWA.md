# Quick Start: Testing Golf App on Your Devices

## Your Setup
- **Development Machine:** MacBook Air
- **Testing Devices:** iPhone + MacBook Air
- **Goal:** Install app as PWA, test sync via manual download/import

---

## Step 1: Start Dev Server (Right Now)

```bash
cd /Users/ericweyhrich/golf-agent
npm run dev
```

Output should show:
```
  VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

✅ Keep this terminal open

---

## Step 2: Test on iPhone (Same WiFi Network)

### Find Your Mac's IP Address
```bash
# In another terminal:
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Look for something like: `inet 192.168.x.x`

### On iPhone Safari:
1. **Make sure iPhone is on same WiFi as Mac**
2. Open Safari
3. Enter: `http://192.168.x.x:5173/` (use YOUR IP from above)
4. App should load

### Install to Home Screen:
1. Tap the **Share** button (↗️ in Safari)
2. Scroll down and tap **Add to Home Screen**
3. Change name if desired (default: "Golf Scorecard")
4. Tap **Add**
5. App icon appears on home screen with golf ball 🏌️

### Test the App:
1. Open app from home screen
2. Go through complete course setup
3. Play a few holes (at least 3-4)
4. Finish the round
5. **Tap "⬇️ Download Round"** button
6. File saves to Downloads folder

---

## Step 3: Transfer Round to MacBook Air

Choose one method:

### Option A: AirDrop (Easiest)
1. On iPhone, open Files app
2. Go to Downloads
3. Find `golf-round-YYYY-MM-DD-*.json`
4. Long press → Share → AirDrop
5. Select your Mac
6. File should appear on your Mac desktop

### Option B: iCloud Drive
1. iPhone: Open Files → iCloud Drive
2. Create "Golf App" folder
3. Move downloaded round file there
4. Mac: Open iCloud Drive, download file to Desktop

### Option C: Email
1. iPhone: Open Mail
2. Compose email to yourself
3. Attach the golf-round JSON file
4. Mac: Open email, download attachment

---

## Step 4: Import Round on MacBook

### Via Browser (Testing)
1. On Mac, open Safari
2. Go to `http://localhost:5173/`
3. Should see "Golf Scorecard" setup screen
4. Tap **📂 Import Round** button
5. Select the JSON file you transferred
6. Your previously played round appears on screen
7. Verify all stats are correct

### Or Install as App on Mac:
1. In Safari, click **File** → **Add to Dock**
2. Name it "Golf Scorecard"
3. Click **Add**
4. App is now in dock
5. Open it and repeat import above

---

## Step 5: Verify Everything Works

### Round Export/Import Checklist:
- [ ] Downloaded round file exists
- [ ] Filename is: `golf-round-YYYY-MM-DD-{timestamp}.json`
- [ ] File is valid JSON (can open with text editor)
- [ ] File contains all round data (holes, scores, GPS distances, etc.)
- [ ] File imports successfully on Mac
- [ ] Imported round displays all stats correctly
- [ ] Scores match what you entered on iPhone

### Offline Mode Test:
1. On iPhone: Complete a round while NOT connected to WiFi
2. Enable airplane mode mid-round
3. Continue playing holes
4. Finish round
5. Exit airplane mode
6. Download round — it should work fine

---

## Troubleshooting

### App Won't Load on iPhone
```
Problem: Safari shows "Cannot find server"
Solution: 
- Make sure iPhone is on same WiFi as Mac
- Check Mac IP address again (might have changed)
- Try: http://192.168.x.x:5173/ directly
- Restart dev server
```

### Service Worker Not Registering
```
Problem: Browser DevTools shows red "X" next to Service Worker
Solution:
- Service Worker only registers on HTTPS or localhost
- For iPhone testing, use localhost (which counts)
- Check browser console (F12) for errors
- Clear browser cache: Cmd+Shift+Delete
```

### Download Button Does Nothing
```
Problem: Clicking "Download Round" doesn't download file
Solution:
- Check browser console (F12) for errors
- Make sure round is fully completed (all 18 holes)
- Try refreshing page (Cmd+R)
- Check browser Downloads folder
```

### Import Button Doesn't Work
```
Problem: Clicking "Import Round" doesn't select file
Solution:
- Make sure JSON file is not corrupted
- Try renaming file to something simple: round.json
- Check file size is > 1KB
- Use File app to verify file exists
```

### Stats Are Wrong After Import
```
Problem: Downloaded/imported round shows incorrect stats
Solution:
- This might be a data structure issue
- Check developer console for errors
- Contact developer with the JSON file for debugging
```

---

## File Locations

### Your Development Folder:
```
~/golf-agent/
├── src/
│   ├── App.jsx (contains handleImportRound)
│   ├── components/
│   │   ├── CourseSetup.jsx (has Import button)
│   │   └── RoundSummary.jsx (has Download button)
│   └── ...
├── public/
│   ├── manifest.json (PWA metadata)
│   ├── service-worker.js (offline support)
│   └── golf-icon.jpg (app icon)
└── index.html
```

### iPhone Downloaded Files:
```
iPhone → Files App → Downloads
```

---

## What to Test Next

1. **✅ Basic Workflow:** Setup → Play → Download → Import
2. **✅ Stats Preservation:** Verify numbers match
3. **✅ Offline Mode:** Play without internet
4. **✅ Multiple Rounds:** Download several rounds, import them

---

## Production Deployment

When you're ready to deploy for real use:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel (easiest):**
   ```bash
   npm install -g vercel
   vercel
   ```
   - Creates production URL with HTTPS
   - App installs from production URL
   - Works fully offline with service worker

3. **Or use Netlify:**
   - Same process as Vercel
   - Go to netlify.com, connect GitHub repo, auto-deploy

4. **Update manifest if needed:**
   - Change `start_url` in `manifest.json` if not at root
   - Update `theme_color` if you rebrand

---

## Notes

- ✅ PWA works offline — rounds saved locally even without internet
- ✅ GPS works in standalone app mode on both iOS and macOS
- ✅ Download/Import is manual sync for now
- 🔮 Future: Can add automatic cloud sync to iCloud or Firebase

---

**Ready to test?** 

Run `npm run dev` and grab your iPhone! 🚀
