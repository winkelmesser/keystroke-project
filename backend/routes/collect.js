const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  const { events, userId, phraseId, mode } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: "Events required" });
  }

  const sessionId = "sess_" + uuidv4().slice(0, 8);

  try {
    // Session speichern
    db.prepare(
      "INSERT INTO sessions (id, user_id, phrase_id) VALUES (?, ?, ?)"
    ).run(sessionId, userId || null, phraseId || null);

    // Train-Mode: auch in phrase_sessions eintragen
    if (mode === "train" && userId && phraseId) {
      db.prepare(
        "INSERT INTO phrase_sessions (session_id, phrase_id, user_id) VALUES (?, ?, ?)"
      ).run(sessionId, phraseId, userId);
    }

    // Events speichern
    const insertEvent = db.prepare(
      "INSERT INTO events (session_id, event_type, key_code, key_value, t) VALUES (?, ?, ?, ?, ?)"
    );
    const insertMany = db.transaction((rows) => {
      for (const e of rows) {
        insertEvent.run(
          sessionId,
          e.event_type,
          e.key_code,
          e.key_value || null,
          e.t
        );
      }
    });
    insertMany(events);

    res.json({ status: "ok", sessionId, eventCount: events.length });
  } catch (err) {
    console.error("❌ collect error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;