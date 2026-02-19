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
  hasInsufficientLiquidity?: boolean;
  availableLiquidityUsd?: number;
  maxBuyUsd?: number;
  maxSellUsd?: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
}

// Assets matching the Python backend (rwa_fee_comparisson.py ASSETS dict)
export const ASSETS: Asset[] = [
  // Commodities
  { id: "XAU", symbol: "XAU/USD", name: "Gold" },
  { id: "XAG", symbol: "XAG/USD", name: "Silver" },
  // Forex
  { id: "EURUSD", symbol: "EUR/USD", name: "Euro" },
  { id: "GBPUSD", symbol: "GBP/USD", name: "British Pound" },
  { id: "USDJPY", symbol: "USD/JPY", name: "Japanese Yen" },
  // MAG7 Stocks
  { id: "AAPL", symbol: "AAPL/USD", name: "Apple" },
  { id: "MSFT", symbol: "MSFT/USD", name: "Microsoft" },
  { id: "GOOG", symbol: "GOOG/USD", name: "Google" },
  { id: "AMZN", symbol: "AMZN/USD", name: "Amazon" },
  { id: "META", symbol: "META/USD", name: "Meta" },
  { id: "NVDA", symbol: "NVDA/USD", name: "Nvidia" },
  { id: "TSLA", symbol: "TSLA/USD", name: "Tesla" },
  // Indices
  { id: "SPY", symbol: "SPY/USD", name: "S&P 500" },
  { id: "QQQ", symbol: "QQQ/USD", name: "Nasdaq 100" },
  // Other
  { id: "COIN", symbol: "COIN/USD", name: "Coinbase" },
];

export const ORDER_SIZES = [
  { label: "$10K", value: 10000 },
  { label: "$100K", value: 100000 },
  { label: "$1M", value: 1000000 },
  { label: "$10M", value: 10000000 },
];
