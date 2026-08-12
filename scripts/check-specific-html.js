const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  const targets = [
    'Casa de 5 dormitorios en Potrerillo de Larreta',
    'Se vende hermoso lote de 1070 m2 con excelente entorno en Alta Gracia, Serralta',
    '2 lotes (901m2 y 1.066m2) sobre ruta y a 250 metros del Lago Los Molinos',
    'Casa de 5 dormitorios en B° Pellegrini, Alta Gracia Córdoba',
    'Casa de 2 dormitorios en Alta Gracia Country Golf',
    'La Paisanita, Córdoba, Casa de 3 dormitorios sobre el Rio en Loteo cerrado'
  ];
  
  for (const t of targets) {
    const mItem = manifest.find(m => m.title.includes(t));
    if (!mItem) {
      console.log(`\nNot in manifest: ${t}`);
      continue;
    }
    
    console.log(`\n--- ${mItem.title} ---`);
    console.log(`URL: ${mItem.legacyUrl}`);
    
    try {
      const res = await fetch(mItem.legacyUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      $('.property-similar, .similar-properties, .widget, .sidebar, footer, .footer, .image-with-label').remove();
      
      let allImgs = [];
      $('img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && !src.includes('logo') && !src.includes('facebook') && !src.includes('google')) {
          allImgs.push(src);
        }
      });
      
      console.log(`Total images on page: ${allImgs.length}`);
      if (allImgs.length > 0) {
         console.log('Classes of first image parent:', $('img[src="' + allImgs[0] + '"]').parent().attr('class'));
         console.log('Classes of second image parent:', $('img[src="' + allImgs[1] + '"]').parent().attr('class'));
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}
run();
