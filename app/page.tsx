"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { FiltersPanel } from "@/components/FiltersPanel";
import {
  BestExecutionCard,
  BestExecutionCardSkeleton,
} from "@/components/BestExecutionCard";
import { VenueGrid } from "@/components/VenueGrid";
import { Venue, ASSETS } from "@/lib/mockVenues";
import { fetchComparison } from "@/lib/api";
import { calculateTotalCostBps } from "@/lib/utils";

export default function FeeAnalysisPage() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0].id);
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [orderSize, setOrderSize] = useState(100000);
  const [customSize, setCustomSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);

  const winnerVenue = useMemo(() => {
    const eligibleVenues = venues.filter((v) => !v.hasInsufficientLiquidity);
    if (eligibleVenues.length === 0) return null;
    return eligibleVenues.reduce((best, venue) => {
      const bestCost = calculateTotalCostBps(best);
      const currentCost = calculateTotalCostBps(venue);
      return currentCost < bestCost ? venue : best;
    }, eligibleVenues[0]);
  }, [venues]);

  const handleApply = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchComparison(selectedAsset, orderSize, direction);
      setVenues(data);
    } catch (err) {
      console.error("Failed to fetch comparison:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAsset, direction, orderSize]);

  // Load initial data on mount
  useEffect(() => {
    handleApply();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Background texture - more visible */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/bg-texture.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
        }}
      />
      {/* Subtle darkening overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(10,10,10,0.6) 100%)",
        }}
      />

      {/* Navbar section - full width */}
      <div className="relative z-10">
        <div
          className="relative overflow-hidden backdrop-blur-md"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/top.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.15,
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
          {/* Navbar */}
          <nav className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FX</span>
                </div>
                <span className="font-semibold text-white">FeeX</span>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-sm text-[#888] hover:text-white transition-colors"
                >
                  Docs
                </a>
                <a
                  href="#"
                  className="text-sm text-[#888] hover:text-white transition-colors"
                >
                  API
                </a>
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <h1
            className="font-light text-white tracking-tight leading-tight"
            style={{ fontSize: "2.75rem" }}
          >
            Compare RWA execution costs
            <br />
            <span className="text-[#666]">across perpetual DEXs</span>
          </h1>
        </motion.header>

        {/* Filters */}
        <section className="mb-8">
          <FiltersPanel
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            direction={direction}
            setDirection={setDirection}
            orderSize={orderSize}
            setOrderSize={setOrderSize}
            customSize={customSize}
            setCustomSize={setCustomSize}
            onApply={handleApply}
            isLoading={isLoading}
          />
        </section>

        {/* Error State */}
        {error && !isLoading && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    Failed to load comparison data
                  </h3>
                  <p className="text-[#888] text-sm mb-4">{error}</p>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Best Execution */}
        <section className="mb-8">
          {isLoading ? (
            <BestExecutionCardSkeleton />
          ) : winnerVenue ? (
            <BestExecutionCard venue={winnerVenue} orderSize={orderSize} />
          ) : null}
        </section>
        {/* Results */}
        {!error && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Grid */}
            <VenueGrid
              venues={venues}
              orderSize={orderSize}
              isLoading={isLoading}
              winnerVenueId={winnerVenue?.id || null}
            />
          </motion.section>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[#555]">
            <p>Fee Analysis • Execution cost comparison</p>
            <p>Data is indicative</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
