export interface Venue {
  id: string;
  name: string;
  logo: string;
  maxLeverage: number;
  openingSpreadBps: number;
  openingSlippageBps: number;
  closingSlippageBps: number;
  feeBps: number;
  updatedAt: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
}

export const ASSETS: Asset[] = [
  { id: "xag-usd", symbol: "XAG/USD", name: "Silver" },
  { id: "btc-usd", symbol: "BTC/USD", name: "Bitcoin" },
  { id: "eth-usd", symbol: "ETH/USD", name: "Ethereum" },
  { id: "xau-usd", symbol: "XAU/USD", name: "Gold" },
  { id: "sol-usd", symbol: "SOL/USD", name: "Solana" },
  { id: "eur-usd", symbol: "EUR/USD", name: "Euro" },
  { id: "gbp-usd", symbol: "GBP/USD", name: "British Pound" },
];

export const ORDER_SIZES = [
  { label: "$10K", value: 10000 },
  { label: "$100K", value: 100000 },
  { label: "$1M", value: 1000000 },
  { label: "$10M", value: 10000000 },
];

export const MOCK_VENUES: Venue[] = [
  {
    id: "avantis",
    name: "Avantis",
    logo: "/logos/avantis.png",
    maxLeverage: 250,
    openingSpreadBps: 0.8,
    openingSlippageBps: 0.5,
    closingSlippageBps: 0.4,
    feeBps: 1.0,
    updatedAt: "2026-02-17T10:30:00Z",
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    logo: "/logos/hyperliquid.png",
    maxLeverage: 50,
    openingSpreadBps: 1.2,
    openingSlippageBps: 0.8,
    closingSlippageBps: 0.7,
    feeBps: 0.5,
    updatedAt: "2026-02-17T10:28:00Z",
  },
  {
    id: "ostium",
    name: "Ostium",
    logo: "/logos/ostium.webp",
    maxLeverage: 100,
    openingSpreadBps: 1.0,
    openingSlippageBps: 0.6,
    closingSlippageBps: 0.5,
    feeBps: 0.8,
    updatedAt: "2026-02-17T10:25:00Z",
  },
  {
    id: "lighter",
    name: "Lighter",
    logo: "/logos/lighter.png",
    maxLeverage: 20,
    openingSpreadBps: 0.5,
    openingSlippageBps: 1.2,
    closingSlippageBps: 1.0,
    feeBps: 0.5,
    updatedAt: "2026-02-17T10:15:00Z",
  },
  {
    id: "aster",
    name: "Aster",
    logo: "/logos/aster.jpg",
    maxLeverage: 100,
    openingSpreadBps: 1.5,
    openingSlippageBps: 1.0,
    closingSlippageBps: 0.9,
    feeBps: 0.6,
    updatedAt: "2026-02-17T10:20:00Z",
  },
  {
    id: "extended",
    name: "Extended",
    logo: "/logos/extended.png",
    maxLeverage: 50,
    openingSpreadBps: 1.1,
    openingSlippageBps: 0.7,
    closingSlippageBps: 0.6,
    feeBps: 0.8,
    updatedAt: "2026-02-17T10:10:00Z",
  },
];

// Function to simulate fetching data with variable costs based on asset and direction
export function getVenueDataForAsset(
  asset: string,
  direction: "long" | "short",
  orderSize: number
): Venue[] {
  // Simulate different costs based on parameters
  const assetMultiplier = asset === "btc-usd" ? 0.8 : asset === "eth-usd" ? 0.9 : 1.0;
  const directionMultiplier = direction === "short" ? 1.05 : 1.0;
  const sizeMultiplier = orderSize >= 1000000 ? 1.2 : orderSize >= 100000 ? 1.1 : 1.0;
  
  return MOCK_VENUES.map((venue) => ({
    ...venue,
    openingSpreadBps: +(venue.openingSpreadBps * assetMultiplier * directionMultiplier).toFixed(2),
    openingSlippageBps: +(venue.openingSlippageBps * sizeMultiplier).toFixed(2),
    closingSlippageBps: +(venue.closingSlippageBps * sizeMultiplier).toFixed(2),
    feeBps: +venue.feeBps.toFixed(2),
  }));
}
