'use server';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';
import cloudinary from '@/config/cloudinary';

async function addProperty(prevState, formData) {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return { error: 'Debes iniciar sesión para agregar una propiedad.' };
    }

    const { userId } = sessionUser;

    // Access all values for amenities
    const amenities = formData.getAll('amenities');

    let lat = formData.get('coordinates.lat');
    let lng = formData.get('coordinates.lng');

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

    // Create the propertyData object with embedded seller_info
    const propertyData = {
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
      operation: formData.get('operation') || 'venta',
      status: formData.get('status') || 'active',
    };

    if (propertyData.status === 'NUEVA' && formData.get('badgeExpiresAt')) {
      const dateStr = formData.get('badgeExpiresAt');
      const dateObj = new Date(`${dateStr}T23:59:59.999-03:00`);
      if (!isNaN(dateObj.getTime())) {
        propertyData.badgeExpiresAt = dateObj;
      }
    }

    // Retrieve pre-uploaded image data from the client
    const uploadedImagesJson = formData.getAll('uploadedImages');
    let imageUrls = [];
    
    if (uploadedImagesJson && uploadedImagesJson.length > 0) {
      try {
        imageUrls = uploadedImagesJson.map(jsonStr => JSON.parse(jsonStr));
      } catch (err) {
        console.error("Error parsing uploaded images JSON", err);
        return { error: 'Error al procesar las imágenes subidas.' };
      }
    }

    if (imageUrls.length === 0) {
      const keys = Array.from(formData.keys()).join(', ');
      return { error: `Es necesario agregar al menos una foto de la propiedad. (Debug keys: ${keys})` };
    }
    if (imageUrls.length > 30) {
      return { error: 'Máximo 30 imágenes por propiedad.' };
    }

    propertyData.images = imageUrls;

    const newProperty = new Property(propertyData);
    await newProperty.save();

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath('/admin/properties');

    return { success: true, redirected: `/admin/properties` };
  } catch (error) {
    console.error('Failed to add property:', error);
    return { error: error.message || 'Error al agregar la propiedad.' };
  }
}

export default addProperty;
