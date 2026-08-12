'use server';
import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

export async function deleteQuotation(quotationId) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.userId) {
      throw new Error('No autorizado');
    }

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new Error('Cotización no encontrada');
    }

    // Opcional: Permitir borrar solo si es el dueño o admin
    // if (quotation.createdBy.toString() !== sessionUser.userId) {
    //   throw new Error('No autorizado para eliminar esta cotización');
    // }

    await quotation.deleteOne();
    revalidatePath('/admin/quotations');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleteQuotation:', error);
    return { error: error.message };
  }
}
