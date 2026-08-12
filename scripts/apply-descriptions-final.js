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
    
    // If not in manifest or no legacy url, clear if it has fake text
    if (!manifestItem) {
      if (doc.description && doc.description.includes('Need an account')) {
        await Property.updateOne({ _id: doc._id }, { $set: { description: '' } });
      }
      return;
    }
    
    try {
      const res = await fetch(manifestItem.legacyUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      let descParts = [];
      const descContainer = $('.property-description .col-lg-12.col-md-12');
      if (descContainer.length > 0) {
        descContainer.find('p, div, br').each((i, el) => {
          if (el.name === 'br') descParts.push('\n');
          else if (el.name === 'p') descParts.push($(el).text().trim() + '\n\n');
          else if (el.name === 'div') descParts.push($(el).text().trim() + '\n');
        });
      }
      
      let finalDesc = descParts.join('').trim() || descContainer.text().trim();
      if (!finalDesc || finalDesc.length < 5) {
        finalDesc = $('.property-description').parent().find('p').text().trim();
      }
      if (!finalDesc || finalDesc.length < 5) {
        finalDesc = $('.property-description').text().replace(/Descripción/g, '').replace(/Imprimir/g, '').trim();
      }
      
      // Clean up fake description
      if (finalDesc && finalDesc.includes('Need an account')) {
        finalDesc = '';
      }

      if (finalDesc && finalDesc.length > 10) {
        await Property.updateOne({ _id: doc._id }, { $set: { description: finalDesc } });
        updatedCount++;
      } else {
        await Property.updateOne({ _id: doc._id }, { $set: { description: '' } });
        clearedCount++;
      }
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  
  console.log(`\nSuccessfully updated ${updatedCount} properties with real descriptions.`);
  console.log(`Cleared ${clearedCount} empty/fake descriptions.`);
  
  // also check the remaining 15 properties that were NOT matched by the manifest
  for (const doc of allProps) {
    if (doc.description && doc.description.includes('Need an account')) {
      await Property.updateOne({ _id: doc._id }, { $set: { description: '' } });
    }
  }

  mongoose.disconnect();
}

run().catch(console.error);
