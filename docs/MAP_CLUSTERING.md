# Map Clustering with Spiderfy

## Overview

The admin dashboard now includes advanced marker clustering with spiderfy functionality to handle overlapping report markers on the map. This feature ensures that all reports are accessible and selectable, even when multiple reports share identical or near-identical coordinates.

## Features

### ✨ Marker Clustering
- **Automatic grouping**: Reports are automatically clustered based on zoom level and proximity
- **Visual feedback**: Cluster bubbles show the count of reports in each cluster
- **Smart sizing**: Cluster icons scale based on the number of reports they contain
- **Status-based coloring**: Cluster color reflects the dominant report status

### 🕷️ Spiderfy for Overlaps
- **Exact coordinate handling**: When multiple reports share the exact same location, they're automatically spiderfied
- **Circular arrangement**: Overlapping markers are arranged in a circle/spiral around the original point
- **Visual legs**: Thin lines ("spider legs") connect each marker to the center point
- **Easy selection**: Each marker in the spiderfied cluster is fully clickable

### 🚀 Performance Optimized
- **Chunked loading**: Large datasets (5k-20k+ markers) are loaded progressively
- **GPU acceleration**: CSS transforms use hardware acceleration
- **Efficient rendering**: Only visible markers are rendered as DOM nodes
- **Minimal re-renders**: Cluster layer persists across component updates

### ♿ Accessibility
- **Keyboard navigation**: All markers and clusters are keyboard accessible
- **Focus indicators**: Clear visual focus states for navigation
- **Touch-friendly**: Minimum 44px touch targets on mobile devices
- **High contrast mode**: Enhanced contrast when system preference is detected
- **Reduced motion**: Respects user's motion preferences

## Usage

### Basic Usage

The clustering feature is **enabled by default** in the MapView component:

```jsx
import MapView from '../components/MapView';

function Reports() {
  const [reports, setReports] = useState([]);

  return (
    <MapView
      reports={reports}
      onMarkerClick={handleMarkerClick}
    />
  );
}
```

### Disabling Clustering

To disable clustering (e.g., for debugging):

```jsx
<MapView
  reports={reports}
  onMarkerClick={handleMarkerClick}
  enableClustering={false}
/>
```

Or, for global debugging, set in `src/config/mapClusterConfig.js`:

```javascript
export const DEBUG_DISABLE_CLUSTERING = true;
```

### Custom Configuration

Override default clustering behavior:

```jsx
import MapView from '../components/MapView';
import MarkerClusterGroup from '../components/MarkerClusterGroup';

function CustomMap() {
  const customConfig = {
    maxClusterRadius: 100,  // Larger clusters
    spiderfyOnMaxZoom: true,
    animate: true,
  };

  return (
    <MapContainer>
      <MarkerClusterGroup config={customConfig}>
        {/* Your markers */}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
```

## Configuration Options

All configuration is centralized in `src/config/mapClusterConfig.js`:

### Core Settings

| Option | Default | Description |
|--------|---------|-------------|
| `maxClusterRadius` | 80 | Maximum radius (pixels) for clustering |
| `spiderfyDistanceMultiplier` | 1 | Distance threshold for spiderfy |
| `disableClusteringAtZoom` | null | Zoom level to disable clustering |
| `spiderfyOnMaxZoom` | true | Enable spiderfy at max zoom |

### Performance Settings

| Option | Default | Description |
|--------|---------|-------------|
| `chunkedLoading` | true | Load markers in chunks |
| `chunkInterval` | 200 | Markers per chunk |
| `chunkDelay` | 50ms | Delay between chunks |
| `performanceThreshold` | 1000 | Force clustering above this count |

### Visual Settings

| Option | Default | Description |
|--------|---------|-------------|
| `animate` | true | Enable animations |
| `showCoverageOnHover` | false | Show cluster coverage area |
| `spiderLegPolylineOptions` | See config | Spider leg styling |

### Spiderfy Behavior

| Option | Default | Description |
|--------|---------|-------------|
| `zoomToBoundsOnClick` | true | Zoom when clicking cluster |
| `spiderfyMaxZoom` | 16 | Max zoom before spiderfy |
| `removeOutsideVisibleBounds` | true | Remove off-screen clusters |

## User Interactions

### Zoomed Out View
- Map displays cluster bubbles with report counts
- Cluster color indicates dominant report status
- Hover shows cluster coverage area (if enabled)

### Clicking a Cluster
1. **If zoom can separate markers**: Map zooms to cluster bounds
2. **If markers remain overlapped**: Markers spiderfy in place
3. **Touch**: Same behavior with larger touch targets

### Spiderfied State
- Markers arrange in a circle around the original point
- Spider legs connect each marker to center
- Click any marker to view report details
- Click outside cluster to collapse back

### Individual Markers
- Clicking opens popup with report details
- "View Details" button navigates to full report
- Keyboard users can tab through markers

## Styling Customization

### Theme Integration

Cluster colors automatically match report status colors from `src/constants/reportStatus.js`:

```javascript
const colorMap = {
  submitted: '#3b82f6',      // Blue
  acknowledged: '#8b5cf6',   // Purple
  assigned: '#f59e0b',       // Amber
  in_progress: '#f97316',    // Orange
  resolved: '#10b981',       // Green
  rejected: '#ef4444',       // Red
  closed: '#6b7280',         // Gray
};
```

### Custom Cluster Styling

Modify `iconCreateFunction` in `src/config/mapClusterConfig.js`:

```javascript
iconCreateFunction: (cluster) => {
  const count = cluster.getChildCount();

  // Custom logic for your cluster appearance
  return L.divIcon({
    html: `<div class="my-cluster">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: [40, 40],
  });
}
```

### CSS Customization

Edit `src/styles/mapClustering.css` to customize:

- Cluster bubble appearance
- Spider leg colors and thickness
- Animations and transitions
- Hover effects
- Mobile responsiveness

## Performance Testing

### Recommended Test Scenarios

1. **Small dataset (< 100 markers)**: Should render instantly
2. **Medium dataset (100-1000 markers)**: Should load within 1 second
3. **Large dataset (1000-10000 markers)**: Should load progressively with chunked loading
4. **Extreme dataset (10000+ markers)**: Clustering mandatory for performance

### Performance Monitoring

Listen to cluster events in browser console:

```javascript
// In browser console
window.addEventListener('cluster-clicked', (e) => {
  console.log('Cluster clicked:', e.detail);
});

window.addEventListener('cluster-spiderfied', (e) => {
  console.log('Cluster spiderfied:', e.detail);
});
```

### Optimization Tips

1. **For large datasets**: Increase `chunkInterval` to 500
2. **For slower devices**: Set `animate: false` for better performance
3. **For dense urban areas**: Increase `maxClusterRadius` to 100
4. **For rural areas**: Decrease to 60 for less aggressive clustering

## Browser Compatibility

### Tested Browsers

- ✅ Chrome 90+ (Chromium)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 9+)

### Known Issues

**Internet Explorer**: Not supported (requires modern ES6+ features)

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate between clusters and markers
- **Enter/Space**: Open cluster or marker popup
- **Escape**: Close popup or collapse spiderfied cluster
- **Arrow keys**: Pan map (native Leaflet behavior)

### Screen Readers

- Clusters announce as "Cluster of X reports"
- Markers announce report title and status
- ARIA labels on interactive elements

### Visual Accessibility

- Focus indicators: 3px outline with contrast
- Touch targets: Minimum 44px (WCAG AA)
- High contrast mode support
- Reduced motion support

## Troubleshooting

### Clusters Not Appearing

**Issue**: Markers appear individually without clustering

**Solutions**:
1. Check `DEBUG_DISABLE_CLUSTERING` is false
2. Verify `enableClustering={true}` prop
3. Ensure reports have valid lat/lng
4. Check browser console for errors

### Spiderfy Not Working

**Issue**: Overlapping markers don't spiderfy

**Solutions**:
1. Verify `spiderfyOnMaxZoom: true` in config
2. Zoom to max level and click cluster
3. Check that markers truly overlap (same coordinates)
4. Look for console errors from leaflet.markercluster

### Performance Issues

**Issue**: Map is slow with many markers

**Solutions**:
1. Enable `chunkedLoading: true`
2. Increase `chunkInterval` to 500 or 1000
3. Set `animate: false` for instant rendering
4. Lower `maxClusterRadius` to create fewer clusters
5. Consider server-side clustering for 50k+ markers

### Styling Not Applied

**Issue**: Clusters don't match theme colors

**Solutions**:
1. Ensure `src/styles/mapClustering.css` is imported
2. Check `iconCreateFunction` in config
3. Verify status colors in `reportStatus.js`
4. Clear browser cache and refresh

## Migration Notes

### Upgrading Existing Maps

If you have an existing MapView implementation:

1. Install dependencies: `npm install leaflet.markercluster --legacy-peer-deps`
2. Import clustering CSS in MapView component
3. Wrap markers in `<MarkerClusterGroup>`
4. Add `reportStatus` and `report` props to markers
5. Test with your data

### Breaking Changes

- None for standard usage
- Custom marker implementations may need `reportStatus` prop
- Custom popup rendering may need adjustment

## Advanced Usage

### Server-Side Clustering

For extremely large datasets (100k+ markers), consider server-side clustering:

```javascript
// Backend API endpoint
GET /api/reports/clusters?bounds=lat1,lng1,lat2,lng2&zoom=10

// Returns pre-clustered data based on viewport and zoom
```

### Dynamic Configuration

Adjust clustering based on zoom level:

```javascript
const map = useMap();

useEffect(() => {
  map.on('zoomend', () => {
    const zoom = map.getZoom();
    // Adjust clustering behavior dynamically
  });
}, [map]);
```

### Custom Events

Listen to clustering events:

```javascript
useEffect(() => {
  const handleClusterClick = (e) => {
    console.log('Cluster clicked:', e.detail);
    // Custom analytics, logging, etc.
  };

  window.addEventListener('cluster-clicked', handleClusterClick);

  return () => {
    window.removeEventListener('cluster-clicked', handleClusterClick);
  };
}, []);
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Heatmap mode for density visualization
- [ ] Custom spiderfy patterns (grid, spiral, etc.)
- [ ] Server-side clustering integration
- [ ] Marker filtering within clusters
- [ ] Cluster statistics panel
- [ ] Export clustered data
- [ ] A/B testing different cluster strategies

## Support

For issues or questions:

1. Check this documentation
2. Review config options in `src/config/mapClusterConfig.js`
3. Inspect browser console for errors
4. Test with `DEBUG_DISABLE_CLUSTERING = true`
5. Check leaflet.markercluster documentation

## References

- [Leaflet.markercluster Documentation](https://github.com/Leaflet/Leaflet.markercluster)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Compatibility**: React-Leaflet 5.0.0, Leaflet 1.9.4
