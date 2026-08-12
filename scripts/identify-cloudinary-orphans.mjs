import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
  try {
    // 1. Extraer IDs de MongoDB
    console.log("Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    const properties = await mongoose.connection.collection('properties').find({}).toArray();
    
    const validIds = new Set();
    let totalMongoImages = 0;

    properties.forEach(prop => {
      if (prop.images && Array.isArray(prop.images)) {
        prop.images.forEach(img => {
          totalMongoImages++;
          let pubId = '';
          if (typeof img === 'string') {
            // Extraer public_id si es una URL directa (asumiendo que empieza después del upload/)
            try {
              const urlParts = new URL(img).pathname.split('/');
              const uploadIndex = urlParts.indexOf('upload');
              if (uploadIndex !== -1) {
                // El formato es /image/upload/v1234/roggero-roma/properties/...
                // Si hay version "v123...", la saltamos
                let startIndex = uploadIndex + 1;
                if (urlParts[startIndex].match(/^v\d+$/)) {
                  startIndex++;
                }
                pubId = urlParts.slice(startIndex).join('/');
                // quitar la extension
                pubId = pubId.replace(/\.[^/.]+$/, "");
              }
            } catch (e) {}
          } else if (img && img.public_id) {
            pubId = img.public_id;
          }
          
          if (pubId) {
            // Normalizar eliminando espacios por si acaso
            validIds.add(pubId.trim());
          }
        });
      }
    });

    console.log(`\n--- FASE 1: Análisis de MongoDB ---`);
    console.log(`Propiedades analizadas: ${properties.length}`);
    console.log(`Total de imágenes detectadas en BD: ${totalMongoImages}`);
    console.log(`Total de public_ids ÚNICOS extraídos: ${validIds.size}`);

    // 2. Extraer todo Cloudinary
    console.log(`\n--- FASE 2: Consultando Servidores de Cloudinary ---`);
    let cloudinaryAssets = [];
    let nextCursor = null;
    let pageCount = 0;

    do {
      pageCount++;
      process.stdout.write(`Obteniendo página ${pageCount} de Cloudinary... `);
      
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'roggero-roma/', // Traer todo lo de la inmobiliaria
        max_results: 500,
        next_cursor: nextCursor
      });
      
      cloudinaryAssets = cloudinaryAssets.concat(result.resources);
      nextCursor = result.next_cursor;
      console.log(`(${result.resources.length} recursos obtenidos)`);
      
    } while (nextCursor);

    console.log(`\nTotal de imágenes alojadas en Cloudinary: ${cloudinaryAssets.length}`);

    // 3. Cruzar datos
    console.log(`\n--- FASE 3: Computando Diferencia (Huérfanas) ---`);
    const orphans = [];
    const validCloudinaryCount = [];

    cloudinaryAssets.forEach(asset => {
      // Cloudinary public_ids no tienen la extensión de archivo
      if (validIds.has(asset.public_id)) {
        validCloudinaryCount.push(asset.public_id);
      } else {
        orphans.push({
          public_id: asset.public_id,
          url: asset.secure_url,
          format: asset.format,
          bytes: asset.bytes,
          created_at: asset.created_at
        });
      }
    });

    const totalMegabytesOrphans = (orphans.reduce((sum, item) => sum + item.bytes, 0) / (1024 * 1024)).toFixed(2);

    console.log(`Imágenes en Cloudinary que SÍ están en MongoDB: ${validCloudinaryCount.length}`);
    console.log(`Imágenes en Cloudinary que NO están en MongoDB (HUÉRFANAS): ${orphans.length}`);
    console.log(`Espacio total que se liberará: ${totalMegabytesOrphans} MB`);

    // 4. Exportar
    const outputPath = 'cloudinary_orphans_to_delete.json';
    fs.writeFileSync(outputPath, JSON.stringify(orphans, null, 2));
    console.log(`\n✅ Archivo de resultados generado exitosamente en: ${outputPath}`);

  } catch (err) {
    console.error("Error durante el proceso:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

run();
