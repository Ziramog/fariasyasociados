
import PropertyDetails from '@/components/PropertyDetails';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import PropertyGallery from '@/components/PropertyGallery';
import dynamic from 'next/dynamic';
import MapErrorBoundary from '@/components/shared/MapErrorBoundary';
import FullGallery from '@/components/FullGallery';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
});
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionTitle from '@/components/shared/SectionTitle';
import JsonLd from '@/components/JsonLd';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Link from 'next/link';
import { SITE_CONFIG, getSiteUrl } from '@/config/site';

export const dynamicParams = true;
export const revalidate = 600;

export async function generateStaticParams() {
  if (!process.env.MONGODB_URI) return [];
  try {
    const connectDB = (await import('@/config/database')).default;
    const Property = (await import('@/models/Property')).default;
    await connectDB();
    const props = await Property.find({ is_published: { $ne: false } })
      .select('_id')
      .lean();
    return props.map((p) => ({ id: p._id.toString() }));
  } catch (error) {
    console.log('[property:generateStaticParams] DB unavailable:', error.message);
    return [];
  }
}

export async function generateMetadata({ params }) {
  if (!process.env.MONGODB_URI) {
    return { title: `Propiedad · ${SITE_CONFIG.name}` };
  }
  let propertyDoc = null;
  try {
    await connectDB();
    propertyDoc = await Property.findById(params.id).lean();
  } catch (error) {
    console.log('[property:metadata] DB unavailable:', error.message);
    return { title: `Propiedad · ${SITE_CONFIG.name}` };
  }

  if (!propertyDoc) {
    return {
      title: 'Propiedad no encontrada',
    };
  }

  const property = convertToSerializeableObject(propertyDoc);
  const title = `${property.name || 'Propiedad'} · ${property.location?.city || SITE_CONFIG.defaultCity}`;
  const description = `${property.type || 'Propiedad'} en ${property.operation || 'venta'} · U$D ${property.price || 'Consultar'} · ${property.description?.slice(0, 150) || `${SITE_CONFIG.name}`}`;
  const image = property.images?.[0]?.url || '/images/og-default.jpg';

  return {
    title,
    description,
    openGraph: {
      title: `${property.name || 'Propiedad'} · ${SITE_CONFIG.name}`,
      description,
      images: [image],
      type: 'article',
      locale: 'es_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.name || 'Propiedad'} · ${SITE_CONFIG.name}`,
      description,
      images: [image],
    },
    alternates: {
      canonical: `/properties/${params.id}`,
    },
  };
}

const PropertyPage = async ({ params }) => {
  try {
    if (!process.env.MONGODB_URI) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F6F6F6' }}>
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">Base de datos pendiente</h1>
            <p className="text-sm text-[#666]">Configurar MONGODB_URI de Farias para ver propiedades reales.</p>
          </div>
        </div>
      );
    }
    await connectDB();
    const propertyDoc = await Property.findById(params.id).lean();

    if (!propertyDoc) {
      return (
        <h1 className='text-center text-2xl font-bold mt-10'>
          Propiedad No Encontrada
        </h1>
      );
    }

    const property = convertToSerializeableObject(propertyDoc);

    const parsePrice = (priceStr) => {
      if (!priceStr) return null;
      const cleaned = priceStr.replace(/[^0-9]/g, '');
      return cleaned ? parseInt(cleaned, 10) : null;
    };

    const propertyImage = property.images?.[0]?.url || 'https://farias-asociados.vercel.app/images/isotipo-farias-placeholder.svg';
    const propertyPrice = parsePrice(property.price);

    const realEstateJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.name || 'Propiedad',
      description: property.description || '',
      url: getSiteUrl(`/properties/${property._id}`),
      image: propertyImage,
      datePosted: property.createdAt,
      offers: {
        '@type': 'Offer',
        price: propertyPrice,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        businessFunction:
          property.operation === 'alquiler'
            ? 'http://purl.org/goodrelations/v1#LeaseOut'
            : 'http://purl.org/goodrelations/v1#Sell',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.location?.street || '',
        addressLocality: property.location?.city || SITE_CONFIG.defaultCity,
        addressRegion: property.location?.state || SITE_CONFIG.defaultRegion,
        addressCountry: 'AR',
      },
      geo:
        property.coordinates?.lat && property.coordinates?.lng
          ? {
              '@type': 'GeoCoordinates',
              latitude: property.coordinates.lat,
              longitude: property.coordinates.lng,
            }
          : undefined,
      numberOfRooms: property.beds || undefined,
      numberOfBathroomsTotal: property.baths || undefined,
      floorSize: property.square_feet
        ? {
            '@type': 'QuantitativeValue',
            value: property.square_feet,
            unitCode: 'MTK',
          }
        : undefined,
    };

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: getSiteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Propiedades',
          item: getSiteUrl('/properties'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: property.name || 'Propiedad',
          item: getSiteUrl(`/properties/${property._id}`),
        },
      ],
    };

    return (
      <div className="min-h-screen" style={{ background: '#F6F6F6' }}>
        <JsonLd data={realEstateJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ScrollReveal variant="fadeScale">
          <PropertyGallery images={property.images} property={property} />
        </ScrollReveal>
        <section className="pb-16">
          <div className="mx-auto">
            <PropertyDetails property={property} />
            {property.images && property.images.length > 0 && (
              <div className="mt-8" id="full-gallery">
                <div className="bg-white rounded-none overflow-hidden">
                  <div className="mx-auto py-[30px] md:py-[80px] px-4 md:px-[50px] md:pb-[35px]">
                    <div className="pb-[30px]">
                      <SectionTitle size="normal">
                        {property.name
                          ? property.name.split(' ').slice(0, 4).join(' ') + (property.name.split(' ').length > 4 ? '...' : '')
                          : 'Fotos'}
                      </SectionTitle>
                    </div>
                    <ScrollReveal delay={100}>
                      <FullGallery images={property.images} propertyName={property.name} />
                    </ScrollReveal>
                  </div>
                </div>
              </div>
            )}

            {/* View on Map */}
            <div className="mt-8">
              <div className="bg-white rounded-none md:rounded-[30px] overflow-hidden">
                <div className="mx-auto px-4 md:px-[50px] py-[30px] md:py-[40px]">
                  <div className="pb-[30px]">
                    <div className="flex items-center justify-between">
                      <SectionTitle size="normal">Vista en Mapa</SectionTitle>
                      <Link
                        href="/properties/map-all"
                        className="hidden md:inline-flex items-center gap-2 text-[var(--color-brand)] text-[13px] font-bold uppercase tracking-wider transition-colors hover:text-[#0F172A]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                          <line x1="8" y1="2" x2="8" y2="18"/>
                          <line x1="16" y1="6" x2="16" y2="22"/>
                        </svg>
                        Ver todas las propiedades en el mapa
                      </Link>
                    </div>
                    <Link
                      href="/properties/map-all"
                      className="md:hidden mt-4 w-full flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[var(--color-brand)] bg-white border border-[var(--color-brand)] rounded-[8px] py-3 px-6 transition-colors hover:bg-[var(--color-brand)] hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                        <line x1="8" y1="2" x2="8" y2="18"/>
                        <line x1="16" y1="6" x2="16" y2="22"/>
                      </svg>
                      Ver todas las propiedades en el mapa
                    </Link>
                  </div>
                  <ScrollReveal delay={100}>
                    <div className="rounded-[30px] overflow-hidden">
                      <MapErrorBoundary>
                        <PropertyMap property={property} />
                      </MapErrorBoundary>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F6F6F6' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" className="w-8 h-8">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Error al cargar la propiedad</h2>
          <p className="text-sm text-[#666] mb-2">{err.message}</p>
          <p className="text-[11px] text-[#bbb] mb-6 font-mono">Digest: {err.digest}</p>
          <Link href="/admin" className="text-[var(--color-brand)] font-medium text-sm hover:underline">
            Volver al panel admin
          </Link>
        </div>
      </div>
    );
  }
};
export default PropertyPage;
