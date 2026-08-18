import connectDB from '@/config/database';
import SiteConfig from '@/models/SiteConfig';
import { SITE_CONFIG } from '@/config/site';

export const DEFAULT_SITE_CONFIG = {
  heroTitle: 'Negocios Inmobiliarios | Urbanos y Rurales',
  heroSubtitle: 'Farias & Asociados',
  aboutTitle: 'Farias & Asociados',
  aboutSubtitle: 'SERVICIOS INMOBILIARIOS',
  aboutText:
    'Acompañamos operaciones inmobiliarias con atención personalizada, información clara y una selección de propiedades para compra, venta y alquiler.',
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
