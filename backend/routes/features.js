const express = require("express");
const router = express.Router();
const db = require("../db");
const { extractFeatures } = require("../utils/features");

// GET /api/features/session/:id
router.get("/session/:id", (req, res) => {
  const sessionId = req.params.id;

  try {
    const events = db
      .prepare("SELECT event_type, key_code, key_value, t FROM events WHERE session_id = ? ORDER BY t")
      .all(sessionId);

    if (!events.length) {
      return res.status(404).json({ error: "No events for this session" });
    }

    const features = extractFeatures(events);
    res.json({ sessionId, features });
  } catch (err) {
    console.error("❌ features error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;