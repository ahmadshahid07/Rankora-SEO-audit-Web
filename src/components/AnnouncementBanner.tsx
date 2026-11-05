import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone, X } from "lucide-react";
import { listAnnouncements } from "@/lib/public.functions";

type Announcement = {
  id: string;
  title: string;
  body: string;
  kind: string;
  pinned?: boolean;
  ends_at?: string | null;
};

function useCountdown(target?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
}

export function AnnouncementBanner() {
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const { data } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: () => fetchAnnouncements(),
    staleTime: 60_000,
  });
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rankora-dismissed-announcements");
      if (raw) setDismissed(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const list = ((data ?? []) as Announcement[]).filter((a) => !dismissed.includes(a.id));
  const active = list.find((a) => a.pinned) ?? list[0];
  const countdown = useCountdown(active?.ends_at ?? null);

  if (!active) return null;

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      localStorage.setItem("rankora-dismissed-announcements", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-royal via-primary to-violet text-primary-foreground animate-fade-in">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0" />
        <span className="font-semibold">{active.title}</span>
        <span className="hidden truncate opacity-90 sm:inline">{active.body}</span>
        {countdown && (
          <span className="ml-auto shrink-0 rounded-full bg-background/20 px-2.5 py-0.5 text-xs font-medium tabular-nums">
            ends in {countdown}
          </span>
        )}
        <button
          aria-label="Dismiss announcement"
          onClick={() => dismiss(active.id)}
          className={`${countdown ? "" : "ml-auto"} grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-background/20`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
