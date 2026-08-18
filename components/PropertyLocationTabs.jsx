'use client';
import { useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
import Image from 'next/image';
import pin from '@/assets/images/pin.svg';
import Spinner from './Spinner';
import { MAP_DEFAULT_PROPS, MAP_STYLE, MAPBOX_ACCESS_TOKEN } from '@/components/shared/MapConfig';

const knownCities = {
  'Alta Gracia': [-31.6525, -64.4397],
  'Córdoba': [-31.4201, -64.1888],
  Cordoba: [-31.4201, -64.1888],
  'Villa Carlos Paz': [-31.4247, -64.4977],
  'San Francisco': [-31.4279, -62.0857],
  'Rio Tercero': [-32.0278, -64.1055],
  'Jesús María': [-30.9815, -64.0932],
  'La Falda': [-31.0833, -64.4833],
  'Villa General Belgrano': [-31.9667, -64.55],
  Cosquín: [-31.24, -64.47],
  Mendiolaza: [-31.3, -64.3],
  Unquillo: [-31.23, -64.32],
  'Río Ceballos': [-31.17, -64.32],
  'Villa Allende': [-31.3, -64.3],
  'La Calera': [-31.35, -64.34],
  Malagueño: [-31.46, -64.36],
};

function geocodeCity(city) {
  if (!city) return null;
  const coords = knownCities[city];
  return coords ? { lat: coords[0], lng: coords[1] } : null;
}

import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

const PropertyLocationTabs = ({ property }) => {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';

  const [activeTab, setActiveTab] = useState('map');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geocodeError, setGeocodeError] = useState(false);

  useEffect(() => {
    const fetchCoords = async () => {
      const cityCoords = geocodeCity(property.location?.city);
      if (cityCoords) {
        setLat(cityCoords.lat);
        setLng(cityCoords.lng);
        setLoading(false);
        return;
      }

      const query = [property.location?.street, property.location?.city, property.location?.state, 'Argentina']
        .filter(Boolean)
        .join(', ');

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
          { headers: { 'User-Agent': 'property-pulse-app' } }
        );
        const data = await res.json();

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
  }, [property.location]);

  if (loading) return <Spinner loading={loading} />;

  if (geocodeError) {
    return <div className='text-xl text-[var(--color-ink-tertiary)]'>No location data found</div>;
  }

  const tabs = [
    { id: 'map', label: 'Mapa', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    )},
    { id: 'streetview', label: 'Street View', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )},
  ];

  return (
    <MapProvider>
      <div>
        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[var(--color-brand)] text-white shadow-md shadow-[var(--color-brand)]/20'
                  : 'bg-[var(--color-surface-soft)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl overflow-hidden border border-[var(--color-border)]" style={{ height: 500 }}>
          {activeTab === 'map' ? (
            mapProvider === 'google' ? (
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
                  <Image src={pin} alt='location' width={40} height={40} />
                </AdvancedMarker>
              </GoogleMap>
            ) : (
              <Map
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                mapLib={import('mapbox-gl')}
                initialViewState={{ longitude: lng, latitude: lat, zoom: 15 }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/wolfim77/cmp93y2ft000s01qf5dxi9ar7"
                cooperativeGestures={true}
              >
                <Marker longitude={lng} latitude={lat} anchor='bottom'>
                  <Image src={pin} alt='location' width={40} height={40} />
                </Marker>
              </Map>
            )
          ) : (
            <div className="relative w-full h-full">
              <iframe
                title="Street View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses!2sar`}
              />
              {/* Overlay link to open full Street View */}
              <a
                href={`https://www.google.com/maps/@${lat},${lng},3a,75y,210h,90t/data=!3m6!1e1!3m4!1s!2e0!7i13312!8i6656`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[var(--color-ink)] px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Abrir Street View
              </a>
            </div>
          )}
        </div>
      </div>
    </MapProvider>
  );
};

export default PropertyLocationTabs;
