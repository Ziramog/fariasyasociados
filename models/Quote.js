import { Schema, model, models } from 'mongoose';

const QuoteSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    client: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'U$D', enum: ['U$D', '$'] },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
    validUntil: { type: Date },
    notes: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Quote = models.Quote || model('Quote', QuoteSchema);

export default Quote;
