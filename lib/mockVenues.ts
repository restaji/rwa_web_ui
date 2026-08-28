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

const COMMODITY_KEYS = new Set(["XAU", "XAG", "WTI", "BRENT"]);
const INDEX_KEYS = new Set(["SPY", "QQQ", "US500", "US100", "EWY"]);

export function categorizeAsset(key: string): AssetCategory {
  if (COMMODITY_KEYS.has(key)) return "Commodities";
  if (INDEX_KEYS.has(key)) return "Indices";
  if (/^(USD[A-Z]{3}|[A-Z]{3}USD)$/.test(key)) return "Forex";
  return "Equities";
}

// Assets matching the Python backend /api/assets list
export const ASSETS: Asset[] = [
  // Commodities
  { id: "XAU",   symbol: "XAU/USD",   name: "Gold",             category: "Commodities" },
  { id: "XAG",   symbol: "XAG/USD",   name: "Silver",           category: "Commodities" },
  { id: "WTI",   symbol: "WTI/USD",   name: "WTI Crude Oil",    category: "Commodities" },
  { id: "BRENT", symbol: "BRENT/USD", name: "Brent Crude Oil",  category: "Commodities" },
  // Forex
  { id: "EURUSD", symbol: "EUR/USD", name: "Euro",               category: "Forex" },
  { id: "GBPUSD", symbol: "GBP/USD", name: "British Pound",      category: "Forex" },
  { id: "USDJPY", symbol: "USD/JPY", name: "Japanese Yen",       category: "Forex" },
  { id: "USDCAD", symbol: "USD/CAD", name: "Canadian Dollar",    category: "Forex" },
  { id: "USDCHF", symbol: "USD/CHF", name: "Swiss Franc",        category: "Forex" },
  { id: "AUDUSD", symbol: "AUD/USD", name: "Australian Dollar",  category: "Forex" },
  { id: "NZDUSD", symbol: "NZD/USD", name: "New Zealand Dollar", category: "Forex" },
  // Equities + Indices
  { id: "AAPL", symbol: "AAPL/USD", name: "Apple",           category: "Equities" },
  { id: "MSFT", symbol: "MSFT/USD", name: "Microsoft",       category: "Equities" },
  { id: "GOOG", symbol: "GOOG/USD", name: "Google",          category: "Equities" },
  { id: "AMZN", symbol: "AMZN/USD", name: "Amazon",          category: "Equities" },
  { id: "META", symbol: "META/USD", name: "Meta",            category: "Equities" },
  { id: "NVDA", symbol: "NVDA/USD", name: "Nvidia",          category: "Equities" },
  { id: "TSLA", symbol: "TSLA/USD", name: "Tesla",           category: "Equities" },
  { id: "US500", symbol: "US500/USD", name: "S&P 500",         category: "Indices" },
  { id: "US100", symbol: "US100/USD", name: "Nasdaq 100",      category: "Indices" },
  { id: "COIN", symbol: "COIN/USD", name: "Coinbase",        category: "Equities" },
  { id: "HOOD", symbol: "HOOD/USD", name: "Robinhood",       category: "Equities" },
  { id: "SPCX", symbol: "SPCX/USD", name: "SpaceX",          category: "Equities" },
  { id: "AMD",  symbol: "AMD/USD",  name: "AMD",             category: "Equities" },
  { id: "INTC", symbol: "INTC/USD", name: "Intel",           category: "Equities" },
  { id: "MU",   symbol: "MU/USD",   name: "Micron",          category: "Equities" },
  { id: "SNDK", symbol: "SNDK/USD", name: "SanDisk",         category: "Equities" },
  { id: "CBRS", symbol: "CBRS/USD", name: "Cerebras",        category: "Equities" },
  { id: "EWY",  symbol: "EWY/USD",  name: "South Korea ETF", category: "Indices" },
  { id: "BABA", symbol: "BABA/USD", name: "Alibaba",         category: "Equities" },
  { id: "CRCL", symbol: "CRCL/USD", name: "Circle",          category: "Equities" },
  { id: "MRVL", symbol: "MRVL/USD", name: "Marvell",         category: "Equities" },
  { id: "MSTR", symbol: "MSTR/USD", name: "MicroStrategy",   category: "Equities" },
  { id: "BB",   symbol: "BB/USD",   name: "BlackBerry",      category: "Equities" },
  { id: "PLTR", symbol: "PLTR/USD", name: "Palantir",        category: "Equities" },
  { id: "AVGO", symbol: "AVGO/USD", name: "Broadcom",        category: "Equities" },
  { id: "NFLX", symbol: "NFLX/USD", name: "Netflix",         category: "Equities" },
  { id: "CRWV", symbol: "CRWV/USD", name: "CoreWeave",       category: "Equities" },
  { id: "SKHY", symbol: "SKHY/USD", name: "SK Hynix",        category: "Equities" },
];

export const ORDER_SIZES = [
  { label: "$10K", value: 10000 },
  { label: "$100K", value: 100000 },
  { label: "$1M", value: 1000000 },
  { label: "$10M", value: 10000000 },
];
