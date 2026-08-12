require('dotenv').config({path: '.env'});
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const duplicates = await mongoose.connection.db.collection('reviews').aggregate([
    { $group: { _id: '$authorName', count: { $sum: 1 }, docs: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();
  console.log('Duplicates:', JSON.stringify(duplicates, null, 2));

  // let's just delete the oldest of the duplicates
  for (const dup of duplicates) {
    // leave the first one (or last), remove the rest
    const toRemove = dup.docs.slice(1);
    await mongoose.connection.db.collection('reviews').deleteMany({ _id: { $in: toRemove } });
    console.log(`Deleted ${toRemove.length} duplicates for ${dup._id}`);
  }

  process.exit(0);
}

run();
