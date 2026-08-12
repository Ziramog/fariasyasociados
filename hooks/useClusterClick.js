'use client';
import { useCallback } from 'react';

export function useClusterClick({ mapRef, markers, onSelect }) {
  const handleClick = useCallback(
    (event) => {
      const features = event.features || [];
      if (features.length === 0) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id;
      const map = mapRef?.current?.getMap?.();

      if (clusterId != null) {
        if (!map) return;
        const source = map.getSource('properties');
        if (!source) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.flyTo({
            center: feature.geometry.coordinates,
            zoom: Math.min(zoom, 16),
            duration: 500,
          });
        });
      } else {
        const id = feature.properties?.id;
        const prop = markers.find((p) => p._id === id);
        if (prop && onSelect) onSelect(prop);
      }
    },
    [mapRef, markers, onSelect]
  );

  const handleMouseMove = useCallback(
    (event) => {
      const map = mapRef?.current?.getMap?.();
      if (!map) return;

      const features = event.features || [];
      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
    },
    [mapRef]
  );

  return { handleClick, handleMouseMove };
}
