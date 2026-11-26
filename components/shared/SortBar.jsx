'use client';

import { useRouter } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más Recientes' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
];

const SortBar = ({ total, activeSort, searchParams }) => {
  const router = useRouter();
  const currentSort = SORT_OPTIONS.some((opt) => opt.value === activeSort)
    ? activeSort
    : 'newest';

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const params = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([key, val]) => {
      if (key !== 'sort' && key !== 'page' && val !== undefined && val !== '') {
        params.set(key, val);
      }
    });
    if (newSort !== 'newest') {
      params.set('sort', newSort);
    }
    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-[#999]">Ordenar por</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="text-sm border border-[#3B3B3B] rounded-lg px-3 py-2 text-white bg-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-[#E94560]/30 focus:border-[#E94560] cursor-pointer transition-all"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SortBar;
