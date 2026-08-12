/**
 * Final fix: reset the one bad match, show final photo counts.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Fix: Hermosa unidad PH images went to wrong property
  const bad = await Property.findOne({ name: /Casa de 5 dormitorios en B.* Pellegrini/ });
  if (bad) {
    await Property.updateOne({ _id: bad._id }, { $set: { images: [] } });
    console.log('Reset: Casa 5 dorm Pellegrini → empty');
  }

  // Show final state
  const props = await Property.find({}, 'name images').lean();
  let total = 0, withImg = 0, without = 0;
  console.log('\nFinal photo counts:');
  for (const p of props) {
    const n = (p.images || []).length;
    total += n;
    if (n > 0) {
      withImg++;
      console.log(`  ${String(n).padStart(2)} photos | ${p.name.substring(0, 70)}`);
    } else {
      without++;
    }
  }
  console.log(`\n${withImg} with images, ${without} without, ${total} total photos`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
