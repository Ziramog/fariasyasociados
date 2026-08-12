require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

const run = async () => {
  await connectDB();

  const properties = await Property.find(
    { description: { $exists: true, $ne: null, $ne: '' } },
    { _id: 1, name: 1, description: 1 }
  ).lean();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const backupPath = path.join(__dirname, 'backups', `descriptions_${date}.json`);

  const backup = properties.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    description: p.description,
  }));

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
  console.log(`Backed up ${properties.length} descriptions to ${backupPath}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
