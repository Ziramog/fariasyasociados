import { Schema, model, models } from 'mongoose';

const BusinessInfoSchema = new Schema({
  googlePlaceId: { type: String, unique: true, required: true },
  googleName: { type: String, default: '' },
  overallRating: { type: Number, default: null },
  totalUserRatings: { type: Number, default: null },
  lastSyncAt: { type: Date, default: null },
}, { timestamps: true });

const BusinessInfo = models.BusinessInfo || model('BusinessInfo', BusinessInfoSchema);
export default BusinessInfo;
