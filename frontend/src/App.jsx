import { useState, useRef } from "react";
import "./App.css";
import FingerprintView from "./components/FingerprintView";
import FingerprintCompare from "./components/FingerprintCompare";
import Mimicry from "./components/Mimicry";



function App() {
  const [consent, setConsent] = useState(false);
  const textareaRef = useRef();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle");
  const [lastSessionId, setLastSessionId] = useState(null);
  const [view, setView] = useState("capture");

  // Event-Handler
  const handleKeyDown = (e) => {
    const entry = {
      event_type: "down",
      key_value: e.key,
      key_code: e.code,
      t: performance.now(),
    };
    setEvents((prev) => [...prev, entry]);
    console.log(entry);
    if (consent) return;
  };

  const handleKeyUp = (e) => {
    const entry = {
      event_type: "up",
      key_value: e.key,
      key_code: e.code,
      t: performance.now(),
    };
    setEvents((prev) => [...prev, entry]);
    console.log(entry);
    if (consent) return;
  };

  // Funktion: Events an Backend senden
  const sendToBackend = async () => {
    if (events.length === 0) {
      setStatus("Keine Events zum Senden");
      return;
    }
    try {
      setStatus("Senden...");
      const res = await fetch("http://localhost:3001/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "train", // oder "attack" / "anon"
          userId: "user_123", // optional",
          phraseId: null,
          events,
        }),
      });

      const json = await res.json();
      if (res.ok && json.sessionId) {
        setStatus("Erfolgreich gesendet!");
        setLastSessionId(json.sessionId); // Session-ID merken
        setEvents([]); // Events zurücksetzen
      } else {
        setStatus("Fehler beim Senden");
      }
    } catch (err) {
      console.error("Fehler:", err);
      setStatus("Server nicht erreichbar");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Keystroke Dynamics Demo
      </h1>

      {!consent ? (
        <div className="bg-white p-4 rounded shadow max-w-md">
          <p className="mb-4 text-gray-700">
            Bevor du startest: Bitte stimme zu, dass Tastatur-Ereignisse
            (KeyDown/KeyUp) mit Zeitstempeln erfasst und in der Konsole
            angezeigt werden. Es werden keine Texte gespeichert.
          </p>
          <button
            onClick={() => setConsent(true)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Zustimmen
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <label className="block mb-2 text-gray-600">
            Tippe hier (Events erscheinen in der Konsole):
          </label>
          <textarea
            ref={textareaRef}
            rows={6}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            className="w-full p-3 border rounded"
            placeholder="Starte mit Tippen..."
          />

          {/* Buttons */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={sendToBackend}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Events senden
            </button>
            <button
              onClick={() => setEvents([])}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Reset
            </button>
          </div>

          {/* Event-Tabelle */}
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Key</th>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-1">{i + 1}</td>
                    <td className="px-3 py-1">{ev.event_type}</td>
                    <td className="px-3 py-1">{ev.key_value}</td>
                    <td className="px-3 py-1">{ev.key_code}</td>
                    <td className="px-3 py-1">{ev.t.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statusanzeige */}
          <p className="mt-2 text-sm text-gray-600">
            Status: <span className="font-semibold">{status}</span>
          </p>

          {/* FingerprintView */}
          {lastSessionId && (
            <>
            <div className="mt-8">
              <FingerprintView sessionId={lastSessionId} />
            </div>
            <div>
              <FingerprintCompare sessionId={lastSessionId} user />
            </div>
            </>
          )}

          {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setView("capture")} className={`px-3 py-1 rounded ${view === "capture" ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Capture</button>
              <button onClick={() => setView("mimicry")} className={`px-3 py-1 rounded ${view === "mimicry" ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Mimicry</button>
            </div>

          {/* Conditional rendering */}
            {view === "mimicry" && <Mimicry />}
        </div>
      )}
    </div>
  );
}

export default App;
