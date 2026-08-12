require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat';

if (!DEEPSEEK_API_KEY) {
  console.error('DEEPSEEK_API_KEY not set in .env');
  process.exit(1);
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};

const PropertySchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    normalizedDescription: {
      resumen: String,
      ubicacion: String,
      detalles: [String],
      highlights: [String],
      nota: String,
    },
  },
  { timestamps: true }
);

const Property = mongoose.model('Property', PropertySchema);

const PROMPT = fs.readFileSync(
  path.join(__dirname, '..', 'mds', 'prompt_normalizacion-textos.md'),
  'utf-8'
);

const normalizeOne = async (description) => {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'system',
          content: PROMPT,
        },
        {
          role: 'user',
          content: description,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response: ' + raw.slice(0, 200));
  }

  return JSON.parse(jsonMatch[0]);
};

const run = async () => {
  await connectDB();

  const toProcess = await Property.find({
    description: { $exists: true, $ne: null, $ne: '' },
    $or: [
      { normalizedDescription: { $exists: false } },
      { normalizedDescription: null },
      { 'normalizedDescription.resumen': { $exists: false } },
    ],
  }).lean();

  console.log(`Found ${toProcess.length} properties to normalize`);

  let processed = 0;
  let errors = 0;

  for (const property of toProcess) {
    try {
      const normalized = await normalizeOne(property.description);

      await Property.updateOne(
        { _id: property._id },
        { $set: { normalizedDescription: normalized } }
      );

      processed++;
      console.log(`[${processed}/${toProcess.length}] OK: ${property.name}`);
    } catch (err) {
      errors++;
      console.error(`[ERROR] ${property.name}: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    if (toProcess.indexOf(property) < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\nDone: ${processed} processed, ${errors} errors`);

  await mongoose.disconnect();
  process.exit(errors > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
