'use server';
import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

export async function getUserAICredits() {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'No autorizado' };
    }

    const user = await User.findById(sessionUser.userId).lean();
    if (!user) {
      return { error: 'Usuario no encontrado' };
    }

    return { credits: user.ai_credits ?? 0 };
  } catch (error) {
    console.error('Error fetching AI credits:', error);
    return { error: 'Error interno' };
  }
}
