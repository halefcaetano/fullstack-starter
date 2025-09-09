require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not found (check your .env).");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error connecting:", err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit();
  }
})();
