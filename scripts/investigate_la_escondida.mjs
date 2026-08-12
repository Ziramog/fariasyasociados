import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const propId = "6a1e1b1c09dc76e1323c93f5";
    const prop = await db.collection('properties').findOne({ _id: new mongoose.Types.ObjectId(propId) });
    
    if (prop) {
      console.log(`Propiedad encontrada: ${prop.name}`);
      console.log(`Imágenes en DB (${prop.images ? prop.images.length : 0}):`);
      prop.images.forEach((img, i) => console.log(`  ${i}: ${typeof img === 'string' ? img : img.url}`));
    } else {
      console.log("No se encontró la propiedad en la DB.");
    }

    const huerfanasPath = 'F:/RoggeroyRoma Backup/backup_ordenado/_HUERFANAS';
    if (fs.existsSync(huerfanasPath)) {
      const dirs = fs.readdirSync(huerfanasPath);
      const matches = dirs.filter(d => d.includes(propId));
      if (matches.length > 0) {
        console.log(`\n¡Se encontró respaldo en _HUERFANAS!: ${matches[0]}`);
        const files = fs.readdirSync(path.join(huerfanasPath, matches[0]));
        console.log(`Contiene ${files.length} archivos.`);
      } else {
        console.log(`\nNO se encontró respaldo en _HUERFANAS para este ID.`);
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
