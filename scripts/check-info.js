const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('property_detail.html', 'utf8');
const $ = cheerio.load(html);

$('.information-label').each((i, el) => {
  const label = $(el).text().trim();
  const value = $(el).next().text().trim();
  console.log(`${label} : ${value}`);
});
