'use client';
import { useEffect } from 'react';

export default function ScrollToResults({ searchParams, isFiltered = false }) {
  useEffect(() => {
    if (isFiltered) {
      // Scroll to results section with navbar offset
      const el = document.getElementById('resultados');
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 83; // 83px navbar offset for ~13px gap
        window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'instant' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isFiltered, JSON.stringify(searchParams)]);

  return null;
}
