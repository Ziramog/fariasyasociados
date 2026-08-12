'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

async function checkBookmarkStatus(propertyId) {
  await connectDB();

  const sessionUser = await getSessionUser();

  if (!sessionUser || !sessionUser.userId) {
    return { error: 'User ID is required', isBookmarked: false };
  }

  const { userId } = sessionUser;

  const user = await User.findById(userId);

  if (!user) {
    return { error: 'User not found', isBookmarked: false };
  }

  const isBookmarked = user.bookmarks.some(
    (bookmark) => bookmark.toString() === propertyId
  );

  return { isBookmarked };
}

export default checkBookmarkStatus;
