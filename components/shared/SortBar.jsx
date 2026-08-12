'use client';

const SORT_OPTIONS = [
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'newest', label: 'Más Nuevas' },
];

const SortBar = ({ total, activeSort, searchParams }) => {
  const handleSortChange = (e) => {
    const params = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([key, val]) => {
      if (key !== 'sort' && key !== 'page') params.set(key, val);
    });
    params.set('sort', e.target.value);
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-[#999]">Ordenar por</span>
      <select
        value={activeSort || 'price-desc'}
        onChange={handleSortChange}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#E94560]/30 focus:border-[#E94560] cursor-pointer transition-all"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SortBar;
