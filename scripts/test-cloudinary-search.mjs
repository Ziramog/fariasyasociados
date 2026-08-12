import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
  try {
    const query = "cenapguxzw6uc0ykgmo0";
    console.log(`Buscando en Cloudinary: ${query}`);
    
    // Buscar en cloudinary cualquier archivo que contenga ese string
    const result = await cloudinary.search
      .expression(query)
      .execute();
      
    console.log(`Encontrados: ${result.total_count}`);
    if (result.resources.length > 0) {
      console.log(JSON.stringify(result.resources[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  }
};
run();
