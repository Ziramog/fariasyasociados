'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TIPO_OPTIONS = [
  { value: '', label: '' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Departamento', label: 'Departamento' },
  { value: 'Terreno', label: 'Terreno' },
  { value: 'Campo', label: 'Campo' },
  { value: 'Inmueble Comercial', label: 'Inmueble Comercial' },
];
const PRECIO_RANGES = [
  { value: '', label: '' },
  { value: '0-100000', label: 'Hasta U$S 100,000' },
  { value: '100000-300000', label: 'U$S 100,000-300,000' },
  { value: '300000-500000', label: 'U$S 300,000-500,000' },
  { value: '500000-1000000', label: 'U$S 500,000-1,000,000' },
  { value: '1000000-2000000', label: 'U$S 1,000,000-2,000,000' },
  { value: '2000000-0', label: '>U$S 2,000,000' },
];
const AREA_RANGES = [
  { value: '', label: '' },
  { value: '0-500', label: '0-500 m²' },
  { value: '500-1000', label: '500-1000 m²' },
  { value: '1000-2000', label: '1000-2000 m²' },
  { value: '2000-5000', label: '2000-5000 m²' },
  { value: '5000-0', label: '> 5000 m²' },
];
const BEDROOM_OPTS = ['', '1', '2', '3', '4', '5+'];
const BATH_OPTS = ['', '1', '2', '3', '4', '5+'];
const STATUS_CHECKBOXES = [
  { value: 'NUEVA', label: 'Nueva' },
  { value: 'PRECIO MEJORADO', label: 'Precio Mejorado' },
  { value: 'ULTIMA UNIDAD', label: 'Última Unidad' },
  { value: 'UNICO EN SU TIPO', label: 'Única en su Tipo' },
  { value: 'MEJOR PRECIO', label: 'Mejor Precio del Mercado' },
  { value: 'EXCELENTE PRECIO', label: 'Excelente Precio' },
  { value: 'AMOBLADA', label: 'Amoblada' },
];

export default function PropertiesSearch({ currentFilters = {}, onFilter, title = 'Búsqueda de Propiedades' }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState(currentFilters.term || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cityInputRef = useRef(null);
  const suggestionTimerRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const [filters, setFilters] = useState({
    term: currentFilters.term || '',
    address: currentFilters.address || '',
    tipo: currentFilters.tipo || '',
    operation: currentFilters.operation || 'venta',
    area: currentFilters.area || '',
    price: currentFilters.price || '',
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || '',
    bedrooms: currentFilters.bedrooms || '',
    baths: currentFilters.baths || '',
    'property-type': currentFilters['property-type'] || [],
    status: currentFilters.status || [],
    sort: currentFilters.sort || 'price-desc',
  });

  const [focused, setFocused] = useState({
    term: false, address: false, tipo: false, area: false, price: false, bedrooms: false, baths: false,
  });

  const labelActive = (field) => {
    if (field === 'term') return focused.term || filters.term !== '';
    if (field === 'address') return focused.address || filters.address !== '';
    if (field === 'tipo') return focused.tipo || filters.tipo !== '';
    if (field === 'area') return focused.area || filters.area !== '';
    if (field === 'price') return focused.price || filters.price !== '';
    if (field === 'bedrooms') return focused.bedrooms || filters.bedrooms !== '';
    if (field === 'baths') return focused.baths || filters.baths !== '';
    return false;
  };

  const precioRanges = PRECIO_RANGES;

  const FILTER_CONFIG = [
    { name: 'tipo', label: 'Tipo',
      options: TIPO_OPTIONS.filter((t) => t.value).map((t) => ({ value: t.value, label: t.label })),
      className: 'flex-1 min-[992px]:w-1/6 xl:w-[12%]' },
    { name: 'area', label: 'Superficie',
      options: AREA_RANGES.filter((r) => r.value).map((r) => ({ value: r.value, label: r.label })),
      className: 'flex-1 min-[992px]:w-1/3 xl:w-[11%]' },
    { name: 'price', label: 'Precio',
      options: PRECIO_RANGES.filter((r) => r.value).map((r) => ({ value: r.value, label: r.label })),
      className: 'w-full min-[651px]:w-1/2 min-[992px]:w-1/3 xl:w-[14%]' },
    { name: 'bedrooms', label: 'Dormitorios',
      options: BEDROOM_OPTS.filter((o) => o).map((o) => ({ value: o, label: o + '+' })),
      className: 'flex-1 min-[992px]:w-1/3 xl:w-[10%]' },
    { name: 'baths', label: 'Baños',
      options: BATH_OPTS.filter((o) => o).map((o) => ({ value: o, label: o + '+' })),
      className: 'flex-1 min-[992px]:w-1/3 xl:w-[10%]' },
  ];

  // Click outside to close custom dropdowns
  useEffect(() => {
    function handleDocClick(e) {
      if (!openDropdown) return;
      const ref = dropdownRefs.current[openDropdown];
      if (ref && !ref.contains(e.target)) {
        setOpenDropdown(null);
        setFocused((p) => ({ ...p, [openDropdown]: false }));
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [openDropdown]);

  const fetchCitySuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/autocomplete/cities?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(suggestionTimerRef.current);
    if (citySearch.length >= 2) {
      suggestionTimerRef.current = setTimeout(() => fetchCitySuggestions(citySearch), 300);
    } else {
      setSuggestions([]);
    }
    return () => clearTimeout(suggestionTimerRef.current);
  }, [citySearch, fetchCitySuggestions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters((prev) => ({
        ...prev,
        [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value),
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelect = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setOpenDropdown(null);
    setFocused((p) => ({ ...p, [name]: false }));
  };

  const handleCitySelect = (city) => {
    setFilters((prev) => ({ ...prev, term: city }));
    setCitySearch(city);
    setSuggestions([]);
    setShowCityDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filters.term && !filters.address && !filters.tipo && !filters.price && !filters.area && !filters.bedrooms && !filters.baths && !filters.status) {
      alert('Por favor, selecioná al menos un filtro para buscar.');
      return;
    }
    const params = new URLSearchParams();
    if (filters.term) params.set('term', filters.term);
    if (filters.address) params.set('address', filters.address);
    if (filters.tipo) params.set('type', filters.tipo);
    if (filters.operation) params.set('operation', filters.operation);
    if (filters.area) params.set('area', filters.area);
    if (filters.price) {
      const [min, max] = filters.price.split('-');
      if (min) params.set('minPrice', min);
      if (max && max !== '0') params.set('maxPrice', max);
    }
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.baths) params.set('baths', filters.baths);
    if (filters['property-type']?.length) params.set('propertyType', filters['property-type'].join('|'));
    if (filters.status?.length) params.set('status', filters.status.join('|'));
    if (filters.sort) params.set('sort', filters.sort);
    const query = params.toString();
    if (onFilter) {
      onFilter(filters);
    } else {
      window.location.href = `/properties${query ? `?${query}` : ''}`;
    }
  };

  const handleReset = () => {
    setFilters({
      term: '', address: '', tipo: '', operation: 'venta', area: '',
      price: '', bedrooms: '', baths: '', 'property-type': [], status: [], sort: 'price-desc',
    });
    setCitySearch('');
    if (onFilter) {
      onFilter(null);
    } else {
      router.push('/properties');
    }
  };

  const FIELD_HEIGHT = '45px';

  const getLabelStyle = (isActive, left = '15px') => ({
    position: 'absolute',
    left,
    zIndex: 9,
    pointerEvents: 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    top: isActive ? '-7.5px' : '10px',
    fontSize: isActive ? '10px' : '12px',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: isActive ? '0.08em' : '0.03em',
    color: isActive ? '#fff' : '#a29696',
    lineHeight: 1.2,
  });

  const getInputStyle = (isActive, extra = {}) => ({
    height: '100%',
    width: '100%',
    background: 'transparent',
    border: '1px solid transparent',
    color: isActive ? '#fff' : '#a29696',
    fontSize: '16px',
    fontWeight: 400,
    outline: 'none',
    paddingLeft: '15px',
    paddingRight: '16px',
    ...extra,
  });

  const getWrapperStyle = () => ({
    position: 'relative',
    height: FIELD_HEIGHT,
    display: 'flex',
    alignItems: 'center',
  });

  return (
    <div className="search-form" style={{ background: '#000', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="text-center">
        <h1 className="text-[28px] md:text-[40px] font-normal text-white leading-tight" style={{ fontFamily: 'var(--font-heading)', margin: 0, marginBottom: '40px' }}>
          {title}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="searchForm" style={{ border: '1px solid #2a2626', borderRadius: '8px', background: '#000', position: 'relative', zIndex: 1 }}>
        <div className="top-part p-[15px] gap-[10px] md:p-5 md:gap-5" style={{
          borderRadius: '12px', background: '#000',
          display: 'flex', flexWrap: 'wrap', marginTop: '0', alignItems: 'center',
        }}>
          {/* City / term */}
          <div className="form-group elatus-autocomplete w-full min-[992px]:w-1/2 xl:w-[20%] border-r border-[#2a2626] max-[650px]:border-r-0 max-[650px]:border-b max-[650px]:border-[#2a2626] hover:bg-[#0d0d0d] transition-colors duration-200"
            style={getWrapperStyle()}
            onFocus={() => setFocused((p) => ({ ...p, term: true }))}
            onBlur={() => setFocused((p) => ({ ...p, term: false }))}>
            <svg style={{
              position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
              width: '19px', height: '19px', zIndex: 9, filter: 'brightness(0) invert(1)',
            }} viewBox="0 0 24 24" fill="currentColor"><path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/></svg>
            <label style={getLabelStyle(labelActive('term'), '50px')}>Ciudad o código</label>
            <input
              ref={cityInputRef}
              type="text" name="term" autoComplete="off"
              value={citySearch}
              onChange={(e) => { setCitySearch(e.target.value); handleChange(e); }}
              onFocus={() => { setShowCityDropdown(true); setFocused((p) => ({ ...p, term: true })); }}
              onBlur={() => { setTimeout(() => setShowCityDropdown(false), 200); setFocused((p) => ({ ...p, term: false })); }}
              style={getInputStyle(labelActive('term'), { paddingLeft: '50px' })}
            />
            {showCityDropdown && suggestions.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: '1px', background: '#000', border: '1px solid #2a2626', borderRadius: '8px', overflow: 'hidden' }}>
                <ul style={{ maxHeight: '240px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
                  {suggestions.map((s, i) => (
                    <li key={i} onMouseDown={() => handleCitySelect(s.label || s)}
                      style={{ padding: '12px 16px', color: '#fff', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #2a2626' }}
                      onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >{s.label || s}</li>
                  ))}
                </ul>
              </div>
            )}
            {showCityDropdown && citySearch.length >= 2 && suggestions.length === 0 && !isLoading && (
              <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: '1px', background: '#000', border: '1px solid #2a2626', borderRadius: '8px', padding: '12px 16px' }}>
                <p style={{ color: '#a29696', fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>No results found!</p>
              </div>
            )}
          </div>

          {/* Custom Dropdown selects */}
          {FILTER_CONFIG.map((f) => {
            const isActive = labelActive(f.name);
            const isOpen = openDropdown === f.name;
            const selectedLabel = f.options.find((o) => o.value === filters[f.name])?.label || '';
            return (
              <div key={f.name}
                ref={(el) => { dropdownRefs.current[f.name] = el; }}
                className={`form-group notranslate ${f.name}-group ${f.className} border-r border-[#2a2626] max-[650px]:border-r-0 max-[650px]:border-b max-[650px]:border-[#2a2626] hover:bg-[#0d0d0d] transition-colors duration-200`}
                style={{ ...getWrapperStyle(), cursor: 'pointer' }}
                onClick={() => {
                  const isClosing = openDropdown === f.name;
                  setOpenDropdown(isClosing ? null : f.name);
                  setFocused((p) => ({ ...p, [f.name]: !isClosing || filters[f.name] !== '' }));
                }}>
                <label style={getLabelStyle(isActive)}>{f.label}</label>
                <div style={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '15px',
                  paddingRight: '30px',
                  color: isActive ? '#fff' : '#a29696',
                  fontSize: '16px',
                  fontWeight: 400,
                  userSelect: 'none',
                }}>
                  {selectedLabel}
                </div>
                <svg style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '10px', height: '10px', zIndex: 2, pointerEvents: 'none',
                  color: '#666',
                }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
                {isOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 60,
                    background: '#000',
                    borderRadius: '6px',
                    padding: '10px',
                    boxShadow: '0 .8px 1.1px rgba(0,0,0,.039), 0 2.5px 2.5px rgba(0,0,0,.057), 0 4.6px 4.8px rgba(0,0,0,.07), 0 8.3px 8.5px rgba(0,0,0,.083), 0 15.5px 15.9px rgba(0,0,0,.101), 0 37px 38px rgba(0,0,0,.14)',
                  }}>
                    {f.options.map((o) => (
                      <div
                        key={o.value}
                        onClick={(e) => { e.stopPropagation(); handleSelect(f.name, o.value); }}
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          color: '#fff',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          background: filters[f.name] === o.value ? 'var(--color-brand)' : 'transparent',
                        }}
                        onMouseEnter={(e) => { if (filters[f.name] !== o.value) e.target.style.background = 'var(--color-brand)'; }}
                        onMouseLeave={(e) => { if (filters[f.name] !== o.value) e.target.style.background = 'transparent'; }}
                      >
                        {o.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Search button */}
          <button type="submit" className="btn btn-primary btnSubmit w-full md:w-auto order-1 min-[651px]:order-0" style={{
            background: 'var(--color-brand)', color: '#fff', border: 'none',
            fontSize: '15px', fontWeight: 400, textTransform: 'uppercase',
            height: FIELD_HEIGHT, padding: '0 20px', borderRadius: '8px', cursor: 'pointer',
            whiteSpace: 'nowrap', alignSelf: 'center', flexShrink: 0,
            letterSpacing: '0.06em', transition: 'opacity 0.2s',
            marginLeft: 'auto',
          }} onMouseEnter={(e) => e.target.style.opacity = '0.85'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
            Buscar
          </button>
        </div>

        {/* Bottom-part expandable filters — Estado only */}
        <div style={{
          maxHeight: expanded ? '450px' : '0',
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
        }}>
          <div className="bottom-part" style={{
            background: '#000', borderRadius: '12px', padding: '20px 0',
            marginTop: '1px',
          }}>
            <div style={{ padding: '0 20px' }}>
              <p style={{ color: '#a29696', fontSize: '14px', textTransform: 'uppercase', margin: '0 0 15px' }}>Estado</p>
              <div className="filter-wrapper flex flex-wrap" style={{ columnGap: '20px' }}>
                {STATUS_CHECKBOXES.map((st) => (
                  <div key={st.value} className="custom-checkbox-wrapper w-full min-[430px]:w-1/2 md:w-auto" style={{ marginBottom: '10px' }}>
                    <label style={{
                      color: '#fff', fontSize: '13px', paddingLeft: '25px',
                      position: 'relative', cursor: 'pointer', display: 'inline-block',
                    }}>
                      <input type="checkbox" name="status" value={st.value}
                        checked={(filters.status || []).includes(st.value)}
                        onChange={handleChange}
                        style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                      />
                      <span style={{
                        position: 'absolute', left: 0, top: '1px', width: '14px', height: '14px',
                        background: '#403941', borderRadius: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(filters.status || []).includes(st.value) && (
                          <svg viewBox="0 0 12 12" width="10" height="10" fill="#fff"><path d="M10 2L4.5 7.5 2 5" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                        )}
                      </span>
                      {st.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 20px' }}>
        <button type="button" onClick={handleReset}
          style={{ background: 'none', border: 'none', color: '#919191', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', padding: 0 }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >Limpiar</button>
        <button type="button" onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', color: '#919191', fontSize: '12px',
            cursor: 'pointer', textTransform: 'uppercase', padding: 0,
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          <span style={{
            color: 'var(--color-brand)',
            fontSize: '16px',
            fontWeight: 300,
            lineHeight: 1,
            width: '14px',
            textAlign: 'center',
            display: 'inline-block',
          }}>{expanded ? '−' : '+'}</span>
          {expanded ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
        </button>
      </div>
    </div>
  );
}
