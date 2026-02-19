import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBps(bps: number): string {
  return bps.toFixed(2);
}

export function formatUsd(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

export function parseOrderSize(input: string): number | null {
  const cleaned = input.toLowerCase().replace(/[,$\s]/g, "");
  
  const multipliers: Record<string, number> = {
    k: 1000,
    m: 1000000,
    b: 1000000000,
  };
  
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(k|m|b)?$/);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const multiplier = match[2] ? multipliers[match[2]] : 1;
  
  return value * multiplier;
}

export function calculateTotalCostBps(venue: {
  openingSpreadBps: number;
  openingSlippageBps: number;
  closingSlippageBps: number;
  feeBps: number;
}): number {
  return (
    venue.openingSpreadBps +
    venue.openingSlippageBps +
    venue.closingSlippageBps +
    venue.feeBps
  );
}

export function calculateUsdCost(orderSize: number, totalCostBps: number): number {
  return (orderSize * totalCostBps) / 10000;
}

export function formatLiquidityCompact(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "N/A";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount)}`;
}

export function formatLiquidityFull(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "N/A";
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
