import connectDB from '@/config/database';
import Subscriber from '@/models/Subscriber';
import SiteConfig from '@/models/SiteConfig';

export const POST = async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { whatsappNumber } = body;

    if (!whatsappNumber || whatsappNumber.trim() === '') {
      return new Response(JSON.stringify({ message: 'El número de WhatsApp es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Buscar el link guardado en SiteConfig
    const config = await SiteConfig.findOne({}).lean();
    const groupLink = config?.whatsappGroupLink || '#';

    // Opcional: Validar si el número ya existe para no duplicarlo, o simplemente actualizar fecha
    let existingSubscriber = await Subscriber.findOne({ whatsappNumber });

    if (existingSubscriber) {
      return new Response(JSON.stringify({ message: 'El número ya está suscrito', success: true, link: groupLink }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newSubscriber = new Subscriber({
      whatsappNumber,
    });

    await newSubscriber.save();

    return new Response(JSON.stringify({ message: 'Suscripción exitosa', success: true, link: groupLink }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/subscribe:', error);
    return new Response(JSON.stringify({ message: 'Hubo un error al procesar tu solicitud', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
