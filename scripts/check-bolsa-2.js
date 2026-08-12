require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  const pName = 'La Bolsa, Av. Los Aromos, Se vende hermoso lote de 1000 con bajada privada al Rio Anisacate';
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const manifestItem = manifest.find(m => m.title.includes('La Bolsa, Av. Los Aromos'));
  
  console.log('Manifest:', manifestItem.title);
  
  const doc = await Property.findOne({ name: pName });
  if (!doc) return console.log('Doc not found in DB');
  
  console.log('Doc found:', doc.name);
  
  // Try exact match like the script did
  const exactManifestItem = manifest.find(m => m.title === doc.name);
  console.log('Exact Manifest match:', exactManifestItem ? 'Yes' : 'No');
  
  mongoose.disconnect();
}
run();
