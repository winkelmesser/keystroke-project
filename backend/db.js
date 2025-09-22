const Database = require("better-sqlite3");

// DB-Datei im backend/data Ordner
const db = new Database("./data/keystroke.db");

// Tabellen anlegen (falls nicht existieren)
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    key_code TEXT,
    key_value TEXT,
    event_type TEXT,
    t REAL,
    FOREIGN KEY(session_id) REFERENCES sessions(id)
  );
`);

module.exports = db;