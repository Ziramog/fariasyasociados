import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import https from 'https';

// ========== AUDIT ONLY - ZERO WRITES ==========

const PROP_IDS = [
  '6a1e1b1c09dc76e1323c93f5', // Lote 9 La Escondida
  '6a1e2b8109dc76e1323c9459', // 2 Lotes Alta Gracia
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve('ERROR'));
  });
}

const run = async () => {
  try {
    // 1. Load backup
    const backupPath = 'F:/RoggeroyRoma Backup/mongodb_backup/backup_2026-06-10T12-39-27-847Z.json';
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    const backupProps = backupData.properties || [];

    // 2. Connect to live DB (READ ONLY)
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    for (const propId of PROP_IDS) {
      console.log('\n' + '='.repeat(80));
      console.log(`PROPIEDAD ID: ${propId}`);
      console.log('='.repeat(80));

      // --- BACKUP STATE ---
      const backupProp = backupProps.find(p => {
        const id = typeof p._id === 'object' ? p._id.$oid || p._id.toString() : p._id;
        return id === propId;
      });
      
      if (backupProp) {
        console.log(`\n[BACKUP PRE-PURGA] Nombre: ${backupProp.name}`);
        const backupImgs = backupProp.images || [];
        console.log(`[BACKUP PRE-PURGA] Imágenes: ${backupImgs.length}`);
        for (let i = 0; i < backupImgs.length; i++) {
          const img = backupImgs[i];
          const url = typeof img === 'string' ? img : img.url;
          const status = await checkUrl(url);
          console.log(`  backup[${i}]: HTTP ${status} | ${url}`);
        }
      } else {
        console.log(`[BACKUP PRE-PURGA] NO ENCONTRADA en backup`);
      }

      // --- LIVE DB STATE ---
      const liveProp = await db.collection('properties').findOne({ _id: new mongoose.Types.ObjectId(propId) });
      if (liveProp) {
        console.log(`\n[LIVE DB] Nombre: ${liveProp.name}`);
        const liveImgs = liveProp.images || [];
        console.log(`[LIVE DB] Imágenes: ${liveImgs.length}`);
        for (let i = 0; i < Math.min(liveImgs.length, 3); i++) {
          const img = liveImgs[i];
          const url = typeof img === 'string' ? img : img.url;
          const status = await checkUrl(url);
          console.log(`  live[${i}]: HTTP ${status} | ${url}`);
        }
        if (liveImgs.length > 3) console.log(`  ... y ${liveImgs.length - 3} más`);
      }

      // --- COMPARE ---
      if (backupProp && liveProp) {
        const getUrl = (img) => typeof img === 'string' ? img : img.url;
        const backupUrls = (backupProp.images || []).map(getUrl);
        const liveUrls = (liveProp.images || []).map(getUrl);
        const same = JSON.stringify(backupUrls) === JSON.stringify(liveUrls);
        console.log(`\n[DIFF] ¿Las imágenes del backup coinciden con las de live? ${same ? 'SÍ' : 'NO'}`);
        if (!same) {
          console.log(`[DIFF] Backup tenía ${backupUrls.length} imgs, Live tiene ${liveUrls.length} imgs`);
          // Check if backup URLs are substring-different from live
          if (backupUrls.length > 0 && liveUrls.length > 0) {
            console.log(`[DIFF] Backup URL[0] folder: ${backupUrls[0].split('/').slice(-2, -1)[0]}`);
            console.log(`[DIFF] Live URL[0] folder:   ${liveUrls[0].split('/').slice(-2, -1)[0]}`);
          }
        }
      }

      // --- LOCAL FILES ---
      const huerfanasPath = 'F:/RoggeroyRoma Backup/backup_ordenado/_HUERFANAS';
      const dirs = fs.readdirSync(huerfanasPath);
      const matches = dirs.filter(d => d.includes(propId));
      if (matches.length > 0) {
        for (const m of matches) {
          const files = fs.readdirSync(path.join(huerfanasPath, m));
          console.log(`\n[_HUERFANAS] Carpeta: ${m}`);
          console.log(`[_HUERFANAS] Archivos: ${files.length}`);
        }
      } else {
        console.log(`\n[_HUERFANAS] NO hay carpeta para este ID`);
      }
    }

    // --- GLOBAL: How many properties have broken images? ---
    console.log('\n' + '='.repeat(80));
    console.log('AUDITORÍA GLOBAL: Propiedades con imágenes rotas en LIVE DB');
    console.log('='.repeat(80));
    
    const allProps = await db.collection('properties').find({}).toArray();
    let brokenCount = 0;
    const brokenList = [];
    
    for (const prop of allProps) {
      const imgs = prop.images || [];
      if (imgs.length === 0) continue;
      
      // Check first image only for speed
      const firstUrl = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].url;
      if (!firstUrl) continue;
      
      const status = await checkUrl(firstUrl);
      if (status !== 200) {
        brokenCount++;
        brokenList.push({
          id: prop._id.toString(),
          name: prop.name,
          imgCount: imgs.length,
          firstImgStatus: status,
          firstUrl: firstUrl,
        });
      }
    }
    
    console.log(`\nTotal propiedades en DB: ${allProps.length}`);
    console.log(`Propiedades con imagen[0] rota (no-200): ${brokenCount}`);
    console.log(`Propiedades sanas: ${allProps.length - brokenCount}`);
    
    if (brokenList.length > 0) {
      console.log('\nLISTA COMPLETA DE PROPIEDADES ROTAS:');
      for (const b of brokenList) {
        console.log(`  ID: ${b.id} | HTTP ${b.firstImgStatus} | imgs: ${b.imgCount} | ${b.name}`);
        console.log(`    URL[0]: ${b.firstUrl}`);
        
        // Check if has local backup
        const hasDirMatch = dirs.some(d => d.includes(b.id));
        console.log(`    Backup local en _HUERFANAS: ${hasDirMatch ? 'SÍ' : 'NO'}`);
        
        // Check if backup JSON had different URLs
        const bp = backupProps.find(p => {
          const id = typeof p._id === 'object' ? p._id.$oid || p._id.toString() : p._id;
          return id === b.id;
        });
        if (bp) {
          const bUrl = typeof bp.images?.[0] === 'string' ? bp.images[0] : bp.images?.[0]?.url;
          const changed = bUrl !== b.firstUrl;
          console.log(`    ¿URL cambió desde el backup? ${changed ? 'SÍ (el asistente anterior la modificó)' : 'NO (ya estaba así antes de la purga)'}`);
          if (changed) {
            console.log(`    URL en backup: ${bUrl}`);
          }
        }
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
