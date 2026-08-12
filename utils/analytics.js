import { getAllowedAnalyticsHosts } from '@/config/site';
export const isBrowser = () => typeof window !== 'undefined';

export function isAllowedTrackingHost(hostname) {
  return getAllowedAnalyticsHosts().includes(hostname);
}

export function isInternalTrackingRole(role) {
  return role === 'admin' || role === 'superadmin';
}

export function shouldTrackPath(pathname = '') {
  if (!pathname) return true;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return false;
  if (pathname === '/superadmin' || pathname.startsWith('/superadmin/')) return false;
  if (pathname.startsWith('/api')) return false;
  return true;
}

export function canTrackAnalytics({ host, pathname, role }) {
  if (host && !isAllowedTrackingHost(host)) return false;
  if (!shouldTrackPath(pathname)) return false;
  if (isInternalTrackingRole(role)) return false;
  return true;
}

export function cleanAnalyticsParams(params = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      // Basic PII safeguard just in case
      if (key !== 'number' && key !== 'email' && key !== 'phone' && key !== 'name') {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export function trackEvent(eventName, params = {}, overrideRole = undefined) {
  if (!isBrowser()) return;
  if (!window.gtag) return;

  // Block if session is still loading
  if (window.__ANALYTICS_SESSION_READY__ !== true) return;

  const role = overrideRole !== undefined ? overrideRole : window.__USER_ROLE__;
  const host = window.location.hostname;
  const pathname = window.location?.pathname || '';

  if (!canTrackAnalytics({ host, pathname, role })) return;

  window.gtag('event', eventName, cleanAnalyticsParams({
    page_path: pathname,
    page_location: window.location?.href,
    ...params,
  }));
}

export function trackWhatsappClick(params = {}) {
  trackEvent('click_whatsapp', {
    contact_channel: 'whatsapp',
    cta_location: params.cta_location,
    component: params.cta_location,
    context: params.context || 'general',
    property_id: params.property_id,
    property_type: params.property_type,
    operation: params.operation,
    location: params.location,
  });
}

export function trackPhoneClick(params = {}) {
  trackEvent('click_phone', {
    contact_channel: 'phone',
    cta_location: params.cta_location,
    component: params.cta_location,
    context: params.context || 'general',
  });
}

export function trackEmailClick(params = {}) {
  trackEvent('click_email', {
    contact_channel: 'email',
    cta_location: params.cta_location,
    component: params.cta_location,
    context: params.context || 'general',
  });
}

export function trackMapClick(params = {}) {
  trackEvent('click_maps', {
    cta_location: params.cta_location,
    component: params.cta_location,
    context: params.context || 'general',
    property_id: params.property_id,
    property_type: params.property_type,
    operation: params.operation,
    location: params.location,
  });
}

export function trackPropertyViewed(property = {}, role = undefined) {
  trackEvent('property_viewed', {
    property_id: property._id || property.id,
    property_type: property.type,
    operation: property.operation,
    location: property.location?.city || property.location?.neighborhood || property.location?.state,
    price_currency: property.currency,
  }, role);
}

export function trackContactFormSubmitted(params = {}) {
  trackEvent('form_submit', {
    form_type: params.form_name || 'contact',
    component: params.form_location,
  });
}

export function trackSearchUsed(params = {}) {
  trackEvent('search_used', {
    search_type: params.search_type || 'property_filter',
    property_type: params.property_type,
    operation: params.operation,
    location: params.location,
    has_query: Boolean(params.query),
    query_length: params.query ? String(params.query).length : 0,
  });
}

export function trackSocialClick(params = {}) {
  trackEvent('click_social', {
    contact_channel: params.channel || 'social',
    cta_location: params.cta_location,
    component: params.cta_location,
    context: params.context || 'general',
  });
}
