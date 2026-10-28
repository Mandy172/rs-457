'use client'

import { useEffect } from 'react'
import { live } from '@/store/scroll'
import { useUI } from '@/store/ui'

type Graph = {
  ctx: AudioContext
  master: GainNode
  voice: GainNode
  filter: BiquadFilterNode
  oscA: OscillatorNode
  oscB: OscillatorNode
  lfo: OscillatorNode
}

function distortionCurve(amount: number) {
  const n = 1024
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(amount * x)
  }
  return curve
}

function build(): Graph | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  const ctx = new Ctor()

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const voice = ctx.createGain()
  voice.gain.value = 0.04
  voice.connect(master)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 320
  filter.Q.value = 4
  filter.connect(voice)

  // Firing pulses: amplitude-modulate the tone at the firing frequency.
  const pulse = ctx.createGain()
  pulse.gain.value = 0.6
  pulse.connect(filter)
  const lfo = ctx.createOscillator()
  lfo.type = 'square'
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 0.4
  lfo.connect(lfoDepth).connect(pulse.gain)

  const shaper = ctx.createWaveShaper()
  shaper.curve = distortionCurve(3.5)
  shaper.oversample = '2x'
  shaper.connect(pulse)

  const mix = ctx.createGain()
  mix.gain.value = 0.5
  mix.connect(shaper)

  const oscA = ctx.createOscillator()
  oscA.type = 'sawtooth'
  oscA.connect(mix)
  const oscB = ctx.createOscillator()
  oscB.type = 'square'
  oscB.detune.value = -8
  const bGain = ctx.createGain()
  bGain.gain.value = 0.6
  oscB.connect(bGain).connect(mix)

  oscA.start()
  oscB.start()
  lfo.start()
  return { ctx, master, voice, filter, oscA, oscB, lfo }
}

/** Synthesised twin-cylinder note driven by live.rpm. Created on the first user gesture. */
export function useEngineAudio() {
  useEffect(() => {
    let graph: Graph | null = null
    let raf = 0

    const unlock = () => {
      if (!graph) graph = build()
      graph?.ctx.resume()
      events.forEach((e) => window.removeEventListener(e, unlock))
    }
    const events = ['pointerdown', 'keydown', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }))

    const onVisibility = () => {
      if (!graph) return
      if (document.hidden) graph.ctx.suspend()
      else graph.ctx.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!graph) return
      const { ctx, master, voice, filter, oscA, oscB, lfo } = graph
      const now = ctx.currentTime
      const f = live.rpm / 60
      oscA.frequency.setTargetAtTime(f * 2, now, 0.03)
      oscB.frequency.setTargetAtTime(f, now, 0.03)
      lfo.frequency.setTargetAtTime(f, now, 0.03)
      filter.frequency.setTargetAtTime(320 + live.rev * 2600, now, 0.05)
      voice.gain.setTargetAtTime(0.035 + live.rev * 0.17, now, 0.05)
      master.gain.setTargetAtTime(useUI.getState().muted ? 0 : 1, now, 0.04)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      events.forEach((e) => window.removeEventListener(e, unlock))
      document.removeEventListener('visibilitychange', onVisibility)
      graph?.ctx.close()
    }
  }, [])
}
