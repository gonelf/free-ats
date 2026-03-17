"use client";

import { CostCalculator } from "./CostCalculator";
import type { PricingCalculatorConfig } from "@/app/vs/competitors";

type Props = {
  competitorName: string;
  config: PricingCalculatorConfig;
  showEmployees?: boolean;
  defaultSeats: number;
  defaultJobs: number;
  defaultEmployees: number;
};

/**
 * Thin wrapper around CostCalculator that accepts default slider values.
 * Kept separate so the alternatives pages can pass page-specific presets.
 */
export function CostCalculatorWithDefaults(props: Props) {
  return (
    <CostCalculator
      competitorName={props.competitorName}
      config={props.config}
      showEmployees={props.showEmployees}
      defaultSeats={props.defaultSeats}
      defaultJobs={props.defaultJobs}
      defaultEmployees={props.defaultEmployees}
    />
  );
}
