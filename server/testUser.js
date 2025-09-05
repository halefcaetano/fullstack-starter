require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  try {
    // connect to your DB (using MONGODB_URI secret or local .env)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // create a test user
    const newUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    await newUser.save();
    console.log("🎉 User saved:", newUser);

    // clean up
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

run();
