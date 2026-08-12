'use server';
import connectDB from '@/config/database';
import Quote from '@/models/Quote';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function updateQuoteStatus(quoteId, status) {
  await connectDB();

  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    throw new Error('User ID is required');
  }

  const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Estado inválido');
  }

  await Quote.findByIdAndUpdate(quoteId, { status });

  revalidatePath('/admin/quotes');
}

export default updateQuoteStatus;
