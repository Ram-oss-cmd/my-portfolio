"use client";

import { useEffect, useState } from "react";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  weekday: "short",
  day: "2-digit",
  month: "short",
});

export function KathmanduClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const start = requestAnimationFrame(() => setNow(new Date()));
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(start);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="clock" aria-label="Live time in Kathmandu">
      <span className="clock__place">Kathmandu</span>
      <time className="clock__time" dateTime={now?.toISOString()}>
        {now ? timeFormat.format(now) : "--:--:--"}
      </time>
      <span className="clock__date">
        {now ? dateFormat.format(now) : "NPT"} · NPT
      </span>
    </div>
  );
}
