/**
 * API client for RWA Fee Comparison Python backend.
 *
 * Calls the Flask API and transforms the response into the
 * Venue[] shape expected by the UI components.
 */

import { Asset, ASSETS, Venue, categorizeAsset } from "./mockVenues";

const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL || "https://api.realworldperps.xyz"
).replace(/\/+$/, "");


const EXCHANGE_META: Record<string, { name: string; logo: string }> = {
    hyperliquid: { name: "Hyperliquid", logo: "/logos/hyperliquid.png" },
    lighter: { name: "Lighter", logo: "/logos/lighter.png" },
    aster: { name: "Aster", logo: "/logos/aster.jpg" },
    avantis: { name: "Avantis", logo: "/logos/avantis.png" },
    avantis_x: { name: "Avantis X", logo: "/logos/avantis.png" },
    ostium: { name: "Ostium", logo: "/logos/ostium.webp" },
    extended: { name: "Extended", logo: "/logos/extended.png" },
    edgex: { name: "EdgeX", logo: "/logos/edgex.png" },
    grvt: { name: "GRVT", logo: "/logos/grvt.png" },
    variational: { name: "Variational", logo: "/logos/variational.png" },
    ondo: { name: "Ondo Perps", logo: "/logos/ondo.png" },
    pacifica: { name: "Pacifica", logo: "/logos/pacifica.png" },
};

const EXCHANGE_KEYS = Object.keys(EXCHANGE_META);
const AVANTIS_KEYS = new Set(["avantis", "avantis_x"]);
const ASSET_BY_ID = new Map(ASSETS.map((asset) => [asset.id, asset]));

interface BackendAsset {
    key: string;
    name?: string;
    symbol?: string;
    exchanges?: Record<string, boolean | null>;
}

interface AssetsAPIResponse {
    assets?: BackendAsset[];
}

interface ExchangeResultSide {
    filled?: boolean;
    filled_usd?: number;
    unfilled_usd?: number;
}

interface ExchangeResult {
    opening_slippage_bps?: number;
    closing_slippage_bps?: number;
    open_fee_bps?: number;
    close_fee_bps?: number;
    total_cost_bps?: number;
    max_leverage?: number | null;
    filled?: boolean;
    filled_usd?: number;
    executed?: boolean | string;
    timestamp?: number;
    symbol?: string;
    buy?: ExchangeResultSide;
    sell?: ExchangeResultSide;
    // Symmetric holding fees (Hyperliquid, Lighter, Aster, Extended)
    holding_fee_1h_pct?: number;
    holding_fee_24h_pct?: number;
    // Directional holding fees (Avantis, Ostium)
    holding_fee_1h_long_pct?: number;
    holding_fee_1h_short_pct?: number;
    holding_fee_24h_long_pct?: number;
    holding_fee_24h_short_pct?: number;
}

interface CompareAPIResponse {
    asset: string;
    symbol_key: string;
    order_size_usd: number;
    order_type: string;
    direction: string;
    winner?: string;
    winner_cost_bps?: number;
    hyperliquid?: ExchangeResult | null;
    lighter?: ExchangeResult | null;
    aster?: ExchangeResult | null;
    avantis?: ExchangeResult | null;
    avantis_x?: ExchangeResult | null;
    ostium?: ExchangeResult | null;
    extended?: ExchangeResult | null;
    edgex?: ExchangeResult | null;
    grvt?: ExchangeResult | null;
    variational?: ExchangeResult | null;
    ondo?: ExchangeResult | null;
    pacifica?: ExchangeResult | null;
}

/* ------------------------------------------------------------------ */
/*  Transform one exchange result into a Venue                        */
/* ------------------------------------------------------------------ */
function toVenue(
    exchangeKey: string,
    data: ExchangeResult,
    hasInsufficientLiquidity: boolean = false
): Venue {
    const meta = EXCHANGE_META[exchangeKey] ?? {
        name: exchangeKey,
        logo: `/logos/${exchangeKey}.png`,
    };

    const openFee = data.open_fee_bps ?? 0;
    const closeFee = data.close_fee_bps ?? 0;

    return {
        id: exchangeKey,
        name: meta.name,
        logo: meta.logo,
        maxLeverage: data.max_leverage ?? 0,
        openingSpreadBps: 0, // Python API combines spread into slippage
        openingSlippageBps: data.opening_slippage_bps ?? 0,
        closingSlippageBps: data.closing_slippage_bps ?? 0,
        feeBps: openFee + closeFee,
        updatedAt: data.timestamp
            ? new Date(data.timestamp * 1000).toISOString()
            : new Date().toISOString(),
        symbol: data.symbol,
        hasInsufficientLiquidity,
        availableLiquidityUsd: data.filled_usd,
        maxBuyUsd: data.buy?.filled_usd,
        maxSellUsd: data.sell?.filled_usd,
        fundingFee1hPct: data.holding_fee_1h_pct,
        fundingFee24hPct: data.holding_fee_24h_pct,
        fundingFee1hLongPct: data.holding_fee_1h_long_pct,
        fundingFee1hShortPct: data.holding_fee_1h_short_pct,
        fundingFee24hLongPct: data.holding_fee_24h_long_pct,
        fundingFee24hShortPct: data.holding_fee_24h_short_pct,
    };
}

function toAsset(raw: BackendAsset): Asset {
    const known = ASSET_BY_ID.get(raw.key);
    if (known) return known;

    const pair = raw.name || (raw.symbol ? `${raw.symbol}/USD` : raw.key);
    return {
        id: raw.key,
        symbol: pair,
        name: raw.symbol || raw.key,
        category: categorizeAsset(raw.key),
    };
}

function isComparableAsset(exchanges: BackendAsset["exchanges"]): boolean {
    const listed = Object.entries(exchanges ?? {})
        .filter(([key, listed]) => listed && EXCHANGE_KEYS.includes(key))
        .map(([key]) => key);
    const otherVenues = listed.filter((key) => !AVANTIS_KEYS.has(key));
    // Need at least one non-Avantis venue so there is something to compare
    return otherVenues.length >= 1;
}

/* ------------------------------------------------------------------ */
/*  Public: fetch comparable assets from Python API                   */
/* ------------------------------------------------------------------ */
export async function fetchAssets(signal?: AbortSignal): Promise<Asset[]> {
    const res = await fetch(`${API_BASE}/api/assets`, { cache: "no-store", signal });

    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    }

    const json: AssetsAPIResponse = await res.json();

    return (json.assets ?? [])
        .filter((asset) => isComparableAsset(asset.exchanges))
        .map(toAsset);
}

/* ------------------------------------------------------------------ */
/*  Public: fetch comparison from Python API                          */
/* ------------------------------------------------------------------ */
export async function fetchComparison(
    assetKey: string,
    orderSize: number,
    direction: "long" | "short",
    orderType: string = "taker",
    signal?: AbortSignal
): Promise<Venue[]> {
    const url = new URL(`${API_BASE}/api/compare/${encodeURIComponent(assetKey)}`);
    url.searchParams.set("size", String(orderSize));
    url.searchParams.set("order_type", orderType);
    url.searchParams.set("direction", direction);

    const res = await fetch(url.toString(), { cache: "no-store", signal });

    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    }

    const json: CompareAPIResponse = await res.json();

    // Convert each exchange that returned data into a Venue
    const venues: Venue[] = [];

    for (const key of EXCHANGE_KEYS) {
        const exData = json[key as keyof CompareAPIResponse] as
            | ExchangeResult
            | null
            | undefined;

        if (exData && typeof exData === "object") {
            const hasInsufficientLiquidity =
                exData.filled === false ||
                exData.executed === false ||
                exData.executed === "false" ||
                exData.executed === "PARTIAL";

            venues.push(toVenue(key, exData, hasInsufficientLiquidity));
        }
    }

    return venues;
}
