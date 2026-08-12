import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const propId = "6a1e1b1c09dc76e1323c93f5"; // La Escondida
    const prop = await db.collection('properties').findOne({ _id: new mongoose.Types.ObjectId(propId) });
    
    if (prop) {
      const img = prop.images[0].url || prop.images[0];
      console.log(`Original DB string: ${img}`);
      
      const urlObj = new URL(img);
      console.log(`URL pathname: ${urlObj.pathname}`);
      
      // La lógica del identify
      const urlParts = urlObj.pathname.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      let startIndex = uploadIndex + 1;
      if (urlParts[startIndex].match(/^v\d+$/)) {
        startIndex++;
      }
      let pubId = urlParts.slice(startIndex).join('/');
      pubId = pubId.replace(/\.[^/.]+$/, "");
      
      console.log(`Extracted public_id (sin decode): ${pubId}`);
      console.log(`Extracted public_id (con decode): ${decodeURIComponent(pubId)}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
run();
