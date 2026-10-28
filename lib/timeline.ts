import { PARTS } from '@/data/parts'

// Page = hero 100vh + anatomy 600vh + marquee 100vh + finale 100vh = 900vh.
export const EXPLODE_START = 0.03
export const EXPLODE_END = 0.13
export const PARTS_START = 0.13
export const PARTS_END = 0.74
export const REASSEMBLE_START = 0.76
export const REASSEMBLE_END = 0.9
export const PART_WINDOW = (PARTS_END - PARTS_START) / PARTS.length

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function explodeAmount(p: number) {
  if (p <= EXPLODE_START) return 0
  if (p < EXPLODE_END) return easeInOutCubic((p - EXPLODE_START) / (EXPLODE_END - EXPLODE_START))
  if (p < REASSEMBLE_START) return 1
  if (p < REASSEMBLE_END)
    return 1 - easeInOutCubic((p - REASSEMBLE_START) / (REASSEMBLE_END - REASSEMBLE_START))
  return 0
}

/** -1 = hero, 0..9 = part stage, 10 = reassembly / finale. */
export function stageAt(p: number) {
  if (p < PARTS_START) return -1
  if (p >= PARTS_END) return PARTS.length
  return Math.min(PARTS.length - 1, Math.floor((p - PARTS_START) / PART_WINDOW))
}

/** 0..1 bump while a part is the active stage. */
export function focusAmount(p: number, index: number) {
  const t = (p - (PARTS_START + index * PART_WINDOW)) / PART_WINDOW
  if (t <= 0 || t >= 1) return 0
  if (t < 0.2) return easeInOutCubic(t / 0.2)
  if (t > 0.85) return 1 - easeInOutCubic((t - 0.85) / 0.15)
  return 1
}

export const progressForStage = (index: number) => PARTS_START + (index + 0.5) * PART_WINDOW

export type CamKey = { p: number; az: number; el: number; r: number; focus: number; lift: number }

function buildKeys(): CamKey[] {
  const keys: CamKey[] = [
    { p: 0, az: 32, el: 7, r: 5.6, focus: -1, lift: 0.32 },
    { p: EXPLODE_START, az: 32, el: 7, r: 5.6, focus: -1, lift: 0.32 },
    { p: PARTS_START, az: 18, el: 16, r: 6.4, focus: -1, lift: 0 },
  ]
  PARTS.forEach((part, i) => {
    const start = PARTS_START + i * PART_WINDOW
    const cam = { ...part.rig.camera, focus: i, lift: 0 }
    keys.push({ p: start + PART_WINDOW * 0.22, ...cam })
    keys.push({ p: start + PART_WINDOW * 0.8, ...cam })
  })
  keys.push({ p: REASSEMBLE_START, az: -25, el: 14, r: 6.2, focus: -1, lift: 0 })
  keys.push({ p: REASSEMBLE_END, az: 0, el: 6, r: 5.4, focus: -1, lift: 0.12 })
  keys.push({ p: 1, az: -8, el: 5, r: 5.2, focus: -1, lift: 0.12 })
  return keys
}

export const CAMERA_KEYS = buildKeys()

export function sampleCamera(p: number) {
  const keys = CAMERA_KEYS
  let i = 0
  while (i < keys.length - 2 && p > keys[i + 1].p) i++
  const a = keys[i]
  const b = keys[i + 1]
  const span = b.p - a.p
  const t = span <= 0 ? 1 : easeInOutCubic(clamp01((p - a.p) / span))
  return { a, b, t }
}
