export const isAdmin = (sessionUser) => {
  return sessionUser?.role === 'admin' || sessionUser?.role === 'superadmin';
};
