require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    
    // Find properties with "Campo de 30 Has" in the name
    const props = await Property.find({ name: /Campo de 30 Has/i });
    console.log(`Found ${props.length} properties.`);
    for (const p of props) {
      console.log(`ID: ${p._id}, Name: ${p.name}, Images Count: ${p.images?.length || 0}`);
      if (p.images && p.images.length > 0) {
        console.log(`First image: ${p.images[0].url || p.images[0]}`);
      }
      console.log('---');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
