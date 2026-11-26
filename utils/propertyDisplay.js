/**
 * Display helpers for property data.
 * Fixes the square_feet / covered_area confusion and standardises formatting.
 */

/**
 * Return the most meaningful area string for a property card.
 * Houses/apartments → covered area.  Land/campo → total area (with hectare conversion).
 */
export function getAreaDisplay(property) {
  const isLand = ['Campo', 'Lote', 'Terreno', 'Loteo'].includes(property.type);
  const total = property.total_area ?? property.square_feet;

  if (property.type === 'Campo' && total != null) {
    // Si es campo y el valor es "chico", asumimos que ya está en hectáreas.
    // Si supera los 10000, asumimos que lo cargaron en m2 (ej: 110000 m2 = 11 has)
    // a menos que realmente vendan un campo de más de 10.000 hectáreas.
    if (total > 10000) {
      const has = total / 10000;
      return `${has.toFixed(has % 1 === 0 ? 0 : 1)} has`;
    }
    return `${total.toLocaleString()} has`;
  }

  if (isLand && total != null) {
    if (total >= 10000) {
      const has = total / 10000;
      return has >= 1 ? `${has.toFixed(has % 1 === 0 ? 0 : 1)} has` : `${total.toLocaleString()} m²`;
    }
    return `${total.toLocaleString()} m²`;
  }

  if (property.covered_area) {
    return `${property.covered_area.toLocaleString()} m²`;
  }

  if (total != null) {
    if (total >= 10000) {
      const has = total / 10000;
      return has >= 1 ? `${has.toFixed(has % 1 === 0 ? 0 : 1)} has` : `${total.toLocaleString()} m²`;
    }
    return `${total.toLocaleString()} m²`;
  }

  return null;
}

/**
 * Return a formatted price string.
 */
export function getPriceDisplay(property) {
  if (property.price && property.price !== 'Consultar') {
    if (typeof property.price === 'string' && property.price.toLowerCase().includes('consultar')) return 'Consultar';

    let currencyStr = 'U$D';
    if (typeof property.price === 'string') {
      const match = property.price.trim().match(/^([A-Z$]+)\s*(.*)$/i);
      if (match && match[1]) {
        currencyStr = match[1].toUpperCase() === 'USD' ? 'U$D' : match[1];
      }
    }

    let num;
    if (typeof property.price === 'number') {
      num = property.price;
    } else {
      const cleaned = String(property.price).trim().replace(/[.,]00$/, '').replace(/[^0-9]/g, '');
      num = cleaned ? parseFloat(cleaned) : NaN;
    }
      
    if (!isNaN(num)) {
      return `${currencyStr} ${num.toLocaleString('es-AR')}`;
    }
    
    if (typeof property.price === 'string') return property.price;
  }
  if (property.rates?.monthly) return `U$D ${property.rates.monthly.toLocaleString('es-AR')}/mes`;
  if (property.rates?.weekly) return `U$D ${property.rates.weekly.toLocaleString('es-AR')}/sem`;
  if (property.rates?.nightly) return `U$D ${property.rates.nightly.toLocaleString('es-AR')}/noche`;
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

export const STAMP_STATUSES = ['VENDIDO', 'RESERVADO'];
export const RESERVED_SYSTEM_STATUSES = ['NUEVA', 'VENDIDO', 'RESERVADO'];

const STATUS_BADGE_MAP = {
  'PRECIO MEJORADO':  { label: 'Precio Mejorado', color: 'bg-green-500' },
  'ULTIMA UNIDAD':    { label: 'Última Unidad',   color: 'bg-[var(--color-brand)]' },
  'UNICO EN SU TIPO': { label: 'Única en su Tipo', color: 'bg-purple-500' },
  'MEJOR PRECIO':     { label: 'Mejor Precio del Mercado', color: 'bg-emerald-500' },
  'NUEVA':            { label: 'Nueva',           color: 'bg-blue-500' },
  'EXCELENTE PRECIO': { label: 'Excelente Precio', color: 'bg-amber-500' },
  'AMOBLADA':         { label: 'Amoblada',        color: 'bg-indigo-500' },
  'VENDIDO':          { label: 'Vendida',         color: 'bg-white/20', isStamp: true },
  'RESERVADO':        { label: 'Reservada',       color: 'bg-amber-500', isStamp: true },
};

/**
 * Return the stamp variant ('VENDIDO' | 'RESERVADO') if the property uses a diagonal stamp, else null.
 */
export function getStampStatus(property) {
  const status = property?.status;
  return STAMP_STATUSES.includes(status) ? status : null;
}

/**
 * Return a human-readable label for any property status, or null when inactive/expired.
 */
export function getStatusLabel(propertyOrStatus) {
  const status = typeof propertyOrStatus === 'string' ? propertyOrStatus : propertyOrStatus?.status;
  if (!status || status === 'active') return null;

  if (typeof propertyOrStatus === 'object' && propertyOrStatus?.status === 'NUEVA' && propertyOrStatus?.badgeExpiresAt) {
    if (new Date(propertyOrStatus.badgeExpiresAt) <= new Date()) return null;
  }

  return STATUS_BADGE_MAP[status]?.label || status;
}

/**
 * Return a status badge config for a property card, or null if no corner pill badge should be rendered.
 * Stamp statuses (VENDIDO / RESERVADO) render a diagonal overlay instead of a corner pill.
 */
export function getStatusBadge(property) {
  if (!property?.status || property.status === 'active') {
    return null;
  }

  if (getStampStatus(property)) {
    return null;
  }

  if (property.status === 'NUEVA') {
    if (property.badgeExpiresAt) {
      const expired = new Date(property.badgeExpiresAt) <= new Date();
      if (expired) return null;
    }
  }

  return STATUS_BADGE_MAP[property.status] || { label: property.status, color: 'bg-[var(--color-brand)]' };
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
