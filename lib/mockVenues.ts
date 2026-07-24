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
  symbol?: string;
  hasInsufficientLiquidity?: boolean;
  availableLiquidityUsd?: number;
  maxBuyUsd?: number;
  maxSellUsd?: number;
  // Holding / funding fee fields (% of notional per period)
  fundingFee1hPct?: number;
  fundingFee24hPct?: number;
  // Directional holding fees (Avantis, Ostium)
  fundingFee1hLongPct?: number;
  fundingFee1hShortPct?: number;
  fundingFee24hLongPct?: number;
  fundingFee24hShortPct?: number;
}

export type AssetCategory = "Commodities" | "Forex" | "Equities" | "Indices";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
}

// Assets matching the Python backend ASSETS dict
export const ASSETS: Asset[] = [
  // Commodities
  { id: "XAU",   symbol: "XAU/USD",   name: "Gold",           category: "Commodities" },
  { id: "XAG",   symbol: "XAG/USD",   name: "Silver",         category: "Commodities" },
  { id: "WTI",   symbol: "WTI/USD",   name: "WTI Crude Oil",  category: "Commodities" },
  { id: "BRENT", symbol: "BRENT/USD", name: "Brent Crude Oil", category: "Commodities" },
  // Forex
  { id: "EURUSD", symbol: "EUR/USD", name: "Euro",           category: "Forex" },
  { id: "GBPUSD", symbol: "GBP/USD", name: "British Pound",  category: "Forex" },
  { id: "USDJPY", symbol: "USD/JPY", name: "Japanese Yen",   category: "Forex" },
  // Equities (MAG7 + Indices + Other stocks)
  { id: "AAPL", symbol: "AAPL/USD", name: "Apple",       category: "Equities" },
  { id: "MSFT", symbol: "MSFT/USD", name: "Microsoft",   category: "Equities" },
  { id: "GOOG", symbol: "GOOG/USD", name: "Google",      category: "Equities" },
  { id: "AMZN", symbol: "AMZN/USD", name: "Amazon",      category: "Equities" },
  { id: "META", symbol: "META/USD", name: "Meta",        category: "Equities" },
  { id: "NVDA", symbol: "NVDA/USD", name: "Nvidia",      category: "Equities" },
  { id: "TSLA", symbol: "TSLA/USD", name: "Tesla",       category: "Equities" },
  { id: "SPY",  symbol: "SPY/USD",  name: "S&P 500",     category: "Indices" },
  { id: "QQQ",  symbol: "QQQ/USD",  name: "Nasdaq 100",  category: "Indices" },
  { id: "COIN", symbol: "COIN/USD", name: "Coinbase",    category: "Equities" },
  { id: "SPCX", symbol: "SPCX/USD", name: "SpaceX",      category: "Equities" },
];

export const ORDER_SIZES = [
  { label: "$10K", value: 10000 },
  { label: "$100K", value: 100000 },
  { label: "$1M", value: 1000000 },
  { label: "$10M", value: 10000000 },
];
