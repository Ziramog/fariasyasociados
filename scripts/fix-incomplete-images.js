require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pLimit = require('p-limit');

const limit = pLimit(2); // Reduced concurrency for stability

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const allProps = await Property.find({}).lean();
  
  const lowImgs = allProps.filter(p => !p.images || p.images.length < 5);
  console.log(`Found ${lowImgs.length} properties with less than 5 images. Processing...`);

  const promises = lowImgs.map(doc => limit(async () => {
    // Find manifest item via substring match (since titles might be slightly different in DB)
    const shortName = doc.name.split(',')[0].trim();
    let manifestItem = manifest.find(m => m.title === doc.name);
    if (!manifestItem) manifestItem = manifest.find(m => m.title.includes(shortName));
    
    if (!manifestItem) {
      console.log(`Skipping ${doc.name} - not found in manifest.`);
      return;
    }
    
    try {
      const res = await fetch(manifestItem.legacyUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      $('.property-similar, .similar-properties, .widget, .sidebar, footer, .footer, .image-with-label').remove();
      
      let allowedUrls = [];
      $('.header_slider_container img, #property-detail-large-slider img, .property-detail-slider img, img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('facebook') && !src.includes('google')) {
          const cleanSrc = src.split('?')[0];
          if (cleanSrc.match(/\.(jpeg|jpg|png|webp)$/i) && !allowedUrls.includes(cleanSrc)) {
            allowedUrls.push(cleanSrc);
          }
        }
      });
      
      console.log(`${doc.name}: Found ${allowedUrls.length} valid images on legacy site.`);
      
      if (allowedUrls.length > 0) {
        const cloudinaryUrls = [];
        for (let i = 0; i < allowedUrls.length; i++) {
          const url = allowedUrls[i];
          console.log(`[${doc.name}] Uploading ${i+1}/${allowedUrls.length}: ${url}`);
          try {
            const slug = doc._id.toString();
            const folderPath = `roggero-roma/properties/${slug}`;
            const uploadRes = await cloudinary.uploader.upload(url, { folder: folderPath });
            cloudinaryUrls.push({ url: uploadRes.secure_url, public_id: uploadRes.public_id });
          } catch (e) {
            console.error(`[${doc.name}] Failed to upload ${url}: ${e.message}`);
          }
        }
        
        if (cloudinaryUrls.length > 0) {
          await Property.updateOne({ _id: doc._id }, { $set: { images: cloudinaryUrls } });
          console.log(`Successfully updated images for: ${doc.name}`);
        }
      }
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  console.log('\nAll done processing incomplete image properties!');
  mongoose.disconnect();
}

run().catch(console.error);
