require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const pName = 'La Bolsa, Av. Los Aromos, Se vende hermoso lote de 1000 con bajada privada al Rio Anisacate';
  const manifestItem = manifest.find(m => m.title === pName);
  
  const res = await fetch(manifestItem.legacyUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('.property-similar, .similar-properties, .widget, .sidebar, footer, .footer, .image-with-label').remove();
  
  let allowedUrls = [];
  $('.header_slider_container img, #property-detail-large-slider img, .property-detail-slider img').each((i, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('facebook') && !src.includes('google')) {
      const cleanSrc = src.split('?')[0];
      if (cleanSrc.match(/\.(jpeg|jpg|png|webp)$/i) && !allowedUrls.includes(cleanSrc)) {
        allowedUrls.push(cleanSrc);
      }
    }
  });

  console.log('Allowed URLs:', allowedUrls);
  mongoose.disconnect();
}
run();
