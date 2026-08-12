'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { getPropertyImage, getAreaDisplay, getStatusBadge } from '@/utils/propertyDisplay';

export default function MapPropertySidebar({ property, onClose }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset + trigger entrance animation when property changes
  useEffect(() => {
    setIsVisible(false);
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, [property?._id]);

  // Lock body scroll when sidebar is open — desktop no internal scroll, mobile allows internal scroll
  useEffect(() => {
    const isMobileNow = window.innerWidth < 768;
    const originalHtml = document.documentElement.style.overflow;
    const originalBody = document.body.style.overflow;
    const originalTouchAction = document.documentElement.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (!isMobileNow) {
      document.documentElement.style.touchAction = 'none';
      const preventTouch = (e) => e.preventDefault();
      window.addEventListener('touchmove', preventTouch, { passive: false });
      return () => {
        document.documentElement.style.overflow = originalHtml;
        document.body.style.overflow = originalBody;
        document.documentElement.style.touchAction = originalTouchAction;
        window.removeEventListener('touchmove', preventTouch, { passive: false });
      };
    }

    return () => {
      document.documentElement.style.overflow = originalHtml;
      document.body.style.overflow = originalBody;
      document.documentElement.style.touchAction = originalTouchAction;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!property) return null;

  const image = getPropertyImage(property);
  const area = getAreaDisplay(property);
  const badge = getStatusBadge(property);
  const city = property.location?.city || '';

  // Feature grid data
  const features = [
    { value: property.price || 'Consultar', label: 'Precio' },
    { value: area || '-', label: 'Superficie' },
    { value: property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : '-', label: 'Tipo' },
    { value: property.beds != null ? property.beds : '-', label: 'Dormitorios' },
    { value: property.baths != null ? property.baths : '-', label: 'Baños' },
    { value: property.operation ? property.operation.charAt(0).toUpperCase() + property.operation.slice(1) : '-', label: 'Operación' },
  ];

  return (
    <>
      {/* Fixed dark overlay — desktop goes above navbar (z-[100]) */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ${
          isMobile ? 'z-30' : 'z-[105]'
        } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar — desktop goes above navbar (z-[100]) */}
      <div
        className={`fixed ${isMobile ? 'z-40' : 'z-[110]'} bg-white shadow-xl overflow-hidden flex-col ${
          isMobile
            ? 'top-[calc(env(safe-area-inset-top,8px)+60px)] left-0 right-0 bottom-0 rounded-none'
            : 'top-0 right-0 h-screen w-[760px]'
        }`}
        style={{
          transform: isVisible
            ? 'translateX(0)'
            : isMobile
            ? 'translateY(100%)'
            : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Content — mobile allows internal scroll, desktop no scroll (Senada-style) */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden px-[50px] pt-8 md:pt-[100px] pb-[50px]">
          <div className="group">
            {/* Photo — clickable to property detail */}
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '16/9' }}
              onClick={() => router.push(`/properties/${property._id}`)}
            >
              <Image
                src={image}
                alt={property.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 760px"
                priority
              />

              {/* Black gradient overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 15%, transparent 100%)',
                }}
              />
              {/* Orange hover gradient (10%) */}
              <div
                className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(180deg, transparent 90%, var(--color-brand))',
                }}
              />

              {/* Status badge */}
              {badge && (
                <span className="absolute top-4 left-4 z-20 bg-[var(--color-brand)] text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider shadow-md">
                  {badge.label}
                </span>
              )}
            </div>

            {/* Property footer — no extra tags here, badge is on image */}
            <div className="py-4">
              <h3
                className="text-[28px] font-medium text-[#0F172A] group-hover:text-[var(--color-brand)] leading-snug line-clamp-2 mb-1 transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {property.name}
              </h3>
              <p className="text-[16px] text-[#878787] leading-tight line-clamp-1">
                {city}
              </p>
            </div>
          </div>

          {/* Feature grid — Senada-style: no table borders */}
          <div className="pb-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              {features.map((feat) => (
                <div key={feat.label} className="py-2">
                  <p className="whitespace-nowrap font-medium text-[26px] text-[#0F172A]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {feat.value}
                  </p>
                  <p className="text-[16px] text-[#878787] leading-[17px] mt-0.5">
                    {feat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons — side by side */}
          <div className="flex gap-3 pb-6">
            <button
              onClick={() => router.push(`/properties/${property._id}`)}
              className="flex-1 py-3.5 border border-[#0F172A] text-[#0F172A] text-[13px] font-bold uppercase tracking-wider transition-colors hover:bg-[#0F172A] hover:text-white"
            >
              Ver detalle
            </button>
            <a
              href={generateWhatsAppLink({ property })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-[#25D366] text-white text-[13px] font-bold uppercase tracking-wider transition-colors hover:bg-[#128C7E] flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.589 5.94L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
