'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { FaHome, FaUsers, FaPlusCircle, FaFileInvoiceDollar, FaCog } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const pathname = usePathname();

  let backLink = '/admin';
  let backText = 'Volver al Panel';

  if (pathname.match(/^\/admin\/quotations\/.+/)) {
    backLink = '/admin/quotations';
    backText = 'Volver a Propuestas';
  } else if (pathname.match(/^\/admin\/properties\/.+/)) {
    backLink = '/admin/properties';
    backText = 'Volver a Propiedades';
  } else if (pathname.match(/^\/admin\/subscribers\/.+/)) {
    backLink = '/admin/subscribers';
    backText = 'Volver a Suscriptores';
  }

  const navItems = [
    { name: 'Mi Día', href: '/admin/crm', icon: FaHome },
    { name: 'Directorio', href: '/admin/crm/contacts', icon: FaUsers },
    { name: 'Cotizar', href: '/admin/quotations', icon: FaFileInvoiceDollar },
    { name: 'Ajustes', href: '/admin', icon: FaCog },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] pb-20 md:pb-0">
      {/* Content */}
      <main className="flex-1 pt-[80px] md:pt-[110px] min-h-screen text-white max-w-[1600px] mx-auto w-full relative">
        {pathname !== '/admin' && (
          <div className="px-4 md:px-6 mb-2">
            <Link href={backLink} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-[#222] text-[12px] font-medium text-[#aaa] hover:text-white hover:bg-[#222] hover:border-[#333] transition-all" title={backText}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backText}
            </Link>
          </div>
        )}
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#111] border-t border-[#333] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <nav className="flex justify-around items-center h-16 px-2 relative">
          
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/crm' && item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[var(--color-brand)]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={isActive ? 22 : 20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(254,139,1,0.5)]' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}

          {/* FLOATING ACTION BUTTON - NUEVO LEAD */}
          <Link href="/admin/crm/contacts/new" className="relative -top-5 flex flex-col items-center justify-center">
            <div className="bg-[var(--color-brand)] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-[#0a0a0a]">
              <FaPlusCircle size={24} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">Nuevo</span>
          </Link>

          {navItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[var(--color-brand)]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={isActive ? 22 : 20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(254,139,1,0.5)]' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;