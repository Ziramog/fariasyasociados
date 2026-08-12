/**
 * fixOwnership.js
 * Assigns all ownerless properties to the admin user (ingjuangomariz@gmail.com).
 * Run once: node scripts/fixOwnership.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const userSchema = new mongoose.Schema({}, { strict: false });
const propertySchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const admin = await User.findOne({ email: 'ingjuangomariz@gmail.com' });
  if (!admin) {
    console.log('Admin user not found. Make sure you logged in at least once with Google.');
    await mongoose.disconnect();
    return;
  }
  console.log(`Admin found: ${admin._id} (${admin.email})`);

  const result = await Property.updateMany(
    { $or: [{ owner: { $exists: false } }, { owner: null }] },
    { $set: { owner: admin._id } }
  );
  console.log(`Updated ${result.modifiedCount} properties with owner = ${admin._id}`);

  const totalWithOwner = await Property.countDocuments({ owner: admin._id });
  console.log(`Total properties now owned by admin: ${totalWithOwner}`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
