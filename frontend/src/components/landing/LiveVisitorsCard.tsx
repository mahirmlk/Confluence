"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { AvatarCircles } from "@/components/magicui/avatar-circles";

function personAvatar(bg: string, fg: string, initials: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>` +
    `<rect width='48' height='48' rx='24' fill='${bg}'/>` +
    `<text x='24' y='30.5' text-anchor='middle' font-family='Inter,system-ui,sans-serif' font-size='15' font-weight='700' fill='${fg}'>${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

/** Illustrative avatar images (local SVG data URIs — no external requests). */
const VISITOR_AVATARS = [
  personAvatar("%23222226", "%23FAFAFA", "AR"),
  personAvatar("%23E4E4E7", "%233F3F46", "MK"),
  personAvatar("%233F3F46", "%23FAFAFA", "JS"),
  personAvatar("%23D4D4D8", "%2327272A", "TP"),
  personAvatar("%2318181B", "%23FAFAFA", "LN"),
  personAvatar("%23EDEDEF", "%2352525B", "RS"),
  personAvatar("%2352525B", "%23FAFAFA", "AK"),
];

interface Health {
  status: string;
  version: string;
  uptime: number;
}

function formatUptime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

/**
 * Live visitors card. Status, version and uptime come from the real
 * backend /health endpoint (polled every 30s, ticked every second).
 * Avatars are illustrative; no visitor counts are fabricated.
 */
export function LiveVisitorsCard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = (await res.json()) as Health;
          setHealth(data);
          setFetchedAt(Date.now());
        } else if (!cancelled) {
          setHealth(null);
        }
      } catch {
        if (!cancelled) setHealth(null);
      }
    };
    check();
    const poll = window.setInterval(check, 30000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const online = health?.status === "ok";
  const uptime =
    health && fetchedAt ? health.uptime + (now - fetchedAt) / 1000 : null;

  return (
    <div
      className="border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.05)]"
      style={{ borderRadius: 14 }}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 md:px-6">
        <p className="font-mono flex items-center gap-2.5 text-[11px] font-medium tracking-[0.14em] text-foreground uppercase">
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 rounded-full ${
              online ? "animate-pulse bg-[#16a34a]" : "bg-[#c9c9c9]"
            }`}
          />
          Live
          <span className="sr-only">{online ? "Systems live" : "Systems unreachable"}</span>
        </p>
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Real-time
        </p>
      </div>

      <div className="px-5 py-6 md:px-6">
        <AvatarCircles avatarUrls={VISITOR_AVATARS} size={48} />
        <p className="font-ui mt-5 text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground">
          Learners exploring ML, live.
        </p>
        <p className="font-ui mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Open the visualizer and run real models alongside them.
        </p>

        <dl className="font-mono mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5 text-xs">
          <div>
            <dt className="tracking-[0.1em] text-muted-foreground uppercase">Status</dt>
            <dd className="mt-1.5 text-foreground">{online ? "Online" : "—"}</dd>
          </div>
          <div>
            <dt className="tracking-[0.1em] text-muted-foreground uppercase">Uptime</dt>
            <dd className="mt-1.5 text-foreground tabular-nums">
              {uptime !== null ? formatUptime(uptime) : "—"}
            </dd>
          </div>
          <div>
            <dt className="tracking-[0.1em] text-muted-foreground uppercase">Version</dt>
            <dd className="mt-1.5 text-foreground">{health?.version ?? "—"}</dd>
          </div>
        </dl>

        <Link
          href="/app"
          className="font-ui group mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-foreground"
        >
          Open the visualizer
          <span aria-hidden="true" className="row-arrow">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
