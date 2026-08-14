import { MaskLines, Reveal } from "@/components/Motion";

export const PageHero = ({ overline, titleLines, sub, testid }) => (
  <section
    data-testid={testid}
    className="relative mx-auto w-full max-w-[1560px] overflow-hidden px-[clamp(18px,4vw,58px)] pb-14 pt-40 md:pb-20 md:pt-52"
  >
    {overline && (
      <Reveal>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">{overline}</span>
        </div>
      </Reveal>
    )}
    <h1 className="font-display font-extrabold uppercase text-[clamp(30px,5.6vw,80px)] leading-[0.98] tracking-[-0.02em] text-bone">
      <MaskLines lines={titleLines} delay={0.1} />
    </h1>
    {sub && (
      <Reveal delay={0.35}>
        <p className="mt-7 max-w-[56ch] text-[15px] leading-relaxed text-mute md:text-base">{sub}</p>
      </Reveal>
    )}
  </section>
);
