'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa';

const PROPERTY_TYPES = ['Todos', 'Casa', 'Departamento', 'Terreno', 'Campo', 'Inmueble Comercial', 'Gran Inversión'];
const CITIES = ['Ciudad', 'Alta Gracia', 'Anisacate', 'Despeñaderos', 'Falda del Carmen', 'Huerta Grande'];
const BEDROOM_OPTS = ['', '1', '2', '3', '4', '5'];

const FilterDrawer = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'Todos',
    city: 'Ciudad',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
    setOpen(false);
  };

  const glassCls = 'bg-black/20 backdrop-blur-xl border border-white/10';

  return (
    <>
      {/* Toggle button — fixed right side */}
      <button
        onClick={() => setOpen(true)}
        className='fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-black/20 backdrop-blur-xl border border-white/10 border-r-0 rounded-l-xl px-2 py-4 flex flex-col items-center gap-1 text-white/80 hover:text-white hover:bg-black/30 transition-all'
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <FaSlidersH className='w-4 h-4' />
        <span className='text-[10px] font-bold uppercase tracking-widest'>Filtros</span>
      </button>

      {/* Drawer backdrop */}
      {open && (
        <div
          className='fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-[70] w-80 ${glassCls} transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
          <span className='text-white font-bold uppercase tracking-wider text-sm'>Filtros</span>
          <button onClick={() => setOpen(false)} className='text-white/60 hover:text-white transition-colors'>
            <FaTimes className='w-5 h-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-4'>
          <div>
            <label className='text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2 block'>Tipo</label>
            <select name='type' value={filters.type} onChange={handleChange}
              className='w-full bg-black/20 border border-white/10 text-white text-sm py-3 px-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 outline-none appearance-none cursor-pointer'>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className='text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2 block'>Ubicación</label>
            <select name='city' value={filters.city} onChange={handleChange}
              className='w-full bg-black/20 border border-white/10 text-white text-sm py-3 px-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 outline-none appearance-none cursor-pointer'>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2 block'>Precio mín</label>
              <input type='number' name='minPrice' value={filters.minPrice} onChange={handleChange} placeholder='U$S'
                className='w-full bg-black/20 border border-white/10 text-white text-sm py-3 px-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 outline-none placeholder:text-white/40' />
            </div>
            <div className='flex-1'>
              <label className='text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2 block'>Precio máx</label>
              <input type='number' name='maxPrice' value={filters.maxPrice} onChange={handleChange} placeholder='U$S'
                className='w-full bg-black/20 border border-white/10 text-white text-sm py-3 px-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 outline-none placeholder:text-white/40' />
            </div>
          </div>

          <div>
            <label className='text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2 block'>Dormitorios</label>
            <select name='bedrooms' value={filters.bedrooms} onChange={handleChange}
              className='w-full bg-black/20 border border-white/10 text-white text-sm py-3 px-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 outline-none appearance-none cursor-pointer'>
              <option value=''>Cualquiera</option>
              {BEDROOM_OPTS.filter(o => o).map((o) => <option key={o} value={o}>{o}+</option>)}
            </select>
          </div>

          <button type='submit'
            className='mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30'>
            <FaSearch className='w-4 h-4' />
            Buscar
          </button>
        </form>
      </div>
    </>
  );
};

export default FilterDrawer;
