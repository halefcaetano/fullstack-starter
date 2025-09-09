require("dotenv").config();
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({ title: String, content: String }, { timestamps: true });
const Post = mongoose.model("Post", PostSchema);

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing");
    await mongoose.connect(uri);
    console.log("Connected. Writing 50 docs, then reading & deleting...");

    // write
    const docs = Array.from({ length: 50 }, (_, i) => ({ title: `demo ${i}`, content: "atlas-metrics" }));
    await Post.insertMany(docs);

    // read
    const count = await Post.countDocuments();
    await Post.find().limit(10);

    // cleanup (optional, comment out if you want to keep data)
    await Post.deleteMany({ content: "atlas-metrics" });

    console.log(`Done. Total posts now: ${count}`);
  } catch (e) {
    console.error(e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
