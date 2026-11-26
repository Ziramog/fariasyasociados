import { getPublicSiteUrl } from '@/config/site';

const WA_NUMBER = '5493564625246';

const MESSAGES = {
  hero: 'Hola! Estoy buscando una propiedad. ¿Me pueden asesorar?',
  seller: 'Hola! Quiero vender mi propiedad. ¿Me pueden dar información sobre su servicio de tasación?',
  rental: 'Hola! Estoy interesado en alquilar una propiedad. ¿Me pueden asesorar con las opciones disponibles?',
  float: 'Hola! Estoy navegando el sitio web de Farias & Asociados y tengo una consulta.',
  general: 'Hola! Quisiera información sobre propiedades disponibles.',
};

/**
 * Generate a WhatsApp deep link with pre-filled message.
 *
 * @param {object}  [options]
 * @param {object}  [options.property]      – Property object (card / detail)
 * @param {string}  [options.context]       – 'hero' | 'seller' | 'float' | 'general'
 * @param {string}  [options.customMessage] – Override auto-generated message
 * @returns {string} Full WhatsApp URL
 */
export function generateWhatsAppLink({ property, context = 'general', customMessage } = {}) {
  let message;

  if (customMessage) {
    message = customMessage;
  } else if (property) {
    const url = getPublicSiteUrl(`/properties/${property._id}`);
    if (property.status === 'VENDIDO') {
      message = `Hola! Vi la propiedad vendida "${property.name}" en Farias & Asociados y me gustaría consultar por opciones similares.

${url}`;
    } else if (property.status === 'RESERVADO') {
      message = `Hola! Vi la propiedad reservada "${property.name}" en Farias & Asociados y me gustaría consultar disponibilidad u opciones similares.

${url}`;
    } else {
      message = `Hola! Vi la propiedad "${property.name}" en Farias & Asociados y me gustaría recibir más información.

${url}`;
    }
  } else {
    message = MESSAGES[context] || MESSAGES.general;
  }

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Expose the canonical number for tel: links */
export const WHATSAPP_NUMBER = WA_NUMBER;
export const PHONE_NUMBER = '3564417598';
export const PHONE_DISPLAY = '3564-417598';
