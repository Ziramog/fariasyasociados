require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const allProps = await Property.find({}).lean();
  
  const targets = [
    'Casa de 5 dormitorios en Potrerillo de Larreta',
    'Se vende hermoso lote de 1070 m2 con excelente entorno en Alta Gracia, Serralta',
    '2 lotes (901m2 y 1.066m2) sobre ruta y a 250 metros del Lago Los Molinos',
    'Casa de 5 dormitorios en B° Pellegrini, Alta Gracia Córdoba',
    'Casa de 2 dormitorios en Alta Gracia Country Golf',
    'La Paisanita, Córdoba, Casa de 3 dormitorios sobre el Rio en Loteo cerrado'
  ];
  
  for (const t of targets) {
    console.log(`\n--- Searching for: ${t} ---`);
    const doc = allProps.find(p => p.name.includes(t));
    if (doc) {
      console.log('DB Name:', doc.name);
      console.log('DB Image count:', doc.images ? doc.images.length : 0);
    } else {
      console.log('Not found in DB!');
    }
  }
  
  mongoose.disconnect();
}
run();
