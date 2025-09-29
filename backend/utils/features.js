function extractFeatures(events) {
  const sorted = [...events].sort((a, b) => a.t - b.t);

  const dwellTimes = [];
  const ikis = [];
  const flightTimes = [];

  const downMap = {};
  let lastDown = null;
  let lastUp = null;

  for (const e of sorted) {
    if (e.event_type === "down") {
      // dwell vorbereiten
      downMap[e.key_code] = e.t;

      // IKI
      if (lastDown !== null) {
        ikis.push(e.t - lastDown);
      }
      lastDown = e.t;

      // Flight time
      if (lastUp !== null) {
        flightTimes.push(e.t - lastUp);
      }
    } else if (e.event_type === "up") {
      const downT = downMap[e.key_code];
      if (downT !== undefined) {
        dwellTimes.push(e.t - downT);
        delete downMap[e.key_code];
      }
      lastUp = e.t;
    }
  }

  // Stats helpers
  function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  function std(arr) {
    if (!arr.length) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
  }

  const sessionDuration = sorted.length
    ? sorted[sorted.length - 1].t - sorted[0].t
    : 0;

  // Key repetition count
  const keyCounts = {};
  for (const e of sorted) {
    if (e.event_type === "down") {
      keyCounts[e.key_code] = (keyCounts[e.key_code] || 0) + 1;
    }
  }
  const repeats = Object.values(keyCounts).filter((c) => c > 1).length;

  return {
    dwell_mean: mean(dwellTimes),
    dwell_std: std(dwellTimes),
    iki_mean: mean(ikis),
    iki_std: std(ikis),
    flight_mean: mean(flightTimes),
    flight_std: std(flightTimes),
    hold_to_iki_ratio: mean(dwellTimes) / (mean(ikis) || 1),
    session_duration: sessionDuration,
    total_keystrokes: sorted.length,
    repeat_keys: repeats,
  };
}

module.exports = { extractFeatures };