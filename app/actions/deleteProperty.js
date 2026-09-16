'use server';
import cloudinary from '@/config/cloudinary';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function deleteProperty(propertyId) {
  try {
    const sessionUser = await getSessionUser();

    // Check for session
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'Debes iniciar sesión para eliminar propiedades.' };
    }

    const { userId } = sessionUser;

    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) return { error: 'Propiedad no encontrada.' };

    // Verify ownership or admin
    if (property.owner.toString() !== userId && sessionUser.role !== 'admin') {
      return { error: 'No tienes permisos para eliminar esta propiedad (no eres dueño ni admin).' };
    }

    // extract public ids from image objects in DB
    const publicIds = property.images
      .filter((img) => typeof img === 'object' && img?.public_id)
      .map((img) => img.public_id);

    // Delete images from Cloudinary
    if (publicIds.length > 0) {
      for (let publicId of publicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error(`Error eliminando imagen ${publicId} de Cloudinary:`, cloudinaryError);
          // no rompemos el borrado de la propiedad si falla una imagen
        }
      }
    }

    // Proceed with property deletion
    await property.deleteOne();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    return { error: error.message || 'Error del servidor al eliminar la propiedad.' };
  }
}

export default deleteProperty;
