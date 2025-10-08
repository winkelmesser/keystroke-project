import React, { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import useKeystrokeCapture from "../hooks/useKeystrokeCapture";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function Mimicry() {
  const [users, setUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [consent, setConsent] = useState(false);

  const { events, onKeyDown, onKeyUp, reset, count } = useKeystrokeCapture();
  const [attempts, setAttempts] = useState([]); // { attempt, score, time }
  const [status, setStatus] = useState("idle");
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef();
  const attemptCounter = useRef(0);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.error("Fehler beim Laden der Nutzer:", err);
      }
    }
    loadUsers();
  }, []);

  const handleKeyDown = (e) => {
    if (!consent) return; // Tippdaten nur mit Einwilligung
    setIsTyping(true);
    onKeyDown(e);
  };
  const handleKeyUp = (e) => {
    if (!consent) return;
    onKeyUp(e);
  };

  const doAttempt = async () => {
    if (!consent) {
      alert("Bitte zuerst zustimmen (Consent).");
      return;
    }
    if (!targetUserId) {
      alert("Bitte Ziel-User auswählen.");
      return;
    }
    if (events.length === 0) {
      alert("Keine Events – bitte tippe zuerst einen kurzen neutralen Satz.");
      return;
    }

    setStatus("Senden...");
    try {
      const res = await fetch(`${API_BASE}/api/attack/mimic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, events }),
      });
      const json = await res.json();

      if (res.ok) {
        attemptCounter.current += 1;
        const newAttempt = {
          attempt: attemptCounter.current,
          score: Number(json.score || 0),
          time: new Date().toLocaleTimeString(),
        };
        setAttempts((prev) => [...prev, newAttempt]);
        setStatus(`Score: ${newAttempt.score.toFixed(2)}`);
      } else {
        setStatus(json.error || "Server-Fehler");
      }
    } catch (err) {
      console.error("Fehler beim Mimicry-Request:", err);
      setStatus("Netzwerkfehler");
    } finally {
      reset();          // Events leeren
      setIsTyping(false);
    }
  };

  const resetAttempts = () => {
    setAttempts([]);
    attemptCounter.current = 0;
    setStatus("idle");
    reset();
    setIsTyping(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">Mimicry-Demo (Nachahmungstest)</h2>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-700 mb-2">
          Didaktisches Experiment: Wähle ein Ziel (User mit Trainings-Sessions) und versuche, dessen Tippmuster zu imitieren.
          Nutze nur neutrale Test-Sätze. Zustimmung ist erforderlich.
        </p>

        <div className="flex items-center gap-4 mb-3">
          <label className="block text-sm font-medium text-gray-700">Ziel-User</label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- auswählen --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.id})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm text-gray-700">Consent (erforderlich)</label>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm">Ich stimme zu, dass meine Tippdaten für diese Demo verwendet werden.</span>
          </div>
        </div>

        <label className="block mb-2 text-gray-600">Tippe hier (kurzer neutraler Satz):</label>
        <textarea
          ref={textareaRef}
          rows={4}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="w-full p-3 border rounded"
          placeholder="z. B. 'this is a demo sentence'"
          disabled={!consent}
        />

        {isTyping && (
          <p className="mt-1 text-sm text-green-600">
            Eingabe läuft… (Events werden aufgezeichnet) — Events: <b>{count}</b>
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={doAttempt}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={!consent || !targetUserId}
          >
            Versuch durchführen
          </button>
          <button onClick={() => { reset(); setIsTyping(false); }} className="px-3 py-1 bg-gray-200 rounded">
            Events zurücksetzen
          </button>
          <button onClick={resetAttempts} className="px-3 py-1 bg-red-500 text-white rounded">
            Versuche zurücksetzen
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600">Status: <strong>{status}</strong></p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Versuchsverlauf</h3>
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Versuche.</p>
        ) : (
          <>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={attempts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attempt" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#1d4ed8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <table className="min-w-full mt-3 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Zeit</th>
                  <th className="px-2 py-1 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.attempt} className="border-b">
                    <td className="px-2 py-1">{a.attempt}</td>
                    <td className="px-2 py-1">{a.time}</td>
                    <td className="px-2 py-1">{a.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
