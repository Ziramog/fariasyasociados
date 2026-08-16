import mongoose from 'mongoose';

const uri = "mongodb+srv://fariasyasociadosweb_db_user:EgZJXnRdPzytNp5V@cluster0.xium1no.mongodb.net/fariasyasociados?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  email: String,
  role: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function promote() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");
    
    // Find all users
    const users = await User.find({});
    console.log("Found users:", users.map(u => u.email));
    
    if (users.length === 0) {
      console.log("No users found in the database. Has the user logged in yet?");
    } else {
      for (const u of users) {
        u.role = 'admin';
        await u.save();
        console.log(`Promoted ${u.email} to admin!`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err.message);
    process.exit(1);
  }
}

promote();
