const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3001;

//Middleware
app.use(cors());
app.use(express.json());

//Pfad zur JSON-Datei
const DATA_FILE = path.join(__dirname, "data","session.json");

//Lade Daten aus der Datei
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return raw ? JSON.parse(raw) : {};
  }

//Speichere Daten in die Datei
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


//--In-Memory Store
const session = {}

//Healthcheck
app.get("/", (req, res) => {
  res.send("✅ Backend läuft!");
});

//Route zum Sammeln der Events
app.post("/collect", (req, res) => {
  const { sessionId, events } = req.body;

    if (!sessionId || !Array.isArray(events)) {
    return res.status(400).json({ message: "Ungültige Daten" });
    }

    //Sessin anlegen falls nicht vorhanden
    const insertSession = db.prepare("INSERT OR IGNORE INTO sessions (id) VALUES (?)");
    insertSession.run(sessionId);

    //Event einfügen
    const insertEvent = db.prepare("INSERT INTO events (session_id, key_code, key_value, event_type, t) VALUES (?, ?, ?, ?, ?)");

    const insertMany = db.transaction((events) => {
      for (const ev of events) {
        insertEvent.run(sessionId, ev.code, ev.key, ev.type, ev.time);
      }
    });

    insertMany(events);

    console.log(`Session ${sessionId}: ${events.length} Events gespeichert (SQLite)`);
    res.json({status:'ok', saved : events.length });
});

app.get("/session/:id", (req, res) => {
    const { id } = req.params;
    const session = db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(id);

    if (!session) {
      return res.status(404).json({ message: "Session nicht gefunden" });
    }
    const events = db
      .prepare("SELECT key_code, key_value, event_type, t FROM events WHERE session_id = ? ORDER BY id ASC")
      .all(id);

    res.json({ sessionId: id, created_at: session.created_at, events});
});


 //Starte den Server
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
