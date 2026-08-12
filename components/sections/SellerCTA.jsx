'use client';
import SectionBox from '@/components/sections/SectionBox';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { Key } from 'lucide-react';

const SellerCTA = () => {
  return (
    <section className="pt-[12px] pb-[12px]">
      <div className="bg-white w-full">
        <div className="px-4 md:px-[50px] py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Sell CTA */}
          <ScrollReveal delay={100}>
            <div className="relative rounded-3xl overflow-hidden flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] h-full group backface-hidden" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85')" }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1A]/90 via-[#1C1C1A]/80 to-[#2A2A27]/85" />
              {/* Glass layer */}
              <div className="absolute inset-0 backdrop-blur-[2px]" />

              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
                {/* Icon */}
                <div className="w-14 h-14 bg-[rgba(242,107,46,0.2)] backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-[rgba(242,107,46,0.15)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[var(--color-brand)]">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>

                {/* Eyebrow */}
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand)] mb-3">
                  PROPIETARIOS
                </p>

                {/* Heading */}
                <h3 className="text-[30px] font-bold text-white leading-tight mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  ¿Querés vender tu propiedad?
                </h3>

                {/* Body */}
                <p className="text-[15px] font-light text-white/70 leading-[1.6] mb-8 flex-1">
                  Te ayudamos a valuar tu propiedad con el mercado actual y te acompañamos en cada paso del proceso de venta.
                </p>

                {/* Button */}
                <a
                  href={generateWhatsAppLink({ context: 'seller' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full h-[52px] bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-[6px] text-sm font-bold uppercase tracking-[0.06em] transition-[background-color,box-shadow,transform] duration-200 shadow-lg shadow-[var(--color-brand)]/30 hover:shadow-xl hover:shadow-[var(--color-brand)]/40 hover:-translate-y-px"
                >
                  Solicitar tasación gratuita
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Invest CTA */}
          <ScrollReveal delay={200}>
            <div className="relative rounded-3xl overflow-hidden flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] h-full group backface-hidden" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85')" }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1A]/90 via-[#1C1C1A]/80 to-[#2A2A27]/85" />
              {/* Glass layer */}
              <div className="absolute inset-0 backdrop-blur-[2px]" />

              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
                {/* Icon — Dollar Sign with two vertical lines */}
                <div className="w-14 h-14 bg-[rgba(242,107,46,0.15)] backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-[rgba(242,107,46,0.1)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[var(--color-brand)]">
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    <line x1="10" y1="1" x2="10" y2="23"/>
                    <line x1="14" y1="1" x2="14" y2="23"/>
                  </svg>
                </div>

                {/* Eyebrow */}
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand)] mb-3">
                  INVERSORES
                </p>

                {/* Heading */}
                <h3 className="text-[26px] font-bold text-white leading-tight mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  ¿Buscás invertir?
                </h3>

                {/* Body */}
                <p className="text-[15px] font-light text-white/70 leading-[1.6] mb-8 flex-1">
                  Te asesoramos sobre las mejores oportunidades existentes en el mercado actual de acuerdo a tus objetivos de inversión.
                </p>

                {/* Ghost Button */}
                <a
                  href="/properties"
                  className="inline-flex items-center justify-center w-full h-[52px] bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-[6px] text-sm font-bold uppercase tracking-[0.06em] transition-[background-color,transform] duration-200 hover:-translate-y-px"
                >
                  Buscar inversión
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Rental CTA */}
          <ScrollReveal delay={300}>
            <div className="relative rounded-3xl overflow-hidden flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] h-full group backface-hidden" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85')" }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1A]/90 via-[#1C1C1A]/80 to-[#2A2A27]/85" />
              {/* Glass layer */}
              <div className="absolute inset-0 backdrop-blur-[2px]" />

              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
                {/* Icon */}
                <div className="w-14 h-14 bg-[rgba(242,107,46,0.15)] backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-[rgba(242,107,46,0.1)]">
                  <Key className="w-7 h-7 text-[var(--color-brand)]" strokeWidth={1.5} />
                </div>

                {/* Eyebrow */}
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand)] mb-3">
                  ALQUILERES
                </p>

                {/* Heading */}
                <h3 className="text-[26px] font-bold text-white leading-tight mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  ¿Querés alquilar?
                </h3>

                {/* Body */}
                <p className="text-[15px] font-light text-white/70 leading-[1.6] mb-8 flex-1">
                  Dejanos tus datos y la info del inmueble que estás buscando, nosotros te ofrecemos las mejores opciones disponibles.
                </p>

                {/* Orange outline button */}
                <a
                  href="https://wa.me/5493547596631?text=Hola%2C%20estoy%20buscando%20alquilar%20una%20propiedad.%20¿Podrían%20ayudarme%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-[52px] bg-transparent hover:bg-[var(--color-brand)] border-2 border-[var(--color-brand)] text-white rounded-[6px] text-sm font-bold uppercase tracking-[0.06em] transition-[background-color,transform] duration-200 hover:-translate-y-px"
                >
                  Dejar mi info acá
                </a>
              </div>
            </div>
          </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
