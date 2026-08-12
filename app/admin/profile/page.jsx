export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Perfil',
  robots: { index: false, follow: false },
};

import Image from 'next/image';
import profileDefault from '@/assets/images/profile.png';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import Payment from '@/models/Payment';
import SiteConfig from '@/models/SiteConfig';
import { getSessionUser } from '@/utils/getSessionUser';
import ProfileClient from '@/components/admin/ProfileClient';

const AdminProfilePage = async () => {
  await connectDB();

  const sessionUser = await getSessionUser();
  const { userId } = sessionUser;

  if (!userId) {
    return <div className="p-6">Error: No se pudo obtener la sesión.</div>;
  }

  const [totalProps, userProperties, payments, config] = await Promise.all([
    Property.countDocuments({}),
    Property.countDocuments({ owner: userId }),
    Payment.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    SiteConfig.findOne({}).lean(),
  ]);

  return (
    <ProfileClient
      user={{ name: sessionUser.user.name, email: sessionUser.user.email, image: sessionUser.user.image }}
      totalProps={totalProps}
      payments={JSON.parse(JSON.stringify(payments))}
      config={config ? JSON.parse(JSON.stringify(config)) : {}}
    />
  );
};

export default AdminProfilePage;