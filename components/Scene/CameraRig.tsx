'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import { PARTS, PART_BY_ID } from '@/data/parts'
import { live, useScene } from '@/store/scroll'
import { sampleCamera, type CamKey } from '@/lib/timeline'
import { anchorsWorld, BIKE_CENTER } from './registry'

const DEG = Math.PI / 180

export function CameraRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const tA = useMemo(() => new Vector3(), [])
  const tB = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  const desired = useMemo(() => new Vector3(), [])
  const curPos = useMemo(() => new Vector3(4, 1.4, 4.5), [])
  const curTarget = useMemo(() => BIKE_CENTER.clone(), [])
  const offset = useRef({ x: 0, y: 0 })
  const first = useRef(true)

  useEffect(() => {
    camera.fov = mobile ? 42 : 32
    camera.updateProjectionMatrix()
  }, [camera, mobile])

  const targetFor = (key: CamKey, out: Vector3) => {
    out.copy(BIKE_CENTER)
    if (key.focus >= 0) {
      const a = anchorsWorld[PARTS[key.focus].id]
      if (a) out.lerp(a, 0.5)
    }
    out.y += key.lift
    return out
  }

  useFrame((state, dt) => {
    const { a, b, t } = sampleCamera(live.progress)
    targetFor(a, tA)
    targetFor(b, tB)
    target.lerpVectors(tA, tB, t)

    const az = MathUtils.lerp(a.az, b.az, t) * DEG
    const el = MathUtils.lerp(a.el, b.el, t) * DEG
    const r = MathUtils.lerp(a.r, b.r, t) * (mobile ? 1.35 : 1)
    desired.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(r).add(target)

    const lambda = reduced || first.current ? 1000 : 4
    first.current = false
    curPos.x = MathUtils.damp(curPos.x, desired.x, lambda, dt)
    curPos.y = MathUtils.damp(curPos.y, desired.y, lambda, dt)
    curPos.z = MathUtils.damp(curPos.z, desired.z, lambda, dt)
    curTarget.x = MathUtils.damp(curTarget.x, target.x, lambda, dt)
    curTarget.y = MathUtils.damp(curTarget.y, target.y, lambda, dt)
    curTarget.z = MathUtils.damp(curTarget.z, target.z, lambda, dt)

    camera.position.copy(curPos)
    if (!reduced && live.rev > 0.01) {
      const amp = live.rev * 0.022
      const time = state.clock.elapsedTime
      camera.position.x += Math.sin(time * 71) * amp
      camera.position.y += Math.sin(time * 53 + 1.3) * amp
    }
    camera.lookAt(curTarget)

    // Shift the rendered frame so the bike sits in the space the info panel leaves free.
    const { selected, stage } = useScene.getState()
    const activeId = selected ?? (stage >= 0 && stage < PARTS.length ? PARTS[stage].id : null)
    const side = activeId ? PART_BY_ID[activeId].side : null
    const { width, height } = state.size
    const wantX = mobile || !side ? 0 : side === 'left' ? -0.15 * width : 0.15 * width
    const wantY = mobile && side ? 0.16 * height : 0
    const offLambda = reduced ? 1000 : 3.5
    offset.current.x = MathUtils.damp(offset.current.x, wantX, offLambda, dt)
    offset.current.y = MathUtils.damp(offset.current.y, wantY, offLambda, dt)
    camera.setViewOffset(width, height, offset.current.x, offset.current.y, width, height)
  })

  return null
}
