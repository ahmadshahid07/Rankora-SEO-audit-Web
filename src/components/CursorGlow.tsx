import { useEffect, useRef } from "react";

/** Soft cursor glow + trailing dot. Disabled on touch devices and for reduced-motion users. */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add("has-cursor-glow");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        if (glow.current) glow.current.style.opacity = "1";
        if (dot.current) dot.current.style.opacity = "1";
      }
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest("a, button, input, textarea, select, [role='button']");
      if (glow.current) glow.current.dataset.hot = interactive ? "1" : "0";
    };

    const onLeave = () => {
      visible = false;
      if (glow.current) glow.current.style.opacity = "0";
      if (dot.current) dot.current.style.opacity = "0";
    };

    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      if (glow.current) glow.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor-glow");
    };
  }, []);

  return (
    <>
      <div ref={glow} className="cursor-glow" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
