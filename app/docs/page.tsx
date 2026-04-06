"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, BookOpen, Calculator, Building2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How It Works" },
  { id: "cost-breakdown", label: "Cost Breakdown" },
  { id: "exchanges", label: "Supported Exchanges" },
  { id: "hyperliquid", label: "Hyperliquid", indent: true },
  { id: "lighter", label: "Lighter", indent: true },
  { id: "aster", label: "Aster", indent: true },
  { id: "avantis", label: "Avantis", indent: true },
  { id: "ostium", label: "Ostium", indent: true },
  { id: "extended", label: "Extended", indent: true },
  { id: "edgex", label: "EdgeX", indent: true },
  { id: "grvt", label: "GRVT", indent: true },
  { id: "slippage-calc", label: "Slippage Calculation" },
  { id: "comparison",    label: "Exchange Comparison" },
  { id: "assets",        label: "Supported Assets" },
  { id: "limitations",   label: "Limitations" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/bg-texture.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(10,10,10,0.8) 100%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#0A0A0A]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-[#888] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D8F213]" />
                <span className="font-light text-white">Documentation</span>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Real World Perps" className="h-8 w-auto" />
              <span className="font-light text-white text-sm">Real World Perps</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="sticky top-28 space-y-1">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                    section.indent && "pl-6",
                    activeSection === section.id
                      ? "bg-white/5 text-white"
                      : "text-[#666] hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero */}
            <div className="mb-16">
              <h1 className="text-4xl font-light text-white mb-4">
                How We Calculate Execution Costs
              </h1>
              <p className="text-lg text-[#888] max-w-2xl">
                Real World Perps compares execution costs across multiple perpetual DEXs in real-time. 
                This documentation explains our methodology and how each exchange calculates fees and slippage.
              </p>
            </div>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <p>
                When you trade perpetual contracts, your total execution cost comes from several sources: 
                trading fees, slippage (the difference between expected and actual price), and spread 
                (the gap between buy and sell prices).
              </p>
              <p>
                Different exchanges use different pricing models. Some use traditional order books where 
                your order walks through available liquidity. Others use a simulated order book where 
                slippage is derived from an oracle price and a dynamic spread parameter.
              </p>
              <p>
                We fetch real-time data from each exchange and calculate what your actual cost would be 
                for a given trade size, direction, and asset.
              </p>
            </Section>

            {/* How It Works */}
            <Section id="how-it-works" title="How It Works">
              <p>
                For every comparison, we query each exchange{"'"}s API to get current order book depth, 
                fee rates, and spread information. We then simulate executing your trade to calculate 
                the total cost.
              </p>
              
              <InfoBox title="Real-Time Data">
                All calculations use live data. Prices, fees, and liquidity are fetched fresh for each 
                comparison. Data auto-refreshes every 10 seconds.
              </InfoBox>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">The Calculation Process</h3>
              <ol className="list-decimal list-inside space-y-2 text-[#999]">
                <li>Fetch current order book or oracle prices from each exchange</li>
                <li>Query each exchange{"'"}s fee API for your specific fee tier</li>
                <li>Simulate walking through the order book (for order book exchanges)</li>
                <li>Calculate spread costs (for simulated order book exchanges)</li>
                <li>Sum up all costs and convert to basis points</li>
                <li>Identify the lowest-cost venue</li>
              </ol>
            </Section>

            {/* Cost Breakdown */}
            <Section id="cost-breakdown" title="Cost Breakdown">
              <p>
                Every trade has costs on both sides — opening and closing your position. We calculate 
                the round-trip cost so you can compare apples to apples.
              </p>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 my-6">
                <h4 className="text-white font-mono text-sm mb-4">Total Cost Formula</h4>
                <code className="block text-[#D8F213] font-mono text-sm leading-relaxed">
                  total_cost_bps = opening_slippage + closing_slippage + open_fee + close_fee
                </code>
                <p className="text-[#666] text-sm mt-4">
                  USD Cost = (order_size × total_cost_bps) ÷ 10,000
                </p>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">What is a Basis Point?</h3>
              <p>
                A basis point (bps) is one hundredth of a percent (0.01%). So 10 bps equals 0.10%. 
                For a $100,000 trade at 10 bps, your cost would be $10.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Opening vs Closing Costs</h3>
              <p>
                <strong className="text-white">Opening costs</strong> occur when you enter a position. 
                For a long trade, you{"'"}re buying — so you pay the ask price (or walk up the ask side 
                of the order book).
              </p>
              <p>
                <strong className="text-white">Closing costs</strong> occur when you exit. For a long
                trade, you{"'"}re selling — so you receive the bid price (or walk down the bid side).
              </p>
            </Section>

            {/* Exchanges Overview */}
            <Section id="exchanges" title="Supported Exchanges">
              <p>
                We currently support eight perpetual DEXs, each with different pricing models and fee 
                structures. Understanding these differences helps you choose the best venue for your trade.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 my-6">
                <ExchangeCard 
                  name="Order Book Exchanges" 
                  exchanges={["Hyperliquid", "Lighter", "Aster", "Extended", "EdgeX", "GRVT"]}
                  description="Your order walks through available liquidity. Slippage depends on order book depth."
                />
                <ExchangeCard 
                  name="Simulated Order Book" 
                  exchanges={["Avantis", "Ostium"]}
                  description="Trade against oracle prices with a dynamic spread. Slippage is modelled from the spread parameter rather than real order book depth."
                />
              </div>
            </Section>

            {/* Hyperliquid */}
            <Section id="hyperliquid" title="Hyperliquid" badge="Order Book">
              <p>
                Hyperliquid is an L1 blockchain built specifically for perpetual trading. RWA assets 
                trade on the xyz sub-market with symbols like xyz:GOLD and xyz:EUR.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                We fetch the order book at maximum precision and simulate your order walking through 
                each price level. The average execution price compared to the mid-price gives us the 
                slippage in basis points.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Hyperliquid fees are dynamic and depend on several factors:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#999] mt-3">
                <li><strong className="text-white">Base rate</strong> — fetched from the userFees API</li>
                <li><strong className="text-white">Deployer fee scale</strong> — a multiplier set by the xyz market</li>
                <li><strong className="text-white">Growth mode</strong> — when enabled, fees are reduced by 90%</li>
              </ul>

              <InfoBox title="Growth Mode Discount">
                When growth mode is active on an asset, fees are reduced to just 10% of the normal rate. 
                This can make Hyperliquid significantly cheaper during promotional periods.
              </InfoBox>
            </Section>

            {/* Lighter */}
            <Section id="lighter" title="Lighter" badge="Order Book">
              <p>
                Lighter runs on ZK-Lighter (Elliot mainnet), a zero-knowledge rollup designed for 
                high-performance trading. Each asset has a specific market ID.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                Same order book walking method as Hyperliquid. We fetch up to 250 price levels and 
                simulate your order execution.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees are fetched from the orderBookDetails API. Both taker and maker fees are published 
                on-chain. Currently, many markets have 0 bps taker fees as a promotional measure.
              </p>
            </Section>

            {/* Aster */}
            <Section id="aster" title="Aster" badge="Order Book">
              <p>
                Aster uses a Binance-compatible API structure. It{"'"}s a centralized-style DEX with deep 
                order books for popular assets.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                We fetch up to 1,000 order book levels and walk through them to calculate your average 
                execution price.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees are fetched via authenticated API calls. The commission rate typically ranges from 
                2-5 bps depending on your fee tier.
              </p>
            </Section>

            {/* Avantis */}
            <Section id="avantis" title="Avantis" badge="Simulated Order Book">
              <p>
                Avantis is a perpetuals protocol on Base that uses a simulated order book model. 
                Instead of resting limit orders, prices are derived from an oracle with a dynamic 
                spread that acts as synthetic slippage.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Spread is Calculated</h3>
              <p>
                Spread can be either dynamic or static depending on the asset. Dynamic spreads are 
                fetched from Avantis{"'"}s risk API and scale with position size.
              </p>

              <InfoBox title="One-Way Spread">
                Avantis is unique — spread only applies when opening a position, not when closing. 
                This means the spread cost is half what it would be on other simulated order book exchanges.
              </InfoBox>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Opening fees are skew-adjusted. If the pool is heavily skewed (e.g., many more longs 
                than shorts), going with the majority costs more. This incentivizes balanced open interest.
              </p>
              <p>
                Closing fees are a flat rate specific to each asset.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Liquidity Limits</h3>
              <p>
                Each asset has a maximum position size (maxWalletOI). If your order exceeds this, 
                we mark it as a partial fill.
              </p>
            </Section>

            {/* Ostium */}
            <Section id="ostium" title="Ostium" badge="Simulated Order Book">
              <p>
                Ostium specializes in real-world asset perpetuals. They use their own price feed that 
                provides bid, ask, and mid prices directly.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Spread is Calculated</h3>
              <p>
                For assets with dynamic pricing, spread combines the market spread (bid-ask gap) with 
                a volume-based component. Recent trading activity affects the spread — high volume 
                leads to wider spreads.
              </p>
              <p>
                The volume impact decays over time using a mathematical formula, so old trades have 
                less effect than recent ones.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees come from the pairs API and may be overridden during promotional seasons. 
                Notably, Ostium charges no closing fee — you only pay when opening.
              </p>
            </Section>

            {/* Extended */}
            <Section id="extended" title="Extended" badge="Order Book">
              <p>
                Extended runs on Starknet, a validity rollup on Ethereum. It offers order book trading 
                for select RWA pairs.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                Same order book methodology as other CLOB exchanges. We fetch the full order book and 
                simulate your execution.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees are fetched via authenticated API calls. Both maker and taker rates are returned 
                per market.
              </p>
            </Section>

            {/* EdgeX */}
            <Section id="edgex" title="EdgeX" badge="Order Book">
              <p>
                EdgeX is a high-performance perpetual DEX with order book-based trading. 
                It offers deep liquidity for popular RWA pairs.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                Same order book methodology as other CLOB exchanges. We fetch the full order book and 
                simulate your execution to calculate slippage.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees are fetched via API. Both maker and taker rates are returned per market.
              </p>
            </Section>

            {/* GRVT */}
            <Section id="grvt" title="GRVT" badge="Order Book">
              <p>
                GRVT (Gravity) is an institutional-grade perpetual DEX with order book trading. 
                It focuses on deep liquidity and low-latency execution.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">How Slippage is Calculated</h3>
              <p>
                Same order book methodology as other CLOB exchanges. We fetch the full order book and 
                simulate your execution to calculate slippage.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Fee Structure</h3>
              <p>
                Fees are fetched via API. Both maker and taker rates are returned per market.
              </p>
            </Section>

            {/* Slippage Calculation */}
            <Section id="slippage-calc" title="Slippage Calculation">
              <p>
                How slippage is computed depends on the exchange{"'"}s pricing model. We treat CLOB 
                and simulated order book venues differently.
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Order Book Exchanges (CLOB)</h3>
              <p>
                For Hyperliquid, Lighter, Aster, Extended, EdgeX, and GRVT we fetch the full order 
                book and simulate walking through it level by level until the full notional is filled.
              </p>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 my-6">
                <h4 className="text-white font-mono text-sm mb-4">CLOB Slippage Formula</h4>
                <code className="block text-[#D8F213] font-mono text-sm leading-relaxed whitespace-pre">
{`weighted_fill = Σ (level_price × level_size) / total_size
slippage_bps  = |weighted_fill − mid_price| / mid_price × 10,000`}
                </code>
                <p className="text-[#666] text-sm mt-4">
                  Both opening and closing slippage are calculated this way. Closing slippage uses 
                  the opposite side of the book (bids for a long exit, asks for a short exit).
                </p>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Simulated Order Book (Avantis &amp; Ostium)</h3>
              <p>
                Avantis and Ostium use a simulated order book model — there is no real resting 
                order book. These venues publish a spread parameter that represents how much the 
                execution price deviates from the oracle price. We use this spread as the synthetic 
                slippage component for both opening and closing legs.
              </p>

              <InfoBox title="Insufficient Liquidity">
                For CLOB exchanges, if the order book does not have enough resting orders to fill 
                the full requested size, the venue is marked <strong>Insufficient Liquidity</strong> and 
                excluded from the best-execution ranking. For Avantis and Ostium, a protocol-published 
                maximum position size cap is used instead.
              </InfoBox>
            </Section>

            {/* Comparison Table */}
            <Section id="comparison" title="Exchange Comparison">
              <p>
                Here{"'"}s a side-by-side comparison of how each exchange handles pricing and fees:
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2.5 px-3 text-[#666] font-medium">Feature</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Hyperliquid</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Lighter</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Aster</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Avantis</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Ostium</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">Extended</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">EdgeX</th>
                      <th className="text-center py-2.5 px-3 text-[#666] font-medium">GRVT</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#999]">
                    <tr className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-white font-medium">Pricing Model</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                      <td className="py-2.5 px-3 text-center">Simulated OB</td>
                      <td className="py-2.5 px-3 text-center">Simulated OB</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                      <td className="py-2.5 px-3 text-center">Order Book</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-white font-medium">Spread Applied</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center text-[#D8F213]">1× open only</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                      <td className="py-2.5 px-3 text-center">2× round trip</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-white font-medium">Close Fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                      <td className="py-2.5 px-3 text-center">Separate rate</td>
                      <td className="py-2.5 px-3 text-center text-[#D8F213]">No close fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                      <td className="py-2.5 px-3 text-center">= Open fee</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-white font-medium">Fee Discounts</td>
                      <td className="py-2.5 px-3 text-center text-[#D8F213]">Growth mode</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                      <td className="py-2.5 px-3 text-center">Season overrides</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                      <td className="py-2.5 px-3 text-center">—</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-white font-medium">Liquidity Check</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                      <td className="py-2.5 px-3 text-center">Position cap</td>
                      <td className="py-2.5 px-3 text-center">Position cap</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                      <td className="py-2.5 px-3 text-center">Book depth</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Supported Assets */}
            <Section id="assets" title="Supported Assets">
              <p>
                Not every exchange lists every asset. Here{"'"}s what{"'"}s available where:
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-[#666] font-medium">Asset</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Hyperliquid</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Lighter</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Aster</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Avantis</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Ostium</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">Extended</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">EdgeX</th>
                      <th className="text-center py-3 px-4 text-[#666] font-medium">GRVT</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#999]">
                    {[
                      { asset: "Gold (XAU)",        hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "✓" },
                      { asset: "Silver (XAG)",       hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "✓" },
                      { asset: "WTI Crude Oil",      hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Brent Crude Oil",    hl: "✓", lt: "—", as: "—", av: "✓", os: "✓", ex: "✓", eg: "—", gr: "—" },
                      { asset: "EUR/USD",            hl: "✓", lt: "✓", as: "—", av: "✓", os: "✓", ex: "✓", eg: "—", gr: "—" },
                      { asset: "GBP/USD",            hl: "✓", lt: "✓", as: "—", av: "✓", os: "✓", ex: "—", eg: "—", gr: "—" },
                      { asset: "USD/JPY",            hl: "✓", lt: "✓", as: "—", av: "✓", os: "✓", ex: "✓", eg: "—", gr: "—" },
                      { asset: "Apple (AAPL)",       hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Microsoft (MSFT)",   hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "—", gr: "—" },
                      { asset: "Google (GOOG)",      hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Amazon (AMZN)",      hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "✓" },
                      { asset: "Meta (META)",        hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "—", gr: "—" },
                      { asset: "Nvidia (NVDA)",      hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Tesla (TSLA)",       hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "✓" },
                      { asset: "S&P 500 (SPY)",      hl: "✓", lt: "✓", as: "—", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Nasdaq 100 (QQQ)",   hl: "✓", lt: "✓", as: "✓", av: "✓", os: "✓", ex: "✓", eg: "✓", gr: "—" },
                      { asset: "Coinbase (COIN)",    hl: "✓", lt: "—", as: "—", av: "✓", os: "✓", ex: "—", eg: "—", gr: "✓" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">{row.asset}</td>
                        <td className="py-3 px-4 text-center">{row.hl === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.lt === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.as === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.av === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.os === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.ex === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.eg === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                        <td className="py-3 px-4 text-center">{row.gr === "✓" ? <span className="text-[#D8F213]">✓</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[#666] text-sm">
                A dash means the exchange doesn{"'"}t list that asset and won{"'"}t appear in comparisons for it.
              </p>
            </Section>

            {/* Limitations */}
            <Section id="limitations" title="Limitations">
              <p>
                Our methodology is designed to be as accurate as possible, but there are factors 
                we do not currently account for:
              </p>
              <ul className="list-disc list-inside space-y-3 text-[#999]">
                <li>
                  <strong className="text-white">Gas / network fees</strong> — on-chain transaction 
                  costs are not included. These vary by network and are typically small relative to 
                  position size but non-zero.
                </li>
                <li>
                  <strong className="text-white">Volume-based fee tiers</strong> — high-volume 
                  traders may qualify for reduced taker fees not reflected in our default-tier 
                  calculations.
                </li>
                <li>
                  <strong className="text-white">Partial fills</strong> — we assume orders fill 
                  in full. In thin markets, a partial fill may result in a different effective cost.
                </li>
                <li>
                  <strong className="text-white">Market impact during execution</strong> — 
                  submitting a large order can move the market before it settles, especially on 
                  CLOB venues.
                </li>
                <li>
                  <strong className="text-white">Holding / funding fees</strong> — ongoing 
                  position costs (funding rates, margin fees) are not included in the round-trip 
                  cost figure as they are duration-dependent and vary continuously.
                </li>
                <li>
                  <strong className="text-white">Counterparty and smart contract risk</strong> — 
                  we compare execution cost only; protocol security and counterparty risk are 
                  outside the scope of this tool.
                </li>
              </ul>
            </Section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-[#555]">
                  Questions? Reach out on Twitter or Discord.
                </p>
                <Link 
                  href="/"
                  className="text-sm text-[#D8F213] hover:underline"
                >
                  ← Back to comparison tool
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Section({ 
  id, 
  title, 
  badge,
  children 
}: { 
  id: string; 
  title: string; 
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-light text-white">{title}</h2>
        {badge && (
          <span className="text-[10px] bg-white/10 text-[#888] px-2 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div className="prose prose-invert prose-sm max-w-none space-y-4 text-[#999] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#D8F213]/5 border border-[#D8F213]/20 rounded-xl p-4 my-6">
      <div className="flex items-start gap-3">
        <Info className="w-4 h-4 text-[#D8F213] mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-white text-sm font-medium mb-1">{title}</h4>
          <p className="text-[#999] text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
}

function ExchangeCard({ 
  name, 
  exchanges, 
  description 
}: { 
  name: string; 
  exchanges: string[]; 
  description: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h4 className="text-white font-medium mb-2">{name}</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {exchanges.map((ex) => (
          <span key={ex} className="text-xs bg-white/5 text-[#888] px-2 py-1 rounded-full">
            {ex}
          </span>
        ))}
      </div>
      <p className="text-sm text-[#666]">{description}</p>
    </div>
  );
}
