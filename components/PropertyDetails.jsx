'use client';
import { useState, useEffect } from 'react';
import { trackPropertyViewed } from '@/utils/analytics';
import { useSession } from 'next-auth/react';
import CheckIcon from './icons/CheckIcon';
import ShareButtons from './ShareButtons';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionTitle from '@/components/shared/SectionTitle';
import { getAreaDisplay, getPriceDisplay } from '@/utils/propertyDisplay';

const ReadMoreText = ({ text, maxChars = 400 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text || text.length <= maxChars) {
    return <div className="text-gray-300 leading-[1.8] whitespace-pre-line text-[15px] text-justify">{text}</div>;
  }
  return (
    <div className="text-gray-300 leading-[1.8] whitespace-pre-line text-[15px] text-justify">
      {expanded ? text : text.slice(0, maxChars).trimEnd() + '…'}
      <button
        onClick={() => setExpanded(!expanded)}
        className="block mt-3 text-[13px] font-bold uppercase tracking-wider text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
      >
        {expanded ? 'Leer menos' : 'Leer más'}
      </button>
    </div>
  );
};



const PropertyDetails = ({ property }) => {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    if (property) trackPropertyViewed(property, session?.user?.role);
  }, [property?._id || property?.id, status]);

  const coveredArea = property.covered_area;
  const operationLabel =
    property.operation === 'venta' ? 'Venta' :
    property.operation === 'alquiler' ? 'Alquiler' :
    property.operation === 'compra' ? 'Compra' : '';

  const featureItems = [
    { label: 'Precio', value: getPriceDisplay(property) },
    { label: 'Superficie', value: getAreaDisplay(property) },
    { label: 'Dormitorios', value: property.beds || null },
    { label: 'Baños', value: property.baths || null },
    { label: 'Cochera', value: property.garage != null ? property.garage : null },
    { label: 'Tipo', value: property.type },
    { label: 'Operación', value: operationLabel || null },
    { label: 'Títulos', value: property.titles_status || null },
  ].filter(f => f.value != null);

  return (
    <main className="space-y-0">
      {/* Features — Senada .listing-feature */}
      {featureItems.length > 0 && (
        <div className="bg-[#0A0A0A] rounded-none overflow-hidden mb-8 md:mb-8">
          <div className="mx-auto px-4 md:px-[50px] py-[30px] md:py-[30px]">
            <div className="pb-[30px]">
              <SectionTitle>Características</SectionTitle>
            </div>
            <ScrollReveal>
              <div className="flex flex-wrap">
                {featureItems.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`flex-1 min-w-[50%] md:min-w-0 flex justify-center py-[30px] px-[20px] md:px-[40px] border-r border-b md:border-b-0 border-[#1C1C1A] ${i === featureItems.length - 1 ? 'border-r-0' : ''} md:[&:nth-last-child(-n+2)]:border-b-0`}
                  >
                    <div>
                      <h5 className="text-[22px] font-semibold text-white mb-[5px]"
                          style={{ fontFamily: 'var(--font-heading)' }}>
                        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
                      </h5>
                      <p className="text-[16px] leading-[24px] text-gray-400">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* 2-col: Description (70%) + Sidebar (30%) — Senada .info-section */}
      <div className="flex flex-col md:flex-row gap-[20px] mb-8">
        {/* Left: Description — 70% */}
        <div className="w-full md:w-[70%]">
          {property.description ? (
            <div className="bg-[#0A0A0A] rounded-none overflow-hidden h-full">
              <div className="px-4 md:px-[50px] pt-[40px] pb-0 flex flex-col h-full">
                <div>
                  <SectionTitle>Descripción</SectionTitle>
                </div>
                <ScrollReveal>
                  <ReadMoreText text={property.description} maxChars={450} />
                </ScrollReveal>
                {property.seller_info?.name && (
                  <p className="mt-6 text-[12px] italic text-gray-500">
                    Publicado por {property.seller_info.name}
                  </p>
                )}
                {/* Share */}
                <div className="share-wrapper border-t border-[#1C1C1A] pt-8 pb-6 mt-auto">
                  <span className="text-[16px] uppercase text-gray-500 block text-center mb-4">Compartir</span>
                  <ShareButtons property={property} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0A0A0A] rounded-none overflow-hidden h-full flex flex-col">
              <div className="px-4 md:px-[50px] pt-[40px] pb-0 flex flex-col h-full flex-1">
                <div>
                  <SectionTitle>Descripción</SectionTitle>
                </div>
                <div className="text-gray-500 italic mt-4">
                  No hay descripción detallada disponible para esta propiedad en este momento.
                </div>
                {/* Share */}
                <div className="share-wrapper border-t border-[#1C1C1A] pt-8 pb-6 mt-auto">
                  <span className="text-[16px] uppercase text-gray-500 block text-center mb-4">Compartir</span>
                  <ShareButtons property={property} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar — 30% */}
        <div className="w-full md:w-[30%] flex flex-col gap-[20px]">
          {/* Additional Info */}
          {(property.square_feet || property.operation || coveredArea || property.garage != null || property.titles_status) && (
            <div className="bg-[#0A0A0A] rounded-none overflow-hidden">
              <div className="px-4 md:px-[50px] pt-[40px] pb-[40px]">
                <div>
                  <SectionTitle>Información Adicional</SectionTitle>
                </div>
                <ScrollReveal>
                  <ul>
                  {coveredArea && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Sup. Cubierta</span>
                      <span className="text-[14px] font-normal text-white">{coveredArea.toLocaleString('es-AR')} m²</span>
                    </li>
                  )}
                  {property.square_feet && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Sup. Total</span>
                      <span className="text-[14px] font-normal text-white">{property.square_feet.toLocaleString('es-AR')} m²</span>
                    </li>
                  )}
                  {property.garage != null && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Cochera</span>
                      <span className="text-[14px] font-normal text-white">{property.garage} {property.garage === 1 ? 'lugar' : 'lugares'}</span>
                    </li>
                  )}
                  {property.operation && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Operación</span>
                      <span className="text-[14px] font-normal text-white">{operationLabel}</span>
                    </li>
                  )}
                  {property.titles_status && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Estado de Títulos</span>
                      <span className="text-[14px] font-normal text-white text-right">{property.titles_status}</span>
                    </li>
                  )}
                  {property.amenities && property.amenities.length > 0 && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Comodidades</span>
                      <span className="text-[14px] font-normal text-white text-right">{property.amenities.join(', ')}</span>
                    </li>
                  )}
                  </ul>
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Community Info */}
          {(property.location?.city || property.location?.state) && (
            <div className="bg-[#0A0A0A] rounded-none overflow-hidden">
              <div className="px-4 md:px-[50px] pt-[40px] pb-[40px]">
                <div>
                  <SectionTitle>Información de la Zona</SectionTitle>
                </div>
                <ScrollReveal>
                  <ol className="list-none">
                  {property.location?.state && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Provincia</span>
                      <span className="text-[14px] font-normal text-white">{property.location.state}</span>
                    </li>
                  )}
                  {property.location?.city && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Ciudad</span>
                      <span className="text-[14px] font-normal text-white">{property.location.city}</span>
                    </li>
                  )}
                  {property.location?.street && (
                    <li className="flex justify-between items-center px-5 py-[10px] mb-[5px] text-[16px] gap-[10px] rounded-none odd:bg-[#141412]">
                      <span className="text-[14px] text-gray-400">Dirección</span>
                      <span className="text-[14px] font-normal text-white text-right max-w-[180px]">{property.location.street}</span>
                    </li>
                  )}
                  </ol>
                </ScrollReveal>
              </div>
            </div>
          )}
        </div>
      </div>

    </main>
  );
};

export default PropertyDetails;
