"use client";

import { useState, useEffect } from "react";

export function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setDisplayed(Math.round(p * score));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, score]);

  const offset = circumference - (displayed / 100) * circumference;
  const color = score >= 75 ? "#0d9488" : "#f59e0b";

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 0.05s linear" }}
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 22, fill: color, fontWeight: 700 }}
      >
        {displayed}
      </text>
    </svg>
  );
}
