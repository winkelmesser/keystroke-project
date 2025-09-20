import { useState, useRef } from 'react';
import './App.css'


function App() {
  const [consent, setConsent] = useState(false);
  const textareaRef = useRef();

  // Event-Handler
  const handleKeyDown = (e) => {
    if (!consent) return;
    console.log({
      type: "down",
      code: e.code,
      time: performance.now(),
    });
  };

  const handleKeyUp = (e) => {
    if (!consent) return;
    console.log({
      type: "up",
      code: e.code,
      time: performance.now(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
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
        </div>
      )}
    </div>
  );
}

export default App;

