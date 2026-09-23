import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import connectDB from '@/config/database';
import User from '@/models/User';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token' });

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type') || request.body?.type;

    if (type === 'payment' && id) {
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id });
      
      if (paymentInfo.status === 'approved') {
        const external_reference = paymentInfo.external_reference;
        if (external_reference) {
          const [userId, quantityStr] = external_reference.split('|');
          const quantity = parseInt(quantityStr, 10);

          if (userId && !isNaN(quantity)) {
            await connectDB();
            await User.findByIdAndUpdate(userId, {
              $inc: { ai_credits: quantity }
            });
            console.log(`[Webhook MP] Sumados ${quantity} créditos al usuario ${userId}`);
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
