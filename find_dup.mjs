import 'dotenv/config';
import mongoose from 'mongoose';
import Review from './models/Review.js';

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
      console.log(`Duplicate found for author: ${name}`);
      for (const r of list) {
        console.log(` - ID: ${r._id}, Text: ${r.text?.substring(0, 50)}..., googlePlaceId: ${r.googlePlaceId}, reviewId: ${r.reviewId}`);
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
      console.log(`Duplicate text found: "${txt.substring(0, 100)}..."`);
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
