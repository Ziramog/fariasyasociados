const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
  const manifest = JSON.parse(fs.readFileSync('scripts/migration_manifest.json', 'utf8'));
  
  // Pick one property that I know failed or grabbed too many
  const item = manifest[3];
  console.log(`Fetching ${item.title} from ${item.legacyUrl}`);
  
  const res = await fetch(item.legacyUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('.property-similar, .similar-properties, .widget, .sidebar, footer, .footer, .image-with-label').remove();
  
  const allowedUrls = [];
  $('.header_slider_container img, #property-detail-large-slider img, .property-detail-slider img, .owl-item img, .item-slider img').each((i, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('facebook') && !src.includes('google')) {
      const cleanSrc = src.split('?')[0];
      if (cleanSrc.match(/\.(jpeg|jpg|png|webp)$/i) && !allowedUrls.includes(cleanSrc)) {
        allowedUrls.push(cleanSrc);
      }
    }
  });
  
  console.log(`Found ${allowedUrls.length} valid images:`);
  console.log(allowedUrls);
}

run().catch(console.error);
