'use client'

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { MathUtils, Vector3, type Group, type PointLight } from 'three'
import { PART_INDEX, type Part } from '@/data/parts'
import { live, useScene } from '@/store/scroll'
import { explodeAmount, focusAmount } from '@/lib/timeline'
import { exhaustGlow } from './materials'
import { anchorsWorld } from './registry'

export const PartActive = createContext(false)

/** Mesh that draws a hard red outline while its part is hovered or selected. */
export function M({ children, ...props }: ThreeElements['mesh']) {
  const active = useContext(PartActive)
  return (
    <mesh {...props}>
      {children}
      {active && <Outlines thickness={0.012} color="#e10600" />}
    </mesh>
  )
}

type Props = { part: Part; anchor: Vector3; reduced: boolean; children: ReactNode }

export function PartGroup({ part, anchor, reduced, children }: Props) {
  const ref = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)
  const index = PART_INDEX[part.id]
  const active = useScene((s) => s.hovered === part.id || s.selected === part.id)
  const holdTimer = useRef<number | null>(null)
  const heldSelect = useRef(false)

  const explode = useMemo(() => new Vector3(...part.rig.explode), [part])
  const base = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  const projected = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const p = live.progress
    const selected = useScene.getState().selected === part.id ? 1 : 0
    const k = explodeAmount(p) + focusAmount(p, index) * 0.35 + selected * 0.15
    target.copy(explode).multiplyScalar(k)

    if (reduced) base.copy(target)
    else {
      const lambda = 7
      base.x = MathUtils.damp(base.x, target.x, lambda, dt)
      base.y = MathUtils.damp(base.y, target.y, lambda, dt)
      base.z = MathUtils.damp(base.z, target.z, lambda, dt)
    }
    g.position.copy(base)

    if (part.id === 'engine' && !reduced) {
      const amp = 0.0012 + live.rev * 0.012
      g.position.x += (Math.random() - 0.5) * amp
      g.position.y += (Math.random() - 0.5) * amp
      g.position.z += (Math.random() - 0.5) * amp * 0.5
    }

    if (part.id === 'exhaust') {
      exhaustGlow.emissiveIntensity = 0.15 + live.rev * 7
      if (lightRef.current) lightRef.current.intensity = live.rev * 4
    }

    const world = (anchorsWorld[part.id] ??= new Vector3())
    world.copy(anchor).add(base)

    projected.copy(world).project(state.camera)
    const sp = (live.screen[part.id] ??= { x: 0, y: 0, visible: false })
    sp.x = (projected.x * 0.5 + 0.5) * state.size.width
    sp.y = (-projected.y * 0.5 + 0.5) * state.size.height
    sp.visible = projected.z < 1 && Math.abs(projected.x) < 1.2 && Math.abs(projected.y) < 1.2
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    useScene.getState().setHovered(part.id)
    document.body.style.cursor = 'crosshair'
  }
  const onOut = () => {
    if (useScene.getState().hovered === part.id) useScene.getState().setHovered(null)
    document.body.style.cursor = ''
  }
  const clearHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
  }
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    heldSelect.current = false
    clearHold()
    holdTimer.current = window.setTimeout(() => {
      heldSelect.current = true
      useScene.getState().setSelected(part.id)
    }, 280)
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    clearHold()
    if (heldSelect.current) {
      heldSelect.current = false
      return
    }
    const { selected, setSelected } = useScene.getState()
    setSelected(selected === part.id ? null : part.id)
  }

  return (
    <group
      ref={ref}
      name={part.id}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onPointerDown={onDown}
      onPointerUp={clearHold}
      onClick={onClick}
    >
      <PartActive.Provider value={active}>{children}</PartActive.Provider>
      {part.id === 'exhaust' && (
        <pointLight
          ref={lightRef}
          position={[anchor.x - 0.3, anchor.y, anchor.z + 0.1]}
          color="#ff3a10"
          intensity={0}
          distance={1.6}
          decay={2}
        />
      )}
    </group>
  )
}
