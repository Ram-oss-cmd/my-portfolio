"use client";

import { useEffect, useState } from "react";
import { NOZZLE_MAX_MS, useNozzle } from "@/store/nozzle";

type NozzleControlsProps = {
  id?: string;
  className?: string;
};

export function NozzleControls({ id, className }: NozzleControlsProps) {
  const recording = useNozzle((state) => state.recording);
  const playing = useNozzle((state) => state.playing);
  const startedAt = useNozzle((state) => state.startedAt);
  const canPlay = useNozzle((state) => state.samples.length >= 2);
  const startRecording = useNozzle((state) => state.startRecording);
  const stopRecording = useNozzle((state) => state.stopRecording);
  const startPlayback = useNozzle((state) => state.startPlayback);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!recording) {
      const frame = requestAnimationFrame(() => setElapsed(0));
      return () => cancelAnimationFrame(frame);
    }
    const timer = window.setInterval(() => {
      setElapsed(Math.min(NOZZLE_MAX_MS, performance.now() - startedAt) / 1000);
    }, 100);
    return () => window.clearInterval(timer);
  }, [recording, startedAt]);

  const label = playing
    ? "Replaying"
    : recording
      ? "Recording"
      : canPlay
        ? "Path ready"
        : "Ready";

  return (
    <div id={id} className={`nozzle-controls ${className ?? ""}`}>
      <button
        type="button"
        className="nozzle-btn nozzle-btn--rec"
        aria-pressed={recording}
        aria-keyshortcuts="R"
        onClick={() => (recording ? stopRecording() : startRecording())}
        disabled={playing}
      >
        <span className="nozzle-btn__mark nozzle-btn__mark--rec" aria-hidden="true" />
        Record
        <kbd>R</kbd>
      </button>

      <button
        type="button"
        className="nozzle-btn nozzle-btn--play"
        aria-keyshortcuts="P"
        onClick={() => startPlayback()}
        disabled={!canPlay || recording || playing}
      >
        <span className="nozzle-btn__mark nozzle-btn__mark--play" aria-hidden="true" />
        Replay
        <kbd>P</kbd>
      </button>

      <p className="nozzle-state">
        <span aria-live="polite">{label}</span>
        {recording ? (
          <span aria-hidden="true"> {elapsed.toFixed(1)}s / 6.0s</span>
        ) : null}
      </p>
    </div>
  );
}
