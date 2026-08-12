'use server';

import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';
import { revalidatePath } from 'next/cache';

const cleanNumber = (val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = parseFloat(val);
  return isNaN(num) ? undefined : num;
};

async function updateProperty(prevState, formData) {
  const propertyId = formData.get('propertyId');

  if (!propertyId) {
    return { error: 'Falta el ID de la propiedad.' };
  }

  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return { error: 'Debes iniciar sesión para editar una propiedad.' };
    }

    const { userId } = sessionUser;

    const prop = await Property.findById(propertyId);

    if (!prop) {
      return { error: 'Propiedad no encontrada.' };
    }

    const removedImages = formData.getAll('removedImages').filter(Boolean);
    const getImageUrl = (img) => (typeof img === 'string' ? img : img?.url);

    // Destroy removed images from Cloudinary
    for (const removedUrl of removedImages) {
      const entry = (prop.images || []).find((img) => getImageUrl(img) === removedUrl);
      const pid = typeof entry === 'object' ? entry?.public_id : null;
      if (pid) {
        try {
          await cloudinary.uploader.destroy(pid);
        } catch (e) {
          console.error('Cloudinary destroy failed:', e.message);
        }
      }
    }

    let currentImages = (prop.images || []).filter(
      (img) => !removedImages.includes(getImageUrl(img))
    );

    const orderedImagesList = formData.getAll('orderedImages').filter(Boolean);
    if (orderedImagesList.length > 0) {
      currentImages.sort((a, b) => {
        const indexA = orderedImagesList.indexOf(getImageUrl(a));
        const indexB = orderedImagesList.indexOf(getImageUrl(b));
        const posA = indexA === -1 ? 999 : indexA;
        const posB = indexB === -1 ? 999 : indexB;
        return posA - posB;
      });
    }

    const uploadedImagesJson = formData.getAll('uploadedImages');
    
    if (uploadedImagesJson && uploadedImagesJson.length > 0) {
      try {
        const newUploadedImages = uploadedImagesJson.map(jsonStr => JSON.parse(jsonStr));
        currentImages = [...currentImages, ...newUploadedImages];
      } catch (err) {
        console.error("Error parsing uploaded images JSON", err);
        return { error: 'Error al procesar las imágenes subidas.' };
      }
    }

    if (currentImages.length === 0) {
      return { error: 'Es necesario mantener al menos una foto de la propiedad.' };
    }

    let lat = formData.get('coordinates.lat');
    let lng = formData.get('coordinates.lng');
    const amenities = formData.getAll('amenities');

    let parsedLat = undefined;
    let parsedLng = undefined;

    if (lat && lng) {
      lat = lat.replace(',', '.');
      lng = lng.replace(',', '.');
      const tempLat = parseFloat(lat);
      const tempLng = parseFloat(lng);
      
      // Valida rangos: latitud de -90 a 90, longitud de -180 a 180
      if (!isNaN(tempLat) && !isNaN(tempLng) && tempLat >= -90 && tempLat <= 90 && tempLng >= -180 && tempLng <= 180) {
        parsedLat = tempLat;
        parsedLng = tempLng;
      }
    }

    prop.set({
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('operation') === 'alquiler' || formData.get('price') === 'Consultar' || !formData.get('price') ? 'Consultar' : `${formData.get('price_currency') || 'USD'} ${formData.get('price')}`,
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      coordinates: (parsedLat !== undefined && parsedLng !== undefined) ? {
        lat: parsedLat,
        lng: parsedLng,
      } : undefined,
      beds: formData.get('beds') || undefined,
      baths: formData.get('baths') || undefined,
      square_feet: formData.get('square_feet') || undefined,
      covered_area: formData.get('covered_area') || undefined,
      amenities,
      owner: userId,
      operation: formData.get('operation'),
      status: formData.get('status'),
      images: currentImages,
    });

    if (prop.status === 'NUEVA' && formData.get('badgeExpiresAt')) {
      const dateStr = formData.get('badgeExpiresAt');
      const dateObj = new Date(`${dateStr}T23:59:59.999-03:00`);
      if (!isNaN(dateObj.getTime())) {
        prop.badgeExpiresAt = dateObj;
      } else {
        prop.badgeExpiresAt = null;
      }
    } else {
      prop.badgeExpiresAt = null;
    }

    await prop.save();

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/admin/properties');

    return { success: true, redirected: `/admin/properties` };
  } catch (err) {
    console.error('[updateProperty] Error:', err);
    const message = (err && typeof err.message === 'string') ? err.message : JSON.stringify(err);
    return { error: `[${err.constructor?.name || 'Error'}] ${message}` };
  }
}

export default updateProperty;