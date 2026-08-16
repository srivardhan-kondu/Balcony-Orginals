import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { Still } from "@/components/Still";
import { SIZES } from "@/lib/images";

export const StatusChip = ({ status }) => (
  <span
    data-testid={`status-chip-${status}`}
    className="inline-flex items-center gap-2 rounded-sm border border-gold/40 bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm"
  >
    <span className="h-1 w-1 rotate-45 bg-gold" />
    {STATUS_LABELS[status] || status}
  </span>
);

export const ProjectCard = ({ project, large = false, index, sizes = SIZES.grid3 }) => {
  /* The tilt used to be written straight to `el.style.transform`, on the same
     element framer-motion animates — so the two fought over one property and
     `onMouseLeave` cleared whatever motion had last written. Handing the tilt
     to motion values instead means there is one writer, and the entry animation
     keeps the rotation axis to itself by no longer using rotateX. */
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 26 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 26 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 4);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 4);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Link
      to={`/projects/${project.slug}`}
      data-testid={`project-card-${project.slug}`}
      className="group block"
      aria-label={`${project.title} — ${STATUS_LABELS[project.status] || project.status}`}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        initial={{ clipPath: "inset(16% 9% 16% 9%)", opacity: 0, y: 34 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-sm border border-line bg-ink2 will-change-transform"
        style={{
          aspectRatio: large ? "16/10" : "16/11",
          transformPerspective: 1000,
          rotateX: springX,
          rotateY: springY,
        }}
      >
        <Still
          src={project.hero}
          alt={project.title}
          sizes={sizes}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/10" />

        {/* viewfinder corner ticks */}
        <span aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 border-l border-t border-bone/30 transition-colors duration-300 group-hover:border-gold/70" />
        <span aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 border-r border-t border-bone/30 transition-colors duration-300 group-hover:border-gold/70" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          {typeof index === "number" ? (
            <span className="font-mono text-[10px] tracking-[0.24em] text-bone/70">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : (
            <span />
          )}
          <StatusChip status={project.status} />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
          <div>
            {project.telugu ? (
              <div className="font-telugu text-sm text-gold/85">{project.telugu}</div>
            ) : null}
            <h3 className={`mt-1 font-serif leading-[1.12] text-bone ${large ? "text-[clamp(24px,2.6vw,40px)]" : "text-[clamp(20px,2vw,30px)]"}`}>
              {project.title}
            </h3>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
              {[project.type === "feature" ? "Feature Film" : "Documentary", project.location, project.year]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <span className="mb-1 flex h-9 w-9 flex-none items-center justify-center rounded-full border border-bone/25 text-bone/70 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </motion.div>
    </Link>
  );
};
