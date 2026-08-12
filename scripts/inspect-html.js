const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('property_detail.html', 'utf8');
const $ = cheerio.load(html);

console.log('Main slider:', $('#property-detail-large-slider').length);
console.log('Main slider items:', $('#property-detail-large-slider img').length);

console.log('Header slider:', $('.header_slider_container').length);
console.log('Header slider items:', $('.header_slider_container img').length);

const similarClasses = [];
$('*').each((i, el) => {
  const c = $(el).attr('class');
  if (c && c.toLowerCase().includes('similar')) {
    similarClasses.push(c);
  }
});
console.log('Similar classes found:', [...new Set(similarClasses)]);

console.log('Are there any other owl-carousels?', $('.owl-carousel').length);
$('.owl-carousel').each((i, el) => {
  console.log('Carousel class:', $(el).attr('class'));
});
