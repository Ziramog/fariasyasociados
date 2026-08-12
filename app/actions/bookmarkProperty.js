'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function bookmarkProperty(propertyId) {
  await connectDB();

  const sessionUser = await getSessionUser();

  if (!sessionUser || !sessionUser.userId) {
    return { error: 'Debes iniciar sesión', isBookmarked: false };
  }

  const { userId } = sessionUser;

  const user = await User.findById(userId);

  if (!user) {
    return { error: 'Usuario no encontrado', isBookmarked: false };
  }

  const isBookmarked = user.bookmarks.some(
    (bookmark) => bookmark.toString() === propertyId
  );

  if (isBookmarked) {
    user.bookmarks.pull(propertyId);
    await user.save();
    revalidatePath('/properties/saved', 'page');
    return { isBookmarked: false };
  } else {
    user.bookmarks.push(propertyId);
    await user.save();
    revalidatePath('/properties/saved', 'page');
    return { isBookmarked: true };
  }
}

export default bookmarkProperty;
