const express = require("express");
const router = express.Router();
const db = require("../db");
const { extractFeatures } = require("../utils/features");

// GET /api/sessions/:id/features
router.get("/:id/features", (req, res) => {
  const sessionId = req.params.id;

  try {
    // Session Metadaten
    const session = db
      .prepare("SELECT id, user_id, phrase_id, created_at FROM sessions WHERE id = ?")
      .get(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Events laden
    const events = db
      .prepare("SELECT event_type, key_code, key_value, t FROM events WHERE session_id = ? ORDER BY t")
      .all(sessionId);

    if (!events.length) {
      return res.status(404).json({ error: "No events for this session" });
    }

    const features = extractFeatures(events);

    res.json({ session, features });
  } catch (err) {
    console.error("❌ sessions features error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;