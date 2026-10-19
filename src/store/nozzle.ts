"use client";

import { create } from "zustand";

export type NozzleSample = {
  x: number;
  y: number;
  /** milliseconds since recording started, capped at 6000 */
  t: number;
};

export const NOZZLE_MAX_MS = 6000;

type NozzleState = {
  recording: boolean;
  playing: boolean;
  startedAt: number;
  samples: NozzleSample[];
  startRecording: () => void;
  stopRecording: () => void;
  pushSample: (sample: NozzleSample) => void;
  startPlayback: () => void;
  stopPlayback: () => void;
};

export const useNozzle = create<NozzleState>((set, get) => ({
  recording: false,
  playing: false,
  startedAt: 0,
  samples: [],

  startRecording: () =>
    set({
      recording: true,
      playing: false,
      startedAt: performance.now(),
      samples: [],
    }),

  stopRecording: () => set({ recording: false }),

  pushSample: (sample) => {
    const { recording, samples } = get();
    if (!recording) return;
    if (sample.t >= NOZZLE_MAX_MS) {
      set({ recording: false, samples: [...samples, { ...sample, t: NOZZLE_MAX_MS }] });
      return;
    }
    set({ samples: [...samples, sample] });
  },

  startPlayback: () => {
    const { samples, recording } = get();
    if (recording || samples.length < 2) return;
    set({ playing: true });
  },

  stopPlayback: () => set({ playing: false }),
}));
