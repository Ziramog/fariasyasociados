const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env'});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const properties = await Property.find({ name: { $regex: 'Casona sobre 10 Has' } }).lean();
  
  if (!properties.length) {
    console.log('Property not found');
    process.exit(0);
  }
  
  const prop = properties[0];
  console.log('Found:', prop.name);
  
  let foundCount = 0;
  const dir = 'F:\\\\RoggeroyRoma Backup\\\\Matched Images';
  const files = fs.readdirSync(dir);
  
  for (const img of prop.images || []) {
    if (!img.public_id) continue;
    const safeName = img.public_id.replace(/\//g, '_');
    if (files.find(f => f.startsWith(safeName))) {
      console.log('✅ Matched:', img.public_id);
      foundCount++;
    } else {
      console.log('❌ Not found:', img.public_id);
    }
  }
  
  console.log(`Total matched for this property: ${foundCount} / ${(prop.images || []).length}`);
  process.exit(0);
});
