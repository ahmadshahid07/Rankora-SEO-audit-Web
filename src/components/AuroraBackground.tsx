export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute -top-1/2 left-1/4 h-[80vh] w-[80vh] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.55 0.24 275 / 0.9), transparent 60%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle at 70% 40%, oklch(0.6 0.24 300 / 0.8), transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[60vh] w-[60vh] rounded-full opacity-30 blur-3xl animate-aurora"
        style={{
          animationDelay: "-12s",
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.72 0.18 165 / 0.7), transparent 60%)",
        }}
      />
    </div>
  );
}
