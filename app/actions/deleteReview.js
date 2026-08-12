'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import { revalidatePath } from 'next/cache';

export default async function deleteReview(formData) {
  const id = formData.get('reviewId');
  if (!id) return;
  await connectDB();
  await Review.findByIdAndDelete(id);
  revalidatePath('/', 'layout');
}
