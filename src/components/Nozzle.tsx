"use client";

import { useEffect, useRef } from "react";
import { useMotionProfile } from "@/hooks/useMotionProfile";
import { NOZZLE_MAX_MS, useNozzle } from "@/store/nozzle";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  orange: boolean;
};

const MAX_PARTICLES = 220;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Records pointer movement and replays it. The canvas is decoration only:
 * the real cursor is never hidden or replaced, so it stays instant.
 */
export function Nozzle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const pointer = useRef({ x: 0, y: 0, t: 0, sample: 0, spray: 0 });
  const playStart = useRef(0);
  const playIndex = useRef(0);
  const reducedRef = useRef(true);

  const { ready, reduced } = useMotionProfile();
  const recording = useNozzle((state) => state.recording);
  const startedAt = useNozzle((state) => state.startedAt);
  const playing = useNozzle((state) => state.playing);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  /* Marks hydration for tests and any code that needs post-hydration timing. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("app-ready");
    return () => root.classList.remove("app-ready");
  }, []);

  /* Sample the pointer while recording; spray only during record/replay. */
  useEffect(() => {
    if (!ready) return;

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      if (particles.current.length > MAX_PARTICLES) {
        particles.current.splice(0, particles.current.length - MAX_PARTICLES);
      }
      const ttl = 24 + Math.random() * 20;
      particles.current.push({
        x,
        y,
        vx,
        vy,
        life: ttl,
        ttl,
        size: 0.8 + Math.random() * 1.6,
        orange: Math.random() < 0.25,
      });
    };

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const last = pointer.current;
      const state = useNozzle.getState();
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const dt = Math.max(8, now - last.t);

      if (state.recording && now - last.sample > 24) {
        state.pushSample({
          x: event.clientX,
          y: event.clientY,
          t: Math.min(NOZZLE_MAX_MS, now - state.startedAt),
        });
        last.sample = now;
      }

      if (!reducedRef.current && state.recording && now - last.spray > 30) {
        spawn(
          event.clientX,
          event.clientY,
          Math.max(-2, Math.min(2, (dx / dt) * 6)) + (Math.random() - 0.5),
          Math.max(-2, Math.min(2, (dy / dt) * 6)) + (Math.random() - 0.5),
        );
        last.spray = now;
      }

      last.x = event.clientX;
      last.y = event.clientY;
      last.t = now;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ready]);

  /* Recording hard cap, even if the pointer never moves. */
  useEffect(() => {
    if (!recording) return;
    const remaining = Math.max(0, NOZZLE_MAX_MS - (performance.now() - startedAt));
    const timer = window.setTimeout(
      () => useNozzle.getState().stopRecording(),
      remaining + 30,
    );
    return () => window.clearTimeout(timer);
  }, [recording, startedAt]);

  /* Canvas: recording trail, replay, and short-lived particles. */
  useEffect(() => {
    if (!ready || reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let lastTime = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - lastTime) / 16.667);
      lastTime = now;
      ctx.clearRect(0, 0, width, height);

      const state = useNozzle.getState();
      const samples = state.samples;

      if (state.recording && samples.length > 1) {
        ctx.strokeStyle = "rgba(36, 75, 255, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(samples[0].x, samples[0].y);
        for (let i = 1; i < samples.length; i += 1) {
          ctx.lineTo(samples[i].x, samples[i].y);
        }
        ctx.stroke();
      }

      if (state.playing && samples.length > 1) {
        if (playStart.current === 0) {
          playStart.current = now;
          playIndex.current = 0;
        }
        const elapsed = now - playStart.current;
        const total = samples[samples.length - 1].t;

        while (
          playIndex.current < samples.length - 1 &&
          samples[playIndex.current + 1].t <= elapsed
        ) {
          playIndex.current += 1;
        }

        const index = Math.min(playIndex.current, samples.length - 2);
        const first = samples[index];
        const second = samples[index + 1];
        const span = Math.max(1, second.t - first.t);
        const mix = Math.max(0, Math.min(1, (elapsed - first.t) / span));
        const x = lerp(first.x, second.x, mix);
        const y = lerp(first.y, second.y, mix);

        ctx.strokeStyle = "rgba(36, 75, 255, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(samples[0].x, samples[0].y);
        for (let i = 1; i <= index; i += 1) {
          ctx.lineTo(samples[i].x, samples[i].y);
        }
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 87, 56, 0.95)";
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 2; i += 1) {
          if (particles.current.length < MAX_PARTICLES) {
            const ttl = 20 + Math.random() * 16;
            particles.current.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 2.4,
              vy: (Math.random() - 0.5) * 2.4,
              life: ttl,
              ttl,
              size: 0.8 + Math.random() * 1.5,
              orange: true,
            });
          }
        }

        if (elapsed >= total) {
          state.stopPlayback();
          playStart.current = 0;
          playIndex.current = 0;
        }
      } else {
        playStart.current = 0;
        playIndex.current = 0;
      }

      const list = particles.current;
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const particle = list[i];
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 0.04 * dt;
        particle.life -= dt;
        if (particle.life <= 0) {
          list.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, particle.life / particle.ttl);
        ctx.fillStyle = particle.orange
          ? `rgba(255, 87, 56, ${alpha * 0.8})`
          : `rgba(36, 75, 255, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (state.recording || state.playing || list.length > 0) {
        raf = requestAnimationFrame(frame);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
      particles.current = [];
    };
  }, [ready, reduced, recording, playing]);

  /* Reduced motion: replay shows the recorded path without movement. */
  useEffect(() => {
    if (!ready || !reduced || !playing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const samples = useNozzle.getState().samples;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "rgba(36, 75, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    samples.forEach((sample, index) => {
      if (index === 0) ctx.moveTo(sample.x, sample.y);
      else ctx.lineTo(sample.x, sample.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 87, 56, 0.95)";
    const last = samples[samples.length - 1];
    if (last) {
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const timer = window.setTimeout(() => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      useNozzle.getState().stopPlayback();
    }, 1600);
    return () => {
      window.clearTimeout(timer);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [ready, reduced, playing]);

  /* R / P anywhere outside a text field. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='textbox']",
        )
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      const state = useNozzle.getState();
      if (key === "r") {
        event.preventDefault();
        if (state.recording) state.stopRecording();
        else state.startRecording();
      }
      if (key === "p") {
        if (state.samples.length < 2 || state.recording) return;
        event.preventDefault();
        state.startPlayback();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <canvas ref={canvasRef} className="nozzle-canvas" aria-hidden="true" />;
}
