import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Provide a dummy token if the real one is missing, to avoid breaking the build/dev environment
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token' });

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { packageType } = await request.json();
    let unit_price = 0;
    let quantity = 0;

    if (packageType === 50) {
      unit_price = 6000;
      quantity = 50;
    } else if (packageType === 100) {
      unit_price = 10000;
      quantity = 100;
    } else {
      return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 });
    }

    const preference = new Preference(client);

    const host = request.headers.get('origin') || process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: [
          {
            id: `ai_credits_${quantity}`,
            title: `Paquete de ${quantity} Créditos AI`,
            quantity: 1,
            unit_price: unit_price,
            currency_id: 'ARS',
          }
        ],
        external_reference: `${sessionUser.userId}|${quantity}`,
        back_urls: {
          success: `${host}/admin/properties/smart-add?payment=success`,
          failure: `${host}/admin/properties/smart-add?payment=failure`,
          pending: `${host}/admin/properties/smart-add?payment=pending`,
        },
        auto_return: 'approved',
      }
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
