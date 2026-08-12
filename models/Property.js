import { Schema, model, models } from 'mongoose';

const PropertySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipcode: {
        type: String,
      },
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    beds: {
      type: Number,
    },
    baths: {
      type: Number,
    },
    square_feet: {
      type: Number,
    },
    amenities: [
      {
        type: String,
      },
    ],
    rates: {
      nightly: {
        type: Number,
      },
      weekly: {
        type: Number,
      },
      monthly: {
        type: Number,
      },
    },
    seller_info: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_published: {
      type: Boolean,
      default: true,
    },
    covered_area: {
      type: Number,
    },
    garage: {
      type: Number,
    },
    services: [
      {
        type: String,
      },
    ],
    titles_status: {
      type: String,
    },
    interior: {
      aberturas: String,
      pisos: String,
      calefaccion: String,
    },
    exterior: {
      techos: String,
    },
    price: {
      type: String,
    },
    normalizedDescription: {
      resumen: { type: String },
      ubicacion: { type: String },
      detalles: [{ type: String }],
      highlights: [{ type: String }],
      nota: { type: String, default: null },
    },
    operation: {
      type: String,
      enum: ['compra', 'venta', 'alquiler'],
    },
    status: {
      type: String,
      default: 'active',
    },
    badgeExpiresAt: {
      type: Date,
      default: null,
    },
    property_type: {
      type: String,
      enum: ['residential', 'multi_family', 'land', 'commercial', 'rental', 'industrial'],
    },
  },
  {
    timestamps: true,
  }
);

const Property = models.Property || model('Property', PropertySchema);

export default Property;
