import type { ReactNode } from 'react'

/** One line of text inside an overflow mask. Animate `[data-mask-inner]` with yPercent. */
export function MaskLine({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <span data-mask-inner className="block will-change-transform" style={{ transform: 'translateY(110%)' }}>
        {children}
      </span>
    </span>
  )
}
