require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', new mongoose.Schema({}, { strict: false }), 'quotations');
    
    const quotes = await Quotation.find().sort({ createdAt: -1 }).limit(3);
    for (const q of quotes) {
      console.log(`Quote: ${q.quoteNumber}, CreatedBy: ${q.createdBy}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
