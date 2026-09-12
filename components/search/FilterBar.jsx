'use client';
import { useMemo } from 'react';
import { getUniqueCities } from '@/utils/filterProperties';

const PROPERTY_TYPES = [
  'Todos', 'Casa', 'Departamento', 'Terreno', 'Campo', 'Inmueble Comercial', 'Gran Inversión',
];

const BEDROOM_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: '1+', value: '1' },
  { label: '2+', value: '2' },
  { label: '3+', value: '3' },
  { label: '4+', value: '4' },
];

const PRICE_PRESETS = [
  { label: 'Hasta 100.000', min: '', max: '100000' },
  { label: '100.000–200.000', min: '100000', max: '200000' },
  { label: '200.000–500.000', min: '200000', max: '500000' },
  { label: '500.000+', min: '500000', max: '' },
];

const FilterBar = ({
  properties = [],
  filters,
  updateFilter,
  resetFilters,
  activeCount,
  hasActiveFilters,
  filteredCount,
}) => {
  const cities = useMemo(() => getUniqueCities(properties), [properties]);

  const handlePricePreset = (preset) => {
    updateFilter('minPrice', preset.min);
    // Small delay to batch both updates
    setTimeout(() => updateFilter('maxPrice', preset.max), 0);
  };

  const isPricePresetActive = (preset) =>
    filters.minPrice === preset.min && filters.maxPrice === preset.max;

  return (
    <div className="space-y-3">
      {/* Row 1: Type pills */}
      <div className="flex flex-wrap gap-2">
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => updateFilter('type', type)}
            className={`pill ${
              filters.type === type ? 'pill-active' : 'pill-inactive'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Row 2: City + Price presets + Bedrooms */}
      <div className="flex flex-wrap items-center gap-2">
        {/* City */}
        <select
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="px-3 py-2 border border-[#3B3B3B] rounded-md text-sm bg-[#1C1C1A] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {cities.map((city) => (
            <option key={city} value={city === 'Todas las ciudades' ? '' : city}>
              {city}
            </option>
          ))}
        </select>

        {/* Price presets (hidden on mobile) */}
        <div className="hidden sm:flex gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePricePreset(preset)}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                isPricePresetActive(preset)
                  ? 'bg-navy text-white border-navy'
                  : 'bg-[#1C1C1A] text-gray-400 border-[#3B3B3B] hover:border-navy'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Bedrooms segmented */}
        <div className="flex border border-[#3B3B3B] rounded-md overflow-hidden">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('bedrooms', opt.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-r last:border-r-0 border-[#3B3B3B] ${
                filters.bedrooms === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-[#1C1C1A] text-gray-400 hover:bg-[#141412]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-primary hover:text-primary-hover font-medium px-2 py-2 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
