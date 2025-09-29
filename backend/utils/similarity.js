function euclideanSimilarity(featuresA, featuresB) {
  const keys = Object.keys(featuresA).filter(
    (k) => typeof featuresA[k] === "number" && typeof featuresB[k] === "number"
  );

  if (keys.length === 0) return 0;

  let sumSq = 0;
  for (const k of keys) {
    const diff = (featuresA[k] || 0) - (featuresB[k] || 0);
    sumSq += diff * diff;
  }
  const distance = Math.sqrt(sumSq);

  // Normalisierung: kleiner Abstand = hoher Score
  const score = 100 / (1 + distance);
  return score; // ca. 0–100
}

module.exports = { euclideanSimilarity };
