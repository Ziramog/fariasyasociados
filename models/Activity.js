import { Schema, model, models } from 'mongoose';

const ActivitySchema = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
    },
    type: {
      type: String,
      enum: ['call', 'whatsapp', 'email', 'visit', 'note', 'meeting', 'other'],
      required: true,
    },
    outcome: {
      type: String,
    },
    notes: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Activity = models.Activity || model('Activity', ActivitySchema);

export default Activity;
