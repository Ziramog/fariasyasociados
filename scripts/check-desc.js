const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('property_detail.html', 'utf8');
const $ = cheerio.load(html);

let descParts = [];
const descContainer = $('.property-description .col-lg-12.col-md-12');
if (descContainer.length > 0) {
  descContainer.find('p, div, br').each((i, el) => {
    // replace br with newline and get text
    if (el.name === 'br') descParts.push('\n');
    else if (el.name === 'p') descParts.push($(el).text().trim() + '\n\n');
    else if (el.name === 'div') descParts.push($(el).text().trim() + '\n');
  });
}

let finalDesc = descParts.join('').trim() || descContainer.text().trim();
if (!finalDesc) {
  finalDesc = $('.property-description').parent().find('p').text().trim();
}

console.log('--- DESCRIPTION ---');
console.log(finalDesc);
