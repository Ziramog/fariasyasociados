'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

async function addManualReview(formData) {
  await connectDB();

  const authorName = formData.get('authorName');
  const rating = parseInt(formData.get('rating'), 10);
  const text = formData.get('text') || null;
  const publishDate = formData.get('publishDate') || new Date().toISOString().split('T')[0];
  const featured = formData.get('featured') === 'on';

  if (!authorName || rating < 1 || rating > 5) {
    throw new Error('Datos inválidos');
  }

  const reviewId = crypto.createHash('sha256').update(`${authorName}::${publishDate}::manual`).digest('hex').slice(0, 32);

  await Review.create({
    googlePlaceId: process.env.GOOGLE_PLACE_ID || 'manual',
    reviewId,
    authorName,
    authorPhoto: null,
    authorUri: null,
    rating,
    text,
    textOriginalLanguage: 'es',
    publishTime: new Date(publishDate),
    relativeTimeDescription: '—',
    googleUpdatedAt: new Date(),
    featured,
    hidden: false,
    priority: 0,
  });

  revalidatePath('/', 'layout');
}

export default addManualReview;
