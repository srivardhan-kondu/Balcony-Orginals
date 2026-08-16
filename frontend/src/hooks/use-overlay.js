import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Everything a full-screen overlay owes the page while it is open: the scroll
 * lock, the smooth-scroll driver, focus, and Escape.
 *
 * The two overlays here (the mobile menu, the reel lightbox) each used to do a
 * bare `documentElement.style.overflow = "hidden"`, which
 *
 *   - left Lenis running, so the wheel still drove the page underneath, and
 *   - let focus walk out of the overlay into the links behind it, with nothing
 *     to bring it back.
 *
 * The layout shift the lock used to cause is handled in CSS instead — `html`
 * carries `scrollbar-gutter: stable`, so the gutter is reserved whether or not
 * the page is scrollable and nothing moves when it stops being so.
 *
 * @param open    whether the overlay is mounted and visible
 * @param onClose called on Escape
 * @param ref     the overlay root, for the focus trap
 */
export const useOverlay = (open, onClose, ref) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previouslyFocused = document.activeElement;
    html.style.overflow = "hidden";
    window.__lenis?.stop();

    const node = ref?.current;
    // Focus the overlay itself rather than its first link: the container is the
    // announcement, and moving straight to a link skips the dialog's own label.
    node?.focus?.({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !node) return;

      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      html.style.overflow = previousOverflow;
      window.__lenis?.start();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, ref]);
};
