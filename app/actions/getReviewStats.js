'use server';
import connectDB from '@/config/database';
import Review from '@/models/Review';

async function getReviewStats() {
  if (!process.env.MONGODB_URI) return { count: 0, average: 5 };

  try {
    await connectDB();
    const reviews = await Review.find({ hidden: false });
    const count = reviews.length;
    if (count === 0) return { count: 0, average: 5 };
    
    const sum = reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0);
    let average = sum / count;
    if (average > 5) average = 5;
    
    return { count, average };
  } catch (err) {
    console.error('[getReviewStats] Error:', err.message);
    return { count: 0, average: 5 };
  }
}

export default getReviewStats;
