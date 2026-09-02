import Hero from '@/components/Hero';
import FeaturedPropertiesCarousel from '@/components/FeaturedPropertiesCarousel';
import SellerCTA from '@/components/sections/SellerCTA';
import StatsBar from '@/components/sections/StatsBar';
import Agents from '@/components/sections/Agents';
import ReviewsSection from '@/components/ReviewsSection';
import Clients from '@/components/Clients';
import ScrollReveal from '@/components/shared/ScrollReveal';
import JsonLd from '@/components/JsonLd';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSiteConfig } from '@/utils/getSiteConfig';
import { SITE_CONFIG, getSiteUrl } from '@/config/site';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export const metadata = {
  title: 'Inicio',
  description: `${SITE_CONFIG.name} — Portal inmobiliario para compra, venta y alquiler de propiedades.`,
};

const HomePage = async () => {
  let properties = [];
  try {
    await connectDB();
    if (process.env.MONGODB_URI) {
      properties = await Property.find({
        is_published: { $ne: false },
        is_featured: true,
        'images.0': { $exists: true }
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    }
  } catch (error) {
    console.log('[home] DB unavailable, rendering without featured properties:', error.message);
  }
  const siteConfig = await getSiteConfig();

  const serializedProperties = properties.map((p) => ({
    ...p,
    _id: p._id.toString(),
    owner: p.owner?.toString(),
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${getSiteUrl()}/#organization`,
        name: SITE_CONFIG.name,
        url: getSiteUrl(),
        logo: getSiteUrl(SITE_CONFIG.isoPath),
        sameAs: [
          'https://www.facebook.com/fariasyasociados',
          'https://www.instagram.com/fariasyasociados',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.contactPhone || SITE_CONFIG.contactPhone,
          contactType: 'sales',
          areaServed: 'AR',
          availableLanguage: 'Spanish',
        },
      },
      {
        '@type': 'RealEstateAgent',
        '@id': `${getSiteUrl()}/#realestateagent`,
        name: SITE_CONFIG.name,
        image: getSiteUrl(SITE_CONFIG.isoPath),
        url: getSiteUrl(),
        telephone: siteConfig.contactPhone || SITE_CONFIG.contactPhone,
        email: siteConfig.contactEmail || 'info@fariasyasociados.com.ar',
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.contactAddress || 'Dirección pendiente',
          addressLocality: 'Argentina',
          addressRegion: SITE_CONFIG.defaultRegion,
          postalCode: '',
          addressCountry: 'AR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: undefined,
          longitude: undefined,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
        priceRange: '$$$',
      },
      {
        '@type': 'WebSite',
        '@id': `${getSiteUrl()}/#website`,
        url: getSiteUrl(),
        name: 'Farias & Asociados Inmobiliaria',
        publisher: { '@id': `${getSiteUrl()}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${getSiteUrl('/properties')}?term={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      {/* 1. Hero — emotional hook + search + trust strip */}
      <Hero title="Negocios Inmobiliarios Urbanos y Rurales" subtitle={siteConfig.heroSubtitle} />

      {/* 2. Stats Bar — social proof metrics (flush with hero) */}
      <StatsBar />

      {/* 3. Featured — best inventory showcase */}
      <div id="propiedades-destacadas">
        <FeaturedPropertiesCarousel properties={serializedProperties} />
      </div>

      {/* 4. CTA — seller + investor */}
      <SellerCTA />

      {/* 5. Agents — Farias & Asociados Historia */}
      <div id="nuestra-historia">
        <Agents 
          title={siteConfig.aboutTitle} 
          subtitle={siteConfig.aboutSubtitle} 
          text="Somos una inmobiliaria con 16 años de trayectoria, especialistas en el mercado urbano y rural principalmente en la ciudad de San Francisco y zona de influencia dentro de la provincia de Córdoba. Ofrecemos un servicio integral que abarca la administración de alquileres, venta de propiedades y campos, y tasaciones residenciales e industriales. Contamos con un equipo de tasadores profesionales listos para asesorarte en cada etapa, ya sea que quieras vender, alquilar o valuar tu propiedad." 
        />
      </div>

      {/* 6. Reviews — Nuestros Clientes */}
      <ScrollReveal variant="fadeScale">
        <ReviewsSection />
      </ScrollReveal>

      {/* 7. Clients — Empresas y Proyectos */}
      <Clients />
    </div>
  );
};

export default HomePage;