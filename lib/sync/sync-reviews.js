import connectDB from '@/config/database';
import Review from '@/models/Review';
import BusinessInfo from '@/models/BusinessInfo';
import { fetchPlaceReviews } from '@/lib/google/places-client';
import { transformGoogleReview } from '@/lib/google/transformer';

async function findAndRemoveDuplicates(googlePlaceId) {
  const reviews = await Review.find({ googlePlaceId }).lean();
  const seen = new Map();
  const idsToRemove = [];

  const normalize = (s) => (s || '').toLowerCase().trim().replace(/[\s.,;:!?]+/g, ' ').trim();

  for (const r of reviews) {
    const normText = normalize(r.text);
    const normAuthor = normalize(r.authorName);
    const key = `${normAuthor}|${r.rating}|${normText.substring(0, 60)}`;
    if (seen.has(key)) {
      const prev = seen.get(key);
      if ((r.lastSeenAt || r.firstSeenAt) > (prev.lastSeenAt || prev.firstSeenAt)) {
        idsToRemove.push(prev._id);
        seen.set(key, r);
      } else {
        idsToRemove.push(r._id);
      }
    } else {
      seen.set(key, r);
    }
  }

  if (idsToRemove.length > 0) {
    await Review.deleteMany({ _id: { $in: idsToRemove } });
  }

  return idsToRemove.length;
}

export async function syncReviews() {
  const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJo00-jbBQLZQRpkMte_gAehk';

  if (!GOOGLE_PLACE_ID) {
    return { success: false, error: 'GOOGLE_PLACE_ID no configurado. Verificá las variables de entorno en Vercel.' };
  }

  await connectDB();

  const start = Date.now();
  let result = { inserted: 0, updated: 0, unchanged: 0, errors: [], durationMs: 0 };

  try {
    const { reviews, name, overallRating, totalRatings } = await fetchPlaceReviews(GOOGLE_PLACE_ID);

    // Save overall business info from Google
    await BusinessInfo.findOneAndUpdate(
      { googlePlaceId: GOOGLE_PLACE_ID },
      { googleName: name, overallRating, totalUserRatings: totalRatings, lastSyncAt: new Date() },
      { upsert: true }
    );

for (const googleReview of reviews) {
      try {
        const reviewData = transformGoogleReview(googleReview, GOOGLE_PLACE_ID);
        let existing = await Review.findOne({ googlePlaceId: GOOGLE_PLACE_ID, reviewId: reviewData.reviewId }).lean();

        if (!existing) {
          const normalizedText = (reviewData.text || '').toLowerCase().trim().replace(/\s+/g, ' ');
          if (reviewData.authorName && normalizedText.length > 10) {
            existing = await Review.findOne({
              googlePlaceId: GOOGLE_PLACE_ID,
              authorName: new RegExp('^' + reviewData.authorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'),
              rating: reviewData.rating,
            }).lean();
            if (existing) {
              const existingText = (existing.text || '').toLowerCase().trim().replace(/\s+/g, ' ');
              if (existingText !== normalizedText && Math.abs(existingText.length - normalizedText.length) > normalizedText.length * 0.3) {
                existing = null;
              }
            }
          }
        }

        if (!existing) {
          await Review.create({
            ...reviewData,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          });
          result.inserted++;
        } else {
          const hasChanged =
            existing.rating !== reviewData.rating ||
            existing.text !== reviewData.text;
          if (hasChanged) {
            await Review.findOneAndUpdate(
              { googlePlaceId: GOOGLE_PLACE_ID, reviewId: reviewData.reviewId },
              { $set: { rating: reviewData.rating, text: reviewData.text, relativeTimeDescription: reviewData.relativeTimeDescription, googleUpdatedAt: reviewData.googleUpdatedAt, lastSeenAt: new Date() } }
            );
            result.updated++;
          } else {
            await Review.findOneAndUpdate(
              { googlePlaceId: GOOGLE_PLACE_ID, reviewId: reviewData.reviewId },
              { $set: { lastSeenAt: new Date() } }
            );
            result.unchanged++;
          }
        }
      } catch (reviewError) {
        result.errors.push(reviewError.message);
      }
    }

    const duplicates = await findAndRemoveDuplicates(GOOGLE_PLACE_ID);
    result.duplicatesRemoved = duplicates;

    result.durationMs = Date.now() - start;
    return { ...result, name, overallRating, totalRatings, success: true };
  } catch (error) {
    result.durationMs = Date.now() - start;
    result.errors.push(error.message);
    return { ...result, success: false, error: error.message };
  }
}
