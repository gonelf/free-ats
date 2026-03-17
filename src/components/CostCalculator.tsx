"use client";

import { useState } from "react";
import type { PricingCalculatorConfig } from "@/app/vs/competitors";

function computeCompetitorCost(
  config: PricingCalculatorConfig,
  seats: number,
  jobs: number,
  employees: number
): number {
  const seatCost = Math.max(0, seats - config.freeSeats) * config.perSeatCost;
  const jobCost = Math.max(0, jobs - config.freeJobs) * config.perJobCost;
  const employeeCost = employees * config.perEmployeeCost;
  return Math.max(config.minimumMonthly, config.baseCost + seatCost + jobCost + employeeCost);
}

type Props = {
  competitorName: string;
  config: PricingCalculatorConfig;
  /** Whether to show the total employees slider (for per-employee models) */
  showEmployees?: boolean;
  defaultSeats?: number;
  defaultJobs?: number;
  defaultEmployees?: number;
};

export function CostCalculator({
  competitorName,
  config,
  showEmployees,
  defaultSeats = 5,
  defaultJobs = 5,
  defaultEmployees = 30,
}: Props) {
  const [seats, setSeats] = useState(defaultSeats);
  const [jobs, setJobs] = useState(defaultJobs);
  const [employees, setEmployees] = useState(defaultEmployees);

  const competitorCost = computeCompetitorCost(config, seats, jobs, employees);
  const kitehrFree = 0;
  const kitehrPro = 49;
  const annualSavings = (competitorCost - kitehrPro) * 12;
  const fiveYearSavings = annualSavings * 5;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-6 md:p-8">
      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <SliderInput
          label="Hiring team members"
          hint="Recruiters, HR, hiring managers"
          value={seats}
          min={1}
          max={50}
          onChange={setSeats}
        />
        <SliderInput
          label="Active job openings"
          hint="Roles you're hiring for right now"
          value={jobs}
          min={1}
          max={50}
          onChange={setJobs}
        />
        {showEmployees && (
          <SliderInput
            label="Total employees"
            hint="Used for per-employee pricing models"
            value={employees}
            min={1}
            max={500}
            onChange={setEmployees}
          />
        )}
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* KiteHR card */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400 mb-3">KiteHR</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold text-white">${kitehrFree}</span>
            <span className="text-white/40 mb-1">/mo</span>
          </div>
          <p className="text-xs text-white/40 mb-4">Free forever — unlimited jobs, users &amp; candidates</p>
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/40 mb-1">With AI features (Pro)</p>
            <p className="text-sm font-semibold text-white">
              $49<span className="text-white/40 font-normal">/mo per workspace</span>
            </p>
          </div>
        </div>

        {/* Competitor card */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">{competitorName}</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold text-white/70">
              ${competitorCost.toLocaleString()}
            </span>
            <span className="text-white/30 mb-1">/mo</span>
          </div>
          <p className="text-xs text-white/30 mb-4">Estimated · {config.billingLabel}</p>
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 italic">{config.notes}</p>
          </div>
        </div>
      </div>

      {/* Savings callout */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-green-400">
            You save ${(competitorCost - kitehrPro).toLocaleString()}/mo with KiteHR Pro
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            ${annualSavings.toLocaleString()} per year · ${fiveYearSavings.toLocaleString()} over 5 years
          </p>
        </div>
        <a
          href="/signup"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
        >
          Start free
        </a>
      </div>
    </div>
  );
}

function SliderInput({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-xs text-white/30">{hint}</p>
        </div>
        <span className="text-lg font-bold text-cyan-400 w-10 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500"
      />
      <div className="flex justify-between text-xs text-white/20 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
