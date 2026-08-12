'use server';
import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

export async function updateQuotationStatus(quotationId, status) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.userId) {
      throw new Error('No autorizado');
    }

    const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido');
    }

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new Error('Cotización no encontrada');
    }

    quotation.status = status;
    await quotation.save();
    
    revalidatePath('/admin/quotations');
    
    return { success: true };
  } catch (error) {
    console.error('Error updateQuotationStatus:', error);
    return { error: error.message };
  }
}
