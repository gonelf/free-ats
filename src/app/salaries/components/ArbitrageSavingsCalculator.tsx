"use client";

/**
 * Interactive geo-arbitrage savings calculator.
 * User adjusts headcount — we show total annual savings and push to /signup.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatSalary } from "../salary-data";

type Props = {
  annualSavingsPerRole: number;
  currency: "USD" | "GBP";
  roleTitle: string;
  cityName: string;
};

export function ArbitrageSavingsCalculator({
  annualSavingsPerRole,
  currency,
  roleTitle,
  cityName,
}: Props) {
  const [headcount, setHeadcount] = useState(3);
  const totalSavings = annualSavingsPerRole * headcount;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-emerald-800 mb-1">
          Savings Calculator
        </h3>
        <p className="text-xs text-slate-500">
          How many {roleTitle}s are you hiring in {cityName}?
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Headcount</span>
          <span className="text-lg font-bold text-slate-900">{headcount}</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={headcount}
          onChange={(e) => setHeadcount(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-emerald-200 accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-slate-300">
          <span>1</span>
          <span>10</span>
          <span>20</span>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl bg-white border border-emerald-200 px-5 py-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Annual savings with remote team</p>
        <p className="text-3xl font-bold text-emerald-600">
          {formatSalary(totalSavings, currency)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {formatSalary(annualSavingsPerRole, currency)} per role × {headcount}{" "}
          {headcount === 1 ? "hire" : "hires"}
        </p>
      </div>

      <Link
        href="/signup"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
      >
        Start hiring remote via KiteHR
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
