import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function FingerprintCompare({ sessionId, userId }) {
  const [sessionData, setSessionData] = useState(null);
  const [avgData, setAvgData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res1 = await fetch(`http://localhost:3001/api/sessions/${sessionId}/features`);
        const sData = await res1.json();
        setSessionData(sData);

        const res2 = await fetch(`http://localhost:3001/api/sessions/user/${userId}/avg-features`);
        const aData = await res2.json();
        setAvgData(aData);
      } catch (err) {
        console.error("❌ Fehler beim Laden", err);
      }
    }
    if (sessionId && userId) fetchData();
  }, [sessionId, userId]);

  if (!sessionData || !avgData) return <p>Lade Vergleich...</p>;

  // BarChart vorbereiten
  const combined = Object.entries(sessionData.features).map(([k, v]) => ({
    name: k,
    aktuelleSession: v,
    durchschnitt: avgData.avgFeatures[k] || 0,
  }));

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Vergleich: aktuelle Session vs. Durchschnitt</h2>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={combined}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="aktuelleSession" fill="#3b82f6" />
            <Bar dataKey="durchschnitt" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
