require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    
    // Find all properties to see if there's a duplicate by a slightly different name
    const props = await Property.find({}, 'name images');
    for (const p of props) {
      if (p.name.toLowerCase().includes('30 has') || p.name.toLowerCase().includes('paisanita') || p.name.toLowerCase().includes('casco')) {
        console.log(`ID: ${p._id}, Name: ${p.name}`);
      }
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
