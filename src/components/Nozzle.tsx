"use client";

import { useEffect, useRef, useState } from "react";
import { NozzleControls } from "@/components/NozzleControls";
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
};

const MAX_PARTICLES = 420;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Nozzle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const pointer = useRef({ x: 0, y: 0, t: 0, sample: 0, spray: 0 });
  const playStart = useRef(0);
  const playIndex = useRef(0);
  const reducedRef = useRef(true);
  const [dockVisible, setDockVisible] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  const { ready, reduced } = useMotionProfile();
  const recording = useNozzle((state) => state.recording);
  const startedAt = useNozzle((state) => state.startedAt);
  const playing = useNozzle((state) => state.playing);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /* Native cursor hides only for fine pointers with motion allowed. */
  useEffect(() => {
    if (!ready || reduced || !finePointer) return;
    const root = document.documentElement;
    root.classList.add("nozzle-native-hidden");
    return () => root.classList.remove("nozzle-native-hidden");
  }, [ready, reduced, finePointer]);

  /* Pointer sampling + live spray. */
  useEffect(() => {
    if (!ready) return;

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      if (particles.current.length > MAX_PARTICLES) {
        particles.current.splice(0, particles.current.length - MAX_PARTICLES);
      }
      const ttl = 38 + Math.random() * 26;
      particles.current.push({
        x,
        y,
        vx,
        vy,
        life: ttl,
        ttl,
        size: 0.8 + Math.random() * 1.8,
      });
    };

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const last = pointer.current;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const dt = Math.max(8, now - last.t);
      const speed = Math.min(2.2, Math.hypot(dx, dy) / dt);

      if (!reducedRef.current && cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursorRef.current.classList.add("is-visible");
      }

      const state = useNozzle.getState();
      if (state.recording && now - last.sample > 24) {
        state.pushSample({
          x: event.clientX,
          y: event.clientY,
          t: Math.min(NOZZLE_MAX_MS, now - state.startedAt),
        });
        last.sample = now;
      }

      if (!reducedRef.current && now - last.spray > 22) {
        const vx = (dx / dt) * 9 + (Math.random() - 0.5) * 1.8;
        const vy = (dy / dt) * 9 + (Math.random() - 0.5) * 1.8 - speed;
        spawn(event.clientX, event.clientY, vx, vy);
        if (Math.random() > 0.55) {
          spawn(event.clientX, event.clientY, vx * 0.6, vy * 0.6);
        }
        last.spray = now;
      }

      last.x = event.clientX;
      last.y = event.clientY;
      last.t = now;
    };

    const onLeave = () => cursorRef.current?.classList.remove("is-visible");
    const onTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch" && !reducedRef.current && cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursorRef.current.classList.add("is-visible");
      }
    };
    const onTouchEnd = () => {
      window.setTimeout(() => cursorRef.current?.classList.remove("is-visible"), 600);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onTouch, { passive: true });
    window.addEventListener("pointerup", onTouchEnd, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTouch);
      window.removeEventListener("pointerup", onTouchEnd);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
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

  /* Live particle engine and recorded playback. */
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

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      if (particles.current.length > MAX_PARTICLES) {
        particles.current.splice(0, particles.current.length - MAX_PARTICLES);
      }
      const ttl = 34 + Math.random() * 30;
      particles.current.push({
        x,
        y,
        vx,
        vy,
        life: ttl,
        ttl,
        size: 0.8 + Math.random() * 1.9,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - lastTime) / 16.667);
      lastTime = now;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const state = useNozzle.getState();
      const samples = state.samples;

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

        ctx.strokeStyle = "rgba(111, 227, 224, 0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(samples[0].x, samples[0].y);
        for (let i = 1; i <= index; i += 1) {
          ctx.lineTo(samples[i].x, samples[i].y);
        }
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 176, 0, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();

        spawn(x, y, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4 - 0.5);
        spawn(x, y, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2);

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
        particle.vy += 0.055 * dt;
        particle.vx *= 0.996;
        particle.life -= dt;
        if (particle.life <= 0) {
          list.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, particle.life / particle.ttl);
        ctx.fillStyle = `rgba(111, 227, 224, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
      particles.current = [];
    };
  }, [ready, reduced]);

  /* Reduced motion: replay draws a still path instead of spraying. */
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
    ctx.strokeStyle = "rgba(111, 227, 224, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    samples.forEach((sample, index) => {
      if (index === 0) ctx.moveTo(sample.x, sample.y);
      else ctx.lineTo(sample.x, sample.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 176, 0, 0.9)";
    const last = samples[samples.length - 1];
    if (last) {
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
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

  /* The fixed dock appears once the hero controls leave the viewport. */
  useEffect(() => {
    const anchor = document.getElementById("nozzle-hero-controls");
    if (!anchor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = !entries[0]?.isIntersecting;
        setDockVisible(visible);
        /* Keep only one accessible REC/PLAY set; the dock is desktop-only. */
        anchor.style.visibility =
          visible && window.matchMedia("(min-width: 1024px)").matches ? "hidden" : "";
      },
      { threshold: 0.2 },
    );
    observer.observe(anchor);
    return () => {
      observer.disconnect();
      anchor.style.visibility = "";
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="nozzle-canvas" aria-hidden="true" />
      <div ref={cursorRef} className="nozzle-cursor" aria-hidden="true">
        <span className="nozzle-cursor__ring" />
        <span className="nozzle-cursor__line nozzle-cursor__line--h" />
        <span className="nozzle-cursor__line nozzle-cursor__line--v" />
      </div>

      <div
        className="nozzle-dock"
        data-visible={dockVisible}
        aria-hidden={!dockVisible}
        inert={!dockVisible}
      >
        <NozzleControls />
      </div>
    </>
  );
}
