'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppLink, PHONE_NUMBER, PHONE_DISPLAY } from '@/utils/whatsapp';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';
import { trackWhatsappClick, trackPhoneClick } from '@/utils/analytics';

const Navbar = ({ contactEmail = 'info@fariasyasociados.com.ar', contactPhone = '+54 9 0000 000000' }) => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [providers, setProviders] = useState(null);
  const [desktopDropdown, setDesktopDropdown] = useState(null);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  const dropdownTimeout = useRef(null);
  const pathname = usePathname();

  const openDropdown = (name) => {
    clearTimeout(dropdownTimeout.current);
    setDesktopDropdown(name);
  };
  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setDesktopDropdown(null), 200);
  };

  const isHomepage = pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');
  const isGlassMode = isHomepage ? (isScrolled || isMobileMenuOpen) : true;
  const showIso = isScrolled || isAdminPage;

  if (pathname.startsWith('/p/')) return null;

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();

    const handleResize = () => setIsMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!desktopDropdown) return;
    const close = (e) => {
      if (!e.target.closest('.desktop-dropdown')) setDesktopDropdown(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [desktopDropdown]);

  return (
    <>
      {/* Desktop Nav — Senada-style */}
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isGlassMode ? 'bg-black shadow-lg shadow-black/20' : 'bg-transparent'
        }`}
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 8px) + 15px)', paddingBottom: '15px' }}
      >
        <div className="flex items-center px-4 md:px-[50px] h-full w-full">
          {/* Logo */}
          <Link className="flex items-center flex-shrink-0 group" href="/">
            <Image
              className="transition-all duration-300 group-hover:opacity-70"
              src={!showIso ? '/images/logo_no_backgroud.png' : '/images/logo_only.png'}
              alt="Farias & Asociados"
              width={!showIso ? 259 : 240}
              height={!showIso ? 88 : 80}
              style={{ height: !showIso ? '88px' : '80px', width: 'auto' }}
            />
          </Link>

          {/* Main Nav — Senada .mainMenu */}
          <nav className="desktop-dropdown flex items-center gap-8 lg:gap-10 ml-auto">
            <Link href="/#propiedades-destacadas" className="text-white hover:text-[var(--color-brand)] transition-colors text-[15px] font-normal tracking-[0.02em] uppercase">
              DESTACADAS
            </Link>

              <div className="relative" onMouseEnter={() => openDropdown('props')} onMouseLeave={closeDropdown}>
                <button className="text-white hover:text-[var(--color-brand)] transition-colors text-[15px] font-normal tracking-[0.02em] uppercase">
                  Propiedades
                </button>
                <svg className={`absolute left-1/2 -translate-x-1/2 w-[14px] h-[12px] transition-transform ${desktopDropdown === 'props' ? 'rotate-180' : ''}`}
                  style={{ top: 'calc(100% + 2px)', color: desktopDropdown === 'props' ? 'var(--color-brand)' : '#fff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
                <div style={{
                  maxHeight: desktopDropdown === 'props' ? '500px' : '0',
                  opacity: desktopDropdown === 'props' ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 50,
                }}>
                  <ul className="bg-black rounded-[6px] min-w-[200px] text-center shadow-[0_8px_14px_-3px_rgba(255,255,255,0.1)] mt-2">
                    {[
                      { label: 'Campos', query: 'type=Campo' },
                      { label: 'Casas', query: 'type=Casa' },
                      { label: 'Departamentos', query: 'type=Departamento' },
                      { label: 'Inmuebles Comerciales', query: 'type=Inmueble+Comercial' },
                      { label: 'Terrenos', query: 'type=Terreno' },
                      { label: 'Todas las propiedades', query: '' },
                    ].map(item => (
                      <li key={item.label} className="border-b border-[#252525] last:border-b-0">
                        <Link href={`/properties${item.query ? `?${item.query}` : ''}`} className="block text-white text-[13px] px-5 py-[15px] font-normal uppercase tracking-wider hover:opacity-40">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            <Link href="/#nuestra-historia" className="text-white hover:text-[var(--color-brand)] transition-colors text-[15px] font-normal tracking-[0.02em] uppercase">
              Sobre Nosotros
            </Link>

            {session && (
              <Link href="/admin" className="text-white hover:text-[var(--color-brand)] transition-colors text-[15px] font-normal tracking-[0.02em] uppercase">
                Panel de Control
              </Link>
            )}
          </nav>

          {/* Side Nav — Senada .sideMenu: Phone | Search | Show More */}
          <div className="desktop-dropdown flex items-center gap-4 ml-8">
            {/* Phone → WhatsApp */}
            <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" aria-label="WhatsApp" onClick={() => trackWhatsappClick({ cta_location: 'navbar_desktop', context: 'general' })}>
              <img src="/senada/images/icons/ico_phone.svg" alt="Teléfono" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
            </a>
            {/* Search */}
            <Link href="/properties" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" aria-label="Buscar">
              <img src="/senada/images/icons/ico_search.svg" alt="Buscar" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            {/* Show More / Hamburger */}
            <div className="relative" onMouseEnter={() => openDropdown('more')} onMouseLeave={closeDropdown}>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" aria-label="Más">
                  <span className="space-y-1 flex flex-col items-center">
                    <span className="block w-[18px] h-[2px] bg-white rounded-sm"></span>
                    <span className="block w-[18px] h-[2px] bg-white rounded-sm"></span>
                    <span className="block w-[18px] h-[2px] bg-white rounded-sm"></span>
                  </span>
                </button>
                <div style={{
                  maxHeight: desktopDropdown === 'more' ? '500px' : '0',
                  opacity: desktopDropdown === 'more' ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
                  position: 'absolute', top: '100%', right: '0', zIndex: 50,
                }}>
                  <ul className="bg-black rounded-[6px] min-w-[180px] text-center shadow-[0_8px_14px_-3px_rgba(255,255,255,0.1)] mt-2">
                    {!session && providers && Object.values(providers).map((provider) => (
                      <li key={provider.id} className="border-b border-[#252525] last:border-b-0">
                          <button onClick={() => signIn(provider.id, { callbackUrl: '/admin' })} className="block w-full text-center text-white text-[13px] px-5 py-[15px] font-normal hover:opacity-40">Ingresar</button>
                      </li>
                    ))}
                    {session && (
                      <li className="border-b border-[#252525] last:border-b-0"><button onClick={() => signOut()} className="block w-full text-center text-white text-[13px] px-5 py-[15px] font-normal hover:opacity-40">Salir</button></li>
                    )}
                  </ul>
                </div>
              </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isGlassMode ? 'bg-black' : 'bg-transparent'
        }`}
        style={{ height: 'calc(env(safe-area-inset-top, 8px) + 60px)' }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          {/* Logo — isotipo */}
          <Link className="flex items-center flex-shrink-0" href="/">
            <Image
              className=""
              src="/images/farias_logo_no_bk.png"
              alt="Farias & Asociados"
              width={150}
              height={50}
              style={{ height: '50px', width: 'auto' }}
            />
          </Link>

          {/* Search icon — 20px left of hamburger */}
          <div className="flex items-center gap-5">
            <Link href="/properties" className="w-8 h-8 flex items-center justify-center">
              <img src="/senada/images/icons/ico_search.svg" alt="Buscar" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>

            {/* Hamburger / Close — senada style */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rButton w-8 h-8 flex items-center justify-center ${isMobileMenuOpen ? 'active' : ''}`}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <div className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile fullscreen overlay — Senada style */}
        <div
          className="md:hidden fixed inset-x-0 z-[110] bg-black flex flex-col overflow-x-hidden"
          style={{
            top: 'calc(env(safe-area-inset-top, 8px) + 60px)',
            height: 'calc(100dvh - env(safe-area-inset-top, 8px) - 60px)',
            padding: '40px 12px calc(20px + env(safe-area-inset-bottom, 0px))',
            overflowY: 'auto',
            transformOrigin: 'top',
            transform: isMobileMenuOpen ? 'scaleY(1)' : 'scaleY(0)',
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
            pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
          }}
        >
          <nav className="flex-1 flex flex-col px-0">
            {/* Destacadas */}
            <Link href="/properties" className={`block text-white text-[22px] py-[15px] border-b border-white/[.08] hover:text-[var(--color-brand)] transition-colors ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, animationDelay: '0.4s' }} onClick={() => setIsMobileMenuOpen(false)}>
              Destacadas
            </Link>

            {/* Propiedades — expandable */}
            <div className={`border-b border-white/[.08] ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ animationDelay: '0.45s' }}>
              <button
                  onClick={() => setMobileSubOpen(!mobileSubOpen)}
                  className="flex items-center justify-between w-full text-white text-[22px] py-[15px] hover:text-[var(--color-brand)] transition-colors"
                  style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
                >
                  Propiedades
                <svg className={`w-5 h-5 text-white/40 transition-transform duration-300 ${mobileSubOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileSubOpen ? 'max-h-[300px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                {[
                  { href: '/properties?type=Campo', label: 'Campos' },
                  { href: '/properties?type=Casa', label: 'Casas' },
                  { href: '/properties?type=Departamento', label: 'Departamentos' },
                  { href: '/properties?type=Inmueble+Comercial', label: 'Inmuebles Comerciales' },
                  { href: '/properties?type=Terreno', label: 'Terrenos' },
                  { href: '/properties', label: 'Todas las propiedades' },
                ].map(l => (
                    <Link key={l.href} href={l.href} className="block text-white/70 text-[16px] py-2 pl-4 hover:text-white transition-colors" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }} onClick={() => setIsMobileMenuOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* SOBRE NOSOTROS */}
            <Link href="/#nuestra-historia" className={`block text-white text-[22px] py-[15px] border-b border-white/[.08] hover:text-[var(--color-brand)] transition-colors ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, animationDelay: '0.5s' }} onClick={() => setIsMobileMenuOpen(false)}>
              Sobre nosotros
            </Link>

            {/* PANEL DE CONTROL */}
            {session && (
              <Link href="/admin" className={`block text-white text-[22px] py-[15px] border-b border-white/[.08] hover:text-[var(--color-brand)] transition-colors ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, animationDelay: '0.55s' }} onClick={() => setIsMobileMenuOpen(false)}>
                Panel de control
              </Link>
            )}

            {session ? (
              <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-white text-[22px] py-[15px] border-b border-white/[.08] hover:text-[var(--color-brand)] transition-colors ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, animationDelay: '0.6s' }}>
                Salir
              </button>
            ) : (
              providers && Object.values(providers).map((provider, i) => (
                <button key={provider.id} onClick={() => { signIn(provider.id, { callbackUrl: '/admin' }); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-white text-[22px] py-[15px] border-b border-white/[.08] hover:text-[var(--color-brand)] transition-colors ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, animationDelay: `${0.55 + (i*0.05)}s` }}>
                  Ingresar
                </button>
              ))
            )}
          </nav>

          {/* Social icons at bottom */}
          <div className={`flex-shrink-0 pt-8 pb-4 ${isMobileMenuOpen ? 'mobile-item' : ''}`} style={{ animationDelay: '0.7s' }}>
            <ul className="flex items-center justify-center gap-3 flex-wrap max-w-full mx-auto px-2">
              <li>
                <a href={`tel:${contactPhone.replace(/\D/g, '')}`} className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/50 hover:bg-[var(--color-brand)] transition-colors duration-300" aria-label="Llamar" onClick={() => trackPhoneClick({ cta_location: 'navbar_mobile', context: 'general' })}>
                  <img src="/senada/images/icons/ico_phone.svg" alt="phone" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/50 hover:bg-[var(--color-brand)] transition-colors duration-300" aria-label="Email">
                  <img src="/senada/images/icons/ico_mail.svg" alt="email" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/50 hover:bg-[var(--color-brand)] transition-colors duration-300" aria-label="WhatsApp" onClick={() => trackWhatsappClick({ cta_location: 'navbar_mobile', context: 'general' })}>
                  <FaWhatsapp className="text-white text-xl" />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/inmobiliariafariasasociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.15] hover:bg-[var(--color-brand)] transition-colors duration-300" aria-label="Instagram">
                  <img src="/senada/images/icons/ico_instagram.svg" alt="instagram" className="w-5 h-5" />
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/search/top?q=Inmobiliaria%20Farias%20%26%20Asociados" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.15] hover:bg-[var(--color-brand)] transition-colors duration-300" aria-label="Facebook">
                  <img src="/senada/images/icons/ico_facebook.svg" alt="facebook" className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    {/* CSS for hamburger animation — senada style */}
      <style jsx>{`
        .rButton .hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background: #fff;
          border-radius: 3px;
          margin: 5px 0;
          position: relative;
          transition: all 0.3s ease;
        }
        .rButton.active .hamburger span:nth-child(1) {
          top: 8px;
          transform: rotate(135deg);
        }
        .rButton.active .hamburger span:nth-child(2) {
          opacity: 0;
          transform: translateX(-30px);
        }
        .rButton.active .hamburger span:nth-child(3) {
          width: 25px;
          margin: unset;
          top: -8px;
          transform: rotate(-135deg);
        }
        .mobile-item {
          opacity: 0;
          transform: translateY(15px);
          animation: mobileFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes mobileFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
        /* Desktop dropdown animation — Senada .top_level */
        .desktop-dropdown ul {
          animation: dropdownFade 0.2s ease-out;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
