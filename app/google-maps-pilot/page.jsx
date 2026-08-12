export const dynamic = 'force-dynamic';

import connectDB from '@/config/database';
import Property from '@/models/Property';
import GoogleMapPilot from '@/components/GoogleMapPilot';
import MapErrorBoundary from '@/components/shared/MapErrorBoundary';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export const metadata = {
  title: 'Piloto Google Maps',
  description: 'Prueba piloto de integración de Google Maps para propiedades de Farias & Asociados.',
};

export default async function GoogleMapsPilotPage() {
  await connectDB();
  const docs = await Property.find({}).lean();
  const properties = docs.map(convertToSerializeableObject);

  return (
    <MapErrorBoundary>
      <GoogleMapPilot initialProperties={properties} />
    </MapErrorBoundary>
  );
}
