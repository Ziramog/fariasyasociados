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

  const promises = allProps.map(doc => limit(async () => {
    const manifestItem = manifest.find(m => m.title === doc.name);
    if (!manifestItem) return;
    
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
      if (!finalDesc) {
        finalDesc = $('.property-description').parent().find('p').text().trim();
      }
      if (!finalDesc) {
        // Fallback to div text just in case
        finalDesc = $('.property-description').text().replace('Descripción', '').replace('Imprimir', '').trim();
      }

      if (finalDesc && finalDesc.length > 10) {
        // Only update if we found real text
        await Property.updateOne(
          { _id: doc._id }, 
          { $set: { description: finalDesc } }
        );
        console.log(`Updated description for: ${doc.name}`);
        updatedCount++;
      } else {
        console.log(`No valid description found for: ${doc.name}`);
      }
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  
  console.log(`\nSuccessfully updated ${updatedCount} properties with real descriptions.`);
  mongoose.disconnect();
}

run().catch(console.error);
