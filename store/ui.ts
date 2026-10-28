import { create } from 'zustand'

type UIState = {
  loaded: boolean
  muted: boolean
  revHeld: boolean
  setLoaded: () => void
  toggleMuted: () => void
  setRevHeld: (held: boolean) => void
}

/** User intents written by the overlay (loader, REV input, mute). The scene reads them. */
export const useUI = create<UIState>()((set) => ({
  loaded: false,
  muted: false,
  revHeld: false,
  setLoaded: () => set({ loaded: true }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setRevHeld: (revHeld) => set({ revHeld }),
}))
