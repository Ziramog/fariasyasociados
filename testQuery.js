import connectDB from './config/database.js';
import Property from './models/Property.js';

async function testQuery() {
  await connectDB();
  const filter = { is_published: { $ne: false }, type: 'Casa' };
  const properties = await Property.find(filter).lean();
  console.log(`Found ${properties.length} properties with type Casa`);
  const otherTypes = properties.filter(p => p.type !== 'Casa');
  console.log(`Of which, ${otherTypes.length} are NOT Casa.`);
  for (const p of properties) {
    if (p.type !== 'Casa') {
      console.log(`- ${p.name} -> type: ${p.type}`);
    }
  }
  process.exit(0);
}

testQuery();
