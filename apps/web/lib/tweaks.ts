"use client";

import { useState, useCallback } from "react";

type Tweaks = Record<string, string | number | boolean>;

// Dev-only tweak panel state — UI knobs without env restarts
export function useTweaks(defaults: Tweaks) {
  const [tweaks, setTweaks] = useState<Tweaks>(defaults);

  const set = useCallback((key: string, value: string | number | boolean) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { tweaks, set };
}
