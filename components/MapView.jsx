'use client';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import Map, { Marker, Popup, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getPropertyImage } from '@/utils/propertyDisplay';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { MAP_DEFAULT_PROPS, MAP_STYLE, MAPBOX_ACCESS_TOKEN } from '@/components/shared/MapConfig';

// ── Known city coordinates (geocoding fallback) ──
const knownCities = {
  'Alta Gracia': [-31.6525, -64.4397],
  Cordoba: [-31.4201, -64.1888],
  Córdoba: [-31.4201, -64.1888],
  'Villa Carlos Paz': [-31.4247, -64.4978],
  'Carlos Paz': [-31.4247, -64.4978],
  'San Francisco': [-31.4279, -62.0857],
  'Rio Tercero': [-32.0278, -64.1055],
  'Jesus Maria': [-30.9815, -64.0932],
  'Jesús María': [-30.9815, -64.0932],
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
  'Villa Allende': [-31.3, -64.3],
  Cosquin: [-31.24, -64.47],
  'La Calera': [-31.35, -64.34],
  Saldan: [-31.31, -64.31],
  Malagueño: [-31.46, -64.36],
  Toledo: [-31.55, -64.01],
};

function geocode(property) {
  if (property.location?.lat && property.location?.lng) {
    return { lat: property.location.lat, lng: property.location.lng };
  }
  const city = property.location?.city;
  if (city && knownCities[city]) {
    const base = knownCities[city];
    const offset = () => (Math.random() - 0.5) * 0.008;
    return { lat: base[0] + offset(), lng: base[1] + offset() };
  }
  return null;
}

function MapViewControls({ mapRef, geocodedProps }) {
  const map = useMap();

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance || geocodedProps.length === 0) return;

    const bounds = geocodedProps.reduce(
      (acc, p) => {
        return [
          [Math.min(acc[0][0], p.coords.lng), Math.min(acc[0][1], p.coords.lat)],
          [Math.max(acc[1][0], p.coords.lng), Math.max(acc[1][1], p.coords.lat)],
        ];
      },
      [[Infinity, Infinity], [-Infinity, -Infinity]]
    );

    const padding = 60;
    mapInstance.fitBounds(bounds, { padding, duration: 800, maxZoom: 14 });
  }, [geocodedProps, mapRef, map]);

  return null;
}

function formatPrice(property) {
  const priceStr = property.price;
  if (!priceStr) return '?';
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return '?';
  if (num >= 1000000) return `USD $${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `USD ${Math.round(num / 1000)}k`;
  return `USD $${num}`;
}

import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap, AdvancedMarker, InfoWindow, useMap as useGoogleMap } from '@vis.gl/react-google-maps';

function GoogleMapViewControls({ geocodedProps }) {
  const map = useGoogleMap();
  useEffect(() => {
    if (!map || geocodedProps.length === 0 || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    geocodedProps.forEach(p => {
      bounds.extend(new window.google.maps.LatLng(p.coords.lat, p.coords.lng));
    });
    map.fitBounds(bounds, 60);
  }, [map, geocodedProps]);
  return null;
}

// ── Main MapView component ──
const MapView = forwardRef(({ properties = [], onMarkerClick, selectedId }, ref) => {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';

  const [geocodedProps, setGeocodedProps] = useState([]);
  const [visitedIds, setVisitedIds] = useState(new Set());
  const [popupProperty, setPopupProperty] = useState(null);
  const mapRef = useRef(null);
  const [googleMapInstance, setGoogleMapInstance] = useState(null);

  useImperativeHandle(ref, () => ({
    flyTo: (coords, zoom) => {
      if (mapProvider === 'google' && googleMapInstance) {
        googleMapInstance.panTo({ lat: coords[1], lng: coords[0] });
        googleMapInstance.setZoom(zoom || 15);
      } else if (mapRef.current) {
        mapRef.current.flyTo({ center: [coords[1], coords[0]], zoom: zoom || 15, duration: 800 });
      }
    },
  }));

  useEffect(() => {
    const geo = properties
      .map((p) => ({ ...p, coords: geocode(p) }))
      .filter((p) => p.coords != null);
    setGeocodedProps(geo);
  }, [properties]);

  const handleMarkerClick = useCallback((property) => {
    onMarkerClick?.(property._id);
    setVisitedIds((prev) => new Set([...prev, property._id]));
    setPopupProperty(property);
  }, [onMarkerClick]);

  const defaultCenter = [-64.4397, -31.6525]; // Alta Gracia [lng, lat]

  if (geocodedProps.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const renderPopupContent = (prop) => (
    <div className="min-w-[220px] max-w-[260px]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <img
        src={getPropertyImage(prop)}
        alt={prop.name}
        className="w-full h-32 object-cover rounded-md mb-2"
      />
      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{prop.name}</h3>
      <p className="text-xs text-gray-500 mt-0.5">
        {prop.location?.city}, {prop.location?.state}
      </p>
      <p className="font-bold mt-1 text-base" style={{ color: '#C93E15' }}>{prop.price || 'Consultar'}</p>
      <a
        href={generateWhatsAppLink({ property: prop })}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 bg-whatsapp text-white text-xs font-semibold rounded-md hover:bg-whatsapp-hover transition-colors"
      >
        WhatsApp
      </a>
    </div>
  );

  return (
    <MapProvider>
      {mapProvider === 'google' ? (
        <GoogleMap
          defaultZoom={13}
          defaultCenter={{ lat: defaultCenter[1], lng: defaultCenter[0] }}
          mapId={googleMapId}
          onIdle={(e) => setGoogleMapInstance(e.map)}
          disableDefaultUI={false}
          streetViewControl={true}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          <GoogleMapViewControls geocodedProps={geocodedProps} />
          {geocodedProps.map((property) => {
            const isSelected = selectedId === property._id;
            const isVisited = visitedIds.has(property._id);
            const bg = isVisited ? '#6B7B8D' : isSelected ? '#E94560' : '#C93E15';

            return (
              <AdvancedMarker
                key={property._id}
                position={{ lat: property.coords.lat, lng: property.coords.lng }}
                onClick={(e) => {
                  e.stop();
                  handleMarkerClick(property);
                }}
              >
                <div
                  className="price-tag"
                  style={{
                    background: bg,
                    color: bg,
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(233,69,96,0.4), 0 8px 24px rgba(0,0,0,0.35)'
                      : '0 4px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)',
                    transform: isSelected ? 'scale(1.15)' : 'none',
                    zIndex: isSelected ? 1000 : 'auto',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ color: '#fff' }}>{formatPrice(property)}</span>
                </div>
              </AdvancedMarker>
            );
          })}
          
          {popupProperty && (
            <InfoWindow
              position={{ lat: popupProperty.coords.lat, lng: popupProperty.coords.lng }}
              onCloseClick={() => setPopupProperty(null)}
              pixelOffset={[0, -30]}
            >
              {renderPopupContent(popupProperty)}
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapLib={import('mapbox-gl')}
          initialViewState={{
            longitude: defaultCenter[0],
            latitude: defaultCenter[1],
            zoom: 13,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/wolfim77/cmp93y2ft000s01qf5dxi9ar7"
          scrollZoom={true}
          attributionControl={false}
          cooperativeGestures={true}
        >
          <MapViewControls mapRef={mapRef} geocodedProps={geocodedProps} />
          {geocodedProps.map((property) => {
            const isSelected = selectedId === property._id;
            const isVisited = visitedIds.has(property._id);
            const bg = isVisited ? '#6B7B8D' : isSelected ? '#E94560' : '#C93E15';

            return (
              <Marker
                key={property._id}
                longitude={property.coords.lng}
                latitude={property.coords.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(property);
                }}
              >
                <div
                  className="price-tag"
                  style={{
                    background: bg,
                    color: bg,
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(233,69,96,0.4), 0 8px 24px rgba(0,0,0,0.35)'
                      : '0 4px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)',
                    transform: isSelected ? 'scale(1.15)' : 'none',
                    zIndex: isSelected ? 1000 : 'auto',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ color: '#fff' }}>{formatPrice(property)}</span>
                </div>
              </Marker>
            );
          })}

          {popupProperty && (
            <Popup
              longitude={popupProperty.coords.lng}
              latitude={popupProperty.coords.lat}
              anchor="top"
              onClose={() => setPopupProperty(null)}
              closeButton={true}
              closeOnClick={false}
              maxWidth="280px"
              className="property-popup"
            >
              {renderPopupContent(popupProperty)}
            </Popup>
          )}
        </Map>
      )}
    </MapProvider>
  );
});

MapView.displayName = 'MapView';
export default MapView;
