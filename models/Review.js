import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    googlePlaceId: { type: String, required: true },
    reviewId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: null },
    authorUri: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: null },
    textOriginalLanguage: { type: String, default: null },
    publishTime: { type: Date, required: true },
    relativeTimeDescription: { type: String, default: '' },
    googleUpdatedAt: { type: Date, required: true },
    featured: { type: Boolean, default: false, index: true },
    hidden: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReviewSchema.index({ googlePlaceId: 1, reviewId: 1 }, { unique: true });
ReviewSchema.index({ hidden: 1, publishTime: -1 });
ReviewSchema.index({ featured: 1, priority: -1 });

const Review = models.Review || model('Review', ReviewSchema);
export default Review;
