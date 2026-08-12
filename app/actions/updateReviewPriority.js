'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import { revalidatePath } from 'next/cache';

export default async function updateReviewPriority(formData) {
  const id = formData.get('reviewId');
  const delta = parseInt(formData.get('delta'), 10);
  if (isNaN(delta) || delta === 0) return;
  await connectDB();
  await Review.findByIdAndUpdate(id, { $inc: { priority: delta } });
  revalidatePath('/', 'layout');
}
