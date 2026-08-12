import 'dotenv/config';
import mongoose from 'mongoose';

const runInspection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Nombres parciales o completos de las propiedades
    const queries = [
      "La Paisanita, Campo de 30",
      "1,5 Hectáreas a 500 mts",
      "Alta Gracia, Córdoba, Lote de 877",
      "Casa de 3 dormitorios en El Anglo",
      "Soñada Casona sobre 10 Has"
    ];

    const results = [];
    const collection = mongoose.connection.collection('properties');

    for (const q of queries) {
      const prop = await collection.findOne({ name: { $regex: q, $options: 'i' } });
      if (prop) {
        results.push({
          id: prop._id,
          name: prop.name,
          imageCount: prop.images ? prop.images.length : 0,
          images: prop.images
        });
      } else {
        results.push({ name: q, error: "Not found in DB" });
      }
    }

    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

runInspection();
