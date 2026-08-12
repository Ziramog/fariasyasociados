require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const pName = 'La Bolsa, Av. Los Aromos, Se vende hermoso lote de 1000 con bajada privada al Rio Anisacate';
  const manifestItem = manifest.find(m => m.title === pName);
  
  const doc = await Property.findOne({ name: pName });
  
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

  console.log(`Found ${allowedUrls.length} valid images for La Bolsa`);
  
  const cloudinaryUrls = [];
  for (let i = 0; i < allowedUrls.length; i++) {
    const url = allowedUrls[i];
    console.log(`Uploading ${i+1}/${allowedUrls.length}: ${url}`);
    try {
      const slug = doc._id.toString();
      const folderPath = `roggero-roma/properties/${slug}`;
      const uploadRes = await cloudinary.uploader.upload(url, { folder: folderPath });
      cloudinaryUrls.push({ url: uploadRes.secure_url, public_id: uploadRes.public_id });
    } catch (e) {
      console.error(`Failed to upload ${url}: ${e.message}`);
    }
  }
  
  if (cloudinaryUrls.length > 0) {
    await Property.updateOne({ _id: doc._id }, { $set: { images: cloudinaryUrls } });
    console.log('Successfully updated property images in DB.');
  } else {
    console.log('No valid images to update.');
  }

  mongoose.disconnect();
}
run().catch(console.error);
