import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/utils/isAdmin';

export async function POST(request) {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await request.json();

    const property = await Property.findById(id);
    if (!property) {
      return new Response('Property not found', { status: 404 });
    }

    // Si la propiedad no tiene is_published definido, es true por defecto
    const currentVal = property.is_published !== undefined ? property.is_published : true;
    property.is_published = !currentVal;
    
    await property.save();

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath(`/properties/${id}`);
    revalidatePath('/admin/properties');

    return NextResponse.json({ 
      success: true, 
      is_published: property.is_published 
    });

  } catch (error) {
    console.error('Error in toggle-published:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
