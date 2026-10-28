const PHRASE = 'BUILT TO BE TAKEN APART // RACE BRED // '

function Strip({ outlined }: { outlined?: boolean }) {
  return (
    <div
      className={`overflow-hidden py-2 ${outlined ? 'border-y border-bone/40 bg-ink' : 'border-y border-ink bg-signal text-ink'}`}
    >
      <div className={`flex w-max ${outlined ? 'marquee-reverse' : 'marquee'}`}>
        {[0, 1].map((k) => (
          <span
            key={k}
            aria-hidden
            className={`whitespace-nowrap pr-[0.3em] font-display text-[clamp(2.5rem,7vw,6.75rem)] uppercase leading-none ${
              outlined ? 'text-stroke' : ''
            }`}
          >
            {PHRASE.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Marquee() {
  return (
    <section aria-label="Built to be taken apart. Race bred." className="relative flex h-svh flex-col justify-end overflow-hidden pb-[calc(var(--hud-h)+12svh)]">
      <div className="-skew-y-3 flex flex-col gap-3">
        <Strip />
        <Strip outlined />
      </div>
    </section>
  )
}
