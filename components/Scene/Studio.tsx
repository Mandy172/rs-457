'use client'

import { ContactShadows, Environment, Grid, Lightformer, MeshReflectorMaterial } from '@react-three/drei'

export function Studio({ mobile }: { mobile: boolean }) {
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 7, 20]} />

      <ambientLight intensity={0.12} />
      <spotLight position={[3.5, 6, 3]} angle={0.45} penumbra={0.5} intensity={70} color="#f2f2f0" />
      <directionalLight position={[-4, 2.5, -3]} intensity={3.2} color="#e10600" />
      <directionalLight position={[3, 2, -4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-3, 1.2, 4]} intensity={0.6} color="#ffffff" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1.5, 0]} rotation-y={Math.PI / 2} scale={[10, 0.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[10, 0.4, 1]} />
        <Lightformer form="rect" intensity={3} color="#e10600" position={[0, 1, -6]} scale={[6, 0.3, 1]} />
        <Lightformer form="rect" intensity={1} position={[0, 1, 6]} rotation-y={Math.PI} scale={[6, 0.6, 1]} />
      </Environment>

      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[40, 40]} />
        {mobile ? (
          <meshStandardMaterial color="#0b0b0b" roughness={0.55} metalness={0.5} />
        ) : (
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={512}
            mixBlur={1}
            mixStrength={25}
            roughness={0.9}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#0c0c0c"
            metalness={0.6}
            mirror={0.5}
          />
        )}
      </mesh>

      <Grid
        position={[0, 0.002, 0]}
        args={[20, 20]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#1c1c1c"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#2e2e2e"
        fadeDistance={12}
        fadeStrength={1.5}
        infiniteGrid
      />

      <mesh position={[0, 0.004, -1.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.5, 0.012]} />
        <meshBasicMaterial color="#e10600" toneMapped={false} />
      </mesh>

      <ContactShadows position={[0, 0.003, 0]} opacity={0.85} scale={6} blur={2.4} far={1.4} resolution={mobile ? 256 : 512} color="#000000" />
    </>
  )
}
