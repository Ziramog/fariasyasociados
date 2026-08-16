import mongoose from 'mongoose';
const uri = "mongodb+srv://fariasyasociadosweb_db_user:EgZJXnRdPzytNp5V@cluster0.xium1no.mongodb.net/fariasyasociados?retryWrites=true&w=majority&appName=Cluster0";
console.log("Connecting to MongoDB...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).then(() => {
  console.log("SUCCESS! Connection works.");
  process.exit(0);
}).catch(err => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
