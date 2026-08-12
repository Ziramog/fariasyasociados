import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const props = await db.collection('properties').find({ name: { $regex: 'escondida|falda', $options: 'i' } }).toArray();
    
    console.log(`Encontradas ${props.length} propiedades:`);
    for (const p of props) {
      console.log(`ID: ${p._id} | Nombre: ${p.name}`);
      if (p.images && p.images.length > 0) {
        const url = typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url;
        console.log(`  Img[0]: ${url}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
run();
