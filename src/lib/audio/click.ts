// ported from instrumenttuner@7156e04
import type { AudioContext } from 'react-native-audio-api'

const CLICK_DURATION_SEC = 0.05

/** Schedule a single metronome click on the given AudioContext at `time` (sec). */
export function scheduleClick(
  ctx: AudioContext,
  time: number,
  isAccent: boolean,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = isAccent ? 1200 : 800
  gain.gain.setValueAtTime(isAccent ? 1.0 : 0.5, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION_SEC)
  osc.start(time)
  osc.stop(time + CLICK_DURATION_SEC)
}
