import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkAdmins() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.useDb('test'); // Nextjs auth often uses test or default
  // Actually, connectDB() in config/database.js uses process.env.MONGODB_URI
  const User = mongoose.connection.collection('users');
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).toArray();
  console.log("Admins:");
  admins.forEach(admin => {
    console.log(`- ${admin.email} (Role: ${admin.role})`);
  });
  process.exit(0);
}

checkAdmins().catch(console.error);
