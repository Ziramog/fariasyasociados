'use client';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import MapboxMap from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { getPropertyImage } from '@/utils/propertyDisplay';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import PropertiesSearch from '@/components/PropertiesSearch';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MapClusterLayer from '@/components/MapClusterLayer';
import MapPropertySidebar from '@/components/MapPropertySidebar';
import { MAP_DEFAULT_PROPS, MAP_STYLE, MAPBOX_ACCESS_TOKEN } from '@/components/shared/MapConfig';
import SectionTitle from '@/components/shared/SectionTitle';
import MapProvider from '@/components/shared/MapProvider';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';
import dynamic from 'next/dynamic';

const GoogleMapClusterLayer = dynamic(() => import('@/components/GoogleMapClusterLayer'), { ssr: false });
const knownCities = {
  'Alta Gracia': [-31.6525, -64.4397],
  Cordoba: [-31.4201, -64.1888],
  'Córdoba': [-31.4201, -64.1888],
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

function getOffset(id) {
  const num = parseInt(String(id).slice(-6), 16) || 0;
  return {
    lat: ((num % 1000) / 1000 - 0.5) * 0.008,
    lng: ((num % 997) / 997 - 0.5) * 0.008,
  };
}

function geocode(property) {
  if (property.coordinates?.lat != null && property.coordinates?.lng != null) {
    return { lat: property.coordinates.lat, lng: property.coordinates.lng };
  }
  const city = property.location?.city;
  if (city && knownCities[city]) {
    const base = knownCities[city];
    const off = getOffset(property._id);
    return { lat: base[0] + off.lat, lng: base[1] + off.lng };
  }
  return null;
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}
export default function MapAllProperties({ initialProperties = [] }) {
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const googleMapId = '5840ac3c29d4b1c78be4a027';
  
  const [allProps, setAllProps] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const mapRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const geo = initialProperties
      .map((p) => ({ ...p, coords: geocode(p) }))
      .filter((p) => p.coords != null);
    setAllProps(geo);
  }, [initialProperties]);

  const filteredProps = useMemo(() => {
    if (!activeFilters) return allProps;

    let result = allProps;

    if (activeFilters.term) {
      const q = activeFilters.term.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.location?.city?.toLowerCase().includes(q) ||
        p.location?.street?.toLowerCase().includes(q)
      );
    }

    if (activeFilters.tipo) {
      result = result.filter(p => p.type === activeFilters.tipo);
    }

    if (activeFilters.price) {
      const [min, max] = activeFilters.price.split('-').map(Number);
      result = result.filter(p => {
        const price = parsePrice(p.price);
        if (price === 0) return false;
        if (max === 0) return price >= min;
        return price >= min && price <= max;
      });
    }

    if (activeFilters.minPrice) {
      const min = parseInt(activeFilters.minPrice, 10);
      result = result.filter(p => parsePrice(p.price) >= min);
    }

    if (activeFilters.maxPrice) {
      const max = parseInt(activeFilters.maxPrice, 10);
      result = result.filter(p => {
        const price = parsePrice(p.price);
        return price > 0 && price <= max;
      });
    }

    if (activeFilters.bedrooms) {
      const minBeds = parseInt(activeFilters.bedrooms, 10);
      result = result.filter(p => {
        const beds = parseInt(p.beds, 10);
        return !isNaN(beds) && beds >= minBeds;
      });
    }

    if (activeFilters.baths) {
      const minBaths = parseInt(activeFilters.baths, 10);
      result = result.filter(p => {
        const baths = parseInt(p.baths, 10);
        return !isNaN(baths) && baths >= minBaths;
      });
    }

    if (activeFilters.area) {
      const [minArea, maxArea] = activeFilters.area.split('-').map(Number);
      result = result.filter(p => {
        const area = parseInt(p.square_feet || p.covered_area, 10);
        if (isNaN(area) || area === 0) return false;
        if (maxArea === 0) return area >= minArea;
        return area >= minArea && area <= maxArea;
      });
    }

    if (activeFilters['property-type']?.length) {
      const typeMap = {
        residential: ['Casa', 'Departamento'],
        multi_family: ['Departamento'],
        land: ['Terreno', 'Campo'],
        commercial: ['Inmueble Comercial'],
        industrial: ['Inmueble Comercial'],
      };
      const allowedTypes = activeFilters['property-type'].flatMap(t => typeMap[t] || []);
      if (allowedTypes.length > 0) {
        result = result.filter(p => allowedTypes.includes(p.type));
      }
    }

    if (activeFilters.status?.length) {
      result = result.filter(p => activeFilters.status.includes(p.status));
    }

    return result;
  }, [allProps, activeFilters]);

  const updateVisibleCountMapbox = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getMap().getBounds();
    if (!bounds) return;

    const count = filteredProps.filter(p => {
      if (!p.coords) return false;
      return (
        p.coords.lat >= bounds.getSouth() &&
        p.coords.lat <= bounds.getNorth() &&
        p.coords.lng >= bounds.getWest() &&
        p.coords.lng <= bounds.getEast()
      );
    }).length;
    setVisibleCount(count);
  }, [filteredProps]);

  const updateVisibleCountGoogle = useCallback((map) => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;

    const count = filteredProps.filter(p => {
      if (!p.coords) return false;
      if (!window.google) return false;
      const latLng = new window.google.maps.LatLng(p.coords.lat, p.coords.lng);
      return bounds.contains(latLng);
    }).length;
    setVisibleCount(count);
  }, [filteredProps]);

  useEffect(() => {
    if (mapProvider === 'mapbox') {
      const timer = setTimeout(() => updateVisibleCountMapbox(), 100);
      return () => clearTimeout(timer);
    }
  }, [filteredProps, updateVisibleCountMapbox, mapProvider]);



  if (allProps.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F6F6F6]">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <MapProvider>
      <div className="min-h-screen bg-[#F6F6F6]">
        {/* Search bar */}
        <section className="bg-black px-4 md:px-[50px] pt-20 md:pt-28 pb-6">
          <div className="max-w-7xl mx-auto">
            <PropertiesSearch onFilter={setActiveFilters} title="Mapa de Propiedades" />
          </div>
        </section>

        {/* Map section */}
        <section className="px-4 md:px-[50px] pb-12 pt-[12px]">
          <div className="bg-white rounded-[30px] overflow-hidden">
            <div className="mx-auto px-4 md:px-[50px] py-[30px] md:py-[40px]">
              {/* Title */}
              <div className="pb-[30px] flex items-center justify-between">
                <SectionTitle size="normal">Todas las Propiedades</SectionTitle>
              </div>

              {/* Map */}
              <ScrollReveal>
                <div className="relative rounded-[30px] overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
                  {/* Property count badge */}
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 text-[12px] font-semibold text-[#1A1A18] shadow-lg">
                    {visibleCount} propiedades visibles
                  </div>

                  {mapProvider === 'google' ? (
                    <GoogleMap
                      defaultZoom={11}
                      defaultCenter={{ lat: -31.6525, lng: -64.4397 }}
                      mapId={googleMapId}
                      onIdle={(e) => updateVisibleCountGoogle(e.map)}
                      disableDefaultUI={false}
                      streetViewControl={true}
                      mapTypeControl={false}
                      fullscreenControl={true}
                    >
                      <GoogleMapClusterLayer 
                        properties={filteredProps} 
                        onSelect={setSelectedProperty} 
                        selectedId={selectedProperty?._id} 
                      />
                    </GoogleMap>
                  ) : (
                    <MapboxMap
                      ref={mapRef}
                      onLoad={updateVisibleCountMapbox}
                      onMove={updateVisibleCountMapbox}
                      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                      mapLib={mapboxgl}
                      initialViewState={{
                        longitude: -64.4397,
                        latitude: -31.6525,
                        zoom: 11,
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle={MAP_STYLE}
                      onError={(e) => console.error('[MapAllProperties] Map load ERROR:', e?.error?.message || e)}
                      {...MAP_DEFAULT_PROPS}
                    >
                      <MapClusterLayer
                        properties={filteredProps}
                        onSelect={setSelectedProperty}
                        selectedId={selectedProperty?._id}
                      />
                    </MapboxMap>
                  )}

                {/* No results overlay */}
                {filteredProps.length === 0 && allProps.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md rounded-xl px-6 py-4 text-center">
                      <p className="text-white font-semibold text-[15px]">No se encontraron propiedades</p>
                      <p className="text-white/50 text-[12px] mt-1">Probá con otros filtros</p>
                    </div>
                  </div>
                )}

              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Sidebar — outside all overflow-hidden containers */}
      {selectedProperty && (
        <MapPropertySidebar
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
      </div>
    </MapProvider>
  );
}
