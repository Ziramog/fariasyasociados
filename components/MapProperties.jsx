'use client';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScrollReveal from './shared/ScrollReveal';
import { filterProperties, isGranInversion } from '@/utils/filterProperties';
import { useFilters } from '@/hooks/useFilters';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { getPriceDisplay } from '@/utils/propertyDisplay';
import { FaBed, FaBath, FaWhatsapp, FaExpand, FaTimes } from 'react-icons/fa';
import { TrendingUp, MapPin } from 'lucide-react';
import Link from 'next/link';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#E8E6E0]">
      <div className="flex flex-col items-center gap-3 text-[var(--color-ink-tertiary)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 opacity-50">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        <span className="text-sm font-medium uppercase tracking-widest">Cargando mapa...</span>
      </div>
    </div>
  ),
});

const PROPERTY_TYPES = ['Casa', 'Departamento', 'Terreno', 'Campo', 'Inmueble Comercial'];

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-8">
    <div className="w-16 h-16 rounded-full bg-[var(--color-brand-light)] flex items-center justify-center mb-4">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[var(--color-brand)]">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    </div>
    <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-2">Seleccioná una propiedad</p>
    <p className="text-[13px] text-[var(--color-ink-secondary)] leading-relaxed">
      Hacé click en un pin del mapa para ver todos los detalles
    </p>
  </div>
);

const PropertyDetail = ({ property, onClose }) => {
  if (!property) return <EmptyState />;

  const price = getPriceDisplay(property);
  const image = property.images?.[0]?.url || '/images/property-placeholder.jpg';

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="relative h-[220px] bg-[var(--color-surface-soft)] flex-shrink-0 overflow-hidden">
        <img
          src={image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {property.status && property.status !== 'active' && (
          <div className="absolute top-3 left-3">
            <span className="text-[11px] font-bold px-[10px] py-1 rounded-[6px] uppercase tracking-wider shadow-sm bg-[var(--color-brand)] text-white">
              {property.status === 'NUEVA' ? 'Nueva' :
               property.status === 'PRECIO MEJORADO' ? 'Precio Mejorado' :
               property.status === 'ULTIMA UNIDAD' ? 'Última Unidad' :
               property.status === 'UNICO EN SU TIPO' ? 'Única en su Tipo' :
               property.status === 'MEJOR PRECIO' ? 'Mejor Precio del Mercado' :
               property.status === 'EXCELENTE PRECIO' ? 'Excelente Precio' :
               property.status === 'AMOBLADA' ? 'Amoblada' :
               property.status}
            </span>
          </div>
        )}
        <a
          href={`/properties/${property._id}`}
          className="absolute top-3 right-3 w-10 h-10 bg-white/40 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center hover:bg-white/60 transition-all shadow-sm"
        >
          <FaExpand className="w-5 h-5 text-[var(--color-ink)]" />
        </a>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-[24px] font-bold leading-tight" style={{ color: '#C93E15' }}>
            {price}
          </p>
          <p className="text-[14px] text-[var(--color-ink)] font-medium mt-0.5">
            {property.name}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-secondary)]">
          <MapPin className="w-4 h-4 flex-shrink-0 text-[var(--color-brand)]" />
          {property.location?.city}
        </div>

        <div className="flex items-center gap-4 text-[13px] font-medium text-[var(--color-ink)] border-t-2 border-b-2 border-[var(--color-border-strong)] py-2.5">
          {property.beds != null && (
            <span className="flex items-center gap-1.5">
              <FaBed className="w-4 h-4 text-[var(--color-ink-tertiary)]" />
              {property.beds} Dorm.
            </span>
          )}
          {property.baths != null && (
            <span className="flex items-center gap-1.5">
              <FaBath className="w-4 h-4 text-[var(--color-ink-tertiary)]" />
              {property.baths} Baños
            </span>
          )}
          {property.area && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--color-ink-tertiary)]">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              {property.area} m&sup2;
            </span>
          )}
        </div>

        {property.description && (
          <p className="text-[13px] text-[var(--color-ink)] leading-relaxed line-clamp-3">
            {property.description}
          </p>
        )}

        <div className="flex-1" />

        <div className="flex flex-col gap-2 pt-2 border-t-2 border-[var(--color-border-strong)]">
          <a
            href={generateWhatsAppLink({ property })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-[44px] bg-whatsapp hover:bg-whatsapp-hover text-white rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md"
          >
            <FaWhatsapp className="w-5 h-5" />
            WhatsApp
          </a>
          <a
            href={`/properties/${property._id}`}
            className="flex items-center justify-center gap-2 w-full h-[44px] bg-[var(--color-ink)] hover:bg-[var(--color-ink-secondary)] text-white rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200"
          >
            Ver propiedad
          </a>
        </div>
      </div>
    </div>
  );
};

const MapProperties = ({ initialProperties = [] }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [activeType, setActiveType] = useState('Casa');
  const [showGranInversion, setShowGranInversion] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [sheetPosition, setSheetPosition] = useState(1); // 0=closed, 1=peek, 2=half, 3=full
  const sheetRef = useRef(null);
  const touchStartY = useRef(null);
  const { filters } = useFilters();
  const mapRef = useRef(null);

  const filteredProperties = useMemo(() => {
    let result = filterProperties(initialProperties, { ...filters, type: activeType });
    if (showGranInversion) result = result.filter(isGranInversion);
    return result;
  }, [initialProperties, filters, activeType, showGranInversion]);

  const selectedProperty = useMemo(
    () => initialProperties.find((p) => p._id === selectedPropertyId) || null,
    [initialProperties, selectedPropertyId]
  );

  useEffect(() => {
    if (!selectedPropertyId && filteredProperties.length > 0) {
      setSelectedPropertyId(filteredProperties[0]._id);
    }
  }, [filteredProperties, selectedPropertyId]);

  const handleMarkerClick = useCallback((propertyId) => {
    setSelectedPropertyId(propertyId);
    setShowMobileDetail(true);
    setSheetPosition(2);
    const prop = initialProperties.find((p) => p._id === propertyId);
    if (prop && mapRef.current) {
      const lat = prop.location?.lat;
      const lng = prop.location?.lng;
      if (lat && lng) mapRef.current.flyTo([lat, lng], 15);
    }
  }, [initialProperties]);

  const handleCloseMobileDetail = () => {
    setShowMobileDetail(false);
    setSelectedPropertyId(null);
    setSheetPosition(1);
  };

  const snapPoints = {
    0: 'translate-y-full',
    1: 'translate-y-[40vh]',
    2: 'translate-y-[15vh]',
    3: 'translate-y-0',
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.touches[0].clientY;
    if (delta > 50 && sheetPosition < 3) {
      setSheetPosition((p) => Math.min(p + 1, 3));
      touchStartY.current = null;
    } else if (delta < -50 && sheetPosition > 0) {
      setSheetPosition((p) => {
        const next = Math.max(p - 1, 0);
        if (next === 0) { setShowMobileDetail(false); setSelectedPropertyId(null); }
        return next;
      });
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <section className="pt-[30px] pb-[30px] px-4 md:px-6 relative overflow-hidden isolate z-10" id="mapa">
      <div className="max-w-[80vw] mx-auto">
        <div className="mb-8 md:mb-10">
          <ScrollReveal>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-brand)] block mb-2 md:mb-3">
              MAPA INTERACTIVO
            </span>
          </ScrollReveal>
          <ScrollReveal delay={50}>
            <h2 className="text-3xl md:text-[52px] font-bold text-[#1A1A18] leading-[1.1] tracking-[-0.01em] mb-4 md:mb-7">
              Explor&aacute; en el mapa
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-wrap items-center gap-2 md:gap-2.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setActiveType(type); setShowGranInversion(false); }}
                  className={`h-8 md:h-9 px-3 md:px-5 border-[1.5px] text-[12px] md:text-[13px] font-medium rounded transition-all duration-150 whitespace-nowrap ${
                    activeType === type && !showGranInversion
                      ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-[0_2px_8px_rgba(242,107,46,0.3)]'
                      : 'bg-white border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]'
                  }`}
                >
                  {type}
                </button>
              ))}

              <div className="w-px h-5 bg-[var(--color-border-strong)] flex-shrink-0 mx-1" />

              <button
                onClick={() => {
                  setShowGranInversion((prev) => !prev);
                  if (!showGranInversion) setActiveType('Casa');
                }}
                className={`h-8 md:h-9 px-3 md:px-5 border-[1.5px] text-[12px] md:text-[13px] font-medium rounded transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                  showGranInversion
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-[0_2px_8px_rgba(242,107,46,0.3)]'
                    : 'bg-white border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                +300k
              </button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={150}>
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-0 h-[560px] overflow-hidden rounded-2xl border-2 border-[var(--color-border-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="col-span-8 relative bg-[#E8E6E0] overflow-hidden h-full">
                <MapView
                  ref={mapRef}
                  properties={filteredProperties}
                  onMarkerClick={handleMarkerClick}
                  selectedId={selectedPropertyId}
                />
              </div>
              <div className="col-span-4 bg-white border-l-2 border-[var(--color-border-strong)] flex flex-col overflow-hidden">
                <PropertyDetail property={selectedProperty} />
              </div>
            </div>
          </div>

          <div className="lg:hidden relative overflow-hidden rounded-2xl border-2 border-[var(--color-border-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]" style={{ height: '65vh' }}>
            <div className="absolute inset-0">
              <MapView
                ref={mapRef}
                properties={filteredProperties}
                onMarkerClick={handleMarkerClick}
                selectedId={selectedPropertyId}
              />
            </div>

            {/* Map all link — mobile */}
            <Link
              href="/properties/map-all"
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-white/40 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#1A1A18] shadow-lg hover:bg-white transition-all lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              Ver todas en mapa
            </Link>

            <div
              className={`absolute inset-x-0 bottom-0 z-20 bg-white rounded-t-3xl transition-transform duration-300 overflow-hidden ${snapPoints[sheetPosition]}`}
              style={{ height: '55vh', maxHeight: '60vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.2), 0 -2px 12px rgba(0,0,0,0.1)' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-20">
                <div className="w-10 h-1.5 bg-[var(--color-border-strong)] rounded-full" />
              </div>
              <button
                onClick={handleCloseMobileDetail}
                className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center z-20 hover:bg-white/45 transition-all shadow-sm"
              >
                <FaTimes className="w-5 h-5 text-[var(--color-ink)]" />
              </button>
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 28px)' }}>
                <PropertyDetail property={selectedProperty} />
              </div>
            </div>

            {showMobileDetail && (
              <div
                className="absolute inset-0 z-10 lg:hidden"
                onClick={handleCloseMobileDetail}
              />
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MapProperties;
