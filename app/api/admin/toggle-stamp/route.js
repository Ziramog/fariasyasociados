import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { isAdmin } from '@/utils/isAdmin';
import { STAMP_STATUSES } from '@/utils/propertyDisplay';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, stamp } = await request.json();
    if (!id || !STAMP_STATUSES.includes(stamp)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    await connectDB();
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    property.status = property.status === stamp ? 'active' : stamp;
    property.badgeExpiresAt = null;
    await property.save();

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath(`/properties/${id}`);
    revalidatePath('/admin/properties');

    return NextResponse.json({
      success: true,
      status: property.status,
    });
  } catch (error) {
    console.error('Error in toggle-stamp:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
