'use server';
import connectDB from '@/config/database';
import Quote from '@/models/Quote';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function deleteQuote(quoteId) {
  await connectDB();

  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    throw new Error('User ID is required');
  }

  await Quote.findByIdAndDelete(quoteId);

  revalidatePath('/admin/quotes');
}

export default deleteQuote;
