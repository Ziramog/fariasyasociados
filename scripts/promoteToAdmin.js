require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    image: { type: String },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
  },
  { timestamps: true }
);

const run = async () => {
  if (!process.argv[2]) {
    console.error('Usage: node scripts/promoteToAdmin.js <email>');
    process.exit(1);
  }

  const email = process.argv[2];
  await mongoose.connect(MONGO_URI);

  const User = mongoose.model('User', UserSchema);
  const user = await User.findOne({ email });

  if (!user) {
    console.error(`User not found: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  console.log(`${user.email} is now admin (role=${user.role})`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
