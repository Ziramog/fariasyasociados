import { Schema, model, models } from 'mongoose';

const SiteConfigSchema = new Schema({
  logoUrl: { type: String, default: null },
  exchangeRateARS: { type: Number, default: null },
  signatureBase64: { type: String, default: null },
  contactEmail: { type: String, default: 'info@fariasyasociados.com.ar' },
  contactPhone: { type: String, default: '+54 9 0000 000000' },
  contactAddress: { type: String, default: 'Dirección pendiente' },
  whatsappGroupLink: { type: String, default: '' },
  
  // CMS Fields (Superadmin)
  heroTitle: { type: String, default: 'Propiedades seleccionadas, asesoramiento de confianza' },
  heroSubtitle: { type: String, default: '' },
  aboutTitle: { type: String, default: 'Farias & Asociados' },
  aboutSubtitle: { type: String, default: 'Servicios inmobiliarios' },
  aboutText: { type: String, default: 'Acompañamos operaciones inmobiliarias con atención personalizada, información clara y una selección de propiedades para compra, venta y alquiler.' },
  footerDescription: { type: String, default: 'En Farias & Asociados te acompañamos en cada paso de tu operación inmobiliaria.' },
  
  // Marketing & Extras
  analyticsId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
  whatsappDefaultMessage: { type: String, default: 'Hola, vengo desde la web y me gustaría recibir más información.' },
  
  // Custom Labels
  customPropertyLabels: { 
    type: [String], 
    default: ['PRECIO MEJORADO', 'ULTIMA UNIDAD', 'UNICO EN SU TIPO', 'MEJOR PRECIO', 'EXCELENTE PRECIO', 'AMOBLADA'] 
  },
}, { timestamps: true });

const SiteConfig = models.SiteConfig || model('SiteConfig', SiteConfigSchema);
export default SiteConfig;