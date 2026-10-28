import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export const mats = {
  paint: new MeshPhysicalMaterial({ color: '#121212', metalness: 0.4, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
  red: new MeshPhysicalMaterial({ color: '#e10600', metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
  bone: new MeshPhysicalMaterial({ color: '#e8e8e4', metalness: 0.1, roughness: 0.35, clearcoat: 0.6 }),
  metal: new MeshStandardMaterial({ color: '#9a9da2', metalness: 1, roughness: 0.22 }),
  gunmetal: new MeshStandardMaterial({ color: '#2f3236', metalness: 0.9, roughness: 0.38 }),
  frame: new MeshStandardMaterial({ color: '#4a4d52', metalness: 0.9, roughness: 0.3 }),
  gold: new MeshStandardMaterial({ color: '#b8913f', metalness: 1, roughness: 0.25 }),
  rubber: new MeshStandardMaterial({ color: '#0e0e0e', metalness: 0, roughness: 0.92 }),
  fabric: new MeshStandardMaterial({ color: '#1c1c1c', metalness: 0, roughness: 0.85 }),
  screen: new MeshPhysicalMaterial({ color: '#111214', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.55 }),
  lamp: new MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 6, toneMapped: false }),
  tail: new MeshStandardMaterial({ color: '#e10600', emissive: '#e10600', emissiveIntensity: 5, toneMapped: false }),
  dash: new MeshStandardMaterial({ color: '#0a0a0a', emissive: '#f2f2f0', emissiveIntensity: 1.2 }),
}

/** Exhaust tip; emissive intensity is driven by the rev simulation. */
export const exhaustGlow = new MeshStandardMaterial({
  color: '#1a0a08',
  emissive: '#ff3a10',
  emissiveIntensity: 0.15,
  metalness: 0.6,
  roughness: 0.4,
  toneMapped: false,
})
