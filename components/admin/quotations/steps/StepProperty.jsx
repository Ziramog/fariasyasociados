'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function StepProperty({ selected, onChange, onNext }) {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/autocomplete/cities?search=')
      .then(res => res.json())
      .catch(() => {});
    // Load all properties from server
    fetch('/properties/data')
      .catch(() => {});
    // Use the page's initial data via a simpler approach
    setLoading(false);
  }, []);

  // Load via admin endpoint
  useEffect(() => {
    fetch('/api/admin/properties')
      .then(r => r.json())
      .then(data => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProperty = (prop) => {
    const idx = selected.findIndex(p => p._id === prop._id);
    if (idx >= 0) {
      onChange(selected.filter((_, i) => i !== idx));
    } else if (selected.length < 3) {
      onChange([...selected, prop]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Seleccionar propiedad(es)</h2>
      <p className="text-sm text-[#888] mb-4">Elegí entre 1 y 3 propiedades para incluir en la propuesta.</p>

      <input
        type="text" placeholder="Buscar por nombre o ciudad..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] mb-4"
      />

      {loading ? (
        <p className="text-sm text-[#999]">Cargando propiedades...</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map(prop => {
            const isSelected = selected.some(p => p._id === prop._id);
            return (
              <div key={prop._id}
                onClick={() => toggleProperty(prop)}
                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${isSelected ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10' : 'border-[#333] hover:border-[#444] bg-[#1a1a1a]'}`}
              >
                <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[var(--color-brand)] bg-[var(--color-brand)]' : 'border-[#444]'}`}>
                  {isSelected && <svg viewBox="0 0 12 12" width="10" height="10" fill="#fff"><path d="M10 2L4.5 7.5 2 5" stroke="#fff" strokeWidth="2" fill="none"/></svg>}
                </div>
                {prop.images?.[0]?.url && (
                  <img src={prop.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{prop.name}</p>
                  <p className="text-xs text-[#888]">{prop.location?.city || ''} · {prop.type || ''}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-brand)]">{prop.price || '—'}</span>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-[#999] text-center py-4">No se encontraron propiedades.</p>}
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xs text-[#999]">{selected.length}/3 seleccionadas</p>
        <button onClick={onNext} disabled={selected.length === 0}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-40">
          Continuar
        </button>
      </div>
    </div>
  );
}
