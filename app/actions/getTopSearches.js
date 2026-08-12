'use server';
import connectDB from '@/config/database';
import SearchTerm from '@/models/SearchTerm';

async function getTopSearches(limit = 3) {
  if (!process.env.MONGODB_URI) return [];

  try {
    await connectDB();
    const results = await SearchTerm.find({})
      .sort({ count: -1 })
      .limit(limit)
      .lean();

    return results.map((r) => ({
      term: r.term,
      count: r.count,
    }));
  } catch (err) {
    console.error('[getTopSearches] Error:', err.message);
    return [];
  }
}

export default getTopSearches;
