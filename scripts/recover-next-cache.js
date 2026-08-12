const fs = require('fs');
const path = require('path');

const nextCacheDir = path.join(__dirname, '..', '.next', 'cache', 'images');
const recoveryDir = 'F:\\RoggeroyRoma Backup\\recovered_cache';

async function recoverCache() {
  console.log(`Starting recovery from ${nextCacheDir}`);
  
  if (!fs.existsSync(nextCacheDir)) {
    console.error(`Next.js cache directory not found at ${nextCacheDir}`);
    return;
  }
  
  if (!fs.existsSync(recoveryDir)) {
    fs.mkdirSync(recoveryDir, { recursive: true });
    console.log(`Created recovery directory: ${recoveryDir}`);
  }

  let count = 0;
  
  const folders = fs.readdirSync(nextCacheDir);
  for (const folder of folders) {
    const folderPath = path.join(nextCacheDir, folder);
    
    // Check if it's a directory
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        
        if (fs.statSync(filePath).isFile()) {
          // It's likely an image file like .webp, .jpg, .avif
          const ext = path.extname(file);
          
          // Generate a safe filename (replace characters that might be weird, though + and = are usually okay on Windows)
          let safeFolderName = folder.replace(/[\\/:*?"<>|]/g, '_');
          const destName = `${safeFolderName}${ext || '.webp'}`;
          const destPath = path.join(recoveryDir, destName);
          
          fs.copyFileSync(filePath, destPath);
          count++;
        }
      }
    }
  }
  
  console.log(`\n🎉 Successfully recovered ${count} cached images from the Next.js cache!`);
  console.log(`They have been saved to: ${recoveryDir}`);
}

recoverCache();
