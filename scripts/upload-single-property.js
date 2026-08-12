const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const matchedImagesDir = 'F:\\RoggeroyRoma Backup\\Matched Images';

async function uploadSingleProperty() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  // Find the specific property
  const properties = await Property.find({ name: { $regex: 'Lote de 877 m2 con vista a las sierras en B° El Golf' } }).lean();
  
  if (!properties || properties.length === 0) {
    console.error('Property not found in DB!');
    process.exit(1);
  }
  
  const prop = properties[0];
  console.log(`Found Property: ${prop.name} (Images: ${prop.images?.length || 0})`);
  
  if (!prop.images || !prop.images.length) {
    console.error('No images found for this property in DB.');
    process.exit(1);
  }

  let uploadedCount = 0;
  const existingFiles = fs.readdirSync(matchedImagesDir);

  for (const img of prop.images) {
    if (!img.public_id) continue;
    
    // safe name logic we used in match-images
    const safeNameBase = img.public_id.replace(/\//g, '_');
    
    // Find the file in the Matched Images folder
    const fileToUpload = existingFiles.find(f => f.startsWith(safeNameBase));
    
    if (fileToUpload) {
      const fullPath = path.join(matchedImagesDir, fileToUpload);
      console.log(`Uploading ${fileToUpload} to Cloudinary as ${img.public_id}...`);
      
      try {
        const result = await cloudinary.uploader.upload(fullPath, {
          public_id: img.public_id, // keep the exact same ID so DB links work
          overwrite: true
        });
        console.log(`[Success] Uploaded to Cloudinary: ${result.secure_url}`);
        uploadedCount++;
      } catch (error) {
        console.error(`[Error] Failed to upload ${fileToUpload}:`, error);
      }
    } else {
      console.log(`[Skip] Could not find matched image for ${img.public_id} locally.`);
    }
  }

  console.log(`\n✅ Finished uploading ${uploadedCount} images for this property.`);
  process.exit(0);
}

uploadSingleProperty().catch(console.error);
