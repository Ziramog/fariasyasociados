export const SITE_CONFIG = {
  name: 'Farias & Asociados',
  legalName: 'Farias & Asociados',
  domain: process.env.NEXT_PUBLIC_DOMAIN || 'https://farias-asociados.vercel.app',
  pendingDomain: 'https://farias-asociados.vercel.app',
  description:
    'Farias & Asociados — Portal inmobiliario para compra, venta y alquiler de propiedades.',
  keywords:
    'inmobiliaria, propiedades, casas, departamentos, campos, terrenos, venta, alquiler, Argentina',
  contactEmail: 'info@fariasyasociados.com.ar',
  contactPhone: '+54 9 0000 000000',
  contactAddress: 'Dirección pendiente',
  defaultCity: 'Argentina',
  defaultRegion: 'Argentina',
  logoPath: '/images/logo-farias-placeholder.svg',
  isoPath: '/images/isotipo-farias-placeholder.svg',
  analyticsHosts: [
    'farias-asociados.vercel.app',
    'fariasyasociados.com.ar',
    'www.fariasyasociados.com.ar',
    'localhost',
    '127.0.0.1',
  ],
};

export function getSiteUrl(path = '') {
  const base = (process.env.NEXT_PUBLIC_DOMAIN || SITE_CONFIG.domain).replace(/\/$/, '');
  const cleanPath = path ? `/${String(path).replace(/^\/+/, '')}` : '';
  return `${base}${cleanPath}`;
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
