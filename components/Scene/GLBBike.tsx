'use client'

import { Component, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Color, Group, Mesh, Vector3, type MeshStandardMaterial, type Object3D } from 'three'
import { PARTS, type PartId } from '@/data/parts'
import { PartActive, PartGroup } from './PartGroup'

export const MODEL_URL = '/models/bike.glb'
const RED = new Color('#e10600')
const BLACK = new Color('#000000')

function classify(mesh: Object3D): PartId {
  const names: string[] = []
  let o: Object3D | null = mesh
  while (o) {
    names.push(o.name)
    o = o.parent
  }
  const mat = (mesh as Mesh).material
  if (mat && !Array.isArray(mat)) names.push(mat.name)
  const haystack = names.join(' ').toLowerCase()
  const hit = PARTS.find((p) => p.rig.keywords.some((k) => haystack.includes(k)))
  return hit?.id ?? 'frame'
}

function useSplitModel() {
  const { scene } = useGLTF(MODEL_URL)
  return useMemo(() => {
    const root = scene.clone(true)
    root.updateMatrixWorld(true)

    const box = new Box3().setFromObject(root)
    const size = box.getSize(new Vector3())
    if (size.z > size.x) root.rotation.y = Math.PI / 2
    root.updateMatrixWorld(true)
    box.setFromObject(root)
    box.getSize(size)
    const scale = 2.0 / Math.max(size.x, size.z)
    root.scale.multiplyScalar(scale)
    root.updateMatrixWorld(true)
    box.setFromObject(root)
    const center = box.getCenter(new Vector3())
    root.position.x -= center.x - 0.02
    root.position.z -= center.z
    root.position.y -= box.min.y
    root.updateMatrixWorld(true)

    const groups = Object.fromEntries(PARTS.map((p) => [p.id, new Group()])) as Record<PartId, Group>
    const meshes: Mesh[] = []
    root.traverse((o) => {
      if ((o as Mesh).isMesh) meshes.push(o as Mesh)
    })
    meshes.forEach((mesh) => {
      const id = classify(mesh)
      if (!Array.isArray(mesh.material)) mesh.material = mesh.material.clone()
      mesh.castShadow = true
      groups[id].attach(mesh)
    })

    const anchors = {} as Record<PartId, Vector3>
    PARTS.forEach((p) => {
      const g = groups[p.id]
      anchors[p.id] = g.children.length
        ? new Box3().setFromObject(g).getCenter(new Vector3())
        : new Vector3(...p.rig.anchor)
    })
    return { groups, anchors }
  }, [scene])
}

function Tint({ group }: { group: Group }) {
  const active = useContext(PartActive)
  useEffect(() => {
    group.traverse((o) => {
      const m = (o as Mesh).material as MeshStandardMaterial | undefined
      if (m && 'emissive' in m) {
        m.emissive.copy(active ? RED : BLACK)
        m.emissiveIntensity = active ? 0.6 : 1
      }
    })
  }, [active, group])
  return null
}

export function GLBBike({ reduced }: { reduced: boolean }) {
  const { groups, anchors } = useSplitModel()
  return (
    <group>
      {PARTS.map((part) => (
        <PartGroup key={part.id} part={part} anchor={anchors[part.id]} reduced={reduced}>
          <primitive object={groups[part.id]} />
          <Tint group={groups[part.id]} />
        </PartGroup>
      ))}
    </group>
  )
}

export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[v0] bike.glb failed to load, using placeholder bike.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
