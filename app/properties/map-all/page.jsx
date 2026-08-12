
import connectDB from '@/config/database';
import Property from '@/models/Property';
import nextDynamic from 'next/dynamic';
import MapErrorBoundary from '@/components/shared/MapErrorBoundary';
import { convertToSerializeableObject } from '@/utils/convertToObject';

const MapAllProperties = nextDynamic(() => import('@/components/MapAllProperties'), {
  ssr: false,
});

export const metadata = {
  title: 'Mapa de Propiedades',
  description: 'Explorá las propiedades de Farias & Asociados en el mapa interactivo.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export default async function MapAllPage() {
  let properties = [];
  try {
    await connectDB();
    if (process.env.MONGODB_URI) {
      const docs = await Property.find({ is_published: { $ne: false } }).lean();
      properties = docs.map(convertToSerializeableObject);
    }
  } catch (error) {
    console.log('[map-all] DB unavailable, rendering empty map:', error.message);
  }

  return (
    <MapErrorBoundary>
      <MapAllProperties initialProperties={properties} />
    </MapErrorBoundary>
  );
}