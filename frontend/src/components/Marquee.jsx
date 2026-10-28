const ITEMS = [
  "Stories rooted in culture",
  "Every story is a gem",
  "Told for the world",
  "Born from the land",
  "Every place has a story",
];

export const Marquee = () => (
  <div
    data-testid="editorial-marquee"
    aria-hidden="true"
    className="select-none overflow-hidden border-y border-line bg-ink py-5"
  >
    <div className="bo-marquee flex w-max">
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center">
          {ITEMS.map((t, i) => (
            <span key={i} className="mx-7 flex items-center gap-14">
              <span className="whitespace-nowrap font-serif text-lg tracking-wide text-bone/70 md:text-2xl">{t}</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gold/70" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
