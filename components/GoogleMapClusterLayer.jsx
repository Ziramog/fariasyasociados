'use client';
import { useEffect, useRef } from 'react';
import { AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

export default function GoogleMapClusterLayer({ properties, onSelect, selectedId }) {
  const map = useMap();
  const markerLibrary = useMapsLibrary('marker');
  const clusterer = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!map || !markerLibrary) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
        onClusterClick: (event, cluster, map) => {
          const currentZoom = map.getZoom();
          const targetZoom = Math.min(currentZoom + 3, 18);
          map.panTo(cluster.position);
          map.setZoom(targetZoom);
        },
        renderer: {
          render: ({ count, position }) => {
            const container = document.createElement('div');
            container.className = 'relative flex items-center justify-center w-10 h-10 cursor-pointer';

            const ripple = document.createElement('div');
            ripple.className = 'absolute inset-0 rounded-full bg-[#db7340] animate-ping opacity-75';

            const circle = document.createElement('div');
            circle.className = 'relative z-10 flex items-center justify-center w-full h-full rounded-full bg-[#db7340] text-white font-bold text-sm shadow-md';
            circle.innerText = count;

            container.appendChild(ripple);
            container.appendChild(circle);

            return new markerLibrary.AdvancedMarkerElement({
              position,
              content: container,
            });
          }
        }
      });
    }
  }, [map, markerLibrary]);

  useEffect(() => {
    if (!clusterer.current) return;
    const timer = setTimeout(() => {
      clusterer.current.clearMarkers();
      clusterer.current.addMarkers(Object.values(markersRef.current));
    }, 100);
    return () => clearTimeout(timer);
  }, [properties, map, markerLibrary]);

  return (
    <>
      {properties.map(p => (
        <AdvancedMarker
          key={p._id}
          position={{ lat: p.coords.lat, lng: p.coords.lng }}
          onClick={() => onSelect(p)}
          ref={(marker) => {
            if (marker) markersRef.current[p._id] = marker;
            else delete markersRef.current[p._id];
          }}
        >
          <div className="relative cursor-pointer transition-transform duration-200 hover:scale-110">
            <Pin background={'#db7340'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={selectedId === p._id ? 1.2 : 1.0} />
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
