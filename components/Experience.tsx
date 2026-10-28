'use client'

import dynamic from 'next/dynamic'
import { PARTS } from '@/data/parts'
import { SmoothScroll } from './SmoothScroll'
import { Frame } from './Overlay/Frame'
import { Loader } from './Overlay/Loader'
import { Hero } from './Overlay/Hero'
import { InfoPanel } from './Overlay/InfoPanel'
import { Stats } from './Overlay/Stats'
import { Marquee } from './Overlay/Marquee'
import { Finale } from './Overlay/Finale'
import { Hud } from './Overlay/Hud'
import { HoverLabel } from './Overlay/HoverLabel'
import { ProgressRail } from './Overlay/ProgressRail'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

export function Experience({ hasModel }: { hasModel: boolean }) {
  return (
    <>
      <SmoothScroll />
      <Scene hasModel={hasModel} />
      <Frame />

      <main className="pointer-events-none relative z-10">
        <Hero />
        <section id="anatomy" aria-labelledby="anatomy-title" className="h-[600vh]">
          <div className="sr-only">
            <h2 id="anatomy-title">Anatomy: ten systems</h2>
            <ol>
              {PARTS.map((p) => (
                <li key={p.id}>
                  {p.name}: {p.pitch}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <Marquee />
        <Finale hasModel={hasModel} />
      </main>

      <Stats />
      <InfoPanel />
      <ProgressRail />
      <HoverLabel />
      <Hud />
      <Loader />
    </>
  )
}
