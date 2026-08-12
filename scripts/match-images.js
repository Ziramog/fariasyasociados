const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const CACHE_VERSION = 3;
const nextCacheDir = path.join(__dirname, '..', '.next', 'cache', 'images');
const outputDir = 'F:\\RoggeroyRoma Backup\\Matched Images';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Exactly match the Next.js 14 hash algorithm
function getHash(items) {
  const hash = crypto.createHash('sha256');
  for (let item of items) {
    if (typeof item === 'number') hash.update(String(item));
    else hash.update(item);
  }
  return hash.digest('base64').replace(/\//g, '-');
}

// We prefer to grab the highest resolution cache we can find
const widths = [3840, 2048, 1920, 1200, 1080, 828, 750, 640, 384, 256, 128, 96, 64, 48, 32, 16];
const qualities = [75];
const mimeTypes = ['image/webp', 'image/avif', 'image/jpeg', 'image/png'];

async function matchImages() {
  if (!fs.existsSync(nextCacheDir)) {
    console.error('Next.js cache directory not found!');
    return;
  }
  const existingFolders = fs.readdirSync(nextCacheDir);
  console.log(`Starting... Found ${existingFolders.length} folders in Next.js cache.`);

  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  
  const properties = await Property.find({}).lean();
  let totalMatched = 0;

  for (const prop of properties) {
    if (!prop.images || !prop.images.length) continue;

    for (const img of prop.images) {
      if (!img.url || !img.public_id) continue;
      
      let matchedFile = null;
      let matchedWidth = 0;

      // Try all combinations from largest width down to smallest
      for (const w of widths) {
        if (matchedFile) break; // Found the best quality already
        for (const q of qualities) {
          if (matchedFile) break;
          for (const m of mimeTypes) {
            const hash = getHash([CACHE_VERSION, img.url, w, q, m]);
            
            if (existingFolders.includes(hash)) {
              const folderPath = path.join(nextCacheDir, hash);
              const files = fs.readdirSync(folderPath);
              if (files.length > 0) {
                // Return the path of the actual cached image file
                matchedFile = path.join(folderPath, files[0]);
                matchedWidth = w;
                break;
              }
            }
          }
        }
      }

      if (matchedFile) {
        // Create a safe filename from the Cloudinary public_id
        const safeName = img.public_id.replace(/\//g, '_');
        const ext = path.extname(matchedFile) || '.webp';
        const destPath = path.join(outputDir, `${safeName}${ext}`);
        
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(matchedFile, destPath);
          console.log(`[OK] Matched ${img.public_id} (Width: ${matchedWidth}px)`);
          totalMatched++;
        }
      }
    }
  }

  console.log(`\n🎉 Success! Extracted and matched ${totalMatched} images.`);
  console.log(`They have been saved to: ${outputDir}`);
  process.exit(0);
}

matchImages().catch(console.error);
