import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Motion";
import { Marquee } from "@/components/Marquee";

const VERTICALS = [
  {
    title: "Documentaries",
    body: "Devotional, cultural, heritage and people-centric documentaries — festivals, rituals, communities and the land that holds them.",
  },
  {
    title: "Feature films",
    body: "Rooted stories shaped for the big screen. Authentic people, culture, place, emotion — cinema with a regional soul and a global reach.",
  },
  {
    title: "Tourism & place",
    body: "Visual stories of destinations, trails and sacred geographies — made with the patience a place deserves.",
  },
  {
    title: "Original stories",
    body: "A door for storytellers who carry a gem but need the backbone to bring it to life. Stories stay safe; possibilities stay open.",
  },
];

export default function About() {
  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    document.title = "About — Balcony Originals";
  }, []);

  return (
    <div data-testid="about-page">
      <PageHero
        testid="about-hero"
        overline="About the house"
        titleLines={["A production house that begins", "with a place, but is not", "limited to it."]}
        sub="Balcony Originals is rooted in Rayalaseema and built on one belief: culture, devotion, heritage, people and lived experience deserve to be documented — and brought to a wider audience."
      />

      <section ref={imgRef} className="relative h-[56vh] overflow-hidden border-y border-line md:h-[70vh]">
        <motion.img
          src="/assets/projects/about.jpg"
          alt="Balcony Originals crew filming a festival at golden hour"
          style={{ y: imgY }}
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />
        <div className="absolute bottom-6 left-[clamp(18px,4vw,58px)] font-mono text-[10px] tracking-[0.22em] text-bone/60">
          ON LOCATION · RAYALASEEMA
        </div>
      </section>

      <section className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(80px,12vh,150px)]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">The idea</span>
            </div>
            <div className="mt-6 font-telugu text-[clamp(24px,2.6vw,36px)] leading-[1.5] text-gold/90">
              కథలు మా మూలాలు
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-6 text-[clamp(15px,1.3vw,18px)] leading-[1.8] text-bone/85">
              <p>
                Balcony Originals begins with a place, but it is not limited to a place. Its roots are in
                Rayalaseema; its stories can travel across Andhra Pradesh, India and the world.
              </p>
              <p>
                From devotional and cultural documentaries to feature films, we look for stories with identity,
                emotion, cultural depth and human truth. And when someone carries a story but lacks the support
                to bring it forward, Balcony Originals should be a door they can knock on.
              </p>
              <p className="text-mute">
                That is the larger promise: preserve stories, produce stories, and give strong stories a chance
                to travel.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-[clamp(70px,10vh,120px)]">
          <Reveal>
            <h2 className="font-serif text-[clamp(26px,3.4vw,46px)] text-bone">What we make</h2>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
            {VERTICALS.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div data-testid={`vertical-${i}`} className="group h-full bg-ink p-8 transition-colors duration-500 hover:bg-ink3 md:p-10">
                  <span className="font-mono text-[11px] tracking-[0.24em] text-gold/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-serif text-[clamp(19px,2vw,27px)] text-bone transition-transform duration-500 group-hover:translate-x-1.5">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.7] text-mute">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(80px,12vh,150px)]">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-serif text-[clamp(24px,3vw,42px)] leading-[1.1] text-bone">
              Two brands, kept separate on purpose.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.75] text-mute">
              Balcony Originals is the storytelling and production house. Balcony X — digital marketing and a
              creator network — is a separate vertical with its own identity. The two may meet at the balcony,
              but they keep their own rooms.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-sm border border-line bg-ink2/60 p-[clamp(28px,4vw,52px)] text-center">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-gold">
                Have a story for us?
              </div>
              <p className="mt-5 font-serif text-[clamp(22px,2.4vw,32px)] leading-[1.25] text-bone">
                Every place has a story. Every person carries one.
              </p>
              <Link
                to="/submit-story"
                data-testid="about-submit-btn"
                className="mt-8 inline-flex items-center gap-3 rounded-sm bg-gold px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-bone"
              >
                Submit Your Story <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
