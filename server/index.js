require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://root:example@127.0.0.1:27017/?authSource=admin";

let db;

// simple root route so / doesn't show "Cannot GET /"
app.get("/", (_req, res) => {
  res.send("API is running. Try /api/health or /api/messages");
});

app.get("/api/health", async (_req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

app.get("/api/messages", async (_req, res) => {
  try {
    const docs = await db.collection("messages").find().toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e?.message });
  }
});

async function start() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db("appdb");

  // seed one doc if empty
  const count = await db.collection("messages").countDocuments();
  if (count === 0) {
    await db.collection("messages").insertOne({
      text: "Hello from MongoDB!",
      insertedAt: new Date(),
    });
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error("Startup error:", e);
  process.exit(1);
});

