/**
 * MarkerClusterGroup Component
 *
 * A React-Leaflet v5 compatible wrapper for leaflet.markercluster
 * Provides marker clustering with spiderfy functionality for overlapping markers
 *
 * Features:
 * - Automatic clustering based on zoom level
 * - Spiderfy for exact coordinate overlaps
 * - Custom cluster styling based on report status
 * - Performance optimized for large datasets (10k+ markers)
 * - Accessible and keyboard-navigable
 */

import { useEffect, useRef, useMemo, createContext, useContext, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import mapClusterConfig, { DEBUG_DISABLE_CLUSTERING } from '../config/mapClusterConfig';

// Create a context to share the cluster group with child markers
const ClusterContext = createContext(null);

export const useCluster = () => {
  return useContext(ClusterContext);
};

const MarkerClusterGroup = ({ children, config = {} }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Merge custom config with defaults (memoized to prevent re-renders)
  const clusterConfig = useMemo(() => ({
    ...mapClusterConfig,
    ...config,
  }), [config]);

  useEffect(() => {
    // Don't create cluster if debugging is enabled
    if (DEBUG_DISABLE_CLUSTERING) {
      return;
    }

    // Only create if not already created
    if (clusterGroupRef.current) {
      setIsReady(true);
      return;
    }

    // Create marker cluster group with config
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: clusterConfig.maxClusterRadius,
      spiderfyDistanceMultiplier: clusterConfig.spiderfyDistanceMultiplier,
      disableClusteringAtZoom: clusterConfig.disableClusteringAtZoom,
      spiderfyOnMaxZoom: clusterConfig.spiderfyOnMaxZoom,
      showCoverageOnHover: clusterConfig.showCoverageOnHover,
      zoomToBoundsOnClick: clusterConfig.zoomToBoundsOnClick,
      removeOutsideVisibleBounds: clusterConfig.removeOutsideVisibleBounds,
      animate: clusterConfig.animate,
      animateAddingMarkers: clusterConfig.animateAddingMarkers,
      spiderLegPolylineOptions: clusterConfig.spiderLegPolylineOptions,
      polygonOptions: clusterConfig.polygonOptions,
      chunkedLoading: clusterConfig.chunkedLoading,
      chunkInterval: clusterConfig.chunkInterval,
      chunkDelay: clusterConfig.chunkDelay,
      iconCreateFunction: clusterConfig.iconCreateFunction,
    });

    clusterGroupRef.current = clusterGroup;

    // Add cluster group to map
    map.addLayer(clusterGroup);

    // Mark as ready so children can render
    setIsReady(true);

    // Add cluster event listeners
    clusterGroup.on('clusterclick', (e) => {
      const cluster = e.layer;
      const childMarkers = cluster.getAllChildMarkers();

      // Custom event for analytics/tracking
      const event = new CustomEvent('cluster-clicked', {
        detail: {
          count: childMarkers.length,
          bounds: cluster.getBounds(),
          center: cluster.getLatLng(),
        },
      });
      window.dispatchEvent(event);
    });

    clusterGroup.on('spiderfied', (e) => {
      const cluster = e.cluster;
      const markers = e.markers;

      // Custom event when spiderfy is triggered
      const event = new CustomEvent('cluster-spiderfied', {
        detail: {
          markerCount: markers.length,
          center: cluster.getLatLng(),
        },
      });
      window.dispatchEvent(event);
    });

    // Cleanup on unmount
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
        setIsReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // Only depend on map, not clusterConfig

  // Provide cluster group via context
  // Only render children after cluster group is ready
  return (
    <ClusterContext.Provider value={clusterGroupRef.current}>
      {isReady ? children : null}
    </ClusterContext.Provider>
  );
};

export default MarkerClusterGroup;
