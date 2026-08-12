require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const allProps = await Property.find({});
  
  let updated = 0;
  
  for (const doc of allProps) {
    if (!doc.price) {
      doc.price = 'Consultar';
    } else {
      let p = doc.price.toString().toUpperCase();
      // Remove all letters, currency symbols, and spaces
      let numericString = p.replace(/[^0-9.,]/g, '').trim();
      
      if (!numericString) {
        doc.price = 'Consultar';
      } else {
        // Handle thousands separator
        // If it has a dot and it's something like 220.000, we want 220,000
        // If it's already comma, keep it.
        // Let's strip all dots and commas, then re-format.
        const numOnly = numericString.replace(/[.,]/g, '');
        const numberVal = parseInt(numOnly, 10);
        
        if (isNaN(numberVal) || numberVal === 0) {
          doc.price = 'Consultar';
        } else {
          // Format with commas: 502,000
          doc.price = numberVal.toLocaleString('en-US');
        }
      }
    }
    
    await doc.save();
    console.log(`Updated price to: ${doc.price}`);
    updated++;
  }
  
  console.log(`Updated prices for ${updated} properties.`);
  mongoose.disconnect();
}

run().catch(console.error);
