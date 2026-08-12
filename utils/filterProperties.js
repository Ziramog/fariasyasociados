/**
 * Filter properties client-side. Used in the map section where all
 * properties are already loaded from the server.
 */
export function filterProperties(properties, filters) {
  return properties
    .filter((p) => {
      // Type filter
      if (filters.type && filters.type !== 'Todos') {
        if (p.type !== filters.type) return false;
      }

      // City filter
      if (
        filters.city &&
        filters.city !== '' &&
        filters.city !== 'Todas las ciudades' &&
        p.location?.city !== filters.city
      )
        return false;

      // Price range (parse from string like "USD 320,000")
      if (filters.minPrice || filters.maxPrice) {
        const numericPrice = parsePrice(p.price);
        if (numericPrice === null) return true; // keep "Consultar" properties
        if (filters.minPrice && numericPrice < Number(filters.minPrice)) return false;
        if (filters.maxPrice && numericPrice > Number(filters.maxPrice)) return false;
      }

      // Bedrooms
      if (filters.bedrooms) {
        const minBeds = parseInt(filters.bedrooms);
        if (!isNaN(minBeds) && (p.beds == null || p.beds < minBeds)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'price_asc')
        return (parsePrice(a.price) || 0) - (parsePrice(b.price) || 0);
      if (filters.sort === 'price_desc')
        return (parsePrice(b.price) || 0) - (parsePrice(a.price) || 0);
      // Default: newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
}

/**
 * Parse a price string like "USD 320,000" or "USD 50/m2" into a number.
 * Returns null for "Consultar" or unparseable strings.
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Check if a property qualifies as a "Gran Inversión":
 * price >= USD 300,000 OR total area >= 10,000 m²
 */
export function isGranInversion(property) {
  const numericPrice = parsePrice(property.price);
  if (numericPrice && numericPrice >= 300000) return true;
  if (property.square_feet && property.square_feet >= 10000) return true;
  return false;
}

/**
 * Extract unique cities from properties array.
 */
export function getUniqueCities(properties) {
  const cities = new Set();
  properties.forEach((p) => {
    if (p.location?.city) cities.add(p.location.city);
  });
  return ['Todas las ciudades', ...Array.from(cities).sort()];
}
