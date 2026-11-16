export const CANONICAL_PUBLIC_DOMAIN = 'https://fariasyasociados.com.ar';

export const SITE_CONFIG = {
  name: 'Farias & Asociados',
  legalName: 'Farias & Asociados',
  domain: process.env.NEXT_PUBLIC_DOMAIN || CANONICAL_PUBLIC_DOMAIN,
  pendingDomain: 'https://farias-asociados.vercel.app',
  description:
    'Farias & Asociados — Portal inmobiliario para compra, venta y alquiler de propiedades.',
  keywords:
    'inmobiliaria, propiedades, casas, departamentos, campos, terrenos, venta, alquiler, Argentina',
  contactEmail: 'fariasyasociados.inmobiliaria@gmail.com',
  contactPhone: '3564625246',
  contactAddress: 'Bv Saenz Peña 2002',
  defaultCity: 'Argentina',
  defaultRegion: 'Argentina',
  logoPath: '/images/farias_logo_no_bk.png',
  isoPath: '/images/farias_logo_no_bk.png',
  analyticsHosts: [
    'farias-asociados.vercel.app',
    'fariasyasociados.com.ar',
    'www.fariasyasociados.com.ar',
    'localhost',
    '127.0.0.1',
  ],
};

function joinSiteUrl(baseUrl, path = '') {
  const base = baseUrl.replace(/\/$/, '');
  const cleanPath = path ? `/${String(path).replace(/^\/+/, '')}` : '';
  return `${base}${cleanPath}`;
}

export function getSiteUrl(path = '') {
  return joinSiteUrl(process.env.NEXT_PUBLIC_DOMAIN || SITE_CONFIG.domain, path);
}

/**
 * Resolve the public production URL for share/WhatsApp links,
 * avoiding temporary vercel.app preview/staging hostnames.
 */
export function getPublicSiteUrl(path = '') {
  const envDomain = process.env.NEXT_PUBLIC_DOMAIN;
  const base =
    envDomain && !envDomain.includes('vercel.app')
      ? envDomain
      : CANONICAL_PUBLIC_DOMAIN;
  return joinSiteUrl(base, path);
}

export function getHostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function getAllowedAnalyticsHosts() {
  const envHost = getHostnameFromUrl(process.env.NEXT_PUBLIC_DOMAIN || '');
  return Array.from(new Set([envHost, ...SITE_CONFIG.analyticsHosts].filter(Boolean)));
}
