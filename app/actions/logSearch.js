'use server';
import connectDB from '@/config/database';
import SearchTerm from '@/models/SearchTerm';

async function logSearch(term) {
  if (!term || typeof term !== 'string' || term.trim().length < 2) return;
  if (!process.env.MONGODB_URI) return;

  try {
    await connectDB();
    await SearchTerm.findOneAndUpdate(
      { term: term.trim().toLowerCase() },
      {
        $inc: { count: 1 },
        $set: { lastSearched: new Date() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[logSearch] Error:', err.message);
  }
}

export default logSearch;
