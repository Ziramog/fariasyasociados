import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import SiteConfig from '@/models/SiteConfig';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { isAdmin } from '@/utils/isAdmin';

export async function PUT(request, { params }) {
  await connectDB();
  const sessionUser = await getSessionUser();
  if (!isAdmin(sessionUser)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingQuotation = await Quotation.findById(id);
    if (!existingQuotation) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 });
    }

    const totalValue = body.properties.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

    // Update fields but preserve quoteNumber, trackingToken, and createdBy
    existingQuotation.properties = body.properties;
    existingQuotation.client = body.client;
    existingQuotation.payment = body.payment;
    existingQuotation.customization = body.customization || {};
    existingQuotation.totalValue = totalValue;

    await existingQuotation.save();

    const config = await SiteConfig.findOne({}).lean();

    revalidatePath('/admin/quotations');
    revalidatePath(`/p/${existingQuotation.delivery.trackingToken}`);
    
    return NextResponse.json({
      id: existingQuotation._id.toString(),
      quoteNumber: existingQuotation.quoteNumber,
      exchangeRateARS: config?.exchangeRateARS || null,
    }, { status: 200 });
  } catch (err) {
    console.error('[PUT /api/quotations/:id] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
