'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { MathUtils } from 'three'
import { live, useScene } from '@/store/scroll'
import { useUI } from '@/store/ui'
import { gsap } from '@/lib/scroll'
import { stageAt } from '@/lib/timeline'
import { IDLE_RPM, MAX_RPM } from '@/lib/rev'
import { useIsMobile, useReducedMotion } from '@/hooks/use-media'
import { Studio } from './Studio'
import { CameraRig } from './CameraRig'
import { ProceduralBike } from './ProceduralBike'
import { GLBBike, ModelBoundary } from './GLBBike'

function useScrollDriver(reduced: boolean) {
  useEffect(() => {
    const proxy = { p: 0 }
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        scrub: reduced ? true : 0.7,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        live.progress = proxy.p
        const stage = stageAt(proxy.p)
        const scene = useScene.getState()
        if (stage !== scene.stage) scene.setStage(stage)
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reduced])
}

function RevSim() {
  const hold = useRef(0)
  useFrame((_, dt) => {
    const held = useUI.getState().revHeld
    hold.current = held ? hold.current + dt : 0
    const target = held ? IDLE_RPM + (MAX_RPM - IDLE_RPM) * Math.pow(Math.min(1, hold.current / 2.4), 0.7) : IDLE_RPM
    live.rpm = MathUtils.damp(live.rpm, target, held ? 5 : 2.4, dt)
    live.rev = (live.rpm - IDLE_RPM) / (MAX_RPM - IDLE_RPM)
  })
  return null
}

function LoadReporter() {
  const progress = useProgress((s) => s.progress)
  useEffect(() => {
    useScene.getState().setLoadProgress(progress)
  }, [progress])
  return null
}

function Ready() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 3) useScene.getState().setSceneReady()
  })
  return null
}

function Bike({ hasModel, reduced }: { hasModel: boolean; reduced: boolean }) {
  const fallback = <ProceduralBike reduced={reduced} />
  if (!hasModel) return fallback
  return (
    <ModelBoundary fallback={fallback}>
      <GLBBike reduced={reduced} />
    </ModelBoundary>
  )
}

export default function Scene({ hasModel }: { hasModel: boolean }) {
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  useScrollDriver(reduced)

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 32, near: 0.1, far: 60, position: [4, 1.4, 4.5] }}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
        onPointerMissed={() => useScene.getState().setSelected(null)}
      >
        <LoadReporter />
        <RevSim />
        <Suspense fallback={null}>
          <Studio mobile={mobile} />
          <Bike hasModel={hasModel} reduced={reduced} />
          <Ready />
        </Suspense>
        <CameraRig mobile={mobile} reduced={reduced} />
        {!mobile && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.9} levels={7} />
            <Vignette offset={0.25} darkness={0.85} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
