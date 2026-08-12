'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import deleteProperty from '@/app/actions/deleteProperty';
import { toast } from 'react-toastify';
import { isGranInversion } from '@/utils/filterProperties';

const AdminPropertyTable = ({ properties = [], customLabels = [], defaultType = '', defaultGranInversion = false, defaultFeatured = '', defaultPublished = '' }) => {
  const router = useRouter();
  const [items, setItems] = useState(properties);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState(defaultType);
  const [filterOp, setFilterOp] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(defaultFeatured);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGranInversion, setFilterGranInversion] = useState(defaultGranInversion ? 'yes' : '');
  const [filterPublished, setFilterPublished] = useState(defaultPublished);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.location?.city?.toLowerCase().includes(q)
      );
    }
    if (filterType) result = result.filter(p => p.type === filterType);
    if (filterOp) result = result.filter(p => p.operation === filterOp);
    if (filterFeatured === 'yes') result = result.filter(p => p.is_featured);
    if (filterFeatured === 'no') result = result.filter(p => !p.is_featured);
    if (filterStatus) result = result.filter(p => p.status === filterStatus);
    if (filterGranInversion === 'yes') result = result.filter(p => isGranInversion(p));
    if (filterGranInversion === 'no') result = result.filter(p => !isGranInversion(p));
    if (filterPublished === 'yes') result = result.filter(p => p.is_published !== false);
    if (filterPublished === 'no') result = result.filter(p => p.is_published === false);
    return result;
  }, [items, search, filterType, filterOp, filterFeatured, filterStatus, filterGranInversion, filterPublished]);

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await deleteProperty(id);
    if (res?.error) { toast.error(res.error); return; }
    setItems(prev => prev.filter(p => p._id !== id));
    toast.success('Propiedad eliminada');
    router.refresh();
  };

  const handleToggleFeatured = async (id) => {
    const res = await fetch('/api/admin/toggle-featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setItems(prev => prev.map(p => p._id === id ? { ...p, is_featured: !p.is_featured } : p));
      toast.success(data.is_featured ? 'Destacada' : 'No destacada');
      router.refresh();
    }
  };

  const handleTogglePublished = async (id) => {
    const res = await fetch('/api/admin/toggle-published', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setItems(prev => prev.map(p => p._id === id ? { ...p, is_published: data.is_published } : p));
      toast.success(data.is_published ? 'Propiedad visible al público' : 'Propiedad ocultada');
      router.refresh();
    }
  };

  const typeLabels = {
    Casa: 'Casa', Departamento: 'Depto', Terreno: 'Terreno',
    Campo: 'Campo', 'Inmueble Comercial': 'Comercial', 'Gran Inversión': 'Inversión',
  };

  const hasActiveFilters = search || filterType || filterOp || filterFeatured || filterStatus || filterGranInversion || filterPublished;

  const clearFilters = () => {
    setSearch(''); setFilterType(''); setFilterOp(''); setFilterFeatured(''); setFilterStatus(''); setFilterGranInversion(''); setFilterPublished('');
  };

  const selectCls = 'text-[12px] bg-[#0a0a0a] border border-[#333] rounded-sm px-3 py-2 text-white outline-none focus:border-[var(--color-brand)] transition-colors w-full';

  return (
    <div className="bg-[#161616] border border-[#222] rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-6 py-4 border-b border-[#222]">
        <h2 className="text-[16px] md:text-[20px] font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          {filtered.length} {filtered.length === 1 ? 'propiedad' : 'propiedades'}
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[11px] text-[#888] hover:text-[var(--color-brand)] uppercase tracking-wider font-medium">
              Limpiar
            </button>
          )}
          <Link href="/admin/properties/add" className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-[12px] md:text-[13px] font-bold uppercase tracking-wider px-4 md:px-5 py-2.5 rounded-sm transition-colors flex-shrink-0">
            + Agregar
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 md:px-6 py-3 border-b border-[#222]">
        {/* Search row */}
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Buscar por nombre o ciudad..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-[#0a0a0a] border border-[#333] rounded-sm outline-none focus:border-[var(--color-brand)] transition-colors text-white placeholder:text-[#555]"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden text-[11px] text-[#888] uppercase tracking-wider font-medium flex-shrink-0 px-3 py-2 border border-[#333] rounded-sm"
          >
            {showMobileFilters ? 'Ocultar' : 'Filtros'}
          </button>
        </div>

        {/* Filter selects */}
        <div className={`${showMobileFilters || 'hidden'} md:flex md:flex-wrap md:items-center md:gap-3 mt-2`}>
          <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls}>
              <option value="">Tipo: Todos</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Campo">Campo</option>
              <option value="Terreno">Terreno</option>
              <option value="Inmueble Comercial">Comercial</option>
            </select>
            <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)} className={selectCls}>
              <option value="">Operación: Todas</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
            <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)} className={selectCls}>
              <option value="">★ Destacada: Todas</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
              <option value="">Estado: Todos</option>
              <option value="NUEVA">Nueva</option>
              {customLabels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <select value={filterGranInversion} onChange={(e) => setFilterGranInversion(e.target.value)} className={selectCls}>
              <option value="">Gran Inversión: Todas</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
            <select value={filterPublished} onChange={(e) => setFilterPublished(e.target.value)} className={selectCls}>
              <option value="">Visibilidad: Todas</option>
              <option value="yes">Visibles</option>
              <option value="no">Ocultas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-[#222] text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#888]">
              <th className="px-3 md:px-6 py-3 font-medium">Propiedad</th>
              <th className="px-2 md:px-4 py-3 font-medium">Tipo</th>
              <th className="px-2 md:px-4 py-3 font-medium">Operación</th>
              <th className="px-2 md:px-4 py-3 font-medium">Precio</th>
              <th className="px-2 md:px-4 py-3 font-medium">Fotos</th>
              <th className="px-2 md:px-4 py-3 font-medium text-center">Dest.</th>
              <th className="px-2 md:px-4 py-3 font-medium text-center">Pub.</th>
              <th className="px-3 md:px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filtered.map(prop => (
              <tr key={prop._id} className="hover:bg-[#1a1a1a] transition-colors">
                <td className="px-3 md:px-6 py-3">
                  <div className="flex items-center gap-3">
                    {prop.images?.[0]?.url ? (
                      <img 
                        src={prop.images[0].url} 
                        alt="" 
                        className="w-14 h-14 md:w-16 md:h-16 rounded-sm object-cover flex-shrink-0 bg-[#222]" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                          e.target.className = "w-14 h-14 md:w-16 md:h-16 rounded-sm bg-[#222] flex items-center justify-center flex-shrink-0 p-4 object-contain";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-sm bg-[#222] flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                    )}
                    <div className="min-w-0 max-w-[120px] md:max-w-none">
                      <Link href={`/properties/${prop._id}`} className="text-[13px] md:text-[14px] font-semibold text-white hover:text-[var(--color-brand)] transition-colors block leading-tight truncate">
                        {prop.name}
                      </Link>
                      <p className="text-[12px] text-[#888] mt-0.5 truncate">{prop.location?.city || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className="text-[13px] text-[#bbb]">{typeLabels[prop.type] || prop.type}</span>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className={`text-[12px] font-semibold uppercase px-2 py-1 rounded-sm ${
                    prop.operation === 'venta' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'
                  }`}>
                    {prop.operation === 'venta' ? 'Venta' : prop.operation === 'alquiler' ? 'Alquiler' : prop.operation}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className="text-[13px] font-semibold text-white">{prop.price || 'Consultar'}</span>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className="text-[13px] text-[#bbb]">{(prop.images || []).length}</span>
                </td>
                <td className="px-2 md:px-4 py-3 text-center">
                  <button onClick={() => handleToggleFeatured(prop._id)}
                    className={`text-lg transition-colors ${prop.is_featured ? 'text-[var(--color-brand)]' : 'text-[#444] hover:text-[var(--color-brand)]'}`}
                    title={prop.is_featured ? 'Quitar destacada' : 'Marcar destacada'}
                  >★</button>
                </td>
                <td className="px-2 md:px-4 py-3 text-center">
                  <button onClick={() => handleTogglePublished(prop._id)}
                    className={`transition-colors ${(prop.is_published !== false) ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                    title={(prop.is_published !== false) ? 'Ocultar propiedad' : 'Publicar propiedad'}
                  >
                    {(prop.is_published !== false) ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mx-auto"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mx-auto"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    )}
                  </button>
                </td>
                <td className="px-3 md:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 md:gap-2">
                    <Link href={`/admin/properties/${prop._id}/edit`}
                      className="inline-flex items-center justify-center md:gap-1.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-[13px] font-semibold w-8 h-8 md:w-auto md:px-4 md:py-2 rounded-sm transition-colors"
                      title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      <span className="hidden md:inline">Editar</span>
                    </Link>
                    <button onClick={() => handleDelete(prop._id, prop.name)}
                      className="inline-flex items-center justify-center md:gap-1.5 text-[12px] font-medium text-[#888] hover:text-red-400 w-8 h-8 md:w-auto md:px-3 md:py-1.5 border border-[#333] hover:border-red-400/50 rounded-sm transition-colors"
                      title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21h-8.276a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/></svg>
                      <span className="hidden md:inline">Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#888] text-[14px]">
                  No se encontraron propiedades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col divide-y divide-[#222]">
        {filtered.map(prop => (
          <div key={prop._id} className="p-4 flex flex-col gap-3 hover:bg-[#1a1a1a] transition-colors">
            {/* Header: Image & Title */}
            <div className="flex items-center gap-3">
              {prop.images?.[0]?.url ? (
                <img 
                  src={prop.images[0].url} 
                  alt="" 
                  className="w-14 h-14 rounded-sm object-cover flex-shrink-0 bg-[#222]" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                    e.target.className = "w-14 h-14 rounded-sm bg-[#222] flex items-center justify-center flex-shrink-0 p-3 object-contain";
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-sm bg-[#222] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/properties/${prop._id}`} className="text-[14px] font-semibold text-white hover:text-[var(--color-brand)] transition-colors block leading-tight truncate">
                  {prop.name}
                </Link>
                <p className="text-[12px] text-[#888] mt-0.5 truncate">{prop.location?.city || '—'}</p>
              </div>
            </div>
            
            {/* Body: Details */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wider">
              <span className={`px-2 py-1 rounded-sm ${
                prop.operation === 'venta' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'
              }`}>
                {prop.operation === 'venta' ? 'Venta' : prop.operation === 'alquiler' ? 'Alquiler' : prop.operation}
              </span>
              <span className="bg-[#222] text-[#bbb] px-2 py-1 rounded-sm">{typeLabels[prop.type] || prop.type}</span>
              <span className="bg-[#222] text-[#bbb] px-2 py-1 rounded-sm">{(prop.images || []).length} 📷</span>
            </div>
            
            {/* Price */}
            <div className="text-[14px] font-semibold text-white">
              {prop.price || 'Consultar'}
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#222]">
              <div className="flex items-center gap-4">
                <button onClick={() => handleToggleFeatured(prop._id)}
                  className={`text-lg transition-colors ${prop.is_featured ? 'text-[var(--color-brand)]' : 'text-[#444] hover:text-[var(--color-brand)]'}`}
                  title={prop.is_featured ? 'Quitar destacada' : 'Marcar destacada'}
                >★</button>
                <button onClick={() => handleTogglePublished(prop._id)}
                  className={`transition-colors ${(prop.is_published !== false) ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                  title={(prop.is_published !== false) ? 'Ocultar propiedad' : 'Publicar propiedad'}
                >
                  {(prop.is_published !== false) ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/properties/${prop._id}/edit`}
                  className="inline-flex items-center justify-center w-8 h-8 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </Link>
                <button onClick={() => handleDelete(prop._id, prop.name)}
                  className="inline-flex items-center justify-center w-8 h-8 text-[#888] border border-[#333] hover:text-red-400 hover:border-red-400/50 rounded-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21h-8.276a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#888] text-[13px]">
            No se encontraron propiedades.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyTable;
