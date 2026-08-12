'use client';
import { useState, useCallback } from 'react';

const DEFAULTS = {
  type: 'Todos',
  city: '',
  bedrooms: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

/**
 * Filter state hook — manages local filter state for the map section.
 * Does NOT sync to URL (homepage stays clean). URL sync is for /properties page.
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({ ...DEFAULTS, ...initialFilters });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULTS);
  }, []);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v && v !== DEFAULTS[k]
  ).length;

  const hasActiveFilters = activeCount > 0;

  return { filters, updateFilter, resetFilters, activeCount, hasActiveFilters };
}
