require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pLimit = require('p-limit');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const limit = pLimit(5);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const allProps = await Property.find({}).lean();
  
  for (const doc of allProps) {
    const manifestItem = manifest.find(m => m.title === doc.name);
    if (!manifestItem) continue;
    
    try {
      console.log(`\nProcessing: ${doc.name}`);
      
      const res = await fetch(manifestItem.legacyUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      $('.property-similar, .similar-properties, .widget, .sidebar, footer, .footer, .image-with-label').remove();
      
      const allowedUrls = [];
      $('.header_slider_container img, #property-detail-large-slider img, .property-detail-slider img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('facebook') && !src.includes('google')) {
          const cleanSrc = src.split('?')[0];
          if (cleanSrc.match(/\.(jpeg|jpg|png|webp)$/i) && !allowedUrls.includes(cleanSrc)) {
            allowedUrls.push(cleanSrc);
          }
        }
      });
      
      if (allowedUrls.length === 0) {
        console.log('No valid images found for this property!');
        continue;
      }
      
      console.log(`Uploading ${allowedUrls.length} valid images...`);
      
      const slug = doc.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const folderName = `roggero-roma/properties/${doc._id}-${slug}`;
      
      const uploadPromises = allowedUrls.map((url) => 
        limit(async () => {
          try {
            const result = await cloudinary.uploader.upload(url, { folder: folderName });
            return { url: result.secure_url, public_id: result.public_id };
          } catch (e) {
            console.error(`Failed to upload ${url}: ${e.message}`);
            return null;
          }
        })
      );
      
      const uploadedImages = await Promise.all(uploadPromises);
      const validUploads = uploadedImages.filter(img => img !== null);
      
      await Property.updateOne({ _id: doc._id }, { $set: { images: validUploads } });
      
      console.log(`Successfully saved ${validUploads.length} images to MongoDB for ${doc.name}`);
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }
  
  console.log('All image recovery complete.');
  mongoose.disconnect();
}

run().catch(console.error);
