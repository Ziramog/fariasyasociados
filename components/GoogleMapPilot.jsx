'use client';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import PropertiesSearch from '@/components/PropertiesSearch';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MapPropertySidebar from '@/components/MapPropertySidebar';
import SectionTitle from '@/components/shared/SectionTitle';

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

const ClusteredMarkers = ({ properties, selectedProperty, setSelectedProperty }) => {
  const map = useMap();
  const markerLibrary = useMapsLibrary('marker');
  const clusterer = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!map || !markerLibrary) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
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
          onClick={() => setSelectedProperty(p)}
          ref={(marker) => {
            if (marker) markersRef.current[p._id] = marker;
            else delete markersRef.current[p._id];
          }}
        >
          <div className="relative cursor-pointer transition-transform duration-200 hover:scale-110">
            <Pin background={'#db7340'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={selectedProperty?._id === p._id ? 1.2 : 1.0} />
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};

export default function GoogleMapPilot({ initialProperties = [] }) {
  const [allProps, setAllProps] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const geo = initialProperties
      .map((p) => ({ ...p, coords: geocode(p) }))
      .filter((p) => p.coords != null);
    setAllProps(geo);
    setHasLoaded(true);
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

  const handleMapIdle = useCallback((map) => {
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

  if (!hasLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F6F6F6]">
        <p className="text-gray-500">Cargando propiedades...</p>
      </div>
    );
  }

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F6F6F6] text-center p-4">
        <p className="text-red-500 font-bold">Error: Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en Vercel/.env</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="min-h-screen bg-[#F6F6F6]">
        <section className="bg-black px-4 md:px-[50px] pt-20 md:pt-28 pb-6">
          <div className="max-w-7xl mx-auto">
            <PropertiesSearch onFilter={setActiveFilters} title="Piloto Google Maps" />
          </div>
        </section>

        <section className="px-4 md:px-[50px] pb-12 pt-[12px]">
          <div className="bg-white rounded-[30px] overflow-hidden">
            <div className="mx-auto px-4 md:px-[50px] py-[30px] md:py-[40px]">
              <div className="pb-[30px] flex items-center justify-between">
                <SectionTitle size="normal">Propiedades (Google Maps)</SectionTitle>
              </div>

              <ScrollReveal>
                <div className="relative rounded-[30px] overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
                  <div className="absolute top-4 right-14 z-20 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 text-[12px] font-semibold text-[#1A1A18] shadow-lg">
                    {visibleCount} propiedades visibles
                  </div>

                  <Map
                    defaultZoom={11}
                    defaultCenter={{ lat: -31.6525, lng: -64.4397 }}
                    mapId="5840ac3c29d4b1c78be4a027"
                    onIdle={(e) => handleMapIdle(e.map)}
                    disableDefaultUI={false}
                    streetViewControl={true}
                    mapTypeControl={false}
                    fullscreenControl={true}
                  >
                    <ClusteredMarkers 
                      properties={filteredProps} 
                      selectedProperty={selectedProperty} 
                      setSelectedProperty={setSelectedProperty} 
                    />
                  </Map>

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

        {selectedProperty && (
          <MapPropertySidebar
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </div>
    </APIProvider>
  );
}
