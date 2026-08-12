import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSiteUrl } from '@/config/site';

export default async function sitemap() {
  let properties = [];
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      properties = await Property.find({ is_published: { $ne: false } }).select('_id updatedAt').lean();
    } catch (error) {
      console.log('[sitemap] DB unavailable, returning static routes only:', error.message);
    }
  }

  const propertyUrls = properties.map((prop) => ({
    url: getSiteUrl(`/properties/${prop._id.toString()}`),
    lastModified: prop.updatedAt ? new Date(prop.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryUrls = [
    { url: getSiteUrl('/properties?type=Casa'), priority: 0.7 },
    { url: getSiteUrl('/properties?type=Departamento'), priority: 0.7 },
    { url: getSiteUrl('/properties?type=Campo'), priority: 0.7 },
    { url: getSiteUrl('/properties?type=Terreno'), priority: 0.7 },
    { url: getSiteUrl('/properties?type=Inmueble+Comercial'), priority: 0.7 },
    { url: getSiteUrl('/properties?operation=venta'), priority: 0.7 },
    { url: getSiteUrl('/properties?operation=alquiler'), priority: 0.7 },
  ];

  const now = new Date().toISOString();

  return [
    { url: getSiteUrl(), lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: getSiteUrl('/properties'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: getSiteUrl('/properties/map-all'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...categoryUrls.map((category) => ({
      url: category.url,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: category.priority,
    })),
    ...propertyUrls,
  ];
}
