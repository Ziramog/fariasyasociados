'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

async function bulkImportReviews(formData) {
  await connectDB();

  const raw = formData.get('reviewsData');
  if (!raw) throw new Error('No hay datos');

  let items;
  try {
    items = JSON.parse(raw);
  } catch {
    throw new Error('Formato JSON inválido');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Debe ser un array con al menos un item');
  }

  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.authorName || !item.rating || item.rating < 1 || item.rating > 5) {
      skipped++;
      continue;
    }

    const dateStr = item.publishDate || new Date().toISOString().split('T')[0];
    const reviewId = crypto.createHash('sha256').update(`${item.authorName}::${dateStr}::${item.text || ''}::bulk`).digest('hex').slice(0, 32);

    const exists = await Review.findOne({ reviewId }).lean();
    if (exists) { skipped++; continue; }

    await Review.create({
      googlePlaceId: process.env.GOOGLE_PLACE_ID || 'manual',
      reviewId,
      authorName: item.authorName,
      authorPhoto: item.authorPhoto || null,
      authorUri: null,
      rating: item.rating,
      text: item.text || null,
      textOriginalLanguage: 'es',
      publishTime: new Date(dateStr),
      relativeTimeDescription: '—',
      googleUpdatedAt: new Date(),
      featured: item.featured || false,
      hidden: false,
      priority: item.priority || 0,
    });

    imported++;
  }

  revalidatePath('/', 'layout');
  return { imported, skipped };
}

export default bulkImportReviews;
