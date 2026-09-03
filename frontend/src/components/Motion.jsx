"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export const Reveal = ({ children, delay = 0, y = 30, className = "", ...rest }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: EASE }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const MaskLines = ({
  lines = [],
  className = "",
  lineClassName = "",
  lastClassName = "",
  delay = 0,
  inView = false,
}) => {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-60px" });
  const active = inView ? seen : true;
  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block will-change-transform ${lineClassName} ${i === lines.length - 1 ? lastClassName : ""}`}
            initial={false}
            animate={active ? { y: 0 } : { y: "115%" }}
            transition={{ duration: 1.05, delay: delay + i * 0.13, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
