# Map Clustering - Quick Start Guide

## 🚀 What's New

Your admin dashboard map now supports **marker clustering with spiderfy** to handle overlapping report markers elegantly.

## ✨ Key Features

- **Automatic clustering** at zoomed-out views
- **Spiderfy** for exact coordinate overlaps (circular arrangement)
- **Color-coded clusters** based on report status
- **Performance optimized** for 10k+ markers
- **Fully accessible** (keyboard navigation, screen readers)

## 📦 Files Added

```
civic-admin/
├── src/
│   ├── components/
│   │   └── MarkerClusterGroup.js      # Clustering component
│   ├── config/
│   │   └── mapClusterConfig.js        # Configuration
│   └── styles/
│       └── mapClustering.css          # Custom styling
└── docs/
    ├── MAP_CLUSTERING.md              # Full documentation
    └── CLUSTERING_QUICK_START.md      # This file
```

## 🎯 Usage

### Default (Clustering Enabled)

```jsx
<MapView
  reports={reports}
  onMarkerClick={handleMarkerClick}
/>
```

That's it! Clustering is enabled by default.

### Disable Clustering (Debugging)

```jsx
<MapView
  reports={reports}
  onMarkerClick={handleMarkerClick}
  enableClustering={false}
/>
```

## ⚙️ Configuration

Edit `src/config/mapClusterConfig.js` to customize:

```javascript
// Quick tweaks
maxClusterRadius: 80,           // Cluster size (pixels)
spiderfyOnMaxZoom: true,        // Enable spiderfy
animate: true,                   // Enable animations
chunkedLoading: true,            // Load in chunks (performance)
```

## 🎨 Visual Behavior

### Zoom Levels

| Zoom | Behavior |
|------|----------|
| 1-10 | Aggressive clustering (large bubbles) |
| 10-15 | Moderate clustering |
| 16+ | Minimal clustering, spiderfy for overlaps |

### Cluster Colors

Clusters inherit the color of the dominant report status:

- 🔵 Blue = Submitted
- 🟣 Purple = Acknowledged
- 🟠 Amber = Assigned
- 🟠 Orange = In Progress
- 🟢 Green = Resolved
- 🔴 Red = Rejected
- ⚫ Gray = Closed

## 🐛 Troubleshooting

### Issue: Markers don't cluster

**Fix**: Check `DEBUG_DISABLE_CLUSTERING` in `mapClusterConfig.js` is `false`

### Issue: Performance is slow

**Fix**: In `mapClusterConfig.js`:
```javascript
chunkedLoading: true,
chunkInterval: 500,  // Increase from 200
animate: false,       // Disable animations
```

### Issue: Spiderfy doesn't work

**Fix**:
1. Zoom to max level (16+)
2. Click the cluster
3. Verify markers have identical lat/lng
4. Check browser console for errors

### Issue: Styling looks wrong

**Fix**:
1. Clear browser cache
2. Check `mapClustering.css` is imported in MapView
3. Verify cluster colors in `reportStatus.js`

## 🧪 Testing Checklist

- [x] Zoom out → See cluster bubbles
- [x] Zoom in → See individual markers
- [x] Click cluster → Zooms or spiderfies
- [x] Click spiderfied marker → Opens popup
- [x] Click outside → Collapses spiderfy
- [x] Keyboard navigation → Works
- [x] Mobile touch → 44px+ targets

## 📊 Performance Benchmarks

| Marker Count | Expected Load Time |
|--------------|-------------------|
| < 100 | Instant |
| 100-1000 | < 1 second |
| 1000-10000 | 1-3 seconds (chunked) |
| 10000+ | 3-5 seconds (chunked) |

## 🔧 Debug Mode

To disable clustering temporarily:

**Option 1**: In `mapClusterConfig.js`
```javascript
export const DEBUG_DISABLE_CLUSTERING = true;
```

**Option 2**: In component
```jsx
<MapView enableClustering={false} />
```

## 📱 Accessibility

- **Keyboard**: Tab through markers, Enter to open
- **Screen Reader**: Announces "Cluster of X reports"
- **High Contrast**: Enhanced borders in high contrast mode
- **Reduced Motion**: Respects user preference

## 🎓 Learn More

- Full documentation: `docs/MAP_CLUSTERING.md`
- Config options: `src/config/mapClusterConfig.js`
- Component source: `src/components/MarkerClusterGroup.js`
- Custom styles: `src/styles/mapClustering.css`

## 🆘 Need Help?

1. Check console for errors
2. Try disabling clustering to isolate issue
3. Review configuration in `mapClusterConfig.js`
4. Check leaflet.markercluster documentation
5. Verify React-Leaflet v5 compatibility

## 🚦 Quick Commands

```bash
# Install dependencies (if needed)
npm install leaflet.markercluster --legacy-peer-deps

# Start dev server
npm start

# Build for production
npm run build
```

## ✅ Migration Status

- ✅ Dependencies installed
- ✅ Configuration created
- ✅ Component implemented
- ✅ Styling applied
- ✅ MapView updated
- ✅ Documentation complete
- ✅ Ready to use!

---

**Status**: ✅ **Production Ready**
**Version**: 1.0.0
**Last Updated**: January 2025
