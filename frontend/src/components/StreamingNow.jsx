import Link from "next/link";
import { ExternalLink } from "lucide-react";

/* Logos for the platforms a finished film streams on, keyed by the
   `watch.platform` name in the project data. */
const PLATFORM_LOGOS = {
  "ETV Win": { src: "/assets/etv-win-logo.png", width: 192, height: 192 },
};

export const platformLogo = (platform) => PLATFORM_LOGOS[platform] || null;

/** "Streaming now on [logo]" — the outbound watch button. */
export const StreamingButton = ({ project, testid = "detail-watch-now-btn", className = "" }) => {
  const { url, platform } = project.watch || {};
  if (!url) return null;
  const logo = platformLogo(platform);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testid}
      aria-label={`Watch ${project.title} — streaming now on ${platform} (opens in a new tab)`}
      className={`group inline-flex items-center gap-3 rounded-sm border border-bone/25 bg-ink/60 py-2 pl-2.5 pr-5 text-bone backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:text-gold ${className}`}
    >
      {logo ? (
        <img
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          className="h-9 w-9 flex-none rounded-[7px]"
        />
      ) : null}
      <span className="flex flex-col items-start leading-tight">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone/55 transition-colors group-hover:text-gold/70">
          Streaming now on
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.15em]">{platform}</span>
      </span>
      <ExternalLink size={12} className="ml-1 shrink-0" />
    </a>
  );
};

/** Home-page band announcing a film that is out and streaming. */
export const StreamingBand = ({ project }) => {
  if (!project?.watch?.url) return null;
  return (
    <section data-testid="streaming-band" className="border-b border-line bg-ink2/40">
      <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-x-10 gap-y-5 px-[var(--bo-gutter)] py-7">
        <div className="flex items-center gap-5">
          <span className="relative flex h-2 w-2 flex-none">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3013] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ec3013]" />
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/55">Now streaming</div>
            <Link
              href={`/projects/${project.slug}`}
              className="mt-1 block font-serif text-[clamp(20px,2vw,28px)] leading-tight text-bone transition-colors hover:text-gold"
            >
              {project.title}
            </Link>
          </div>
        </div>
        <StreamingButton project={project} testid="home-streaming-btn" />
      </div>
    </section>
  );
};
