'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { trackSearchUsed } from '@/utils/analytics';

const PropertyFilters = ({ variant = 'hero' }) => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    type: 'Todos',
    city: 'Ciudad',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  const propertyTypes = ['Todos', 'Casa', 'Departamento', 'Terreno', 'Campo', 'Inmueble Comercial', 'Gran Inversión'];
  const cities = ['Ciudad', 'Alta Gracia', 'Anisacate', 'Despeñaderos', 'Falda del Carmen', 'Huerta Grande'];
  const bedroomOptions = ['', '1', '2', '3', '4', '5'];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'Todos') params.set('type', filters.type);
    if (filters.city && filters.city !== 'Todas las ciudades' && filters.city !== 'Ciudad') params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);

    trackSearchUsed({
      property_type: filters.type !== 'Todos' ? filters.type : undefined,
      location: (filters.city !== 'Ciudad' && filters.city !== 'Todas las ciudades') ? filters.city : undefined,
    });

    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
        <select name="type" value={filters.type} onChange={handleChange}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
          {propertyTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
        </select>
        <select name="city" value={filters.city} onChange={handleChange}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
          {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-all">
          Buscar
        </button>
      </form>
    );
  }

  if (variant === 'full') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)]">Tipo</label>
            <select name="type" value={filters.type} onChange={handleChange}
              className="w-full border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm bg-white text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer">
              {propertyTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)]">Ubicación</label>
            <select name="city" value={filters.city} onChange={handleChange}
              className="w-full border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm bg-white text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer">
              {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)]">Precio Máx (USD)</label>
            <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange}
              placeholder="Sin límite"
              className="w-full border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm bg-white text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)]">Dormitorios</label>
            <select name="bedrooms" value={filters.bedrooms} onChange={handleChange}
              className="w-full border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm bg-white text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer">
              <option value="">Cualquiera</option>
              {bedroomOptions.filter(o => o).map((opt) => (<option key={opt} value={opt}>{opt}+</option>))}
            </select>
          </div>

          <button type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <FaSearch className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </form>
    );
  }

  const heroInputCls = 'w-full bg-black/20 border border-white/10 text-white py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all outline-none appearance-none cursor-pointer';
  const heroLabelCls = 'text-white/60 text-[11px] font-bold uppercase tracking-widest ml-1 mb-2 block';

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-end">
        <div className="flex flex-col gap-2">
          <label className={heroLabelCls}>Tipo de Propiedad</label>
          <select name="type" value={filters.type} onChange={handleChange} className={heroInputCls}>
            {propertyTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={heroLabelCls}>Ubicación</label>
          <select name="city" value={filters.city} onChange={handleChange} className={heroInputCls}>
            {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={heroLabelCls}>Precio Máx (USD)</label>
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Sin límite" className={heroInputCls} />
        </div>

        <div className="flex flex-col gap-2">
          <label className={heroLabelCls}>Dormitorios</label>
          <select name="bedrooms" value={filters.bedrooms} onChange={handleChange} className={heroInputCls}>
            <option value="">Cualquiera</option>
            {bedroomOptions.filter(o => o).map((opt) => (<option key={opt} value={opt}>{opt}+</option>))}
          </select>
        </div>

        <button type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/30 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
          BUSCAR AHORA
        </button>
      </div>
    </form>
  );
};

export default PropertyFilters;
