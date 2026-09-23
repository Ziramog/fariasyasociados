import { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    whatsapp: {
      type: String,
    },
    roles: [{
      type: String,
      enum: ['comprador', 'propietario', 'inversor', 'inquilino'],
    }],
    source: {
      type: String,
      default: 'Manual',
    },
    tags: [{
      type: String,
    }],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = models.Contact || model('Contact', ContactSchema);

export default Contact;
