'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const SuperadminLayout = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-black">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0f0f13] border-b border-purple-900/30 z-[60] h-[60px] flex items-center justify-between px-4">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-purple-400/60 hover:text-purple-400" title="Volver al sitio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </Link>
        <span className="text-purple-400 font-bold tracking-widest uppercase text-xs">God Mode</span>
      </div>

      {/* Sidebar Desktop/Mobile bottom nav */}
      <aside className="fixed bottom-0 md:top-0 md:left-0 md:bottom-auto w-full md:w-[260px] md:h-screen bg-[#0f0f13] md:border-r border-purple-900/30 z-50 flex md:flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:shadow-none">
        
        {/* Logo Area (Desktop) */}
        <div className="hidden md:flex h-[90px] items-center px-8 border-b border-purple-900/30">
          <Link href="/superadmin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-purple-600/20 flex items-center justify-center border border-purple-500/30 text-purple-400 transition-colors group-hover:border-purple-400 group-hover:text-purple-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-purple-400 font-bold tracking-widest text-[11px] uppercase">Superadmin</span>
              <span className="text-purple-200/50 text-[10px] tracking-wider">GOD MODE</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 md:px-5 py-3 md:py-8 flex flex-row md:flex-col justify-around md:justify-start gap-2 overflow-x-auto overflow-y-hidden md:overflow-y-auto no-scrollbar">
          <Link 
            href="/superadmin" 
            className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl transition-all duration-300 min-w-max md:min-w-0 ${pathname === '/superadmin' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="font-medium text-[13px] md:text-sm tracking-wide hidden md:block">Gestión de Roles</span>
          </Link>

          <Link 
            href="/superadmin/backups" 
            className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl transition-all duration-300 min-w-max md:min-w-0 ${pathname.includes('/superadmin/backups') ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span className="font-medium text-[13px] md:text-sm tracking-wide hidden md:block">Respaldos (Backups)</span>
          </Link>

          <Link 
            href="/superadmin/content" 
            className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl transition-all duration-300 min-w-max md:min-w-0 ${pathname.includes('/superadmin/content') ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="font-medium text-[13px] md:text-sm tracking-wide hidden md:block">Gestor de Contenido</span>
          </Link>
          
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-all duration-300 min-w-max md:min-w-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="font-medium text-[13px] md:text-sm tracking-wide hidden md:block">Panel Admin Normal</span>
          </Link>

          <div className="hidden md:block w-full h-px bg-purple-900/20 my-2"></div>
        </nav>

        {/* Logout Area */}
        <div className="hidden md:block p-5 border-t border-purple-900/30">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="font-semibold text-[13px] tracking-wider uppercase">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-[260px] pb-[80px] md:pb-0 pt-[60px] md:pt-0 min-h-screen">
        <div className="h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black border-l border-purple-900/20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperadminLayout;
