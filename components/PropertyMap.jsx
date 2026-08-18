'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import Map, { Marker } from 'react-map-gl';
import { MAP_DEFAULT_PROPS, MAP_STYLE, MAPBOX_ACCESS_TOKEN } from '@/components/shared/MapConfig';
import Spinner from './Spinner';
import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

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

const PropertyMap = ({ property }) => {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geocodeError, setGeocodeError] = useState(false);
  const mapRef = useRef();

  const onMapLoad = useCallback(() => {
    console.log('[PropertyMap] Map loaded successfully');
  }, []);

  useEffect(() => {
    const fetchCoords = async () => {
      // 1. Exact coordinates from DB
      if (property.coordinates?.lat != null && property.coordinates?.lng != null) {
        setLat(property.coordinates.lat);
        setLng(property.coordinates.lng);
        setLoading(false);
        return;
      }

      // 2. Known cities dictionary
      const cityCoords = geocodeCity(property.location?.city);
      if (cityCoords) {
        setLat(cityCoords.lat);
        setLng(cityCoords.lng);
        setLoading(false);
        return;
      }

      // 3. Nominatim geocoding fallback (full address)
      const fullQuery = [property.location?.street, property.location?.city, property.location?.state, 'Argentina']
        .filter(Boolean)
        .join(', ');

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`,
          { headers: { 'User-Agent': 'property-pulse-app' } }
        );
        let data = await res.json();

        // Fallback: try city + state + Argentina without street
        if (data.length === 0 && property.location?.city && property.location?.state) {
          const fallbackQuery = `${property.location.city}, ${property.location.state}, Argentina`;
          const fallbackRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}`,
            { headers: { 'User-Agent': 'property-pulse-app' } }
          );
          data = await fallbackRes.json();
        }

        if (data.length === 0) {
          setGeocodeError(true);
          setLoading(false);
          return;
        }

        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
        setLoading(false);
      } catch {
        setGeocodeError(true);
        setLoading(false);
      }
    };

    fetchCoords();
  }, [property.coordinates, property.location]);

  if (loading) return <Spinner loading={loading} />;

  if (geocodeError) {
    return <div className='text-xl'>No location data found</div>;
  }

  const markerSvg = (
    <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="m32 0a24.028 24.028 0 0 0 -24 24c0 16.228 22.342 38.756 23.293 39.707a1 1 0 0 0 1.414 0c.951-.951 23.293-23.479 23.293-39.707a24.028 24.028 0 0 0 -24-24z" fill="#db7340"/>
      <circle cx="32" cy="24" fill="#c06030" r="13"/>
      <circle cx="32" cy="24" fill="#fff" opacity="0.25" r="6"/>
    </svg>
  );

  return (
    <MapProvider>
      <div className="relative h-[500px]">
        {mapProvider === 'google' ? (
          <GoogleMap
            defaultZoom={15}
            defaultCenter={{ lat, lng }}
            mapId={googleMapId}
            disableDefaultUI={false}
            streetViewControl={true}
            mapTypeControl={false}
            fullscreenControl={true}
          >
            <AdvancedMarker position={{ lat, lng }}>
              {markerSvg}
            </AdvancedMarker>
          </GoogleMap>
        ) : (
          <Map
            ref={mapRef}
            onLoad={onMapLoad}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            mapLib={mapboxgl}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 15,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onError={(e) => console.error('[PropertyMap] Map load ERROR:', e?.error?.message || e)}
            {...MAP_DEFAULT_PROPS}
          >
            <Marker longitude={lng} latitude={lat} anchor='bottom'>
              {markerSvg}
            </Marker>
          </Map>
        )}
      </div>
    </MapProvider>
  );
};

export default PropertyMap;
