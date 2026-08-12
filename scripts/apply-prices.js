require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const allProps = await Property.find({}).lean();
  
  let updated = 0;
  
  for (const doc of allProps) {
    let newPrice = 'Consultar';
    if (doc.price && doc.price !== 'Consultar') {
      let p = doc.price.toString().toUpperCase();
      let numericString = p.replace(/[^0-9.,]/g, '').trim();
      
      if (numericString) {
        const numOnly = numericString.replace(/[.,]/g, '');
        const numberVal = parseInt(numOnly, 10);
        
        if (!isNaN(numberVal) && numberVal > 0) {
          newPrice = numberVal.toLocaleString('en-US');
        }
      }
    }
    
    await Property.updateOne({ _id: doc._id }, { $set: { price: newPrice } });
    console.log(`Updated price to: ${newPrice}`);
    updated++;
  }
  
  console.log(`Applied prices for ${updated} properties.`);
  mongoose.disconnect();
}

run().catch(console.error);
