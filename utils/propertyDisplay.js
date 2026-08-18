/**
 * Display helpers for property data.
 * Fixes the square_feet / covered_area confusion and standardises formatting.
 */

/**
 * Return the most meaningful area string for a property card.
 * Houses/apartments → covered area.  Land/campo → total area (with hectare conversion).
 */
export function getAreaDisplay(property) {
  const isBuilding = ['Casa', 'Departamento', 'Inmueble Comercial'].includes(property.type);

  // Prefer covered_area for buildings
  if (isBuilding && property.covered_area) {
    return `${property.covered_area.toLocaleString()} m²`;
  }

  // Fallback to square_feet (which is really total/lot area)
  if (property.square_feet != null) {
    if (property.square_feet >= 10000) {
      const has = property.square_feet / 10000;
      return has >= 1 ? `${has.toFixed(has % 1 === 0 ? 0 : 1)} has` : `${property.square_feet.toLocaleString()} m²`;
    }
    return `${property.square_feet.toLocaleString()} m²`;
  }

  return null;
}

/**
 * Return a formatted price string.
 */
export function getPriceDisplay(property) {
  if (property.price) {
    // Handle both string ('USD 320,000') and number prices
    let num = typeof property.price === 'number'
      ? property.price
      : parseFloat(property.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 1000) {
      const k = num / 1000;
      return `U$D ${k % 1 === 0 ? k : k.toFixed(k < 10 ? 2 : 1)} K`;
    }
    if (!isNaN(num)) return `U$D ${num.toLocaleString('es-AR')}`;
  }
  if (property.rates?.monthly) return `U$D ${property.rates.monthly.toLocaleString()}/mes`;
  if (property.rates?.weekly) return `U$D ${property.rates.weekly.toLocaleString()}/sem`;
  if (property.rates?.nightly) return `U$D ${property.rates.nightly.toLocaleString()}/noche`;
  return 'Consultar';
}

/**
 * Check if a property was published within the last N days.
 */
export function isNewListing(property, days = 7) {
  if (!property.createdAt) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(property.createdAt).getTime() > cutoff;
}

const STATUS_BADGE_MAP = {
  'PRECIO MEJORADO':  { label: 'Precio Mejorado', color: 'bg-green-500' },
  'ULTIMA UNIDAD':    { label: 'Última Unidad',   color: 'bg-[var(--color-brand)]' },
  'UNICO EN SU TIPO': { label: 'Única en su Tipo', color: 'bg-purple-500' },
  'MEJOR PRECIO': { label: 'Mejor Precio del Mercado', color: 'bg-emerald-500' },
  'NUEVA':            { label: 'Nueva',           color: 'bg-blue-500' },
  'EXCELENTE PRECIO': { label: 'Excelente Precio', color: 'bg-amber-500' },
  'AMOBLADA':         { label: 'Amoblada',        color: 'bg-indigo-500' },
};

/**
 * Return a status badge config for a property card, or null if no badge.
 */
export function getStatusBadge(property) {
  if (!property.status || property.status === 'active') {
    return null;
  }

  if (property.status === 'NUEVA') {
    if (property.badgeExpiresAt) {
      const expired = new Date(property.badgeExpiresAt) <= new Date();
      if (expired) return null;
    }
  }

  return STATUS_BADGE_MAP[property.status] || null;
}

/**
 * Fallback image when a property has none or uses a placeholder domain.
 */
export const FALLBACK_IMAGE = '/images/property-placeholder.jpg';

export function getPropertyImage(property, index = 0) {
  const src = property.images?.[index];
  const url = typeof src === 'string' ? src : src?.url;
  if (!url || url.includes('via.placeholder.com')) return FALLBACK_IMAGE;
  return url;
}
