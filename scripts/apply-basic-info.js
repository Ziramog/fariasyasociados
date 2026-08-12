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
      
      const updateData = {};
      
      $('.information-label').each((i, el) => {
        const label = $(el).text().trim().toLowerCase();
        const value = $(el).next().text().trim();
        
        if (!value) return;
        
        // Extract numbers
        const numMatch = value.match(/\d+/);
        const num = numMatch ? parseInt(numMatch[0], 10) : 0;
        
        if (label.includes('dormitorio')) {
          updateData.beds = num;
        } else if (label.includes('baño')) {
          updateData.baths = num;
        } else if (label.includes('terreno')) {
          // Sometimes it has dots for thousands, e.g. "1.988"
          const cleanVal = value.replace(/\./g, '');
          const largeNumMatch = cleanVal.match(/\d+/);
          if (largeNumMatch) updateData.square_feet = parseInt(largeNumMatch[0], 10);
        } else if (label.includes('cubierta')) {
          const cleanVal = value.replace(/\./g, '');
          const largeNumMatch = cleanVal.match(/\d+/);
          if (largeNumMatch) updateData.covered_area = parseInt(largeNumMatch[0], 10);
        } else if (label.includes('garage') || label.includes('cochera')) {
          updateData.garage = num || 1; // If it just says "Si" or "1"
        } else if (label.includes('servicios')) {
          updateData.services = value.split(',').map(s => s.trim());
        } else if (label.includes('títulos') || label.includes('titulo')) {
          updateData.titles_status = value;
        } else if (label.includes('abertura')) {
          updateData['interior.aberturas'] = value;
        } else if (label.includes('pisos')) {
          updateData['interior.pisos'] = value;
        } else if (label.includes('calefacción') || label.includes('calefaccion')) {
          updateData['interior.calefaccion'] = value;
        } else if (label.includes('techos')) {
          updateData['exterior.techos'] = value;
        }
      });
      
      if (Object.keys(updateData).length > 0) {
        await Property.updateOne({ _id: doc._id }, { $set: updateData });
        console.log(`Updated basic info for: ${doc.name} ->`, updateData);
        updatedCount++;
      }
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  
  console.log(`\nSuccessfully updated ${updatedCount} properties with basic info.`);
  mongoose.disconnect();
}

run().catch(console.error);
