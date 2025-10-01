/**
 * ClusterMarker Component
 *
 * A Marker component that integrates with MarkerClusterGroup
 * This is a wrapper around Leaflet markers that adds them to the cluster group
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { useCluster } from './MarkerClusterGroup';

const ClusterMarker = ({ position, icon, children, reportStatus, report, eventHandlers }) => {
  const map = useMap();
  const clusterGroup = useCluster();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!position || position.length !== 2) {
      return;
    }

    // Create Leaflet marker
    const marker = L.marker(position, {
      icon: icon,
      reportStatus: reportStatus,
      report: report,
    });

    markerRef.current = marker;

    // Bind popup if children provided
    if (children) {
      // Render React children to HTML
      const popupContent = renderToStaticMarkup(children);
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        minWidth: 250,
        closeButton: true,
        autoPan: true,
      });
    }

    // Add event handlers if provided
    if (eventHandlers) {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        marker.on(event, handler);
      });
    }

    // Add marker to cluster group or map
    if (clusterGroup) {
      clusterGroup.addLayer(marker);
    } else {
      marker.addTo(map);
    }

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        if (clusterGroup) {
          clusterGroup.removeLayer(markerRef.current);
        } else {
          map.removeLayer(markerRef.current);
        }
        markerRef.current = null;
      }
    };
  }, [position, icon, children, reportStatus, report, eventHandlers, map, clusterGroup]);

  // This component doesn't render anything itself
  return null;
};

export default ClusterMarker;
