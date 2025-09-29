const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// Create user
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "Name required" });
  const id = "user_" + uuidv4().slice(0,8);
  const stmt = db.prepare("INSERT INTO users (id, name) VALUES (?, ?)");
  try {
    stmt.run(id, name);
    res.json({ userId: id, name });
  } catch (err) {
    console.error("users POST error", err);
    res.status(500).json({ error: "DB error" });
  }
});

// List users
router.get("/", (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, created_at FROM users ORDER BY created_at DESC").all();
    res.json({ count: users.length, users });
  } catch (err) {
    console.error("users GET error", err);
    res.status(500).json({ error: "DB error" });
  }
});

// Delete user's data (sessions/events/phrase_sessions) - data wipe
router.delete("/:id/data", (req, res) => {
  const userId = req.params.id;
  try {
    const sessions = db.prepare("SELECT id FROM sessions WHERE user_id = ?").all(userId);
    const delEvents = db.prepare("DELETE FROM events WHERE session_id = ?");
    const delSessions = db.prepare("DELETE FROM sessions WHERE id = ?");
    const delPhraseSessions = db.prepare("DELETE FROM phrase_sessions WHERE user_id = ?");
    const delConsents = db.prepare("DELETE FROM consents WHERE user_id = ?");

    const tx = db.transaction((sessions) => {
      for (const s of sessions) {
        delEvents.run(s.id);
        delSessions.run(s.id);
      }
      delPhraseSessions.run(userId);
      delConsents.run(userId);
    });

    tx(sessions);
    res.json({ status: "ok", message: "Daten des Nutzers gelöscht" });
  } catch (err) {
    console.error("users DELETE error", err);
    res.status(500).json({ error: "DB error" });
  }
});

// GET /api/users/:id/avg-features
router.get("/:id/avg-features", (req, res) => {
  const userId = req.params.id;
  
  
  try {
    // alle Session-IDs des Users
    const sessions = db
      .prepare("SELECT id FROM sessions WHERE user_id = ?")
      .all(userId);

    if (!sessions.length) {
      return res.status(404).json({ error: "Keine Sessions für diesen User" });
    }

    const allFeatures = [];
    const selectEvents = db.prepare(
      "SELECT event_type, key_code, key_value, t FROM events WHERE session_id = ? ORDER BY t"
    );

    for (const s of sessions) {
      const events = selectEvents.all(s.id);
      if (events.length) {
        const f = extractFeatures(events);
        allFeatures.push(f);
      }
    }

    if (!allFeatures.length) {
      return res.status(404).json({ error: "Keine Features für diesen User" });
    }

    // Mittelwerte über alle Sessions bilden
    const featureKeys = Object.keys(allFeatures[0]);
    const avg = {};
    for (const k of featureKeys) {
      const values = allFeatures.map((f) => f[k]);
      const sum = values.reduce((a, b) => a + b, 0);
      avg[k] = sum / values.length;
    }

    res.json({ userId, sessions: sessions.length, avgFeatures: avg });
  } catch (err) {
    console.error("❌ avg-features error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;