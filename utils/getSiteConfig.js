import connectDB from '@/config/database';
import SiteConfig from '@/models/SiteConfig';
import { SITE_CONFIG } from '@/config/site';

export const DEFAULT_SITE_CONFIG = {
  heroTitle: 'Negocios Inmobiliarios | Urbanos y Rurales',
  heroSubtitle: 'Farias & Asociados',
  aboutTitle: 'Farias & Asociados',
  aboutSubtitle: 'SERVICIOS INMOBILIARIOS',
  aboutText:
    'En Farías y Asociados somos una inmobiliaria con 16 años de trayectoria, especialistas en el mercado urbano y rural principalmente en la ciudad de San Francisco y zona de influencia dentro de la provincia de Córdoba. Ofrecemos un servicio integral que abarca la administración de alquileres, venta de propiedades y campos, y tasaciones residenciales e industriales. Contamos con un equipo de tasadores profesionales listos para asesorarte en cada etapa, ya sea que quieras vender, alquilar o valuar tu propiedad.',
  footerDescription: 'En Farias & Asociados te acompañamos en cada paso de tu operación inmobiliaria.',
  contactEmail: SITE_CONFIG.contactEmail,
  contactPhone: SITE_CONFIG.contactPhone,
  contactAddress: SITE_CONFIG.contactAddress,
  whatsappGroupLink: '',
  whatsappDefaultMessage: 'Hola, vengo desde la web de Farias & Asociados y me gustaría recibir más información.',
  analyticsId: '',
  facebookPixelId: '',
};

export const getSiteConfig = async () => {
  if (!process.env.MONGODB_URI) return DEFAULT_SITE_CONFIG;

  try {
    await connectDB();
    const config = await SiteConfig.findOne({}).lean();

    return {
      heroTitle: config?.heroTitle || DEFAULT_SITE_CONFIG.heroTitle,
      heroSubtitle: config?.heroSubtitle || DEFAULT_SITE_CONFIG.heroSubtitle,
      aboutTitle: config?.aboutTitle || DEFAULT_SITE_CONFIG.aboutTitle,
      aboutSubtitle: config?.aboutSubtitle || DEFAULT_SITE_CONFIG.aboutSubtitle,
      aboutText: config?.aboutText || DEFAULT_SITE_CONFIG.aboutText,
      footerDescription: config?.footerDescription || DEFAULT_SITE_CONFIG.footerDescription,
      contactEmail: config?.contactEmail || DEFAULT_SITE_CONFIG.contactEmail,
      contactPhone: config?.contactPhone || DEFAULT_SITE_CONFIG.contactPhone,
      contactAddress: config?.contactAddress || DEFAULT_SITE_CONFIG.contactAddress,
      whatsappGroupLink: config?.whatsappGroupLink || DEFAULT_SITE_CONFIG.whatsappGroupLink,
      whatsappDefaultMessage: config?.whatsappDefaultMessage || DEFAULT_SITE_CONFIG.whatsappDefaultMessage,
      analyticsId: config?.analyticsId || DEFAULT_SITE_CONFIG.analyticsId,
      facebookPixelId: config?.facebookPixelId || DEFAULT_SITE_CONFIG.facebookPixelId,
    };
  } catch (error) {
    console.error('Error fetching site config:', error);
    return DEFAULT_SITE_CONFIG;
  }
};
