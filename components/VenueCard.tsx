"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Venue } from "@/lib/mockVenues";
import {
  formatBps,
  formatUsd,
  calculateTotalCostBps,
  calculateUsdCost,
  formatLiquidityFull,
  cn,
} from "@/lib/utils";

interface VenueCardProps {
  venue: Venue;
  orderSize: number;
  isWinner: boolean;
  index: number;
}

export function VenueCard({ venue, orderSize, isWinner, index }: VenueCardProps) {
  const totalCostBps = calculateTotalCostBps(venue);
  const usdCost = calculateUsdCost(orderSize, totalCostBps);
  const hasInsufficientLiquidity = venue.hasInsufficientLiquidity;
  const orderSizeFormatted = formatLiquidityFull(orderSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "p-5 relative",
        isWinner && !hasInsufficientLiquidity ? "card-winner" : "card-nebular"
      )}
    >
      <div>
        {/* Winner badge */}
        {isWinner && !hasInsufficientLiquidity && (
          <div className="absolute top-0 right-0">
            <Badge variant="winner">
              <Crown className="w-3 h-3 mr-1" />
              WINNER
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden">
            <Image
              src={venue.logo}
              alt={venue.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-white">{venue.name}</h4>
            <Badge variant="muted" className="mt-1">
              {venue.maxLeverage}x
            </Badge>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2.5">
          <CostRow label="Opening Slippage" value={venue.openingSlippageBps} />
          <CostRow label="Closing Slippage" value={venue.closingSlippageBps} />
          <CostRow label="Fees" value={venue.feeBps} />

          {/* Divider */}
          <div className="border-t border-white/5 my-3" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className={cn(
                "w-4 h-4",
                isWinner && !hasInsufficientLiquidity ? "text-[#D8F213]" : "text-[#888]"
              )} />
              <span className="text-sm font-medium text-white">Total Cost</span>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-xl font-bold font-mono",
                isWinner && !hasInsufficientLiquidity ? "text-[#D8F213]" : "text-white"
              )}>
                {formatBps(totalCostBps)}
              </span>
              <span className="text-sm text-[#888] ml-1">bps</span>
            </div>
          </div>

          {/* USD Cost */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666]">USD Cost</span>
            <span className="font-mono text-white">{formatUsd(usdCost)}</span>
          </div>
        </div>

        {/* Partial Fill Warning */}
        {hasInsufficientLiquidity && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 text-center">
              {venue.maxBuyUsd !== undefined && venue.maxSellUsd !== undefined ? (
                <>Partial fill – Buy: {formatLiquidityFull(venue.maxBuyUsd)}/{orderSizeFormatted} – Sell: {formatLiquidityFull(venue.maxSellUsd)}/{orderSizeFormatted}</>
              ) : venue.availableLiquidityUsd !== undefined ? (
                <>Insufficient Liquidity – Max: {formatLiquidityFull(venue.availableLiquidityUsd)}/{orderSizeFormatted}</>
              ) : (
                <>Insufficient Liquidity</>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#888]">{label}</span>
      <span className="font-mono text-white">{formatBps(value)} bps</span>
    </div>
  );
}

export function VenueCardSkeleton() {
  return (
    <div className="card-nebular p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl skeleton-shimmer" />
        <div>
          <div className="h-5 w-24 rounded-lg skeleton-shimmer mb-1" />
          <div className="h-4 w-12 rounded-full skeleton-shimmer" />
        </div>
      </div>
      <div className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded-lg skeleton-shimmer" />
            <div className="h-4 w-16 rounded-lg skeleton-shimmer" />
          </div>
        ))}
        <div className="border-t border-white/5 my-3" />
        <div className="flex justify-between">
          <div className="h-5 w-20 rounded-lg skeleton-shimmer" />
          <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
