import crypto from 'crypto';

export function deriveReviewId(review) {
  const seed = `${review.author_url || review.author_name}::${review.time}`;
  return crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
}

export function transformGoogleReview(review, googlePlaceId) {
  const reviewId = deriveReviewId(review);

  return {
    googlePlaceId,
    reviewId,
    authorName: review.author_name || 'Anónimo',
    authorPhoto: review.profile_photo_url || null,
    authorUri: review.author_url || null,
    rating: review.rating,
    text: review.text || null,
    textOriginalLanguage: review.language || null,
    publishTime: new Date(review.time * 1000),
    relativeTimeDescription: review.relative_time_description || '',
    googleUpdatedAt: new Date(review.time * 1000),
    featured: false,
    hidden: false,
    priority: 0,
  };
}
