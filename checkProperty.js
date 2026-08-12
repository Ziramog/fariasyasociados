require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    
    const propId = '69fa3b194acb27ba6ab44f14';
    
    // Find by ID directly, or any duplicated ones? Let's search by name or ID.
    const prop = await Property.findById(propId);
    if (prop) {
      console.log(`Property Found: ${prop.name}`);
      console.log('Photos:');
      console.log(JSON.stringify(prop.images, null, 2));
      
      // Look for duplicates by name or some unique identifier
      const duplicates = await Property.find({ name: prop.name });
      console.log(`Found ${duplicates.length} properties with the same name.`);
      for (const d of duplicates) {
        console.log(`Duplicate ID: ${d._id}`);
      }
    } else {
      console.log('Property not found by ID.');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
