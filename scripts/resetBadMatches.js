/**
 * Reset and re-sync with exact matching only.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

// DB properties that got dirty images from fuzzy matches — reset to empty
const RESET_NAMES = [
  'Casa de 3 dormitorios en El Anglo, Alta Gracia, Córdoba.',
  'Alta Gracia, Córdoba, Departamento de 3 Dormitorios en zona de El Golf',
  'Alta Gracia, Córdoba, Lote de 877 m2 con vista a las sierras en B El Golf',
  'Alta Gracia, Córdoba, Barrio Poluyan, Casa de 3 hab. a 4 cuadras del Tajamar',
  'Hermoso Dúplex de 2 dormitorios a 3 cuadras del centro, Alta Gracia, Córdoba',
  'Córdoba, Alta Gracia, 2 Hectáreas sobre autovía Ruta 5, zona Industrial',
  'SE VENDEN 2 LOTES DE 1000 M2 SOBRE RUTA EN EJE COMERCIAL',
  'Alta Gracia, Córdoba, Hermosa casa de 3 dormitorios en B° Pellegrini',
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const name of RESET_NAMES) {
    const prop = await Property.findOne({ name });
    if (prop) {
      await Property.updateOne({ _id: prop._id }, { $set: { images: [] } });
      console.log(`Reset: "${name.substring(0, 60)}..."`);
    } else {
      console.log(`Not found: "${name.substring(0, 60)}..."`);
    }
  }

  console.log('\nDone resetting. Run syncPhotos.js now with exact matching.');
  await mongoose.disconnect();
}

main().catch(console.error);
