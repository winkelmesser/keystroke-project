import { useState } from "react";
import "./App.css";
import Capture from "./components/Capture";
import Mimicry from "./components/Mimicry";

function App() {
  const [view, setView] = useState("capture"); // "capture" | "mimicry"

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Keystroke Dynamics Demo</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setView("capture")}
              className={`px-3 py-1 rounded ${view === "capture" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Capture
            </button>
            <button
              onClick={() => setView("mimicry")}
              className={`px-3 py-1 rounded ${view === "mimicry" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Mimicry
            </button>
          </nav>
        </header>

        {view === "capture" && <Capture />}
        {view === "mimicry" && <Mimicry />}
      </div>
    </div>
  );
}

export default App;
