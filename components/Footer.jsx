'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { MapPin } from 'lucide-react';
import { generateWhatsAppLink, PHONE_NUMBER, PHONE_DISPLAY } from '@/utils/whatsapp';
import { trackWhatsappClick, trackMapClick, trackContactFormSubmitted, trackSocialClick } from '@/utils/analytics';

const Footer = ({ 
  footerDescription = 'En Farias & Asociados te acompañamos en cada paso. Nuestra experiencia asegura las mejores oportunidades del mercado inmobiliario.',
  contactEmail = 'info@fariasyasociados.com.ar',
  contactPhone = '+54 9 0000 000000',
  contactAddress = 'Dirección pendiente'
}) => {
  const currentYear = new Date().getFullYear();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [groupLink, setGroupLink] = useState('#');
  const pathname = usePathname();

  if (pathname.startsWith('/p/')) {
    return null;
  }

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!whatsappNumber) return;
    trackContactFormSubmitted({ form_name: 'newsletter_whatsapp', form_location: 'footer' });
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.link) setGroupLink(data.link);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="text-white" style={{ background: '#110b11' }}>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="max-w-[1430px] mx-auto px-4 py-[35px]">
          {/* Top — 2-column */}
          <div className="flex justify-between flex-wrap">
            {/* Left: Logo + Address + Contact */}
            <div className="flex flex-col gap-1">
              <Link href="/" className="inline-block mb-10">
                <Image
                  src="/images/logo-farias-placeholder.svg"
                  alt="Farias & Asociados"
                  width={200}
                  height={100}
                  style={{ height: '100px', width: 'auto' }}
                  className="brightness-0 invert"
                />
              </Link>
                  <ul>
                    <li className="py-[5px]">
                      <a href="https://www.google.com/maps/search/?api=1&query=Bv+Saenz+Pe%C3%B1a+2002%2C+San+Francisco%2C+AR" target="_blank" rel="noopener noreferrer" className="flex items-start gap-[5px] text-[13px] text-white/70 font-light hover:text-white transition-colors group" onClick={() => trackMapClick({ cta_location: 'footer', context: 'office_address' })}>
                        <MapPin className="w-4 h-4 text-[#F26B2E] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>
                          {contactAddress}<br/>
                          San Francisco, AR
                        </span>
                      </a>
                    </li>
                  </ul>
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-[5px] text-[13px] text-white font-light py-[5px] hover:text-white/70 transition-colors">
                <img src="/senada/images/icons/ico_mail.svg" alt="email" className="w-[17px] h-[17px]" style={{ filter: 'brightness(0) invert(1)' }} />
                {contactEmail}
              </a>
              <div className="flex items-start gap-[5px] py-[5px]">
                <img src="/senada/images/icons/ico_phone.svg" alt="phone" className="w-[17px] h-[17px] mt-[2px]" style={{ filter: 'brightness(0) invert(1)' }} />
                <div className="flex flex-col gap-[2px]">
                  <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`} className="text-[13px] text-white font-light hover:text-white/70 transition-colors" onClick={() => trackWhatsappClick({ cta_location: 'footer' })}>
                    {contactPhone.replace(/(\d{2})(\d{4})$/, '$1-$2')}
                  </a>
                  <a href="https://wa.me/5490000000000" className="text-[13px] text-white font-light hover:text-white/70 transition-colors" onClick={() => trackWhatsappClick({ cta_location: 'footer' })}>
                    +54 9 0000 000000
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Nav + Newsletter */}
            <div className="flex">
              {/* Footer nav — 3 columns */}
              <nav className="pr-[35px] md:pr-[75px]">
                <ul className="flex gap-[50px] md:gap-[100px]">
                  {/* PROPIEDADES */}
                  <li>
                    <span className="block text-[15px] text-white uppercase font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      Propiedades
                    </span>
                    <ul>
                      {[
                        { href: '/properties?type=Casa', label: 'Casas' },
                        { href: '/properties?type=Departamento', label: 'Departamentos' },
                        { href: '/properties?type=Campo', label: 'Campos' },
                        { href: '/properties?type=Terreno', label: 'Terrenos' },
                      ].map(l => (
                        <li key={l.href}>
                          <Link href={l.href} className="block text-[13px] text-white/70 font-light py-[5px] pr-[10px] hover:text-white transition-colors">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href="/properties" className="block text-[13px] text-white/70 font-light py-[5px] pr-[10px] hover:text-white transition-colors">
                          Ver todas
                        </Link>
                      </li>
                    </ul>
                  </li>
                  {/* EMPRESA */}
                  <li>
                    <span className="block text-[15px] text-white uppercase font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      Empresa
                    </span>
                    <ul>
                      {[
                        { href: '/#nuestra-historia', label: 'Nuestra Historia' },
                      ].map(l => (
                        <li key={l.href}>
                          <Link href={l.href} className="block text-[13px] text-white/70 font-light py-[5px] pr-[10px] hover:text-white transition-colors">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {/* DESTACADAS */}
                  <li>
                    <span className="block text-[15px] text-white uppercase font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      DESTACADAS
                    </span>
                    <ul>
                      <li>
                        <Link href="/#propiedades-destacadas" className="block text-[13px] text-white/70 font-light py-[5px] pr-[10px] hover:text-white transition-colors">
                          Nuestra Selección
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>

              {/* Newsletter */}
              <div className="newsletter max-w-[320px]">
                  <h3 className="text-[15px] text-white uppercase font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    ENTERATE DE LOS NUEVOS INGRESOS ANTES QUE NADIE
                  </h3>
                
                {!isSubscribed ? (
                  <form className="pt-[15px]" onSubmit={handleSubscribe}>
                    <div className="relative mb-3">
                      <FaWhatsapp className="absolute left-[15px] top-1/2 -translate-y-1/2 text-white/50 text-xl" />
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Tu nro. de WhatsApp"
                        required
                        className="w-[285px] h-[40px] bg-white/[0.06] border-none rounded-[5px] text-white font-bold text-[14px] pl-[45px] pr-4 outline-none placeholder:text-white/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm uppercase tracking-wider rounded-[5px] h-[40px] px-6 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Guardando...' : 'Suscribir'}
                    </button>
                  </form>
                ) : (
                  <div className="pt-[15px] animate-fade-in">
                    <p className="text-[#4ade80] text-[13px] font-bold mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ¡Número guardado!
                    </p>
                    <a
                      href={groupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[13px] rounded-[5px] h-[40px] px-4 transition-all"
                    >
                      <FaWhatsapp className="text-lg" />
                      Unirte al Grupo VIP
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom — Border top + Copyright + Social + Wolfim */}
          <div className="flex items-center justify-between mt-[35px] pt-[35px] md:mt-[50px] md:pt-[50px] border-t-2 border-white/[0.1]">
            <p className="text-white text-[14px] uppercase font-bold">
              &copy; {currentYear} Farias & Asociados <sup>TM</sup>
            </p>
            <ul className="flex items-center gap-[25px]">
              <li>
                <a href={`mailto:${contactEmail}`} className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Email">
                  <img src="/senada/images/icons/ico_mail.svg" alt="email" className="w-[20px] h-[20px]" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href={generateWhatsAppLink({ context: 'general' })} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="WhatsApp" onClick={() => trackWhatsappClick({ cta_location: 'footer', context: 'general' })}>
                  <FaWhatsapp className="text-xl" />
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/search/top?q=Inmobiliaria%20Farias%20%26%20Asociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Facebook">
                  <img src="/senada/images/icons/ico_facebook.svg" alt="facebook" className="w-[20px] h-[20px]" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/inmobiliariafariasasociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Instagram">
                  <img src="/senada/images/icons/ico_instagram.svg" alt="instagram" className="w-[20px] h-[20px]" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
            </ul>
            <p className="text-white/50 text-[14px] uppercase font-bold">
              Powered by{' '}
              <a href="https://www.wolfim.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                <Image
                  src="/images/wolfim studio white-Photoroom.png"
                  alt="Wolfim Studio"
                  width={80}
                  height={30}
                  style={{ height: '22px', width: 'auto' }}
                  className="opacity-50 hover:opacity-80 transition-opacity"
                />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile — matches desktop structure, stacked */}
      <div className="block md:hidden">
        <div className="px-5 py-8">
          {/* Logo + Company info */}
          <div className="flex flex-col gap-2 mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-farias-placeholder.svg"
                alt="Farias & Asociados"
                width={200}
                height={100}
                style={{ height: '55px', width: 'auto' }}
                className="brightness-0 invert"
              />
            </Link>
            <a href="https://www.google.com/maps/search/?api=1&query=Bv+Saenz+Pe%C3%B1a+2002%2C+San+Francisco%2C+AR" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-[13px] text-white/60 font-light mt-3 hover:text-white transition-colors" onClick={() => trackMapClick({ cta_location: 'footer_mobile', context: 'office_address' })}>
              <MapPin className="w-4 h-4 text-[#F26B2E] mt-0.5 shrink-0" />
              <span>
                {contactAddress}<br/>
                San Francisco, AR
              </span>
            </a>
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-[13px] text-white font-light">
              <img src="/senada/images/icons/ico_mail.svg" alt="email" className="w-[17px] h-[17px]" style={{ filter: 'brightness(0) invert(1)' }} />
              {contactEmail}
            </a>
            <div className="flex items-start gap-2">
              <img src="/senada/images/icons/ico_phone.svg" alt="phone" className="w-[17px] h-[17px] mt-[2px]" style={{ filter: 'brightness(0) invert(1)' }} />
              <div className="flex flex-col gap-1">
                <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`} className="text-[13px] text-white font-light">
                  {contactPhone.replace(/(\d{2})(\d{4})$/, '$1-$2')}
                </a>
                <a href="https://wa.me/5490000000000" className="text-[13px] text-white font-light">
                  +54 9 0000 000000
                </a>
              </div>
            </div>
          </div>

          {/* Nav columns — stacked with headings */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Propiedades */}
            <div>
              <span className="block text-[15px] text-white uppercase font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Propiedades</span>
              <div className="grid grid-cols-2 gap-y-1">
                {[
                  { href: '/properties?type=Casa', label: 'Casas' },
                  { href: '/properties?type=Departamento', label: 'Departamentos' },
                  { href: '/properties?type=Campo', label: 'Campos' },
                  { href: '/properties?type=Terreno', label: 'Terrenos' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-[13px] text-white/60 font-light py-[3px] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
                <Link href="/properties" className="text-[13px] text-white/60 font-light py-[3px] hover:text-white transition-colors">
                  Ver todas
                </Link>
              </div>
            </div>
            {/* Empresa */}
            <div>
              <span className="block text-[15px] text-white uppercase font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Empresa</span>
              <div className="grid grid-cols-2 gap-y-1">
                {[
                  { href: '/#nuestra-historia', label: 'Nuestra Historia' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-[13px] text-white/60 font-light py-[3px] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* DESTACADAS */}
            <div>
              <span className="block text-[15px] text-white uppercase font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>DESTACADAS</span>
              <Link href="/#propiedades-destacadas" className="text-[13px] text-white/60 font-light py-[3px] hover:text-white transition-colors">
                Nuestra Selección
              </Link>
            </div>
            {/* Newsletter */}
            <div>
              <span className="block text-[15px] text-white uppercase font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>ENTERATE DE LOS NUEVOS INGRESOS ANTES QUE NADIE</span>
              
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe}>
                  <div className="relative mb-3">
                    <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl" />
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Tu nro. de WhatsApp"
                      required
                      className="w-full h-10 bg-white/[0.06] border-none rounded-[5px] text-white font-bold text-[14px] pl-[45px] pr-4 outline-none placeholder:text-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm uppercase tracking-wider rounded-[5px] h-10 px-6 transition-all w-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Suscribir'}
                  </button>
                </form>
              ) : (
                <div className="animate-fade-in bg-white/[0.03] rounded-lg p-4 border border-[#25D366]/30">
                  <p className="text-[#4ade80] text-[13px] font-bold mb-3 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ¡Número guardado!
                  </p>
                  <a
                    href={groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[13px] rounded-[5px] h-[40px] px-4 transition-all w-full"
                  >
                    <FaWhatsapp className="text-lg" />
                    Unirte al Grupo VIP
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Copyright + Social + Powered by */}
          <div className="border-t border-white/[0.08] pt-6 flex flex-col items-center gap-4">
            <p className="text-[14px] text-white uppercase font-bold mb-2">
              &copy; {currentYear} Farias & Asociados <sup>TM</sup>
            </p>
            <ul className="flex items-center gap-[25px]">
              <li>
                <a href={`mailto:${contactEmail}`} className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Email">
                  <img src="/senada/images/icons/ico_mail.svg" alt="email" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href={generateWhatsAppLink({ context: 'general' })} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="WhatsApp" onClick={() => trackWhatsappClick({ cta_location: 'footer_mobile', context: 'general' })}>
                  <FaWhatsapp className="text-xl" />
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/search/top?q=Inmobiliaria%20Farias%20%26%20Asociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Facebook" onClick={() => trackSocialClick({ channel: 'facebook', cta_location: 'footer_mobile', context: 'social' })}>
                  <img src="/senada/images/icons/ico_facebook.svg" alt="facebook" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/inmobiliariafariasasociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[40px] h-[40px] rounded-[9px] bg-white/[0.15] hover:bg-[var(--color-brand)] transition-all duration-300" aria-label="Instagram">
                  <img src="/senada/images/icons/ico_instagram.svg" alt="instagram" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
            </ul>
            <p className="text-[14px] text-white/40">
              Powered by{' '}
              <a href="https://www.wolfim.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">
                <Image
                  src="/images/wolfim studio white-Photoroom.png"
                  alt="Wolfim Studio"
                  width={80}
                  height={22}
                  style={{ height: '18px', width: 'auto' }}
                  className="opacity-60 inline-block align-middle"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
