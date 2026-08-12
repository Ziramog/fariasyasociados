import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
  try {
    const propId = "6a1e1b1c09dc76e1323c93f5";
    const huerfanasPath = 'F:/RoggeroyRoma Backup/backup_ordenado/_HUERFANAS';
    
    const dirs = fs.readdirSync(huerfanasPath);
    const match = dirs.find(d => d.includes(propId));
    
    if (!match) {
      console.log("No se encontró carpeta local.");
      process.exit(1);
    }
    
    const dirPath = path.join(huerfanasPath, match);
    const files = fs.readdirSync(dirPath);
    
    console.log(`Encontrados ${files.length} archivos para resubir...`);
    
    const newImagesArray = [];
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      process.stdout.write(`Subiendo ${file}... `);
      
      // Construir carpeta destino en Cloudinary
      const folder = `roggero-roma/properties/${match}`;
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder
      });
      
      newImagesArray.push({
        url: result.secure_url,
        public_id: result.public_id
      });
      console.log(`✅ OK`);
    }
    
    if (newImagesArray.length > 0) {
      console.log("Actualizando MongoDB...");
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      
      await db.collection('properties').updateOne(
        { _id: new mongoose.Types.ObjectId(propId) },
        { $set: { images: newImagesArray } }
      );
      console.log("DB actualizada con éxito.");
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
run();
