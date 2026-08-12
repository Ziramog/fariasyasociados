'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import { revalidatePath } from 'next/cache';

export default async function toggleReviewHidden(formData) {
  const id = formData.get('reviewId');
  const current = formData.get('current') === 'true';
  await connectDB();
  await Review.findByIdAndUpdate(id, { hidden: !current });
  revalidatePath('/', 'layout');
}
