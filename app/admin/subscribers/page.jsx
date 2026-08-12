export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Comunidad WhatsApp',
  robots: { index: false, follow: false },
};

import connectDB from '@/config/database';
import Subscriber from '@/models/Subscriber';
import SiteConfig from '@/models/SiteConfig';
import SubscribersClient from './SubscribersClient';

const AdminSubscribersPage = async () => {
  await connectDB();

  // Fetch config
  const config = await SiteConfig.findOne({}).lean();
  const initialLink = config?.whatsappGroupLink || '';

  // Fetch subscribers (sort by newest first)
  const rawSubscribers = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize ObjectId to string so it can be passed to the Client Component
  const subscribers = rawSubscribers.map(sub => ({
    ...sub,
    _id: sub._id.toString(),
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  }));

  return (
    <SubscribersClient initialLink={initialLink} subscribers={subscribers} />
  );
};

export default AdminSubscribersPage;
