require('dotenv').config({ path: '.env' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BACKUP_DIR = path.join('f:\\RoggeroyRoma Backup', 'Cloudinary Sync');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to clean property names for Windows folder names
function sanitizeFolderName(name) {
  return name.replace(/[<>:"/\\|?*]+/g, '-').trim();
}

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function runBackup() {
  console.log(`Starting Smart Backup to ${BACKUP_DIR}...`);
  let totalDownloaded = 0;
  
  try {
    console.log('Connecting to Database to map properties...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Using strict: false allows us to read documents even if we don't have a strict schema here
    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
    const properties = await Property.find({}).lean();
    console.log(`Found ${properties.length} properties in DB.`);

    // Build a map of public_id -> property folder name
    const imageToFolderMap = {};
    for (const prop of properties) {
      if (!prop.images) continue;
      const folderName = sanitizeFolderName(prop.name || 'Propiedad_Sin_Nombre');
      
      for (const img of prop.images) {
        if (img.public_id) {
          imageToFolderMap[img.public_id] = folderName;
        }
      }
    }

    let nextCursor = null;
    do {
      console.log('Fetching list of resources from Cloudinary...');
      const response = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor,
      });

      const resources = response.resources;
      
      for (const res of resources) {
        // Find which folder this image belongs to
        const propertyFolder = imageToFolderMap[res.public_id] || 'Otras_Imagenes';
        
        // Create the property specific folder
        const propertyPath = path.join(BACKUP_DIR, propertyFolder);
        if (!fs.existsSync(propertyPath)) {
          fs.mkdirSync(propertyPath, { recursive: true });
        }

        // Clean file name
        const safeName = res.public_id.split('/').pop() + '.' + res.format;
        const filepath = path.join(propertyPath, safeName);

        if (fs.existsSync(filepath)) {
          console.log(`[SKIP] Already exists: ${propertyFolder}/${safeName}`);
          continue;
        }

        try {
          await downloadImage(res.secure_url, filepath);
          totalDownloaded++;
          console.log(`[OK] Downloaded: ${propertyFolder}/${safeName}`);
        } catch (err) {
          console.log(`[ERROR] Failed to download ${safeName}: ${err.message}`);
        }
      }

      nextCursor = response.next_cursor;
    } while (nextCursor);

    console.log(`\nBackup Complete! Successfully downloaded ${totalDownloaded} new images.`);
    
  } catch (error) {
    console.error('Error during backup:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

runBackup();
