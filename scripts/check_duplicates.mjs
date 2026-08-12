import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('properties');
    
    // Buscar todas las propiedades que tengan "El Anglo" en el nombre
    const props = await collection.find({
      name: { $regex: 'El Anglo', $options: 'i' }
    }).toArray();
    
    console.log(`Se encontraron ${props.length} propiedades con 'El Anglo' en el nombre:`);
    props.forEach((p, idx) => {
      console.log(`\n--- Propiedad ${idx + 1} ---`);
      console.log(`ID: ${p._id}`);
      console.log(`Nombre: ${p.name}`);
      console.log(`Cantidad de fotos: ${p.images ? p.images.length : 0}`);
      if (p.images && p.images.length > 0) {
        // Mostrar solo el primer public_id para ver si coincide con cenapgux...
        const firstImg = typeof p.images[0] === 'string' ? p.images[0] : p.images[0].public_id;
        console.log(`Primera foto: ${firstImg}`);
        const hasCenap = p.images.some(img => {
          const pid = typeof img === 'string' ? img : img.public_id;
          return pid && pid.includes('cenapgux');
        });
        console.log(`¿Tiene cenapgux...?: ${hasCenap}`);
      }
    });

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};
run();
