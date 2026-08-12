'use server';
import cloudinary from '@/config/cloudinary';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function deleteProperty(propertyId) {
  const sessionUser = await getSessionUser();

  // Check for session
  if (!sessionUser || !sessionUser.userId) {
    throw new Error('User ID is required');
  }

  const { userId } = sessionUser;

  await connectDB();

  const property = await Property.findById(propertyId);

  if (!property) throw new Error('Property Not Found');

  // Verify ownership or admin
  if (property.owner.toString() !== userId && sessionUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // extract public ids from image objects in DB
  const publicIds = property.images
    .filter((img) => typeof img === 'object' && img?.public_id)
    .map((img) => img.public_id);

  // Delete images from Cloudinary
  if (publicIds.length > 0) {
    for (let publicId of publicIds) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  // Proceed with property deletion
  await property.deleteOne();

  revalidatePath('/', 'layout');
}

export default deleteProperty;
