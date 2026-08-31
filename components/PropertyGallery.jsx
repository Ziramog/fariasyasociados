'use client';
import Image from 'next/image';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { LayoutGrid, LandPlot } from 'lucide-react';
import { getAreaDisplay, getPriceDisplay } from '@/utils/propertyDisplay';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { trackWhatsappClick, trackMapClick } from '@/utils/analytics';

const PropertyGallery = ({ images = [], property }) => {
  if (images.length === 0) return null;

  const beds = property?.beds;
  const baths = property?.baths;
  const displayArea = getAreaDisplay(property);
  const isLand = ['Terreno', 'Campo', 'Gran Inversión'].includes(property?.type);
  const rawPrice = property?.price;
  const numericPrice = rawPrice ? parseFloat(String(rawPrice).replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '')) : null;

  const operationLabel =
    property?.operation === 'venta' ? 'Venta' :
    property?.operation === 'alquiler' ? 'Alquiler' :
    property?.operation === 'compra' ? 'Compra' : '';

  const statusMap = {
    'PRECIO MEJORADO': 'Precio Mejorado',
    'ULTIMA UNIDAD': 'Última Unidad',
    'UNICO EN SU TIPO': 'Única en su Tipo',
    'MEJOR PRECIO': 'Mejor Precio del Mercado',
    'NUEVA': 'Nueva',
    'EXCELENTE PRECIO': 'Excelente Precio',
    'AMOBLADA': 'Amoblada',
  };
  const statusLabel = statusMap[property?.status];

  const subThumbs = images.slice(1, 7);

  const scrollToFullGallery = () => {
    const el = document.getElementById('full-gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Gallery options={{ bgOpacity: 0.95, padding: { top: 80, bottom: 80, left: 20, right: 20 } }}>
      <section className="bg-[#000] pt-[90px] md:pt-[150px] pb-[30px]">
        {/* Mosaic: full width with navbar padding, no max-w */}
        <div className="px-4 md:px-[50px]">
          <div className="flex flex-col md:grid md:grid-cols-[2fr_3fr] md:gap-[5px] rounded-[30px] overflow-hidden">

            {/* Big image — 40% width on desktop */}
            <div className="relative group cursor-pointer overflow-hidden bg-[#111] md:aspect-[16/9]"
                 style={{ minHeight: '250px' }}>
              {images[0] && (
                <Item original={images[0]?.url} thumbnail={images[0]?.url} width="1920" height="1280">
                  {({ ref, open }) => (
                    <div ref={ref} onClick={open}
                         className="relative w-full md:h-full"
                         style={{ minHeight: '250px' }}>
                      <Image
                        src={images[0]?.url}
                        alt={property?.name || ''}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority={true}
                      />
                    </div>
                  )}
                </Item>
              )}
              {/* White overlay on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition-all duration-300 ease-in-out pointer-events-none z-[5]" />
              {images.length > 1 && (
                <button
                  onClick={scrollToFullGallery}
                  className="absolute left-4 top-4 md:left-[30px] md:top-[30px] bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-[14px] font-normal px-4 py-2 md:px-5 md:py-2.5 rounded-[12px] md:rounded-[14px] transition-all duration-300 ease-in-out z-10 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <LayoutGrid size={18} strokeWidth={2} />
                  Ver todas las {images.length} fotos
                </button>
              )}
          </div>

          {/* Thumbnail grid — 60% width on desktop */}
          {subThumbs.length > 0 && (
            <div>
              {/* Mobile: horizontal scroll */}
                <div className="md:hidden flex overflow-x-auto gap-[5px] py-2 px-3 scrollbar-hide">
                  {subThumbs.map((image, index) => (
                    <Item key={index} original={image?.url} thumbnail={image?.url} width="1920" height="1280">
                      {({ ref, open }) => (
                        <div ref={ref} onClick={open}
                             className="relative group flex-shrink-0 w-[130px] h-[86px] cursor-pointer overflow-hidden">
                          <Image src={image?.url} alt="" fill
                                 className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                                 sizes="130px" loading="lazy" />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition-all duration-300 ease-in-out pointer-events-none" />
                        </div>
                      )}
                    </Item>
                ))}
              </div>
              {/* Desktop: 3-col x 2-row grid */}
                <div className="hidden md:grid grid-cols-3 gap-[5px] content-start">
                {subThumbs.map((image, index) => (
                    <Item key={index} original={image?.url} thumbnail={image?.url} width="1920" height="1280">
                      {({ ref, open }) => (
                        <div ref={ref} onClick={open}
                             className="relative group cursor-pointer overflow-hidden bg-[#111] aspect-[16/9]">
                          <Image src={image?.url} alt="" fill
                                 className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                                 sizes="20vw" loading="lazy" />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition-all duration-300 ease-in-out pointer-events-none" />
                        </div>
                      )}
                    </Item>
                ))}
              </div>
            </div>
          )}

          {/* Elementos ocultos para que PhotoSwipe indexe todas las imágenes de la propiedad */}
          {images.slice(7).map((image, index) => (
            <Item key={`hidden-${index}`} original={image?.url} thumbnail={image?.url} width="1920" height="1280">
              {({ ref }) => <div ref={ref} style={{ display: 'none' }} />}
            </Item>
          ))}
        </div>
        </div>

        {/* Dark info bar: back to max-w container for alignment */}
        <div className="max-w-[1820px] mx-auto px-4 md:px-[50px] mt-[30px]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-[25px] md:gap-[50px] pt-[30px] pb-0 text-white">
            {/* Left */}
            <div itemScope itemType="https://schema.org/Place">
              <h1 className="text-[24px] leading-[28px] md:text-[36px] md:leading-[42px] font-normal text-white mb-[10px]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                  itemProp="name">
                {property?.name}
              </h1>

              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${property?.location?.street || ''}, ${property?.location?.city || ''}, ${property?.location?.state || ''}`
              )}`}
                 target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-[#b8b8b8] hover:text-white transition-colors text-[16px] mb-4"
                 itemProp="address" itemScope itemType="https://schema.org/PostalAddress" onClick={() => trackMapClick({ cta_location: 'property_gallery', context: 'property', property_id: property?._id || property?.id, property_type: property?.type, operation: property?.operation, location: property?.location?.city || property?.location?.neighborhood || property?.location?.state })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span itemProp="streetAddress">
                  {property?.location?.street}{property?.location?.street && property?.location?.city ? ', ' : ''}
                  {property?.location?.city}{property?.location?.city && property?.location?.state ? ', ' : ''}
                  {property?.location?.state}
                </span>
              </a>

              {/* Features row */}
              <div className="flex gap-[20px] md:gap-[40px] flex-wrap items-center">
                {beds > 0 && (
                  <span className="flex items-center gap-[6px] md:gap-[10px] text-white font-normal text-[16px] md:text-[22px]">
                    <img src="/senada/images/icons/ico_bed.svg" alt="" className="w-5 h-5 md:w-[30px] md:h-[25px]" />
                    {beds}
                  </span>
                )}
                {baths > 0 && (
                  <span className="flex items-center gap-[6px] md:gap-[10px] text-white font-normal text-[16px] md:text-[22px]">
                    <img src="/senada/images/icons/ico_bath.svg" alt="" className="w-5 h-5 md:w-[30px] md:h-[25px]" />
                    {baths}
                  </span>
                )}
                {displayArea && (
                  <span className="flex items-center gap-[6px] md:gap-[10px] text-white font-normal text-[16px] md:text-[22px]">
                    {isLand ? (
                      <LandPlot className="w-5 h-5 md:w-[30px] md:h-[25px] text-white" strokeWidth={1.5} />
                    ) : (
                      <img src="/senada/images/icons/ico_sqfoot.svg" alt="" className="w-5 h-5 md:w-[30px] md:h-[25px]" />
                    )}
                    {displayArea}
                  </span>
                )}
              </div>
            </div>

            {/* Right — Status + Price + CTA */}
            <div className="flex flex-col md:flex-row md:items-end gap-[30px] flex-shrink-0">
              {/* Status — left within right column */}
              <div className="text-left">
                {operationLabel && (
                  <p className="text-[#b8b8b8] text-[14px] md:text-[16px] leading-[19px]">
                    Operación <span className="text-white">{operationLabel}</span>
                  </p>
                )}
                {statusLabel && (
                  <p className="text-[#b8b8b8] text-[14px] md:text-[16px] leading-[19px]">
                    Estado <span className="text-white">{statusLabel}</span>
                  </p>
                )}
              </div>

              {/* Price + CTA — right within right column */}
              <div className="text-left md:text-right">
                <h2 className="text-[28px] md:text-[40px] text-white font-normal mb-[20px]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                    itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="priceCurrency" content="USD" />
                  <span itemProp="price" content={numericPrice}>
                    {getPriceDisplay(property)}
                  </span>
                </h2>

                <a
                  href={generateWhatsAppLink({ property })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-white text-[15px] font-normal uppercase tracking-wider text-center py-3 px-[24px] rounded-[8px] transition-colors"
                  onClick={() => trackWhatsappClick({ cta_location: 'property_gallery', context: 'property', property_id: property?._id || property?.id, property_type: property?.type, operation: property?.operation, location: property?.location?.city || property?.location?.neighborhood || property?.location?.state })}
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--color-brand), var(--color-brand), var(--color-brand-dark), var(--color-brand-dark))',
                    backgroundSize: '400% 100%',
                  }}
                >
                  Contáctanos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Gallery>
  );
};

export default PropertyGallery;
