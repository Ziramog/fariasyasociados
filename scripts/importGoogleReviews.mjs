/**
 * scripts/importGoogleReviews.mjs
 * One-time script to import all 29 Google reviews into MongoDB.
 * Run: node --env-file=.env scripts/importGoogleReviews.mjs
 */
import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ReviewSchema = new mongoose.Schema({
  googlePlaceId: String,
  reviewId: { type: String, unique: true },
  authorName: String,
  authorPhoto: String,
  authorUri: String,
  rating: Number,
  text: String,
  textOriginalLanguage: String,
  publishTime: Date,
  relativeTimeDescription: String,
  googleUpdatedAt: Date,
  featured: Boolean,
  hidden: Boolean,
  priority: Number,
}, { timestamps: true, strict: false });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

function getRelativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 14) return 'Hace 1 semana';
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
  const diffYears = Math.floor(diffMonths / 12);
  return `Hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
}

async function importAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const raw = fs.readFileSync(path.join(__dirname, '../data/google-reviews.json'), 'utf-8');
  const reviews = JSON.parse(raw);
  let imported = 0;
  let skipped = 0;

  for (const item of reviews) {
    const dateStr = item.publishDate;
    const reviewId = crypto.createHash('sha256')
      .update(`${item.authorName}::${dateStr}::${item.text || ''}`)
      .digest('hex')
      .slice(0, 32);

    const exists = await Review.findOne({ reviewId }).lean().catch(() => null);
    if (exists) {
      console.log(`  ⏭  ${item.authorName} — already exists`);
      skipped++;
      continue;
    }

    await Review.create({
      googlePlaceId: process.env.GOOGLE_PLACE_ID || 'ChIJo00-jbBQLZQRpkMte_gAehk',
      reviewId,
      authorName: item.authorName,
      authorPhoto: item.authorPhoto || null,
      authorUri: null,
      rating: item.rating,
      text: item.text || null,
      textOriginalLanguage: item.language || 'es',
      publishTime: new Date(dateStr),
      relativeTimeDescription: getRelativeTime(dateStr),
      googleUpdatedAt: new Date(),
      featured: false,
      hidden: false,
      priority: 0,
    });

    console.log(`  ✅  ${item.authorName} — ${item.rating}★`);
    imported++;
  }

  console.log(`\n──────────────────────────────`);
  console.log(`Imported : ${imported}`);
  console.log(`Skipped  : ${skipped}`);
  await mongoose.disconnect();
}

importAll().catch(err => { console.error('Fatal:', err); process.exit(1); });
