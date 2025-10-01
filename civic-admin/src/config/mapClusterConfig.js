/**
 * Map Clustering Configuration
 *
 * This file contains configuration options for Leaflet marker clustering with spiderfy.
 * Adjust these values to tune clustering behavior, performance, and visual appearance.
 */

const mapClusterConfig = {
  /**
   * CLUSTERING BEHAVIOR
   */

  // Maximum radius a cluster will cover from the center marker (in pixels)
  // Lower values = more granular clusters, higher values = more aggressive clustering
  maxClusterRadius: 80,

  // When two markers are closer than this distance (in pixels) at max zoom,
  // they will be spiderfied instead of showing separate markers
  spiderfyDistanceMultiplier: 1,

  // Disable clustering at this zoom level and below
  // Set to null to always cluster, or a number (e.g., 18) to disable at high zoom
  disableClusteringAtZoom: null,

  // Zoom to bounds padding when clicking a cluster
  spiderfyMaxZoom: 16,

  // Whether to animate marker addition/removal
  animate: true,

  // Animation duration for spiderfy (milliseconds)
  animateAddingMarkers: true,

  /**
   * SPIDERFY SETTINGS
   */

  // Enable spiderfy feature (circular arrangement of overlapping markers)
  spiderfyOnMaxZoom: true,

  // Show bounds of all markers in cluster when clicking
  showCoverageOnHover: false,

  // When clicking a cluster, zoom to its bounds
  zoomToBoundsOnClick: true,

  // Remove cluster outline when zooming out
  removeOutsideVisibleBounds: true,

  // Spiderfy leg polyline options
  spiderLegPolylineOptions: {
    weight: 1.5,
    color: '#6366f1',
    opacity: 0.5,
  },

  /**
   * PERFORMANCE SETTINGS
   */

  // Chunked loading for large datasets (improves initial render)
  chunkedLoading: true,

  // Number of markers to process per frame when chunkedLoading is true
  chunkInterval: 200,

  // Delay between processing chunks (milliseconds)
  chunkDelay: 50,

  // Maximum number of markers to show without clustering
  // Beyond this, clustering is enforced for performance
  performanceThreshold: 1000,

  /**
   * VISUAL CUSTOMIZATION
   */

  // Cluster icon creation function
  // Returns an L.DivIcon based on cluster child count and status distribution
  iconCreateFunction: (cluster) => {
    const childCount = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();

    // Analyze status distribution in cluster
    const statusCounts = markers.reduce((acc, marker) => {
      const status = marker.options.reportStatus || 'submitted';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Determine dominant status
    const dominantStatus = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'submitted';

    // Get color based on dominant status
    const colorMap = {
      submitted: '#3b82f6',
      acknowledged: '#8b5cf6',
      assigned: '#f59e0b',
      in_progress: '#f97316',
      resolved: '#10b981',
      rejected: '#ef4444',
      closed: '#6b7280',
    };

    const bgColor = colorMap[dominantStatus] || '#3b82f6';

    // Size based on count
    let size = 'small';
    let dimension = 40;
    if (childCount >= 100) {
      size = 'large';
      dimension = 60;
    } else if (childCount >= 10) {
      size = 'medium';
      dimension = 50;
    }

    const L = require('leaflet');

    return L.divIcon({
      html: `
        <div class="cluster-marker cluster-marker-${size}" style="
          background-color: ${bgColor};
          width: ${dimension}px;
          height: ${dimension}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: ${dimension === 40 ? '14px' : dimension === 50 ? '16px' : '18px'};
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          position: relative;
          transition: transform 0.2s;
        ">
          <span>${childCount}</span>
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: [dimension, dimension],
      iconAnchor: [dimension / 2, dimension / 2],
    });
  },

  /**
   * ACCESSIBILITY & UX
   */

  // Polygon options for cluster coverage area on hover
  polygonOptions: {
    fillColor: '#6366f1',
    color: '#4f46e5',
    weight: 2,
    opacity: 0.5,
    fillOpacity: 0.2,
  },

  // Minimum touch target size (ensures mobile usability)
  minTouchTargetSize: 44, // pixels (WCAG AA guideline)

  // Keyboard navigation support
  keyboardAccessible: true,
};

/**
 * UTILITY: Get nearby threshold in pixels at current zoom
 * Used to determine if markers should be considered "overlapping"
 */
export const getNearbyThreshold = (zoom) => {
  // At higher zoom, markers need to be closer to be considered overlapping
  // At lower zoom, be more aggressive about clustering
  if (zoom >= 16) return 10; // Very close only
  if (zoom >= 13) return 20;
  if (zoom >= 10) return 40;
  return 80; // Far zoom = aggressive clustering
};

/**
 * UTILITY: Disable clustering (for debugging)
 * Set this to true in your MapView to disable clustering temporarily
 */
export const DEBUG_DISABLE_CLUSTERING = false;

export default mapClusterConfig;
