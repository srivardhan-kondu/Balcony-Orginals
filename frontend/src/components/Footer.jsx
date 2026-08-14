import { Link } from "react-router-dom";

export const Footer = () => (
  <footer data-testid="site-footer" className="border-t border-line bg-ink">
    <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(48px,7vh,90px)]">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/assets/bo-lockup.png" alt="Balcony Originals" className="h-12 w-auto opacity-95" />
          <p className="mt-6 max-w-[36ch] font-serif text-xl leading-snug text-sand md:text-2xl">
            Stories rooted in culture. Told for the world.
          </p>
          <p className="mt-6 font-mono text-[10.5px] leading-relaxed tracking-[0.18em] text-bone/35">
            PRODUCTION HOUSE · RAYALASEEMA
            <br />
            ANDHRA PRADESH · INDIA
          </p>
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-gold">Explore</div>
          <ul className="mt-5 space-y-3">
            {[
              { to: "/works", label: "Stories & Works", id: "footer-link-works" },
              { to: "/works?type=feature", label: "Feature Films", id: "footer-link-films" },
              { to: "/upcoming", label: "Upcoming", id: "footer-link-upcoming" },
              { to: "/submit-story", label: "Submit Your Story", id: "footer-link-submit" },
            ].map((l) => (
              <li key={l.id}>
                <Link to={l.to} data-testid={l.id} className="text-sm text-bone/70 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-gold">Company</div>
          <ul className="mt-5 space-y-3">
            {[
              { to: "/about", label: "About", id: "footer-link-about" },
              { to: "/contact", label: "Contact", id: "footer-link-contact" },
            ].map((l) => (
              <li key={l.id}>
                <Link to={l.to} data-testid={l.id} className="text-sm text-bone/70 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-dim">
            Part of the Balcony ecosystem. Balcony X — digital marketing & creator network — remains a separate vertical.
          </p>
        </div>
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <span className="font-mono text-[10px] tracking-[0.2em] text-bone/30">
          © {new Date().getFullYear()} BALCONY ORIGINALS
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-bone/30">
          EVERY STORY IS A GEM
        </span>
      </div>
    </div>
  </footer>
);
