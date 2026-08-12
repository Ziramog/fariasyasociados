require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    await User.updateOne({ email: 'marcosromaar@gmail.com' }, { $set: { agentName: 'Marcos Roma', username: 'Marcos Roma' } });
    await User.updateOne({ email: 'franeroma@gmail.com' }, { $set: { agentName: 'Francisco Roma', username: 'Francisco Roma' } });
    
    console.log('Nombres de agentes actualizados correctamente.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
