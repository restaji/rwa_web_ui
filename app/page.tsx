"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { FiltersPanel } from "@/components/FiltersPanel";
import {
  BestExecutionCard,
  BestExecutionCardSkeleton,
} from "@/components/BestExecutionCard";
import { VenueGrid } from "@/components/VenueGrid";
import { getVenueDataForAsset, Venue, ASSETS } from "@/lib/mockVenues";
import { calculateTotalCostBps } from "@/lib/utils";

export default function FeeAnalysisPage() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0].id);
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [orderSize, setOrderSize] = useState(100000);
  const [customSize, setCustomSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);

  const winnerVenue = useMemo(() => {
    if (venues.length === 0) return null;
    return venues.reduce((best, venue) => {
      const bestCost = calculateTotalCostBps(best);
      const currentCost = calculateTotalCostBps(venue);
      return currentCost < bestCost ? venue : best;
    }, venues[0]);
  }, [venues]);

  const handleApply = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = getVenueDataForAsset(selectedAsset, direction, orderSize);
    setVenues(data);
    setIsLoading(false);
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

        {/* Best Execution */}
        <section className="mb-8">
          {isLoading ? (
            <BestExecutionCardSkeleton />
          ) : winnerVenue ? (
            <BestExecutionCard venue={winnerVenue} orderSize={orderSize} />
          ) : null}
        </section>
        {/* Results */}
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
