// ported from instrumenttuner@7156e04
/**
 * Average BPM from a list of tap timestamps (ms). Returns null if fewer than
 * two taps (no interval to measure). Mirrors the metronome tap-tempo math.
 */
export function averageBpmFromTaps(
  timestamps: readonly number[],
): number | null {
  if (timestamps.length < 2) return null
  const intervals: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1])
  }
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return Math.round(60000 / avg)
}
