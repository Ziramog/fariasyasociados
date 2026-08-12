'use client';
import { useState, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import Map from 'react-map-gl';
import { useRouter } from 'next/navigation';
import MapClusterLayer from '@/components/MapClusterLayer';
import MapPropertySidebar from '@/components/MapPropertySidebar';
import { MAP_DEFAULT_PROPS, MAP_STYLE } from '@/components/shared/MapConfig';


const knownCities = {
  'Alta Gracia': [-31.6525, -64.4397],
  'Córdoba': [-31.4201, -64.1888],
  Cordoba: [-31.4201, -64.1888],
  'Villa Carlos Paz': [-31.4247, -64.4977],
  'Carlos Paz': [-31.4247, -64.4977],
  'San Francisco': [-31.4279, -62.0857],
  'Rio Tercero': [-32.0278, -64.1055],
  'Jesús María': [-30.9815, -64.0932],
  'Jesus Maria': [-30.9815, -64.0932],
  'La Falda': [-31.0833, -64.4833],
  'Falda del Carmen': [-31.6333, -64.4500],
  'Villa General Belgrano': [-31.9667, -64.55],
  Anisacate: [-31.7, -64.4167],
  Despeñaderos: [-32.15, -64.3],
  'Huerta Grande': [-31.0667, -64.5],
  'La Paisanita': [-31.72, -64.48],
  'La Serranita': [-31.7167, -64.4],
  'Los Aromos': [-31.6833, -64.3833],
  'Los Gigantes': [-31.4, -64.8],
  'Los Molinos': [-31.7667, -64.3667],
  'Potrero de Garay': [-31.75, -64.45],
  'San Clemente': [-31.8833, -64.4667],
  'Santa Ana': [-31.6333, -64.3667],
  Mendiolaza: [-31.3, -64.3],
  Unquillo: [-31.23, -64.32],
  'Rio Ceballos': [-31.17, -64.32],
  'Río Ceballos': [-31.17, -64.32],
  'Villa Allende': [-31.3, -64.3],
  Cosquin: [-31.24, -64.47],
  Cosquín: [-31.24, -64.47],
  'La Calera': [-31.35, -64.34],
  Saldan: [-31.31, -64.31],
  Malagueño: [-31.46, -64.36],
  Toledo: [-31.55, -64.01],
};

function geocodeCity(city) {
  if (!city) return null;
  const coords = knownCities[city];
  return coords ? { lat: coords[0], lng: coords[1] } : null;
}

function getOffset(id) {
  const num = parseInt(String(id).slice(-6), 16) || 0;
  return {
    lat: ((num % 1000) / 1000 - 0.5) * 0.008,
    lng: ((num % 997) / 997 - 0.5) * 0.008,
  };
}

import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';
import GoogleMapClusterLayer from '@/components/GoogleMapClusterLayer';

const CategoryMap = ({ properties = [] }) => {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';

  const [selectedProperty, setSelectedProperty] = useState(null);
  const mapRef = useRef();
  const router = useRouter();

  const { markers, initialViewState } = useMemo(() => {
    const list = [];
    const cityTracker = {};

    properties.forEach((p) => {
      let coords = null;

      if (p.coordinates?.lat != null && p.coordinates?.lng != null) {
        coords = { lat: p.coordinates.lat, lng: p.coordinates.lng };
      } else if (p.location?.city) {
        coords = geocodeCity(p.location.city);
      }

      if (coords && coords.lat != null && coords.lng != null) {
        const cityKey = p.location?.city || 'unknown';
        const count = cityTracker[cityKey] || 0;
        cityTracker[cityKey] = count + 1;

        const off = getOffset(p._id);
        list.push({
          ...p,
          coords: {
            lat: coords.lat + (count > 0 ? off.lat : 0),
            lng: coords.lng + (count > 0 ? off.lng : 0),
          },
        });
      }
    });

    if (list.length === 0) {
      return { markers: [], initialViewState: null };
    }

    if (list.length === 1) {
      return {
        markers: list,
        initialViewState: { longitude: list[0].coords.lng, latitude: list[0].coords.lat, zoom: 14 },
      };
    }

    const lats = list.map((m) => m.coords.lat);
    const lngs = list.map((m) => m.coords.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      markers: list,
      initialViewState: {
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom: 11,
      },
    };
  }, [properties]);

  const onMapboxLoad = useCallback((evt) => {
    const map = evt.target;

    if (markers.length > 1) {
      const bounds = markers.reduce(
        (acc, m) => [
          [Math.min(acc[0][0], m.coords.lng), Math.min(acc[0][1], m.coords.lat)],
          [Math.max(acc[1][0], m.coords.lng), Math.max(acc[1][1], m.coords.lat)],
        ],
        [[Infinity, Infinity], [-Infinity, -Infinity]]
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    } else if (markers.length === 1) {
      map.flyTo({ center: [markers[0].coords.lng, markers[0].coords.lat], zoom: 14, duration: 500 });
    }
  }, [markers]);

  // Track if we already fitted bounds on Google Maps
  const hasFittedBoundsRef = useRef(false);

  const onGoogleMapIdle = useCallback((map) => {
    if (!map || hasFittedBoundsRef.current || !window.google) return;
    
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend(new window.google.maps.LatLng(m.coords.lat, m.coords.lng)));
      map.fitBounds(bounds);
    } else if (markers.length === 1) {
      map.setCenter({ lat: markers[0].coords.lat, lng: markers[0].coords.lng });
      map.setZoom(14);
    }
    hasFittedBoundsRef.current = true;
  }, [markers]);

  if (markers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[#999] text-[15px]">
        No hay ubicaciones disponibles para mostrar
      </div>
    );
  }

  return (
    <MapProvider>
      <div className="relative rounded-[30px] overflow-hidden" style={{ height: 500 }}>
        {mapProvider === 'google' ? (
          <GoogleMap
            defaultZoom={initialViewState?.zoom || 11}
            defaultCenter={{ lat: initialViewState?.latitude || -31.6525, lng: initialViewState?.longitude || -64.4397 }}
            mapId={googleMapId}
            onIdle={(e) => onGoogleMapIdle(e.map)}
            disableDefaultUI={false}
            streetViewControl={true}
            mapTypeControl={false}
            fullscreenControl={true}
          >
            <GoogleMapClusterLayer 
              properties={markers} 
              onSelect={setSelectedProperty} 
              selectedId={selectedProperty?._id} 
            />
          </GoogleMap>
        ) : (
          <Map
            ref={mapRef}
            onLoad={onMapboxLoad}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            mapLib={mapboxgl}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            {...MAP_DEFAULT_PROPS}
          >
            <MapClusterLayer properties={markers} onSelect={setSelectedProperty} selectedId={selectedProperty?._id} />
          </Map>
        )}
      </div>

      {/* Sidebar — portal to body so it escapes overflow-hidden ancestors */}
      {selectedProperty && typeof document !== 'undefined' && createPortal(
        <MapPropertySidebar
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />,
        document.body
      )}
    </MapProvider>
  );
};

export default CategoryMap;
