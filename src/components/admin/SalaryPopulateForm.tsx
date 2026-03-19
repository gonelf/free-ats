"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, RotateCcw } from "lucide-react";

interface CityOption {
  slug: string;
  name: string;
  tier: number;
}

interface SalaryPopulateFormProps {
  cities: CityOption[];
  totalEntries: number;
}

export function SalaryPopulateForm({ cities, totalEntries }: SalaryPopulateFormProps) {
  const [scope, setScope] = useState<"all" | "tier" | "city">("tier");
  const [tier, setTier] = useState<"1" | "2" | "3">("1");
  const [city, setCity] = useState(cities[0]?.slug ?? "");
  const [dryRun, setDryRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  function buildUrl() {
    const params = new URLSearchParams();
    if (scope === "city") params.set("city", city);
    else if (scope === "tier") params.set("tier", tier);
    if (dryRun) params.set("dryRun", "true");
    return `/api/admin/salary-populate?${params.toString()}`;
  }

  function start() {
    setLines([]);
    setDone(false);
    setRunning(true);

    const es = new EventSource(buildUrl());
    esRef.current = es;

    es.onmessage = (e) => {
      const { msg } = JSON.parse(e.data) as { msg: string };
      setLines((prev) => [...prev, msg]);
    };

    es.addEventListener("done", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setLines((prev) => [
        ...prev,
        `\nTotal upserted: ${data.totalUpserted}${data.totalInDb !== null ? ` | Total in DB: ${data.totalInDb}` : ""}`,
      ]);
      setDone(true);
      setRunning(false);
      es.close();
    });

    es.addEventListener("error", (e) => {
      if ((e as MessageEvent).data) {
        const data = JSON.parse((e as MessageEvent).data);
        setLines((prev) => [...prev, `\nError: ${data.error}`]);
      }
      setRunning(false);
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setRunning(false);
      }
    };
  }

  function stop() {
    esRef.current?.close();
    setRunning(false);
    setLines((prev) => [...prev, "\n[Stopped by user]"]);
  }

  function reset() {
    setLines([]);
    setDone(false);
  }

  const tierCities = cities.filter((c) => scope === "tier" ? c.tier === parseInt(tier) : true);
  const scopeLabel =
    scope === "all"
      ? `all ${cities.length} cities`
      : scope === "tier"
      ? `Tier ${tier} (${tierCities.length} cities)`
      : cities.find((c) => c.slug === city)?.name ?? city;

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900">Configuration</h2>

        {/* Scope */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Scope</label>
          <div className="flex gap-2">
            {(["tier", "city", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                disabled={running}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  scope === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {s === "all" ? "All cities" : s === "tier" ? "By tier" : "Single city"}
              </button>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        {scope === "tier" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Tier</label>
            <div className="flex gap-2">
              {(["1", "2", "3"] as const).map((t) => {
                const count = cities.filter((c) => c.tier === parseInt(t)).length;
                return (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    disabled={running}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                      tier === t
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    Tier {t} ({count} cities)
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* City selector */}
        {scope === "city" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={running}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {[1, 2, 3].map((t) => (
                <optgroup key={t} label={`Tier ${t}`}>
                  {cities
                    .filter((c) => c.tier === t)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* Dry run */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            disabled={running}
            className="rounded border-gray-300"
          />
          <span className="text-xs font-medium text-gray-700">
            Dry run{" "}
            <span className="font-normal text-gray-500">(preview without DB writes)</span>
          </span>
        </label>

        {/* DB stats */}
        <div className="text-xs text-gray-400">
          Current DB: <span className="font-medium text-gray-600">{totalEntries.toLocaleString()}</span> salary entries
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {!running ? (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Run for {scopeLabel}
              {dryRun && " (dry run)"}
            </button>
          ) : (
            <button
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          )}
          {lines.length > 0 && !running && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          {running && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Running…
            </span>
          )}
          {done && (
            <span className="text-xs font-medium text-green-700">Completed</span>
          )}
        </div>
      </div>

      {/* Log output */}
      {lines.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400">Output</span>
            <span className="text-xs text-gray-500">{lines.length} lines</span>
          </div>
          <div
            ref={logRef}
            className="h-96 overflow-y-auto p-4 font-mono text-xs text-gray-300 space-y-0.5"
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("✓") || line.includes("✅")
                    ? "text-green-400"
                    : line.includes("✗") || line.includes("Error") || line.includes("Fatal")
                    ? "text-red-400"
                    : line.includes("DRY RUN") || line.includes("[Stopped")
                    ? "text-yellow-400"
                    : line.startsWith("\n---") || line.startsWith("---")
                    ? "text-blue-400 font-semibold mt-1"
                    : "text-gray-300"
                }
              >
                {line || "\u00a0"}
              </div>
            ))}
            {running && (
              <div className="text-gray-500 animate-pulse">▌</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
