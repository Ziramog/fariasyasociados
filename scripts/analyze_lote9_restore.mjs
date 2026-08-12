import 'dotenv/config';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';

// ========== ANÁLISIS SOLO LECTURA ==========

const PROP_ID = '6a1e1b1c09dc76e1323c93f5';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ status: res.statusCode, contentType: res.headers['content-type'], size: res.headers['content-length'] });
      res.resume();
    }).on('error', (e) => resolve({ status: 'ERROR', error: e.message }));
  });
}

const run = async () => {
  // 1. Load backup
  const backupPath = 'F:/RoggeroyRoma Backup/mongodb_backup/backup_2026-06-10T12-39-27-847Z.json';
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  const backupProps = backupData.properties || [];
  const backupProp = backupProps.find(p => {
    const id = typeof p._id === 'object' ? p._id.$oid || p._id.toString() : p._id;
    return id === PROP_ID;
  });

  // 2. Connect to live DB (READ ONLY)
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const liveProp = await db.collection('properties').findOne({ _id: new mongoose.Types.ObjectId(PROP_ID) });

  console.log('=== ESTADO ACTUAL (LIVE DB) ===');
  console.log(`Nombre: ${liveProp.name}`);
  console.log(`Imágenes: ${liveProp.images.length}`);
  console.log(`Carpeta: ${liveProp.images[0]?.url?.split('/').slice(-2, -1)[0]}`);

  console.log('\n=== ESTADO EN BACKUP (PRE-PURGA) ===');
  console.log(`Nombre: ${backupProp.name}`);
  console.log(`Imágenes: ${backupProp.images.length}`);
  console.log(`Carpeta: ${backupProp.images[0]?.url?.split('/').slice(-2, -1)[0]}`);

  console.log('\n=== VERIFICANDO QUE LAS 13 FOTOS DEL BACKUP SIGUEN VIVAS EN CLOUDINARY ===');
  const backupImgs = backupProp.images;
  let allOk = true;
  for (let i = 0; i < backupImgs.length; i++) {
    const img = backupImgs[i];
    const url = typeof img === 'string' ? img : img.url;
    const result = await checkUrl(url);
    const ok = result.status === 200;
    if (!ok) allOk = false;
    console.log(`  [${ok ? '✅' : '❌'}] backup[${i}]: HTTP ${result.status} | ${Math.round(result.size/1024)}KB | ${url.split('/').pop()}`);
  }

  console.log('\n=== VERIFICANDO LAS 26 FOTOS ACTUALES (las erróneas) ===');
  const liveImgs = liveProp.images;
  for (let i = 0; i < Math.min(3, liveImgs.length); i++) {
    const img = liveImgs[i];
    const url = typeof img === 'string' ? img : img.url;
    const result = await checkUrl(url);
    console.log(`  live[${i}]: HTTP ${result.status} | ${url.split('/').pop()}`);
  }
  console.log(`  ... y ${liveImgs.length - 3} más`);

  console.log('\n=== RESUMEN ===');
  console.log(`Las 13 fotos originales siguen en Cloudinary: ${allOk ? 'SÍ ✅' : 'NO ❌'}`);
  console.log(`\nPLAN DE RESTAURACIÓN:`);
  console.log(`1. Reemplazar el array images en MongoDB con las 13 entradas del backup`);
  console.log(`2. Eliminar de Cloudinary las 26 fotos subidas por error`);
  console.log(`3. Push a Vercel para limpiar caché`);

  // Output the backup images as JSON for use in restore
  console.log('\n=== DATOS DEL BACKUP PARA RESTAURAR ===');
  console.log(JSON.stringify(backupImgs, null, 2));

  mongoose.connection.close();
  process.exit(0);
};
run();
