require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const pLimit = require('p-limit');

const limit = pLimit(10); // Concurrent fetches

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const allProps = await Property.find({}).lean();
  
  let updatedCount = 0;
  let clearedCount = 0;

  const promises = allProps.map(doc => limit(async () => {
    const manifestItem = manifest.find(m => m.title === doc.name);
    if (!manifestItem) return;
    
    try {
      const res = await fetch(manifestItem.legacyUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      let finalDesc = '';
      const descContainer = $('.property-description');
      
      // Try multiple ways to extract text without "Descripción Imprimir"
      const pText = descContainer.find('p').text().trim();
      if (pText && pText.length > 10 && !pText.includes('DescripciónImprimir')) {
        finalDesc = pText;
      } else {
        const rawText = descContainer.text().replace(/Descripción\s*Imprimir/i, '').replace(/Descripción/i, '').replace(/Imprimir/i, '').trim();
        if (rawText && rawText.length > 10) {
          finalDesc = rawText;
        }
      }
      
      // Check if it's completely empty or fake
      if (finalDesc.length < 5) {
        finalDesc = '';
      }

      if (finalDesc !== '') {
        await Property.updateOne(
          { _id: doc._id }, 
          { $set: { description: finalDesc } }
        );
        updatedCount++;
      } else {
        // Clear fake description
        await Property.updateOne(
          { _id: doc._id }, 
          { $set: { description: '' } }
        );
        clearedCount++;
      }
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  
  console.log(`\nUpdated ${updatedCount} real descriptions.`);
  console.log(`Cleared ${clearedCount} fake/empty descriptions.`);
  mongoose.disconnect();
}

run().catch(console.error);
