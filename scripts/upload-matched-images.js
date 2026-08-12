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

async function uploadAllMatched() {
  if (!fs.existsSync(matchedImagesDir)) {
    console.error('Matched Images directory not found!');
    process.exit(1);
  }

  const files = fs.readdirSync(matchedImagesDir);
  console.log(`Found ${files.length} images to upload...`);

  let successCount = 0;
  let failCount = 0;

  // We upload sequentially to avoid rate limits or overwhelming the network
  for (const file of files) {
    const fullPath = path.join(matchedImagesDir, file);
    
    // We reverse the safe name back to the Cloudinary public_id
    // Example: "roggero-roma_properties_csdlcgvehij7fqvca63f.webp"
    // Becomes: "roggero-roma/properties/csdlcgvehij7fqvca63f"
    const baseName = path.basename(file, path.extname(file));
    let publicId = baseName;
    
    // Our previous script replaced '/' with '_'
    // So we need to carefully replace the first two '_' back to '/' to match standard structure
    // Or simpler: replace 'roggero-roma_properties_' with 'roggero-roma/properties/'
    if (publicId.startsWith('roggero-roma_properties_')) {
      publicId = publicId.replace('roggero-roma_properties_', 'roggero-roma/properties/');
    }

    console.log(`Uploading -> ${publicId} ...`);
    
    try {
      await cloudinary.uploader.upload(fullPath, {
        public_id: publicId,
        overwrite: true
      });
      console.log(`[OK] Successfully uploaded ${publicId}`);
      successCount++;
    } catch (error) {
      console.error(`[FAIL] Error uploading ${publicId}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n✅ Finished! Successfully uploaded: ${successCount}. Failed: ${failCount}.`);
  process.exit(0);
}

uploadAllMatched().catch(console.error);
