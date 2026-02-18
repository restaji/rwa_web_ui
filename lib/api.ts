/**
 * API client for RWA Fee Comparison Python backend.
 *
 * Calls the Flask API and transforms the response into the
 * Venue[] shape expected by the UI components.
 */

import { Venue } from "./mockVenues";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://perpdexcomparisson.up.railway.app";

const EXCHANGE_META: Record<string, { name: string; logo: string }> = {
    hyperliquid: { name: "Hyperliquid", logo: "/logos/hyperliquid.png" },
    lighter: { name: "Lighter", logo: "/logos/lighter.png" },
    aster: { name: "Aster", logo: "/logos/aster.jpg" },
    avantis: { name: "Avantis", logo: "/logos/avantis.png" },
    ostium: { name: "Ostium", logo: "/logos/ostium.webp" },
    extended: { name: "Extended", logo: "/logos/extended.png" },
};

const EXCHANGE_KEYS = Object.keys(EXCHANGE_META);

/* ------------------------------------------------------------------ */
/*  Raw API response shape (subset of the fields we care about)       */
/* ------------------------------------------------------------------ */
interface ExchangeResult {
    opening_slippage_bps?: number;
    closing_slippage_bps?: number;
    open_fee_bps?: number;
    close_fee_bps?: number;
    total_cost_bps?: number;
    max_leverage?: number | null;
    filled?: boolean;
    executed?: boolean | string;
    timestamp?: number;
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
    ostium?: ExchangeResult | null;
    extended?: ExchangeResult | null;
}

/* ------------------------------------------------------------------ */
/*  Transform one exchange result into a Venue                        */
/* ------------------------------------------------------------------ */
function toVenue(
    exchangeKey: string,
    data: ExchangeResult
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
    };
}

/* ------------------------------------------------------------------ */
/*  Public: fetch comparison from Python API                          */
/* ------------------------------------------------------------------ */
export async function fetchComparison(
    assetKey: string,
    orderSize: number,
    direction: "long" | "short",
    orderType: string = "taker"
): Promise<Venue[]> {
    const url = new URL(`${API_BASE}/api/compare/${encodeURIComponent(assetKey)}`);
    url.searchParams.set("size", String(orderSize));
    url.searchParams.set("order_type", orderType);
    url.searchParams.set("direction", direction);

    const res = await fetch(url.toString(), { cache: "no-store" });

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
            venues.push(toVenue(key, exData));
        }
    }

    return venues;
}
