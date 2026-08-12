
import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import BusinessInfo from '@/models/BusinessInfo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const featuredOnly = searchParams.get('featured') === 'true';

  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        reviews: [],
        summary: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          googleOverallRating: null,
          totalUserRatings: null,
          lastUpdated: new Date().toISOString(),
        },
      }, { status: 200 });
    }

    await connectDB();

    const query = { hidden: false };
    if (featuredOnly) query.featured = true;

    const limit = Math.min(parseInt(limitParam || '20', 10), 50);

    const [reviews, allReviews, businessInfo] = await Promise.all([
      Review.find(query).sort({ priority: -1, publishTime: -1 }).limit(limit).lean(),
      Review.find({ hidden: false }).select('rating').lean(),
      BusinessInfo.findOne({}).lean(),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    for (const r of allReviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      ratingSum += r.rating;
    }

    const dbAverage = allReviews.length > 0 ? Math.round((ratingSum / allReviews.length) * 10) / 10 : 0;

    const summary = {
      totalReviews: allReviews.length,
      averageRating: businessInfo?.overallRating || dbAverage,
      ratingDistribution: distribution,
      googleOverallRating: businessInfo?.overallRating,
      totalUserRatings: businessInfo?.totalUserRatings,
      lastUpdated: new Date().toISOString(),
    };

    const reviewsDTO = reviews.map(r => ({
      id: r._id.toString(),
      authorName: r.authorName,
      authorPhoto: r.authorPhoto,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relativeTimeDescription,
      publishTime: r.publishTime.toISOString(),
      featured: r.featured,
      priority: r.priority,
    }));

    return NextResponse.json({ reviews: reviewsDTO, summary }, {
      status: 200,
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[API/reviews] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
