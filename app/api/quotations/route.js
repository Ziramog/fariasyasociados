import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import SiteConfig from '@/models/SiteConfig';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const quotes = await Quotation.find({}).sort({ createdAt: -1 }).lean();
  const config = await SiteConfig.findOne({}).lean();
  
  const users = await User.find({}, '_id username agentName email').lean();
  const userMap = users.reduce((acc, u) => {
    acc[u._id.toString()] = u.agentName || u.username || u.email.split('@')[0];
    return acc;
  }, {});

  const quotesWithCreator = quotes.map(q => ({
    ...q,
    creatorName: userMap[q.createdBy?.toString()] || 'Farias'
  }));

  return NextResponse.json({ quotes: quotesWithCreator, exchangeRateARS: config?.exchangeRateARS || null });
}

import { isAdmin } from '@/utils/isAdmin';

export async function POST(request) {
  await connectDB();
  const sessionUser = await getSessionUser();
  if (!isAdmin(sessionUser)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Generate quote number
    const year = new Date().getFullYear();
    const count = await Quotation.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
    const sequential = String(count + 1).padStart(4, '0');
    const quoteNumber = `RR-${year}-${sequential}`;

    const totalValue = body.properties.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

    const trackingToken = crypto.randomUUID();

    const quotation = await Quotation.create({
      quoteNumber,
      properties: body.properties,
      client: body.client,
      payment: body.payment,
      customization: body.customization || {},
      delivery: { trackingToken },
      totalValue,
      createdBy: sessionUser.userId,
    });

    const config = await SiteConfig.findOne({}).lean();

    revalidatePath('/admin/quotations');
    return NextResponse.json({
      id: quotation._id.toString(),
      quoteNumber,
      exchangeRateARS: config?.exchangeRateARS || null,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/quotations] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
