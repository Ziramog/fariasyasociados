require('dotenv').config();
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true },
  reviewId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorPhoto: { type: String, default: null },
  authorUri: { type: String, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: null },
  textOriginalLanguage: { type: String, default: null },
  publishTime: { type: Date, required: true },
  relativeTimeDescription: { type: String, default: '' },
  googleUpdatedAt: { type: Date, required: true },
  featured: { type: Boolean, default: false, index: true },
  hidden: { type: Boolean, default: false, index: true },
  priority: { type: Number, default: 0, index: true },
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const reviews = await Review.find().lean();
  
  const byName = {};
  for (const r of reviews) {
    if (!byName[r.authorName]) byName[r.authorName] = [];
    byName[r.authorName].push(r);
  }

  const duplicates = [];
  for (const [name, list] of Object.entries(byName)) {
    if (list.length > 1) {
      duplicates.push(name);
      console.log(`\nDuplicate found for author: ${name}`);
      for (const r of list) {
        console.log(` - ID: ${r._id}, Text: ${r.text?.substring(0, 50)}...`);
      }
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicates found by author name.");
  }
  
  const byText = {};
  for (const r of reviews) {
    if (!r.text) continue;
    const txt = r.text.trim();
    if (!byText[txt]) byText[txt] = [];
    byText[txt].push(r);
  }
  
  let textDupes = 0;
  for (const [txt, list] of Object.entries(byText)) {
    if (list.length > 1) {
      textDupes++;
      console.log(`\nDuplicate text found: "${txt.substring(0, 100)}..."`);
      for (const r of list) {
        console.log(` - ID: ${r._id}, Author: ${r.authorName}`);
      }
    }
  }

  if (textDupes === 0) {
    console.log("No duplicates found by text.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
