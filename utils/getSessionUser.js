import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';

export const getSessionUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[auth:getSessionUser] No session found');
    return null;
  }

  console.log('[auth:getSessionUser] Found session: id=' + session.user.id + ', role=' + session.user.role);

  return {
    user: session.user,
    userId: session.user.id,
    role: session.user.role,
  };
};
