import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
  try {
    const inputPath = 'cloudinary_orphans_to_delete.json';
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: No se encontró el archivo ${inputPath}`);
      process.exit(1);
    }

    const orphans = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    if (orphans.length === 0) {
      console.log("No hay archivos huérfanos para eliminar.");
      process.exit(0);
    }

    // Extraer solo los public_ids
    const publicIds = orphans.map(asset => asset.public_id);
    const total = publicIds.length;
    console.log(`Iniciando purga de ${total} imágenes huérfanas en Cloudinary...`);

    // Dividir en chunks de 100
    const chunkSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = publicIds.slice(i, i + chunkSize);
      process.stdout.write(`Eliminando bloque ${i} a ${i + chunk.length - 1}... `);
      
      const result = await cloudinary.api.delete_resources(chunk);
      
      // Contar eliminaciones exitosas
      let chunkDeleted = 0;
      if (result && result.deleted) {
        chunkDeleted = Object.values(result.deleted).filter(status => status === 'deleted').length;
      }
      
      deletedCount += chunkDeleted;
      console.log(`(${chunkDeleted} borradas con éxito)`);
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n================================`);
    console.log(`✅ PURGA FINALIZADA CON ÉXITO ✅`);
    console.log(`================================`);
    console.log(`Total solicitadas: ${total}`);
    console.log(`Total eliminadas: ${deletedCount}`);

  } catch (err) {
    console.error("Error durante la purga:", err);
  } finally {
    process.exit(0);
  }
};

run();
