import { Vector3 } from 'three'
import type { PartId } from '@/data/parts'

/** Current world-space anchor of each part (rest anchor + explode offset), updated every frame. */
export const anchorsWorld: Partial<Record<PartId, Vector3>> = {}

/** Visual center of the assembled bike. */
export const BIKE_CENTER = new Vector3(0.02, 0.55, 0)
