"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowDown, ArrowUp, Info, LayoutGrid, List, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VenueCard, VenueCardSkeleton } from "@/components/VenueCard";
import { Venue } from "@/lib/mockVenues";
import { calculateTotalCostBps, calculateUsdCost, formatBps, formatUsd, cn } from "@/lib/utils";

function formatLiquidityFull(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "N/A";
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatLiquidity(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "N/A";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount)}`;
}

type SortField = "totalCost" | "fees" | "slippage";
type SortDirection = "asc" | "desc";
type ViewMode = "cards" | "table";

interface VenueGridProps {
  venues: Venue[];
  orderSize: number;
  isLoading: boolean;
  winnerVenueId: string | null;
}

export function VenueGrid({
  venues,
  orderSize,
  isLoading,
  winnerVenueId,
}: VenueGridProps) {
  const [sortField, setSortField] = useState<SortField>("totalCost");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const sortedVenues = useMemo(() => {
    const sorted = [...venues].sort((a, b) => {
      // Always put insufficient liquidity venues at the bottom
      if (a.hasInsufficientLiquidity && !b.hasInsufficientLiquidity) return 1;
      if (!a.hasInsufficientLiquidity && b.hasInsufficientLiquidity) return -1;

      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "totalCost":
          aValue = calculateTotalCostBps(a);
          bValue = calculateTotalCostBps(b);
          break;
        case "fees":
          aValue = a.feeBps;
          bValue = b.feeBps;
          break;
        case "slippage":
          aValue = a.openingSlippageBps + a.closingSlippageBps;
          bValue = b.openingSlippageBps + b.closingSlippageBps;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [venues, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field, isActive }: { field: SortField; isActive: boolean }) => {
    const iconClass = isActive ? "w-3.5 h-3.5 text-[#0A0A0A]" : "w-3.5 h-3.5 text-[#555]";
    
    if (sortField !== field) {
      return <ArrowUpDown className={iconClass} />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className={iconClass} />
    ) : (
      <ArrowDown className={iconClass} />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded skeleton-shimmer" />
          <div className="h-10 w-72 rounded-full skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with sorting and view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            All Venues
          </h3>
          <span className="text-sm text-[#666]">
            {venues.length} results
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-[#555] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A1A] border-white/10 rounded-xl">
                <p className="text-xs max-w-[200px]">
                  <strong>bps</strong> = basis points. 1 bps = 0.01%
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4">
          {/* View toggle */}
          <div className="flex items-center bg-white/5 rounded-full p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === "table" ? "bg-white/10 text-white" : "text-[#666] hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === "cards" ? "bg-white/10 text-white" : "text-[#666] hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666] uppercase tracking-wider mr-1">
              Sort:
            </span>
            <div className="flex gap-1.5">
            {[
              { field: "totalCost" as const, label: "Cost" },
              { field: "fees" as const, label: "Fees" },
              { field: "slippage" as const, label: "Slippage" },
            ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={cn(
                    "h-9 px-4 text-xs rounded-full flex items-center gap-1.5 transition-all duration-200 font-medium",
                    sortField === field
                      ? "bg-[#D8F213] text-[#0A0A0A]"
                      : "bg-white/5 border border-white/10 text-[#999] hover:bg-white/10"
                  )}
                >
                  {label}
                  <SortIcon field={field} isActive={sortField === field} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === "cards" && (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {sortedVenues.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                orderSize={orderSize}
                isWinner={venue.id === winnerVenueId}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-nebular overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Platform</th>
                <th className="text-left text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Leverage</th>
                <th className="text-right text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Opening Spread</th>
                <th className="text-right text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Closing Spread</th>
                <th className="text-right text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Fees</th>
                <th className="text-right text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">Total Cost</th>
                <th className="text-right text-xs text-[#666] font-medium uppercase tracking-wider px-4 py-3">USD Cost</th>
              </tr>
            </thead>
            <tbody>
              {sortedVenues.map((venue, index) => {
                const totalCost = calculateTotalCostBps(venue);
                const usdCost = calculateUsdCost(orderSize, totalCost);
                const isWinner = venue.id === winnerVenueId;
                const hasInsufficientLiquidity = venue.hasInsufficientLiquidity;

                return (
                  <motion.tr
                    key={venue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02]",
                      isWinner && !hasInsufficientLiquidity && "bg-[#D8F213]/[0.03] border-l-2 border-l-[#D8F213]",
                      hasInsufficientLiquidity && "opacity-60"
                    )}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg overflow-hidden flex-shrink-0",
                          hasInsufficientLiquidity && "grayscale"
                        )}>
                          <Image
                            src={venue.logo}
                            alt={venue.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-medium",
                            hasInsufficientLiquidity ? "text-[#888]" : "text-white"
                          )}>
                            {venue.name}
                          </span>
                          {hasInsufficientLiquidity && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span className="text-[10px] text-amber-400">
                                Insufficient Liquidity • Max: {formatLiquidity(venue.availableLiquidityUsd)}
                              </span>
                            </div>
                          )}
                        </div>
                        {isWinner && !hasInsufficientLiquidity && (
                          <span className="text-[10px] bg-[#D8F213] text-[#0A0A0A] px-2 py-0.5 rounded-full font-semibold">
                            BEST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={cn(
                      "px-4 py-4 tabular-nums",
                      hasInsufficientLiquidity ? "text-[#555]" : "text-[#888]"
                    )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                      {venue.maxLeverage}x
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-right tabular-nums",
                      hasInsufficientLiquidity ? "text-[#555]" : "text-white"
                    )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                      {formatBps(venue.openingSlippageBps)}
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-right tabular-nums",
                      hasInsufficientLiquidity ? "text-[#555]" : "text-white"
                    )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                      {formatBps(venue.closingSlippageBps)}
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-right tabular-nums",
                      hasInsufficientLiquidity ? "text-[#555]" : "text-white"
                    )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                      {formatBps(venue.feeBps)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={cn(
                        "tabular-nums font-medium",
                        hasInsufficientLiquidity ? "text-[#555]" : isWinner ? "text-[#D8F213]" : "text-white"
                      )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                        {formatBps(totalCost)} bps
                      </span>
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-right tabular-nums",
                      hasInsufficientLiquidity ? "text-[#555]" : "text-white"
                    )} style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}>
                      {formatUsd(usdCost)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
