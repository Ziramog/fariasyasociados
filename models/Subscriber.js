import { Schema, model, models } from 'mongoose';

const SubscriberSchema = new Schema(
  {
    whatsappNumber: {
      type: String,
      required: [true, 'El número de WhatsApp es requerido'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber = models.Subscriber || model('Subscriber', SubscriberSchema);

export default Subscriber;
