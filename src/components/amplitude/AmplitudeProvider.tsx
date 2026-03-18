"use client";

import { useEffect } from "react";
import { initAmplitude } from "@/lib/analytics";

export function AmplitudeProvider() {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
}
