import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Cross-page transition: a gradient sweep plays over the screen while the
 * incoming route fades/slides in.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [key, setKey] = useState(pathname);
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    if (pathname === key) return;
    setSweeping(true);
    setKey(pathname);
    const t = setTimeout(() => setSweeping(false), 620);
    return () => clearTimeout(t);
  }, [pathname, key]);

  return (
    <>
      {sweeping && (
        <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
          <div className="page-sweep absolute inset-0" />
        </div>
      )}
      <div key={key} className="page-enter">
        {children}
      </div>
    </>
  );
}
