import { parsePrice } from './priceUtils.js';

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
 * Always shows full extended numbers (no compact "k" abbreviation) and appends /mes for rentals.
 */
export function getPriceDisplay(property) {
  const isRental = String(property?.operation || '').toLowerCase() === 'alquiler';
  const suffix = isRental ? '/mes' : '';

  if (property?.price && property.price !== 'Consultar') {
    if (typeof property.price === 'string' && property.price.toLowerCase().includes('consultar')) {
      return 'Consultar';
    }

    if (typeof property.price === 'number' && !isNaN(property.price)) {
      return `U$D ${property.price.toLocaleString('es-AR')}${suffix}`;
    }

    const { symbol, numericPrice } = parsePrice(property.price);
    if (numericPrice != null && !isNaN(numericPrice)) {
      return `${symbol} ${numericPrice.toLocaleString('es-AR')}${suffix}`;
    }

    if (typeof property.price === 'string') return property.price;
  }
  if (property?.rates?.monthly) return `U$D ${property.rates.monthly.toLocaleString('es-AR')}/mes`;
  if (property?.rates?.weekly) return `U$D ${property.rates.weekly.toLocaleString('es-AR')}/sem`;
  if (property?.rates?.nightly) return `U$D ${property.rates.nightly.toLocaleString('es-AR')}/noche`;
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

export const STAMP_STATUSES = ['VENDIDO', 'ALQUILADO', 'RESERVADO'];
export const RESERVED_SYSTEM_STATUSES = [
  'NUEVA',
  'VENDIDO',
  'VENDIDA',
  'ALQUILADO',
  'ALQUILADA',
  'RESERVADO',
  'RESERVADA',
];

const STATUS_BADGE_MAP = {
  'PRECIO MEJORADO':  { label: 'Precio Mejorado', color: 'bg-green-500' },
  'ULTIMA UNIDAD':    { label: 'Última Unidad',   color: 'bg-[var(--color-brand)]' },
  'UNICO EN SU TIPO': { label: 'Única en su Tipo', color: 'bg-purple-500' },
  'MEJOR PRECIO':     { label: 'Mejor Precio del Mercado', color: 'bg-emerald-500' },
  'NUEVA':            { label: 'Nueva',           color: 'bg-blue-500' },
  'EXCELENTE PRECIO': { label: 'Excelente Precio', color: 'bg-amber-500' },
  'AMOBLADA':         { label: 'Amoblada',        color: 'bg-indigo-500' },
  'VENDIDO':          { label: 'Vendida',         color: 'bg-white/20', isStamp: true },
  'ALQUILADO':        { label: 'Alquilada',       color: 'bg-white/20', isStamp: true },
  'RESERVADO':        { label: 'Reservada',       color: 'bg-amber-500', isStamp: true },
};

const TYPE_GENDER_MAP = {
  'Casa': 'f',
  'Gran Inversión': 'f',
  'Departamento': 'm',
  'Terreno': 'm',
  'Campo': 'm',
  'Inmueble Comercial': 'm',
};

const FEMININE_TITLE_NOUNS = /\b(casa|quinta|chacra|cabana|oficina|cochera|nave|posada|residencia|vivienda|fraccion|hectarea|propiedad|esquina|galeria)\b/;
const MASCULINE_TITLE_NOUNS = /\b(local|salon|galpon|deposito|fondo de comercio|lote|loteo|terreno|campo|departamento|depto|piso|duplex|ph|edificio|complejo|hotel|consultorio|estudio|inmueble)\b/;

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Determine grammatical gender ('f' | 'm') for a property based on its type and title noun.
 */
export function getPropertyGrammaticalGender(property) {
  const type = property?.type || '';
  const isAmbiguousType = !type || type === 'Inmueble Comercial' || type === 'Gran Inversión';

  if (isAmbiguousType && property?.name) {
    const normalizedName = normalizeText(property.name);
    const femMatch = normalizedName.match(FEMININE_TITLE_NOUNS);
    const mascMatch = normalizedName.match(MASCULINE_TITLE_NOUNS);

    if (femMatch && mascMatch) {
      return femMatch.index <= mascMatch.index ? 'f' : 'm';
    }
    if (femMatch) return 'f';
    if (mascMatch) return 'm';
  }

  return TYPE_GENDER_MAP[type] || 'f';
}

/**
 * Keep stamp status aligned with operation ('alquiler' uses ALQUILADO; venta/compra uses VENDIDO).
 */
export function normalizeStampStatus(status, operation) {
  if (operation === 'alquiler' && status === 'VENDIDO') return 'ALQUILADO';
  if (operation !== 'alquiler' && status === 'ALQUILADO') return 'VENDIDO';
  return status;
}

const STAMP_LABELS = {
  VENDIDO: { f: 'VENDIDA', m: 'VENDIDO' },
  ALQUILADO: { f: 'ALQUILADA', m: 'ALQUILADO' },
  RESERVADO: { f: 'RESERVADA', m: 'RESERVADO' },
};

/**
 * Return stamp display metadata ({ status, variant, label, gender }) or null if no diagonal stamp applies.
 */
export function getStampDisplay(property) {
  if (!property?.status || !STAMP_STATUSES.includes(property.status)) {
    return null;
  }

  const effectiveStatus = normalizeStampStatus(property.status, property?.operation);
  const gender = getPropertyGrammaticalGender(property);
  const label = STAMP_LABELS[effectiveStatus]?.[gender];
  if (!label) return null;

  return {
    status: effectiveStatus,
    variant: effectiveStatus === 'RESERVADO' ? 'RESERVADO' : 'VENDIDO',
    label,
    gender,
  };
}

/**
 * Return the two allowed stamp options for admin controls based on operation and grammatical gender.
 */
export function getAvailableStampOptions(property) {
  const gender = getPropertyGrammaticalGender(property);
  const isRental = property?.operation === 'alquiler';

  if (isRental) {
    return [
      { value: 'ALQUILADO', label: gender === 'f' ? 'Alquilada' : 'Alquilado' },
      { value: 'RESERVADO', label: gender === 'f' ? 'Reservada' : 'Reservado' },
    ];
  }

  return [
    { value: 'VENDIDO', label: gender === 'f' ? 'Vendida' : 'Vendido' },
    { value: 'RESERVADO', label: gender === 'f' ? 'Reservada' : 'Reservado' },
  ];
}

/**
 * Return the stamp status ('VENDIDO' | 'ALQUILADO' | 'RESERVADO') if active, else null.
 */
export function getStampStatus(property) {
  return getStampDisplay(property)?.status || null;
}

/**
 * Return a human-readable label for any property status, or null when inactive/expired.
 */
export function getStatusLabel(propertyOrStatus) {
  if (typeof propertyOrStatus === 'object' && propertyOrStatus !== null) {
    const stamp = getStampDisplay(propertyOrStatus);
    if (stamp) {
      return stamp.label.charAt(0) + stamp.label.slice(1).toLowerCase();
    }
  }

  const status = typeof propertyOrStatus === 'string' ? propertyOrStatus : propertyOrStatus?.status;
  if (!status || status === 'active') return null;

  if (typeof propertyOrStatus === 'object' && propertyOrStatus?.status === 'NUEVA' && propertyOrStatus?.badgeExpiresAt) {
    if (new Date(propertyOrStatus.badgeExpiresAt) <= new Date()) return null;
  }

  return STATUS_BADGE_MAP[status]?.label || status;
}

/**
 * Return a status badge config for a property card, or null if no corner pill badge should be rendered.
 * Stamp statuses (VENDIDO / ALQUILADO / RESERVADO) render a diagonal overlay instead of a corner pill.
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
