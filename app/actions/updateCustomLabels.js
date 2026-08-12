'use server';

import connectDB from '@/config/database';
import SiteConfig from '@/models/SiteConfig';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function updateCustomLabels(labels) {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'Debes estar autenticado para realizar esta acción' };
    }

    if (!Array.isArray(labels)) {
      return { error: 'El formato de las etiquetas es incorrecto' };
    }

    // Since we only have one config document, we find it and update it
    let config = await SiteConfig.findOne({});
    if (!config) {
      config = new SiteConfig();
    }

    config.customPropertyLabels = labels;
    await config.save();

    revalidatePath('/admin/profile');
    revalidatePath('/admin/properties');
    revalidatePath('/admin/properties/add');

    return { success: true };
  } catch (error) {
    console.error('Error in updateCustomLabels:', error);
    return { error: 'Error al actualizar las etiquetas' };
  }
}

export default updateCustomLabels;
