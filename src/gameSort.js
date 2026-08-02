export function compareGameInnings(a, b) {
  if (!a.linescore && !b.linescore) {
    return 0;
  }
  if (!a.linescore) {
    return 1;
  }
  if (!b.linescore) {
    return -1;
  }

  const inningCompare = b.linescore.currentInning - a.linescore.currentInning;
  if (inningCompare !== 0) {
    return inningCompare;
  }
  if (a.isTopInning && !b.isTopInning) {
    return -1;
  }
  if (b.isTopInning && !a.isTopInning) {
    return 1;
  }
  return 0;
}
