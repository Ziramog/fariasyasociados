import { Schema, model, models } from 'mongoose';

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD', enum: ['USD', 'U$D', '$', 'ARS'] },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'cancelled'],
      default: 'pending',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'pro',
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
    periodStart: { type: Date },
    periodEnd: { type: Date },
  },
  { timestamps: true }
);

const Payment = models.Payment || model('Payment', PaymentSchema);

export default Payment;
