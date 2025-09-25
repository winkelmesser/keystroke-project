const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// Add phrase (admin/seed)
router.post("/", (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") return res.status(400).json({ error: "text required" });
  const id = "phrase_" + uuidv4().slice(0,8);
  try {
    db.prepare("INSERT INTO phrases (id, text) VALUES (?, ?)").run(id, text);
    res.json({ phraseId: id, text });
  } catch (err) {
    console.error("phrases POST error", err);
    res.status(500).json({ error: "DB error" });
  }
});

// List phrases
router.get("/", (req, res) => {
  try {
    const phrases = db.prepare("SELECT id, text, created_at FROM phrases ORDER BY created_at").all();
    res.json({ count: phrases.length, phrases });
  } catch (err) {
    console.error("phrases GET error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;