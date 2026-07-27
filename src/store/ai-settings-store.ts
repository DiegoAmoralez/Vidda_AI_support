"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AiSettingsState = {
  neuralEnabled: boolean;
  setNeuralEnabled: (enabled: boolean) => void;
};

export const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set) => ({
      neuralEnabled: true,
      setNeuralEnabled: (neuralEnabled) => set({ neuralEnabled }),
    }),
    {
      name: "vidda-ai-settings-v1",
    },
  ),
);
