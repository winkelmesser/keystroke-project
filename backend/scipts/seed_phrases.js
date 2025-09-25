// Seed-Skript für Phrasen in der Datenbank
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

const phrases = [
  "the quick brown fox jumps over the lazy dog",
  "lorem ipsum dolor sit amet",
  "keystroke dynamics demo text one",
  "keystroke timing teaches privacy risks",
  "learning security through interactive demos",
  "this is a neutral training phrase",
  "practice typing to create a fingerprint",
  "consent is required before collecting data",
  "we do not store secret or personal data",
  "timing patterns are unique but not plaintext"
];

// insert phrases
const insert = db.prepare("INSERT OR IGNORE INTO phrases (id, text) VALUES (?, ?)");
const insertMany = db.transaction((rows) => {
  for (const r of rows) insert.run(r.id, r.text);
});

const rows = phrases.map((p) => ({ id: "phrase_" + uuidv4().slice(0,8), text: p }));

try {
  insertMany(rows);
  console.log("✅ Seeded phrases:");
  rows.forEach(r => console.log(r.id, ":", r.text));
} catch (err) {
  console.error("❌ Fehler beim Seed:", err);
}
process.exit(0);