'use server';
import connectDB from '@/config/database';
import Quote from '@/models/Quote';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function addQuote(formData) {
  await connectDB();

  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    throw new Error('User ID is required');
  }

  const { userId } = sessionUser;

  const property = formData.get('property');
  const clientName = formData.get('clientName');
  const clientEmail = formData.get('clientEmail') || '';
  const clientPhone = formData.get('clientPhone') || '';
  const notes = formData.get('notes') || '';
  const validUntil = formData.get('validUntil') || null;

  const descriptions = formData.getAll('itemDescription');
  const amounts = formData.getAll('itemAmount');
  const currencies = formData.getAll('itemCurrency');

  const items = [];
  let totalAmount = 0;

  for (let i = 0; i < descriptions.length; i++) {
    const amount = parseFloat(amounts[i]) || 0;
    if (descriptions[i] && amount > 0) {
      items.push({
        description: descriptions[i],
        amount,
        currency: currencies[i] || 'U$D',
      });
      totalAmount += amount;
    }
  }

  if (!property || !clientName || items.length === 0) {
    throw new Error('Faltan datos requeridos');
  }

  await Quote.create({
    property,
    client: {
      name: clientName,
      email: clientEmail || undefined,
      phone: clientPhone || undefined,
    },
    items,
    totalAmount,
    notes: notes || undefined,
    validUntil: validUntil || undefined,
    createdBy: userId,
  });

  revalidatePath('/admin/quotes');
  redirect('/admin/quotes');
}

export default addQuote;
