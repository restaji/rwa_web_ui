"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowDown, ArrowUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VenueCard, VenueCardSkeleton } from "@/components/VenueCard";
import { Venue } from "@/lib/mockVenues";
import { calculateTotalCostBps, cn } from "@/lib/utils";

type SortField = "totalCost" | "fees" | "spread" | "slippage";
type SortDirection = "asc" | "desc";

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

  const sortedVenues = useMemo(() => {
    const sorted = [...venues].sort((a, b) => {
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
        case "spread":
          aValue = a.openingSpreadBps;
          bValue = b.openingSpreadBps;
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
          {[...Array(8)].map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with sorting */}
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

        {/* Sort pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666] uppercase tracking-wider mr-1">
            Sort:
          </span>
          <div className="flex gap-1.5">
            {[
              { field: "totalCost" as const, label: "Cost" },
              { field: "fees" as const, label: "Fees" },
              { field: "spread" as const, label: "Spread" },
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

      {/* Venue grid */}
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
    </div>
  );
}
