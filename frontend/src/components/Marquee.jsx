const ITEMS = [
  { t: "Stories rooted in culture", telugu: false },
  { t: "ప్రతి కథ ఒక రత్నం", telugu: true },
  { t: "Told for the world", telugu: false },
  { t: "Born from the land", telugu: false },
  { t: "ప్రతి చోటికి ఒక కథ ఉంది", telugu: true },
  { t: "Every story is a gem", telugu: false },
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
          {ITEMS.map((item, i) => (
            <span key={i} className="mx-7 flex items-center gap-14">
              <span
                className={`whitespace-nowrap text-lg tracking-wide md:text-2xl ${
                  item.telugu ? "font-telugu text-sand" : "font-serif text-bone/70"
                }`}
              >
                {item.t}
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gold/70" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
