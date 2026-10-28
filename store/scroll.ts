import { create } from 'zustand'
import type { PartId } from '@/data/parts'
import { IDLE_RPM } from '@/lib/rev'

export type ScreenPoint = { x: number; y: number; visible: boolean }

/**
 * Per-frame values written by the scene and read by the overlay inside rAF loops.
 * Kept outside React state so 60fps updates never trigger re-renders.
 */
export const live = {
  progress: 0,
  rpm: IDLE_RPM,
  rev: 0,
  screen: {} as Partial<Record<PartId, ScreenPoint>>,
}

type SceneState = {
  stage: number
  hovered: PartId | null
  selected: PartId | null
  loadProgress: number
  sceneReady: boolean
  setStage: (stage: number) => void
  setHovered: (id: PartId | null) => void
  setSelected: (id: PartId | null) => void
  setLoadProgress: (v: number) => void
  setSceneReady: () => void
}

/** Written only from components/Scene. The overlay subscribes read-only. */
export const useScene = create<SceneState>()((set) => ({
  stage: -1,
  hovered: null,
  selected: null,
  loadProgress: 0,
  sceneReady: false,
  setStage: (stage) => set({ stage, selected: null }),
  setHovered: (hovered) => set({ hovered }),
  setSelected: (selected) => set({ selected }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setSceneReady: () => set({ sceneReady: true }),
}))
