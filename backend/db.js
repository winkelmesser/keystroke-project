
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Sicherstellen, dass der data Ordner existiert
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

//Datenbankverbindung
const DB_PATH = path.join(dataDir, "keystroke.db");
const db = new Database(DB_PATH);

// Tabellen anlegen (falls nicht existieren)
db.exec(`
  PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phrases (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phrase_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (phrase_id) REFERENCES phrases(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  event_type TEXT,
  key_code TEXT,
  key_value TEXT,
  t REAL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS phrase_sessions (
  session_id TEXT PRIMARY KEY,
  phrase_id TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (phrase_id) REFERENCES phrases(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS phrase_profiles (
  phrase_id TEXT PRIMARY KEY,
  features_json TEXT,
  computed_at DATETIME,
  FOREIGN KEY (phrase_id) REFERENCES phrases(id)
);

CREATE TABLE IF NOT EXISTS consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  user_id TEXT,
  consent_type TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

//Datenbankverbindung exportieren
module.exports = db;