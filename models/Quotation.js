import { Schema, model, models } from 'mongoose';

const PropertySnapshotSchema = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', default: null },
  title: { type: String, required: true },
  address: { type: String, default: '' },
  type: { type: String, required: true },
  operation: { type: String, enum: ['venta', 'alquiler'], required: true },
  price: { type: Number, required: true },
  priceARS: { type: Number, default: null },
  surface: { type: Number, default: null },
  bedrooms: { type: Number, default: null },
  bathrooms: { type: Number, default: null },
  photos: [{ type: String }],
  listingUrl: { type: String, default: null },
  status: { type: String, default: null },
  description: { type: String, default: null },
  coveredArea: { type: Number, default: null },
  garage: { type: Number, default: null },
  services: [{ type: String }],
  titlesStatus: { type: String, default: null },
}, { _id: false });

const PaymentSchema = new Schema({
  type: { type: String, enum: ['contado', 'financiado'], default: 'contado' },
  downPaymentPct: { type: Number, default: null },
  downPayment: { type: Number, default: null },
  installments: { type: Number, default: null },
  installmentAmount: { type: Number, default: null },
  interestRate: { type: Number, default: null },
  totalPaid: { type: Number, default: null },
  totalInterest: { type: Number, default: null },
  notes: { type: String, default: null },
}, { _id: false });

const CustomizationSchema = new Schema({
  template: { type: String, enum: ['luxury', 'modern', 'minimal'], default: 'modern' },
  showAIDescription: { type: Boolean, default: false },
  aiDescription: { type: String, default: null },
  whatsappMessage: { type: String, default: null },
  agentNotes: { type: String, default: null },
  validUntil: { type: Date, default: null },
}, { _id: false });

const DeliverySchema = new Schema({
  pdfUrl: { type: String, default: null },
  pdfGeneratedAt: { type: Date, default: null },
  trackingToken: { type: String, default: null },
  openedAt: { type: Date, default: null },
  openCount: { type: Number, default: 0 },
}, { _id: false });

const QuotationSchema = new Schema({
  quoteNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft',
  },
  properties: {
    type: [PropertySnapshotSchema],
    required: true,
    validate: [v => v.length >= 1 && v.length <= 3, 'Entre 1 y 3 propiedades'],
  },
  client: {
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    dni: { type: String, default: null },
    notes: { type: String, default: null },
  },
  payment: { type: PaymentSchema, required: true },
  customization: { type: CustomizationSchema, default: () => ({}) },
  delivery: { type: DeliverySchema, default: () => ({}) },
  totalValue: { type: Number, required: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

QuotationSchema.index({ quoteNumber: 1 }, { unique: true });
QuotationSchema.index({ status: 1, createdAt: -1 });

const Quotation = models.Quotation || model('Quotation', QuotationSchema);
export default Quotation;
