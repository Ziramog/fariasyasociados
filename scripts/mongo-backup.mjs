import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = 'F:/RoggeroyRoma Backup/mongodb_backup';

const run = async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    console.log("Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup_${dateStr}.json`);
    
    const backupData = {};

    for (const col of collections) {
      const colName = col.name;
      console.log(`Extrayendo colección: ${colName}...`);
      const data = await db.collection(colName).find({}).toArray();
      backupData[colName] = data;
      console.log(` - ${data.length} documentos extraídos.`);
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`\nBackup guardado exitosamente en:\n${backupFile}`);

  } catch (err) {
    console.error("Error en backup:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

run();
