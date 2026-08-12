'use client';

import { APIProvider } from '@vis.gl/react-google-maps';

export default function MapProvider({ children }) {
  const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox';
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (provider === 'google' && apiKey) {
    return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
  }

  return <>{children}</>;
}
