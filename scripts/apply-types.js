require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
  const allProps = await Property.find({}).lean();
  
  let updated = 0;
  
  for (const doc of allProps) {
    const title = doc.name ? doc.name.toLowerCase() : '';
    const desc = doc.description ? doc.description.toLowerCase() : '';
    
    let newType = 'Sin tipo específico';
    
    if (title.includes('departamento') || title.includes('dpto') || title.includes('duplex') || title.includes('dúplex') || title.includes('ph')) {
      newType = 'Departamento';
    } else if (title.includes('comercial') || title.includes('local') || title.includes('salón') || title.includes('galpón')) {
      newType = 'Inmueble Comercial';
    } else if (title.includes('campo')) {
      newType = 'Campo';
    } else if (title.includes('lote') || title.includes('terreno') || title.includes('fracción') || title.includes('fraccion') || title.includes('hectárea') || title.includes('hectarea') || title.includes('has')) {
      if (title.includes('casa ') || title.includes('casona')) {
        newType = 'Casa';
      } else {
        newType = 'Terreno';
      }
    } else if (title.includes('casa') || title.includes('casona') || title.includes('chalet') || title.includes('cabaña')) {
      newType = 'Casa';
    } else if (title.includes('inversión') || title.includes('inversion')) {
      newType = 'Gran Inversión';
    } else {
      if (desc.includes('departamento') || desc.includes('dúplex')) newType = 'Departamento';
      else if (desc.includes('comercial') || desc.includes('galpón')) newType = 'Inmueble Comercial';
      else if (desc.includes('campo')) newType = 'Campo';
      else if (desc.includes('lote') || desc.includes('terreno')) newType = 'Terreno';
      else if (desc.includes('casa') || desc.includes('casona')) newType = 'Casa';
    }

    await Property.updateOne({ _id: doc._id }, { $set: { type: newType } });
    console.log(`Updated "${newType}": ${doc.name}`);
    updated++;
  }
  
  console.log(`Applied types for ${updated} properties.`);
  mongoose.disconnect();
}

run().catch(console.error);
