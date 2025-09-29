const express = require("express");
const router = express.Router();
const db = require("../db");
const { extractFeatures } = require("../utils/features");
const { euclideanSimilarity } = require("../utils/similarity");

// POST /api/attack/mimic
router.post("/mimic", (req, res) => {
  const { targetUserId, events } = req.body;

  if (!targetUserId || !Array.isArray(events)) {
    return res.status(400).json({ error: "targetUserId und events erforderlich" });
  }

  try {
    // Sessions des Ziel-Users laden
    const sessions = db
      .prepare("SELECT id FROM sessions WHERE user_id = ?")
      .all(targetUserId);

    if (!sessions.length) {
      return res.status(404).json({ error: "Keine Sessions für Ziel-User" });
    }

    // Features aller Ziel-Sessions berechnen
    const allFeatures = [];
    const selectEvents = db.prepare(
      "SELECT event_type, key_code, key_value, t FROM events WHERE session_id = ? ORDER BY t"
    );

    for (const s of sessions) {
      const evts = selectEvents.all(s.id);
      if (evts.length) {
        allFeatures.push(extractFeatures(evts));
      }
    }

    if (!allFeatures.length) {
      return res.status(404).json({ error: "Keine Features für Ziel-User" });
    }

    // Durchschnittsprofil des Ziel-Users
    const featureKeys = Object.keys(allFeatures[0]);
    const avgTarget = {};
    for (const k of featureKeys) {
      const values = allFeatures.map((f) => f[k] || 0);
      avgTarget[k] = values.reduce((a, b) => a + b, 0) / values.length;
    }

    // Features des Angreifers
    const attackerFeatures = extractFeatures(events);

    // Similarity Score berechnen
    const score = euclideanSimilarity(attackerFeatures, avgTarget);

    res.json({
      targetUserId,
      score,
      attackerFeatures,
      targetAvgFeatures: avgTarget,
    });
  } catch (err) {
    console.error("❌ mimicry error", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
