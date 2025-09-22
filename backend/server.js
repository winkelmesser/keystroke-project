const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

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

    //Lade bestehende Daten
    const data = loadData();

    //Falls Session noch nicht existiert, erstelle sie
    if (!data[sessionId]) {
    data[sessionId] = [];
    }

    //Events hinzufügen
    data[sessionId].push(...events);
    
    //Daten speichern
    saveData(data);

    console.log(`Session ${sessionId}: ${events.length} Events empfangen (gesamt: ${data[sessionId].length})`);
    res.json({status:'ok', totalEvents: data[sessionId].length});
});

app.get("/session/:id", (req, res) => {
    const { id } = req.params;
    const data = loadData();

    if (!data[id]) {
        return res.status(404).json({ message: "Session nicht gefunden" });
    }

    res.json({ sessionId: id, events: data[id] });
});


 //Starte den Server
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
