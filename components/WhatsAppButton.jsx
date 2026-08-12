'use client'

import WhatsAppIcon from './icons/WhatsAppIcon'

const WHATSAPP_NUMBER = '+5493547563911'

const WhatsAppButton = ({ property }) => {
  const message = encodeURIComponent(
    `Hola! Vi la propiedad "${property.name}" en Farias & Asociados y me gustaría recibir más información.`
  )

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-none md:rounded-[18px] shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'
    >
      <WhatsAppIcon className='w-5 h-5' />
      <span className='text-sm font-bold'>Contactar por WhatsApp</span>
    </a>
  )
}

export default WhatsAppButton
