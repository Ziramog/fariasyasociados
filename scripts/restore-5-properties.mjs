import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const HUERFANAS_DIR = 'F:/RoggeroyRoma Backup/backup_ordenado/_HUERFANAS';

const targetProperties = [
  "La Paisanita, Campo de 30 Has",
  "1,5 Hectáreas a 500 mts",
  "Lote de 877 m2 con vista a las sierras en B° El Golf",
  "Casa de 3 dormitorios en El Anglo, Alta",
  "Soñada Casona sobre 10 Has"
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('properties');

    for (const targetName of targetProperties) {
      console.log(`\n===========================================`);
      console.log(`Buscando propiedad: ${targetName}`);
      const prop = await collection.findOne({ name: { $regex: targetName, $options: 'i' } });
      
      if (!prop) {
        console.log(`❌ No se encontró en DB.`);
        continue;
      }
      
      const propIdStr = prop._id.toString();
      console.log(`✅ Encontrada en DB: ID ${propIdStr} - ${prop.name}`);

      const allDirs = fs.readdirSync(HUERFANAS_DIR);
      const matchedDir = allDirs.find(d => d.startsWith(propIdStr));

      if (!matchedDir) {
        console.log(`❌ No se encontró carpeta en _HUERFANAS para este ID.`);
        continue;
      }

      console.log(`✅ Carpeta encontrada: ${matchedDir}`);
      
      const dirPath = path.join(HUERFANAS_DIR, matchedDir);
      const files = fs.readdirSync(dirPath);
      
      console.log(`📷 Encontrados ${files.length} archivos.`);

      const newImagesArray = [];

      for (const file of files) {
        const basename = path.parse(file).name;
        const parts = basename.split('_');
        const uniqueId = parts[parts.length - 1]; // "cenapguxzw"

        console.log(`   Consultando Cloudinary para: ${uniqueId}`);
        const result = await cloudinary.search.expression(uniqueId).execute();
        
        if (result.resources.length > 0) {
          const imgData = result.resources[0];
          newImagesArray.push({
            url: imgData.secure_url,
            public_id: imgData.public_id
          });
        }
      }

      console.log(`✅ URLs encontradas en Cloudinary: ${newImagesArray.length} / ${files.length}`);
      
      if (newImagesArray.length > 0) {
        await collection.updateOne(
          { _id: prop._id },
          { $set: { images: newImagesArray } }
        );
        console.log(`🎉 DB Actualizada exitosamente para ${prop.name}!`);
      } else {
        console.log(`⚠️ No se encontraron las fotos en Cloudinary para esta propiedad.`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

run();
