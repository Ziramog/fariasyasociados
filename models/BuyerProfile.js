import { Schema, model, models } from 'mongoose';

const BuyerProfileSchema = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    operation: {
      type: String,
      enum: ['venta', 'alquiler'],
    },
    propertyTypes: [{
      type: String,
    }],
    priceMin: {
      type: Number,
    },
    priceMax: {
      type: Number,
    },
    currency: {
      type: String,
      enum: ['USD', 'ARS'],
      default: 'USD',
    },
    locations: [{
      type: String,
    }],
    minBeds: {
      type: Number,
    },
    minBaths: {
      type: Number,
    },
    minCoveredArea: {
      type: Number,
    },
    minTotalArea: {
      type: Number,
    },
    features: [{
      type: String,
    }],
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

const BuyerProfile = models.BuyerProfile || model('BuyerProfile', BuyerProfileSchema);

export default BuyerProfile;
