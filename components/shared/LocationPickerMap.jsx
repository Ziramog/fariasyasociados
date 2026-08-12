'use client';
import { useState, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { MAP_DEFAULT_PROPS, MAP_STYLE } from './MapConfig';

import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap, AdvancedMarker, MapControl, ControlPosition } from '@vis.gl/react-google-maps';

// Default center: Alta Gracia
const DEFAULT_CENTER = { lat: -31.6525, lng: -64.4397 };

export default function LocationPickerMap({ initialLat, initialLng, onLocationChange }) {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';

  const [marker, setMarker] = useState({
    lat: initialLat || DEFAULT_CENTER.lat,
    lng: initialLng || DEFAULT_CENTER.lng,
  });

  const [viewState, setViewState] = useState({
    latitude: initialLat || DEFAULT_CENTER.lat,
    longitude: initialLng || DEFAULT_CENTER.lng,
    zoom: 13,
  });

  // Sync if external props change (e.g. user manually typing in the input fields)
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setMarker({ lat: initialLat, lng: initialLng });
      setViewState(prev => ({
        ...prev,
        latitude: initialLat,
        longitude: initialLng,
      }));
    }
  }, [initialLat, initialLng]);

  const onMarkerDragEnd = useCallback((event) => {
    const lat = event.lngLat.lat;
    const lng = event.lngLat.lng;
    setMarker({ lat, lng });
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const onMapClick = useCallback((event) => {
    const lat = event.lngLat.lat;
    const lng = event.lngLat.lng;
    setMarker({ lat, lng });
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const onGoogleMarkerDragEnd = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const onGoogleMapClick = useCallback((event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    setMarker({ lat, lng });
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const markerSvg = (
    <div className="relative cursor-grab active:cursor-grabbing flex items-center justify-center">
      <svg
        width="36"
        height="48"
        viewBox="0 0 32 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M16 0C7.2 0 0.8 6.72 0.8 15.36c0 11.52 14.08 24.32 14.72 25.04 0.32 0.32 0.64 0.32 1.28 0 0.64-0.64 14.72-13.12 14.72-25.04C31.52 6.72 24.32 0 16 0z"
          fill="#db7340"
        />
        <circle cx="16" cy="15" r="6.5" fill="white" />
        <circle cx="16" cy="15" r="4" fill="#db7340" />
      </svg>
    </div>
  );

  return (
    <MapProvider>
      <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[#333] relative">
        {mapProvider === 'google' ? (
          <GoogleMap
            defaultZoom={viewState.zoom}
            defaultCenter={{ lat: viewState.latitude, lng: viewState.longitude }}
            mapId={googleMapId}
            onClick={onGoogleMapClick}
            disableDefaultUI={false}
            streetViewControl={true}
            mapTypeControl={false}
            fullscreenControl={true}
          >
            <AdvancedMarker
              position={marker}
              draggable={true}
              onDragEnd={onGoogleMarkerDragEnd}
            >
              {markerSvg}
            </AdvancedMarker>
          </GoogleMap>
        ) : (
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            mapLib={mapboxgl}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={onMapClick}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            {...MAP_DEFAULT_PROPS}
          >
            <NavigationControl position="bottom-right" />
            <Marker
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="bottom"
              draggable
              onDragEnd={onMarkerDragEnd}
            >
              {markerSvg}
            </Marker>
          </Map>
        )}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-md pointer-events-none shadow-md">
          Arrastrá el pin o hacé clic en el mapa
        </div>
      </div>
    </MapProvider>
  );
}
