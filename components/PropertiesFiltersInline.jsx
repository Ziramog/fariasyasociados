'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaChevronDown, FaTimes, FaHeart } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { trackSearchUsed } from '@/utils/analytics';

const PROPERTY_TYPES = ['Todos', 'Casa', 'Departamento', 'Terreno', 'Campo', 'Inmueble Comercial', 'Gran Inversión'];
const CITIES = ['Ciudad', 'Alta Gracia', 'Anisacate', 'Despeñaderos', 'Falda del Carmen', 'Huerta Grande'];
const BEDROOM_OPTS = ['', '1', '2', '3', '4', '5'];

const PropertiesFiltersInline = ({ currentFilters }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: currentFilters.type || 'Todos',
    city: currentFilters.city || 'Ciudad',
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || '',
    bedrooms: currentFilters.bedrooms || '',
    favoritos: currentFilters.favoritos || '',
  });

  const hasActiveFilters =
    (filters.type && filters.type !== 'Todos') ||
    (filters.city && filters.city !== 'Ciudad') ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.favoritos === 'true';

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'Todos') params.set('type', filters.type);
    if (filters.city && filters.city !== 'Ciudad') params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.favoritos === 'true') params.set('favoritos', 'true');

    trackSearchUsed({
      property_type: filters.type !== 'Todos' ? filters.type : undefined,
      location: filters.city !== 'Ciudad' ? filters.city : undefined,
    });

    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
  };

  const handleReset = () => {
    setFilters({ type: 'Todos', city: 'Ciudad', minPrice: '', maxPrice: '', bedrooms: '', favoritos: '' });
    router.push('/properties');
  };

  const toggleFavoritos = () => {
    const newFavoritos = filters.favoritos === 'true' ? '' : 'true';
    setFilters({ ...filters, favoritos: newFavoritos });
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'Todos') params.set('type', filters.type);
    if (filters.city && filters.city !== 'Ciudad') params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (newFavoritos === 'true') params.set('favoritos', 'true');
    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
  };

  const selectCls = 'w-full bg-white border border-[var(--color-border)] text-[var(--color-ink)] text-sm py-2.5 px-3.5 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] outline-none appearance-none cursor-pointer transition-all';
  const inputCls = 'w-full bg-white border border-[var(--color-border)] text-[var(--color-ink)] text-sm py-2.5 px-3.5 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] outline-none placeholder:text-[var(--color-ink-tertiary)] transition-all';
  const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-1.5 block';

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300">
      {/* Toggle bar — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--color-surface-soft)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--color-brand)]">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            {hasActiveFilters ? 'Filtros activos' : 'Filtrar propiedades'}
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] font-bold bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">
              {[filters.type !== 'Todos' && filters.type, filters.city !== 'Ciudad' && filters.city, filters.minPrice, filters.maxPrice, filters.bedrooms && `${filters.bedrooms}+ dorm`, filters.favoritos === 'true' && 'Favoritos'].filter(Boolean).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavoritos(); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                filters.favoritos === 'true'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] hover:bg-red-500/20'
              }`}
              title="Mis favoritos"
            >
              <FaHeart className={`w-3.5 h-3.5 ${filters.favoritos === 'true' ? 'fill-current' : ''}`} />
            </button>
          )}
          <FaChevronDown className={`w-4 h-4 text-[var(--color-ink-tertiary)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Active filter pills — shown when collapsed and filters active */}
      {!expanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 px-5 pb-3.5">
          {filters.type !== 'Todos' && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-1 rounded-full">
              {filters.type}
              <button onClick={() => { setFilters({ ...filters, type: 'Todos' }); }} className="hover:text-[var(--color-brand-dark)]">
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.city !== 'Ciudad' && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-1 rounded-full">
              {filters.city}
              <button onClick={() => { setFilters({ ...filters, city: 'Ciudad' }); }} className="hover:text-[var(--color-brand-dark)]">
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.bedrooms && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-1 rounded-full">
              {filters.bedrooms}+ dorm
              <button onClick={() => { setFilters({ ...filters, bedrooms: '' }); }} className="hover:text-[var(--color-brand-dark)]">
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-1 rounded-full">
              {filters.minPrice ? `U$S ${Number(filters.minPrice).toLocaleString()}` : 'U$S 0'} — {filters.maxPrice ? `U$S ${Number(filters.maxPrice).toLocaleString()}` : 'Sin límite'}
              <button onClick={() => { setFilters({ ...filters, minPrice: '', maxPrice: '' }); }} className="hover:text-[var(--color-brand-dark)]">
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.favoritos === 'true' && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
              <FaHeart className="w-3 h-3 fill-current" /> Favoritos
              <button onClick={() => { setFilters({ ...filters, favoritos: '' }); router.push('/properties'); }} className="hover:text-red-600">
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          <button onClick={handleReset} className="text-[12px] font-medium text-[var(--color-ink-tertiary)] hover:text-[var(--color-brand)] transition-colors underline underline-offset-2">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Expanded filter form */}
      {expanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-1 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col">
              <label className={labelCls}>Tipo</label>
              <select name="type" value={filters.type} onChange={handleChange} className={selectCls}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelCls}>Ubicación</label>
              <select name="city" value={filters.city} onChange={handleChange} className={selectCls}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelCls}>Precio máx (USD)</label>
              <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Sin límite" className={inputCls} />
            </div>

            <div className="flex flex-col">
              <label className={labelCls}>Dormitorios</label>
              <select name="bedrooms" value={filters.bedrooms} onChange={handleChange} className={selectCls}>
                <option value="">Cualquiera</option>
                {BEDROOM_OPTS.filter(o => o).map((o) => <option key={o} value={o}>{o}+</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit"
                className="flex-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[var(--color-brand)]/20">
                <FaSearch className="w-3.5 h-3.5" />
                Buscar
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={handleReset}
                  className="px-3 py-2.5 border border-[var(--color-border)] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-tertiary)] rounded-xl text-sm transition-all">
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PropertiesFiltersInline;
