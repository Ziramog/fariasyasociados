import connectDB from '@/config/database';
import Review from '@/models/Review';
import BusinessInfo from '@/models/BusinessInfo';
import ReviewsCarousel from '@/components/ReviewsCarousel';

export default async function ReviewsSection() {
  if (!process.env.MONGODB_URI) return null;

  let reviews = [];
  let businessInfo = null;
  try {
    await connectDB();
    [reviews, businessInfo] = await Promise.all([
      Review.find({
        featured: true,
        hidden: false,
        authorPhoto: { $ne: null, $ne: "" }
      })
        .sort({ priority: -1, publishTime: -1 })
        .limit(8)
        .lean(),
      BusinessInfo.findOne({}).lean(),
    ]);
  } catch (error) {
    console.log('[reviews-section] DB unavailable:', error.message);
    return null;
  }

  if (reviews.length === 0) return null;

  const serialized = reviews.map(r => ({
    id: r._id.toString(),
    googlePlaceId: r.googlePlaceId,
    authorName: r.authorName,
    authorPhoto: r.authorPhoto,
    rating: r.rating,
    text: r.text,
    relativeTimeDescription: r.relativeTimeDescription,
    publishTime: r.publishTime.toISOString(),
    featured: r.featured,
    priority: r.priority,
  }));

  const googleRating = businessInfo?.overallRating || null;
  const totalRatings = businessInfo?.totalUserRatings || null;

  return (
    <ReviewsCarousel
      reviews={serialized}
      googleRating={googleRating}
      totalRatings={totalRatings}
    />
  );
}