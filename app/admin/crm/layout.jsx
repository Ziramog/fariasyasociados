'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaPlusCircle, FaFileInvoiceDollar, FaCog } from 'react-icons/fa';

export default function CRMLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Mi Día', href: '/admin/crm', icon: FaHome },
    { name: 'Directorio', href: '/admin/crm/contacts', icon: FaUsers },
    { name: 'Cotizar', href: '/admin/quotations', icon: FaFileInvoiceDollar },
    { name: 'Ajustes', href: '/admin', icon: FaCog },
  ];

  return (
    <>
      <div className="pb-20 md:pb-0">
        {children}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-[#333] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <nav className="flex justify-around items-center h-16 px-2 relative">
          
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/crm' && pathname.startsWith(item.href));
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
    </>
  );
}
