const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

//Middleware
app.use(cors());
app.use(express.json());

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

    //Falls Session noch nicht existiert, erstelle sie
    if (!session[sessionId]) {
    session[sessionId] = [];
    }

    //Events hinzufügen
    session[sessionId].push(...events);
    console.log(`Session ${sessionId} hat jetzt ${session[sessionId].length} Events.`);
    res.json({status: "ok", totalEvents: session[sessionId].length});
});

app.get("/session/:id", (req, res) => {
    const { id } = req.params;
    if (!session[id]) {
        return res.status(404).json({ message: "Session nicht gefunden" });
    }
    res.json({ sessionId: id, events: session[id] });
});


 //Starte den Server
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
