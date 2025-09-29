import React, { useState, useMemo } from "react";
import useKeystrokeCapture from "../hooks/useKeystrokeCapture";
import FingerprintView from "./FingerprintView";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function Capture() {
  const { events, onKeyDown, onKeyUp, reset, count } = useKeystrokeCapture();
  const [status, setStatus] = useState("idle");
  const [lastSessionId, setLastSessionId] = useState(null);
  const [consent, setConsent] = useState(false);

  // einfache „Benutzerwahl“ (bis wir echtes User-Management anbinden)
  const [userId, setUserId] = useState("user_demo");
  const [mode, setMode] = useState("train");     // "train" | "attack" | "anon"
  const [phraseId, setPhraseId] = useState("");  // optional

  const canSend = useMemo(() => consent && events.length > 0, [consent, events.length]);

  const sendToBackend = async () => {
    if (!canSend) return;
    setStatus("Senden...");
    try {
      const res = await fetch(`${API_BASE}/api/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          userId: mode === "train" ? userId : null,
          phraseId: mode === "train" && phraseId ? phraseId : null,
          events
        })
      });
      const json = await res.json();
      if (res.ok && json.sessionId) {
        setStatus("Erfolgreich gesendet");
        setLastSessionId(json.sessionId);
        reset();
      } else {
        setStatus(json?.error || "Fehler beim Senden");
      }
    } catch (e) {
      console.error(e);
      setStatus("Server nicht erreichbar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Capture (Events erfassen)</h2>

        <div className="flex flex-wrap gap-3 mb-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            <span className="text-sm">Ich stimme der Erfassung zu (nur Timing, keine Klartexte).</span>
          </label>

          <label className="text-sm">
            Modus:&nbsp;
            <select value={mode} onChange={e => setMode(e.target.value)} className="border px-2 py-1 rounded">
              <option value="train">train</option>
              <option value="attack">attack</option>
              <option value="anon">anon</option>
            </select>
          </label>

          {mode === "train" && (
            <>
              <label className="text-sm">
                User-ID:&nbsp;
                <input
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="border px-2 py-1 rounded"
                  placeholder="user_demo"
                />
              </label>
              <label className="text-sm">
                Phrase-ID (optional):&nbsp;
                <input
                  value={phraseId}
                  onChange={e => setPhraseId(e.target.value)}
                  className="border px-2 py-1 rounded"
                  placeholder="leave empty"
                />
              </label>
            </>
          )}
        </div>

        <label className="block mb-2 text-gray-600">Tippe hier (neutraler Text):</label>
        <textarea
          rows={5}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className="w-full p-3 border rounded"
          placeholder="z. B. „this is a demo sentence“"
          disabled={!consent}
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={sendToBackend}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!canSend}
          >
            Events senden
          </button>
          <button onClick={reset} className="px-3 py-1 bg-gray-200 rounded">Reset</button>
          <span className="text-sm text-gray-600">gesammelte Events: <b>{count}</b></span>
          <span className="text-sm text-gray-600">Status: <b>{status}</b></span>
        </div>
      </div>

      {lastSessionId && (
        <div className="bg-white p-4 rounded shadow">
          <FingerprintView sessionId={lastSessionId} />
        </div>
      )}
    </div>
  );
}
 