import React, { useEffect, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function FingerprintView({ sessionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatures() {
      try {
        const res = await fetch(`http://localhost:3001/api/sessions/${sessionId}/features`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Fehler beim Laden der Features", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatures();
  }, [sessionId]);

  if (loading) return <p className="text-gray-500">Lade Features...</p>;
  if (!data || !data.features) return <p className="text-red-500">Keine Features gefunden</p>;

  const f = data.features;

  // Für BarChart: Key-Value Paare (numerische Features)
  const barData = Object.entries(f)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => ({ name: k, value: v }));

  // Für RadarChart: nur Mittelwerte
  const radarData = [
    { metric: "dwell_mean", value: f.dwell_mean },
    { metric: "iki_mean", value: f.iki_mean },
    { metric: "flight_mean", value: f.flight_mean },
    { metric: "hold_to_iki_ratio", value: f.hold_to_iki_ratio }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Fingerprint für Session {sessionId}</h2>

      {/* Tabelle */}
      <table className="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border px-2 py-1">Feature</th>
            <th className="border px-2 py-1">Wert</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(f).map(([k, v]) => (
            <tr key={k}>
              <td className="border px-2 py-1">{k}</td>
              <td className="border px-2 py-1">{typeof v === "number" ? v.toFixed(2) : v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BarChart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RadarChart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            <Radar name="Profile" dataKey="value" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
