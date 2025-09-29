// frontend/src/hooks/useKeystrokeCapture.js
import { useState, useCallback } from "react";

export default function useKeystrokeCapture() {
  const [events, setEvents] = useState([]);

  const onKeyDown = useCallback((e) => {
    setEvents(prev => [...prev, {
      event_type: "down",
      key_code: e.code,
      key_value: e.key,
      t: performance.now()
    }]);
  }, []);

  const onKeyUp = useCallback((e) => {
    setEvents(prev => [...prev, {
      event_type: "up",
      key_code: e.code,
      key_value: e.key,
      t: performance.now()
    }]);
  }, []);

  const reset = useCallback(() => setEvents([]), []);

  return { events, onKeyDown, onKeyUp, reset, count: events.length };
}
