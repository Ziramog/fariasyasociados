import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const propId = "6a1e1b1c09dc76e1323c93f5";
    const prop = await db.collection('properties').findOne({ _id: new mongoose.Types.ObjectId(propId) });
    if (prop) {
      console.log(`Propiedad ID: ${prop._id}`);
      console.log(`Nombre: ${prop.name}`);
      console.log(`Descripción: ${prop.description.substring(0, 200)}...`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
run();
