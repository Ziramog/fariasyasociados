export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panel de Control',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import Quotation from '@/models/Quotation';
import { isGranInversion } from '@/utils/filterProperties';
import {
  Home,
  Building2,
  Sprout,
  Map,
  Store,
  TrendingUp,
  User,
  Star,
  Layers,
  CheckCircle,
  FileText,
  MessageCircle
} from 'lucide-react';
import MotionCard from '@/components/admin/MotionCard';

const AdminPage = async () => {
  await connectDB();

  const total = await Property.countDocuments({});
  const activas = await Property.countDocuments({ is_published: { $ne: false } });
  const featured = await Property.countDocuments({ is_featured: true });
  const quotations = await Quotation.countDocuments({});

  const types = ['Casa', 'Departamento', 'Campo', 'Terreno', 'Inmueble Comercial'];
  const categoryCounts = await Promise.all(
    types.map(async (t) => ({
      type: t,
      count: await Property.countDocuments({ type: t }),
    }))
  );

  // Gran Inversión: price >= 300k OR square_feet >= 10,000
  const allPropsForGI = await Property.find({}, 'price square_feet').lean();
  const granInversionCount = allPropsForGI.filter((p) => isGranInversion(p)).length;

  const CATEGORIES = [
    { type: 'Casa', Icon: Home, color: '#F26B2E' },
    { type: 'Departamento', Icon: Building2, color: '#652660' },
    { type: 'Campo', Icon: Sprout, color: '#25D366' },
    { type: 'Terreno', Icon: Map, color: '#60A5FA' },
    { type: 'Inmueble Comercial', Icon: Store, color: '#E94560' },
    { type: 'Gran Inversión', Icon: TrendingUp, color: '#FFD700', count: granInversionCount, href: '/admin/properties?granInversion=true' },
  ];

  const NAV_LINKS = [
    { label: 'Perfil', href: '/admin/profile', Icon: User, color: '#888' },
    { label: 'Propuestas', href: '/admin/quotations', Icon: FileText, color: '#3B82F6' },
    { label: 'Comunidad', href: '/admin/subscribers', Icon: MessageCircle, color: '#25D366' },
    { label: 'Reseñas', href: '/admin/reviews', Icon: Star, color: '#FFD700' },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-[28px] md:text-[36px] font-normal text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Panel de Control
      </h1>

      {/* Global Stats: 3 cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: total, label: 'Total Propiedades', color: '#F26B2E', href: '/admin/properties', Icon: Layers },
            { value: activas, label: 'Activas', color: '#25D366', href: '/admin/properties?status=active', Icon: CheckCircle },
            { value: featured, label: 'Destacadas', color: '#652660', href: '/admin/properties?is_featured=true', Icon: Star },
          ].map((stat, index) => (
            <MotionCard key={stat.label} delay={0.1 + index * 0.1} color={stat.color}>
              <Link href={stat.href} className="block h-full bg-[#161616] border border-[#222] rounded-sm p-5 md:p-6 hover:border-[#333] transition-colors relative group overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.Icon size={120} style={{ color: stat.color }} />
                </div>
                <div className="relative z-10 text-center mt-2">
                  <p className="text-[32px] md:text-[40px] font-bold leading-none mb-2" style={{ fontFamily: 'var(--font-heading)', color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] md:text-[13px] font-medium text-[#888] uppercase tracking-wider">{stat.label}</p>
                </div>
              </Link>
            </MotionCard>
          ))}
        </div>
      </div>

      {/* Category cards: 6 cards */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, index) => {
            const count = cat.count !== undefined ? cat.count : categoryCounts.find((c) => c.type === cat.type)?.count || 0;
            return (
              <MotionCard key={cat.type} delay={0.2 + index * 0.1} color={cat.color}>
                <Link
                  href={cat.href || `/admin/properties?type=${cat.type}`}
                  className="block h-full bg-[#161616] border border-[#222] rounded-sm p-5 hover:border-[#333] transition-colors text-center group"
                >
                  <cat.Icon className="w-7 h-7 mx-auto mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: cat.color }} strokeWidth={1.5} />
                  <p className="text-[24px] font-bold leading-none mb-1" style={{ color: cat.color }}>
                    {count}
                  </p>
                  <p className="text-[10px] font-medium text-[#888] uppercase tracking-wider">{cat.type}</p>
                </Link>
              </MotionCard>
            );
          })}
        </div>
      </div>

      {/* Navigation links: 4 cards */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NAV_LINKS.map((link, index) => {
            const tooltipText = 
              link.label === 'Perfil' ? 'Administra información personal, firma PDF y configuraciones de contacto.' :
              link.label === 'Propuestas' ? 'Crea y gestiona presupuestos en PDF o web para tus clientes.' :
              link.label === 'Comunidad' ? 'Gestiona contactos, suscripciones y boletines.' :
              'Modera y visualiza las reseñas y testimonios públicos.';

            return (
              <MotionCard key={link.label} delay={0.4 + index * 0.1} color={link.color}>
                <div className="relative group h-full">
                  <Link
                    href={link.href}
                    className="block h-full bg-[#161616] border border-[#222] rounded-sm p-5 hover:border-[#333] transition-colors text-center group-hover:bg-[#1a1a1a]"
                  >
                    <link.Icon className="w-7 h-7 mx-auto mb-3 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: link.color }} strokeWidth={1.5} />
                    <p className="text-[11px] font-medium text-[#888] uppercase tracking-wider">{link.label}</p>
                  </Link>

                  <div className="absolute top-2 right-2 group/help cursor-help">
                    <div className="p-1 rounded-full hover:bg-white/10 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#666] group-hover/help:text-white">
                         <circle cx="12" cy="12" r="10"></circle>
                         <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                         <line x1="12" y1="17" x2="12.01" y2="17"></line>
                       </svg>
                    </div>
                    {/* Tooltip Popup */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 sm:w-56 bg-[#0a0a0a] border border-[#333] rounded-sm p-3 shadow-2xl opacity-0 pointer-events-none group-hover/help:opacity-100 transition-opacity duration-200 z-20">
                      <p className="text-[10px] text-[#aaa] leading-relaxed">{tooltipText}</p>
                    </div>
                  </div>
                </div>
              </MotionCard>
            );
          })}
        </div>
      </div>


    </div>
  );
};

export default AdminPage;
