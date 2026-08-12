'use server';
import connectDB from '@/config/database';
import Property from '@/models/Property';

async function getPropertyCount() {
  if (!process.env.MONGODB_URI) return 0;

  try {
    await connectDB();
    return await Property.countDocuments({ is_published: { $ne: false } });
  } catch (err) {
    console.error('[getPropertyCount] Error:', err.message);
    return 0;
  }
}

export default getPropertyCount;
