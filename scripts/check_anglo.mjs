import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const prop = await mongoose.connection.collection('properties').findOne({
      name: { $regex: 'Casa de 3 dormitorios en El Anglo', $options: 'i' }
    });
    console.log("ID:", prop._id);
    console.log("Name:", prop.name);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};
run();
