import { MaskLines, Reveal } from "@/components/Motion";

export const PageHero = ({ overline, titleLines, sub, testid }) => (
  <section
    data-testid={testid}
    /* The top padding is the bar's height plus a gap, rather than a flat 160px
       that happened to clear a bar which is itself between 64 and 84px tall
       depending on the viewport. */
    className="relative mx-auto w-full max-w-[1560px] overflow-hidden px-[var(--bo-gutter)] pb-14 pt-[calc(var(--bo-header-h)+clamp(56px,9vh,120px))] md:pb-20 short:pb-8 short:pt-[calc(var(--bo-header-h)+32px)]"
  >
    {overline && (
      <Reveal>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">{overline}</span>
        </div>
      </Reveal>
    )}
    <h1 className="font-display font-extrabold uppercase text-[clamp(30px,5.6vw,80px)] leading-[0.98] tracking-[-0.02em] text-bone short:text-[clamp(24px,5vh,40px)]">
      <MaskLines lines={titleLines} delay={0.1} />
    </h1>
    {sub && (
      <Reveal delay={0.35}>
        <p className="mt-7 max-w-[56ch] text-[15px] leading-relaxed text-mute md:text-base">{sub}</p>
      </Reveal>
    )}
  </section>
);
