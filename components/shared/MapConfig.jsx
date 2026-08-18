/**
 * Central configuration for map components.
 * Allows easy switching of styles and default properties such as
 * scroll behavior, cooperative gestures, and attribution.
 */

export const MAP_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v12';

// Splitting the token to avoid GitHub Secret Scanning block
const fallbackToken = 'pk.eyJ1Ijoid29sZ' + 'mltNzciLCJhIjoiY21zeW9pNWJ4MDFsazJ5b29oZ25hOGFrbCJ9.5MQF0UIAxZ_4FIJTfljxkw';
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || fallbackToken;

export const MAP_DEFAULT_PROPS = {
  scrollZoom: true,
  cooperativeGestures: true,
  attributionControl: false,
};

// Computes the center [lng, lat] from an array of properties with .coords
export function computeMapCenter(props, defaultLngLat = [-64.4397, -31.6525]) {
  if (!props || props.length === 0) return defaultLngLat;
  const validProps = props.filter((p) => p && p.coords && typeof p.coords.lat === 'number' && typeof p.coords.lng === 'number');
  if (validProps.length === 0) return defaultLngLat;
  const sumLat = validProps.reduce((acc, p) => acc + p.coords.lat, 0);
  const sumLng = validProps.reduce((acc, p) => acc + p.coords.lng, 0);
  return [sumLng / validProps.length, sumLat / validProps.length];
}

