import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import SiteConfig from '@/models/SiteConfig';
import { getSessionUser } from '@/utils/getSessionUser';

export const dynamic = 'force-dynamic';

async function uploadToBlob(buffer, filename) {
  const { put } = await import('@vercel/blob');
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const prefix = process.env.BLOB_PREFIX ? `${process.env.BLOB_PREFIX.replace(/\/$/, '')}/` : '';
  const blob = await put(`${prefix}logos/${filename}`, buffer, {
    contentType: 'image/png',
    access: 'public',
  });
  return blob.url;
}

import { isAdmin } from '@/utils/isAdmin';

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    const formData = await request.formData();
    const file = formData.get('logo');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `agency-logo-${Date.now()}.png`;

    let logoUrl = null;
    try {
      logoUrl = await uploadToBlob(buffer, filename);
    } catch (blobError) {
      console.log('[upload-logo] Blob upload failed:', blobError.message);
    }

    if (!logoUrl) {
      // Fallback: store as base64 data URI directly in MongoDB
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
      await SiteConfig.findOneAndUpdate(
        {},
        { $set: { logoUrl: base64 } },
        { upsert: true }
      );
      return NextResponse.json({ logoUrl: base64 });
    }

    await SiteConfig.findOneAndUpdate(
      {},
      { $set: { logoUrl } },
      { upsert: true }
    );

    return NextResponse.json({ logoUrl });
  } catch (err) {
    console.error('[upload-logo] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}