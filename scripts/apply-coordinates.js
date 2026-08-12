require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
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
      
      let lat = null;
      let lng = null;
      
      // Try to find google.maps.LatLng("-31.xxx","-64.yyy")
      const latLngMatch = html.match(/google\.maps\.LatLng\("([^"]+)","([^"]+)"\)/i);
      if (latLngMatch) {
        lat = parseFloat(latLngMatch[1]);
        lng = parseFloat(latLngMatch[2]);
      } else {
        // Try to find {lat: -31.xxx, lng: -64.yyy}
        const objMatch = html.match(/lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+)/i);
        if (objMatch) {
          lat = parseFloat(objMatch[1]);
          lng = parseFloat(objMatch[2]);
        }
      }
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        await Property.updateOne(
          { _id: doc._id }, 
          { $set: { "coordinates.lat": lat, "coordinates.lng": lng } }
        );
        console.log(`Saved coordinates [${lat}, ${lng}] for: ${doc.name}`);
        updatedCount++;
      } else {
        console.log(`No coordinates found for: ${doc.name}`);
      }
      
    } catch (e) {
      console.error(`Error processing ${doc.name}: ${e.message}`);
    }
  }));

  await Promise.all(promises);
  
  console.log(`\nSuccessfully updated ${updatedCount} properties with coordinates.`);
  mongoose.disconnect();
}

run().catch(console.error);
