import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const schema = new mongoose.Schema({
  heroTitle: String,
  heroSubtitle: String
}, { strict: false });

const SiteConfig = mongoose.model('SiteConfig', schema);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await SiteConfig.findOneAndUpdate({}, {
    heroTitle: 'Vendemos Inmuebles, Construimos Confianza',
    heroSubtitle: 'Alta Gracia, Córdoba, Argentina'
  }, { new: true, upsert: true });
  console.log('DB Updated!');
  process.exit(0);
};

run().catch(console.error);
