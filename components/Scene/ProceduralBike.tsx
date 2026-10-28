'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Quaternion, Shape, Vector3, type Group, type Material } from 'three'
import { PARTS, type PartId, type Vec3 } from '@/data/parts'
import { live } from '@/store/scroll'
import { M, PartGroup } from './PartGroup'
import { exhaustGlow, mats } from './materials'

const UP = new Vector3(0, 1, 0)
const PI = Math.PI

function Tube({ a, b, r = 0.02, material }: { a: Vec3; b: Vec3; r?: number; material: Material }) {
  const key = `${a.join()}|${b.join()}`
  const { position, quaternion, length } = useMemo(() => {
    const va = new Vector3(...a)
    const vb = new Vector3(...b)
    const dir = vb.clone().sub(va)
    const length = dir.length()
    return {
      length,
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.normalize()),
      position: va.add(vb).multiplyScalar(0.5),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return (
    <M position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[r, r, length, 12]} />
    </M>
  )
}

function Slab({ points, depth, z = 0, material }: { points: [number, number][]; depth: number; z?: number; material: Material }) {
  const key = points.flat().join()
  const geometry = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(points[0][0], points[0][1])
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y))
    shape.closePath()
    const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    g.translate(0, 0, -depth / 2)
    g.computeVertexNormals()
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, depth])
  return <M geometry={geometry} position-z={z} material={material} />
}

function Box({ p, s, r = [0, 0, 0], material }: { p: Vec3; s: Vec3; r?: Vec3; material: Material }) {
  return (
    <M position={p} rotation={r} material={material}>
      <boxGeometry args={s} />
    </M>
  )
}

function Wheel({ center, front }: { center: Vec3; front?: boolean }) {
  const spin = useRef<Group>(null)
  useFrame(() => {
    if (spin.current) spin.current.rotation.z = -live.progress * 28
  })
  return (
    <group position={center}>
      <group ref={spin}>
        <M material={mats.rubber}>
          <torusGeometry args={[0.25, 0.065, 14, 48]} />
        </M>
        <M material={mats.gunmetal} rotation-x={PI / 2}>
          <cylinderGeometry args={[0.19, 0.19, 0.05, 40, 1, true]} />
        </M>
        <M material={mats.red}>
          <torusGeometry args={[0.188, 0.004, 6, 48]} />
        </M>
        {[0, 1, 2].map((k) => (
          <Box key={k} p={[0, 0, 0]} s={[0.37, 0.026, 0.02]} r={[0, 0, (k * PI) / 3]} material={mats.gunmetal} />
        ))}
        <M material={mats.metal} rotation-x={PI / 2}>
          <cylinderGeometry args={[0.045, 0.045, 0.14, 16]} />
        </M>
        <M material={mats.metal} rotation-x={PI / 2} position-z={front ? 0.08 : -0.08}>
          <cylinderGeometry args={[front ? 0.15 : 0.11, front ? 0.15 : 0.11, 0.006, 40]} />
        </M>
      </group>
      <Box
        p={front ? [-0.11, 0.09, 0.095] : [-0.09, -0.06, -0.095]}
        s={[0.05, 0.09, 0.03]}
        r={[0, 0, front ? 0.6 : -0.4]}
        material={mats.red}
      />
    </group>
  )
}

const PARTS_JSX: Record<PartId, () => React.ReactNode> = {
  fairing: () => (
    <>
      <Slab
        points={[[0.93, 0.72], [0.8, 0.8], [0.62, 1.01], [0.53, 0.99], [0.5, 0.86], [0.56, 0.63], [0.84, 0.63]]}
        depth={0.3}
        material={mats.paint}
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab
            points={[[0.5, 0.86], [0.25, 0.76], [0.05, 0.62], [0.0, 0.42], [0.12, 0.26], [0.33, 0.26], [0.36, 0.56], [0.56, 0.63]]}
            depth={0.018}
            z={0.175 * s}
            material={mats.paint}
          />
          <Slab points={[[0.48, 0.8], [0.3, 0.73], [0.18, 0.6], [0.42, 0.66]]} depth={0.02} z={0.182 * s} material={mats.red} />
          <Slab points={[[0.3, 0.32], [0.14, 0.32], [0.2, 0.42], [0.33, 0.42]]} depth={0.02} z={0.182 * s} material={mats.bone} />
        </group>
      ))}
      <Box p={[0.6, 0.99, 0]} s={[0.18, 0.006, 0.22]} r={[0, 0, 0.62]} material={mats.screen} />
    </>
  ),
  tank: () => (
    <>
      <Box p={[0.2, 0.9, 0]} s={[0.44, 0.2, 0.32]} r={[0, 0, -0.06]} material={mats.paint} />
      <Box p={[0.2, 1.0, 0]} s={[0.42, 0.012, 0.06]} r={[0, 0, -0.06]} material={mats.red} />
      <M material={mats.metal} position={[0.3, 1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.016, 20]} />
      </M>
    </>
  ),
  seat: () => (
    <>
      <Box p={[-0.22, 0.86, 0]} s={[0.34, 0.06, 0.26]} r={[0, 0, 0.08]} material={mats.fabric} />
      <Slab
        points={[[-0.05, 0.82], [-0.78, 0.98], [-0.82, 0.94], [-0.4, 0.74], [-0.1, 0.74]]}
        depth={0.22}
        material={mats.paint}
      />
      <Slab points={[[-0.4, 0.865], [-0.78, 0.965], [-0.8, 0.95], [-0.42, 0.845]]} depth={0.23} material={mats.red} />
      <Box p={[-0.81, 0.955, 0]} s={[0.014, 0.026, 0.13]} r={[0, 0, 0.3]} material={mats.tail} />
    </>
  ),
  engine: () => (
    <>
      <Box p={[0.06, 0.42, 0]} s={[0.38, 0.24, 0.3]} material={mats.gunmetal} />
      <group position={[0.2, 0.62, 0]} rotation={[0, 0, -0.4]}>
        <Box p={[0, 0, 0]} s={[0.2, 0.22, 0.27]} material={mats.gunmetal} />
        {[-0.06, -0.02, 0.02, 0.06].map((y) => (
          <Box key={y} p={[0, y, 0]} s={[0.23, 0.008, 0.29]} material={mats.metal} />
        ))}
        <Box p={[0, 0.14, 0]} s={[0.18, 0.06, 0.25]} material={mats.red} />
      </group>
      <M material={mats.metal} position={[0.0, 0.42, 0.165]} rotation-x={PI / 2}>
        <cylinderGeometry args={[0.09, 0.09, 0.03, 32]} />
      </M>
      <M material={mats.gunmetal} position={[-0.08, 0.4, 0.165]} rotation-x={PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
      </M>
      <Box p={[0.32, 0.5, 0]} s={[0.03, 0.26, 0.3]} r={[0, 0, -0.2]} material={mats.metal} />
    </>
  ),
  exhaust: () => (
    <>
      {[-0.05, 0.05].map((z) => (
        <group key={z}>
          <Tube a={[0.3, 0.62, z]} b={[0.36, 0.42, z]} r={0.022} material={mats.metal} />
          <Tube a={[0.36, 0.42, z]} b={[0.3, 0.2, z]} r={0.022} material={mats.metal} />
          <Tube a={[0.3, 0.2, z]} b={[0.06, 0.15, z]} r={0.022} material={mats.metal} />
        </group>
      ))}
      <Box p={[-0.1, 0.15, 0.04]} s={[0.34, 0.12, 0.22]} r={[0, 0.12, 0]} material={mats.gunmetal} />
      <M material={exhaustGlow} position={[-0.29, 0.15, 0.08]} rotation-z={PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 20]} />
      </M>
    </>
  ),
  wheels: () => (
    <>
      <Wheel center={[0.7, 0.3, 0]} front />
      <Wheel center={[-0.68, 0.3, 0]} />
    </>
  ),
  forks: () => (
    <>
      {[-0.09, 0.09].map((z) => (
        <group key={z}>
          <Tube a={[0.47, 0.98, z]} b={[0.6, 0.62, z]} r={0.026} material={mats.gold} />
          <Tube a={[0.6, 0.62, z]} b={[0.7, 0.3, z]} r={0.034} material={mats.gunmetal} />
        </group>
      ))}
      <Box p={[0.47, 0.97, 0]} s={[0.09, 0.03, 0.24]} r={[0, 0, -0.33]} material={mats.gunmetal} />
      <Box p={[0.5, 0.88, 0]} s={[0.09, 0.03, 0.24]} r={[0, 0, -0.33]} material={mats.gunmetal} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube a={[0.46, 0.94, 0.1 * s]} b={[0.4, 0.92, 0.3 * s]} r={0.014} material={mats.gunmetal} />
          <Tube a={[0.4, 0.92, 0.3 * s]} b={[0.385, 0.915, 0.37 * s]} r={0.02} material={mats.rubber} />
        </group>
      ))}
      <Box p={[0.74, 0.6, 0]} s={[0.3, 0.02, 0.1]} r={[0, 0, -0.25]} material={mats.paint} />
    </>
  ),
  swingarm: () => (
    <>
      {[-1, 1].map((s) => (
        <Tube key={s} a={[-0.15, 0.46, 0.13 * s]} b={[-0.68, 0.3, 0.11 * s]} r={0.032} material={mats.gunmetal} />
      ))}
      <Tube a={[-0.3, 0.41, -0.13]} b={[-0.3, 0.41, 0.13]} r={0.02} material={mats.gunmetal} />
      <Tube a={[-0.33, 0.43, 0]} b={[-0.16, 0.72, 0]} r={0.024} material={mats.metal} />
      <Tube a={[-0.3, 0.48, 0]} b={[-0.2, 0.65, 0]} r={0.042} material={mats.red} />
      <Tube a={[-0.08, 0.45, 0.165]} b={[-0.68, 0.4, 0.165]} r={0.007} material={mats.metal} />
      <Tube a={[-0.08, 0.35, 0.165]} b={[-0.68, 0.2, 0.165]} r={0.007} material={mats.metal} />
      <M material={mats.metal} position={[-0.68, 0.3, 0.155]} rotation-x={PI / 2}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 32]} />
      </M>
    </>
  ),
  electronics: () => (
    <>
      {[-1, 1].map((s) => (
        <Box key={s} p={[0.905, 0.715, 0.065 * s]} s={[0.05, 0.022, 0.07]} r={[0, 0, 0.5]} material={mats.lamp} />
      ))}
      <Box p={[0.86, 0.68, 0]} s={[0.02, 0.008, 0.2]} r={[0, 0, 0.5]} material={mats.lamp} />
      <group position={[0.5, 0.99, 0]} rotation={[0, 0, 0.7]}>
        <Box p={[0, 0, 0]} s={[0.016, 0.09, 0.13]} material={mats.gunmetal} />
        <Box p={[0.009, 0, 0]} s={[0.004, 0.075, 0.11]} material={mats.dash} />
      </group>
      <Box p={[-0.3, 0.7, 0]} s={[0.13, 0.07, 0.1]} material={mats.gunmetal} />
      <Box p={[-0.24, 0.73, 0]} s={[0.02, 0.02, 0.04]} material={mats.red} />
      <Tube a={[0.5, 0.95, 0.02]} b={[-0.3, 0.72, 0.02]} r={0.006} material={mats.rubber} />
    </>
  ),
  frame: () => (
    <>
      <Tube a={[0.5, 0.85, 0]} b={[0.46, 0.99, 0]} r={0.04} material={mats.frame} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube a={[0.48, 0.9, 0.06 * s]} b={[0.05, 0.8, 0.16 * s]} r={0.035} material={mats.frame} />
          <Tube a={[0.05, 0.8, 0.16 * s]} b={[-0.14, 0.48, 0.14 * s]} r={0.035} material={mats.frame} />
          <Tube a={[0.46, 0.82, 0.05 * s]} b={[0.12, 0.55, 0.15 * s]} r={0.024} material={mats.frame} />
          <Tube a={[-0.1, 0.72, 0.1 * s]} b={[-0.62, 0.86, 0.07 * s]} r={0.018} material={mats.frame} />
          <Tube a={[-0.14, 0.55, 0.12 * s]} b={[-0.45, 0.8, 0.08 * s]} r={0.016} material={mats.frame} />
        </group>
      ))}
      <M material={mats.metal} position={[-0.15, 0.46, 0]} rotation-x={PI / 2}>
        <cylinderGeometry args={[0.035, 0.035, 0.34, 16]} />
      </M>
    </>
  ),
}

export function ProceduralBike({ reduced }: { reduced: boolean }) {
  const anchors = useMemo(
    () => Object.fromEntries(PARTS.map((p) => [p.id, new Vector3(...p.rig.anchor)])) as Record<PartId, Vector3>,
    [],
  )
  return (
    <group>
      {PARTS.map((part) => (
        <PartGroup key={part.id} part={part} anchor={anchors[part.id]} reduced={reduced}>
          {PARTS_JSX[part.id]()}
        </PartGroup>
      ))}
    </group>
  )
}
