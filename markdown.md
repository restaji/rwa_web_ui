# DEX Slippage & Fee Calculation — Backend Source of Truth

This document is derived directly from `rwa_fee_comparisson.py`. Every formula, constant, and API call listed here maps exactly to the backend implementation.

---

## Universal Cost Formula

All exchanges reduce to the same four fields. The UI sums them as:

```
total_cost_bps = opening_slippage_bps
               + closing_slippage_bps
               + open_fee_bps
               + close_fee_bps
```

USD cost: `(order_size_usd × total_cost_bps) / 10,000`

How `opening/closing_slippage_bps` is assigned from the raw result depends on direction:

| Direction | `opening_slippage_bps` | `closing_slippage_bps` |
|---|---|---|
| `long` | `buy_slippage_bps` | `sell_slippage_bps` |
| `short` | `sell_slippage_bps` | `buy_slippage_bps` |

---

## Shared Order Book Walk (`ExecutionCalculator`)

Hyperliquid, Lighter, Aster, and Extended all normalise their books to `StandardizedOrderbook` and delegate to the same `ExecutionCalculator`. Understanding it once covers all four.

### Walk Algorithm

```
sorted_asks  # ascending by price (best = lowest ask)
sorted_bids  # descending by price (best = highest bid)

for each level:
    value_available = price × qty
    if remaining_order ≤ value_available:
        qty_needed = remaining_order / price
        total_qty  += qty_needed
        total_cost += remaining_order
        remaining   = 0
        break
    else:
        total_qty  += qty
        total_cost += value_available
        remaining  -= value_available

avg_execution_price = total_cost / total_qty
slippage_bps = |avg_execution_price - mid_price| / mid_price × 10,000
```

- `mid_price = (best_bid + best_ask) / 2`
- Run once on asks → `buy_slippage_bps`
- Run once on bids → `sell_slippage_bps`
- `avg_slippage_bps = (buy + sell) / 2`

### Total cost for order-book exchanges

```python
# from calculate_totals_and_winner()
effective_spread = 2 × avg_slippage_bps   # buy + sell round trip
total_cost = effective_spread + open_fee_bps + close_fee_bps
```

In practice this equals `buy_slippage + sell_slippage + open_fee + close_fee`.

### Partial fill flag

`filled = True` only when **both** the buy walk and the sell walk consume the full `order_size_usd`. If either side runs out of book depth, `executed = "PARTIAL"`.

### Maker order override

When `order_type = "maker"` the backend **zeros all slippage** for the four order-book exchanges before returning:

```python
# Only applied to: hyperliquid, lighter, aster, extended
result[ex]['slippage_bps']     = 0.0
result[ex]['buy_slippage_bps'] = 0.0
result[ex]['sell_slippage_bps']= 0.0
```

Avantis and Ostium are oracle-based — their spread is kept as-is even in maker mode.

---

## 1. Hyperliquid

**Type:** Order-book perpetuals on Hyperliquid L1 (xyz / RWA sub-market)  
**Symbol format:** All RWA assets are prefixed `xyz:` — e.g. `xyz:GOLD`, `xyz:EUR`

### Slippage

Uses `ExecutionCalculator` on the Hyperliquid L2 book.

Book is fetched with cascading precision:

1. **Max precision** (`nSigFigs = None`) — most accurate prices, may be shallow
2. **4 sig figs** (`nSigFigs = 4`) — aggregated, more depth

If step 1 gives a full fill, step 2 is skipped. If step 1 gives a partial fill, step 2 is tried. The last successful result is returned.

### Fee Formula

All values are **fetched dynamically from the Hyperliquid public API** — nothing is hardcoded except two protocol-level multipliers.

**Step 1 — `deployer_fee_scale`** from the `perpDexs` API:

```python
POST https://api.hyperliquid.xyz/info
{"type": "perpDexs"}

# Find the dex where name == "xyz"
deployer_fee_scale = float(dex["deployerFeeScale"])  # e.g. 0.5
```

**Step 2 — base rates** from the `userFees` API (no auth needed, dummy address used):

```python
POST https://api.hyperliquid.xyz/info
{"type": "userFees", "user": "0x0000000000000000000000000000000000000001", "dex": "xyz"}

base_taker_rate = float(fees["userCrossRate"])   # e.g. 0.00045  (= 0.045%)
base_maker_rate = float(fees["userAddRate"])     # e.g. 0.00015
```

**Step 3 — growth mode** from `metaAndAssetCtxs` API:

```python
POST https://api.hyperliquid.xyz/info
{"type": "metaAndAssetCtxs", "dex": "xyz"}

growth_enabled = (asset["growthMode"] == "enabled")
```

**Step 4 — compute fees:**

```python
# Protocol constants (not available from API):
GROWTH_MODE_SCALE    = 0.1   # 90% reduction when growth mode is ON
NO_GROWTH_MODE_SCALE = 1.0   # No reduction when growth mode is OFF

if deployer_fee_scale < 1:
    scale_if_hip3 = deployer_fee_scale + 1
else:
    scale_if_hip3 = deployer_fee_scale * 2

growth_scale = GROWTH_MODE_SCALE if growth_enabled else NO_GROWTH_MODE_SCALE

taker_fee_bps = base_taker_rate × 100 × scale_if_hip3 × growth_scale × 100
maker_fee_bps = base_maker_rate × 100 × scale_if_hip3 × growth_scale × 100
```

**Example** (growth mode ON, `deployer_fee_scale = 0.5`, `base_taker = 0.00045`):

```
scale_if_hip3 = 0.5 + 1 = 1.5
growth_scale  = 0.1
taker_fee_bps = 0.00045 × 100 × 1.5 × 0.1 × 100 = 0.675 bps
```

### Fee Assignment in Total Cost

```python
# Both open and close use the same taker rate
open_fee_bps  = taker_fee_bps
close_fee_bps = taker_fee_bps
```

### Liquidity

Full order depth from the `l2Book` endpoint. `filled = False` when the available ask/bid depth is less than `order_size_usd`.

---

## 2. Lighter

**Type:** ZK order-book perpetuals (ZK-Lighter / Elliot mainnet)  
**Market IDs** (from `ASSETS`):

| Asset | `lighter_market_id` |
|---|---|
| XAU | 92 |
| XAG | 93 |
| EUR | 96 |
| GBP | 97 |
| JPY | 98 |
| AAPL | 113 |
| MSFT | 115 |
| GOOG | 116 |
| AMZN | 114 |
| META | 117 |
| NVDA | 110 |
| TSLA | 112 |
| SPY | 128 |
| QQQ | 129 |
| COIN | 109 |

### Slippage

Uses `ExecutionCalculator` on the Lighter order book:

```
GET https://mainnet.zklighter.elliot.ai/api/v1/orderBookOrders?market_id={id}&limit=250
```

Each level has `price` and `remaining_base_amount` (qty in base asset units).

### Fees

Fetched from the `orderBookDetails` endpoint — **no auth required**:

```python
GET https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails

taker_fee_bps = float(market["taker_fee"]) × 100
maker_fee_bps = float(market["maker_fee"]) × 100
# e.g. "taker_fee": "0.0000" → 0 bps; "0.0003" → 3 bps
```

### Max Leverage

```python
max_leverage = 10_000 / min_initial_margin_fraction
```

`min_initial_margin_fraction` comes from the same `orderBookDetails` response.

### Fee Assignment

```python
open_fee_bps  = taker_fee_bps
close_fee_bps = taker_fee_bps
```

---

## 3. Aster

**Type:** Centralised-style perpetuals DEX (Binance FAPI-compatible API)  
**Base URL:** `https://fapi.asterdex.com/fapi/v1`

### Slippage

Uses `ExecutionCalculator` on the Aster order book:

```
GET https://fapi.asterdex.com/fapi/v1/depth?symbol={symbol}&limit=1000
```

Levels are `[price, qty]` arrays, already in USD-denominated form.

### Fees

**Requires a signed API request** (`ASTER_API_KEY` + `ASTER_SECRET_KEY` from `.env`):

```python
GET /fapi/v1/commissionRate?symbol={symbol}&timestamp=...&signature=...

taker_bps = float(response["takerCommissionRate"]) × 10_000
maker_bps = float(response["makerCommissionRate"]) × 10_000
# e.g. takerCommissionRate = 0.0002 → 2 bps
```

If credentials are not configured, fees return `None` and the exchange is excluded from the result.

### Max Leverage

```
GET https://www.asterdex.com/bapi/futures/v1/public/future/common/symbol/leverageoi/remaining?symbol={symbol}

max_leverage = max(int(k) for k in leverageOiRemainingMap.keys())
```

### Fee Assignment

```python
open_fee_bps  = taker_fee_bps
close_fee_bps = 0.0   # only one-way fee in ExecutionCalculator call
# but calculate_totals_and_winner reassigns close_fee = taker_fee_bps
# so the effective round-trip fee = taker + taker
```

---

## 4. Avantis

**Type:** Oracle-based perpetuals on Base  
**Unique property:** Spread is **one-way only** — it applies on open, not on close

### Slippage / Spread

Avantis does not use an order book. Spread is either **dynamic** (fetched from risk API) or **constant** (from socket API).

**Socket data (cached 30 s):**

```
GET https://socket-api-pub.avantisfi.com/socket-api/v1/data
→ data.pairInfos[pairIndex]   # pair metadata
→ data.groupInfo[groupIndex]  # group-level settings
```

**Dynamic spread** (`groupInfo.isSpreadDynamic == true`):

```python
GET https://risk-api.avantisfi.com/spread/dynamic
  ?pairIndex={idx}
  &positionSizeUsdc={int(order_size_usd × 10^18)}
  &isLong={true|false}
  &isPnl=false
  &trader=0x1234567890123456789012345678901234567890

spread_raw = float(response["spreadP"])
spread_bps = (spread_raw / 10^10) × 100
```

**Constant spread** (fallback when not dynamic):

```python
spread_pct = pair_info["spreadP"]
spread_bps = spread_pct × 100
```

### Opening Fee (Skew-Adjusted)

This is the most complex fee calculation in the backend:

```python
long_oi  = pairInfo["openInterest"]["long"]
short_oi = pairInfo["openInterest"]["short"]

# Opposing OI percentage after the trade lands
if is_long:
    new_long_oi = long_oi + position_size
    open_interest_pct = floor(100 × short_oi / (new_long_oi + short_oi))
else:
    new_short_oi = short_oi + position_size
    open_interest_pct = floor(100 × long_oi / (new_short_oi + long_oi))

# Lookup in skewEqParams table (from socket API)
# skewEqParams = [[param1, param2], ...]  — 10 buckets, one per 10 pct points
pct_index = min(floor(open_interest_pct / 10), len(skewEqParams) - 1)
param1, param2 = skewEqParams[pct_index]

fee_bps = (param1 × open_interest_pct + param2) / 10_000 × 100
```

A more balanced OI → lower `open_interest_pct` → lower bucket index → lower fee. A heavily skewed pool charges a premium for the dominant side.

### Closing Fee

```python
close_fee_bps = pair_info["closeFeeP"] × 100
```

### Liquidity Check

```python
max_wallet_oi = pair_info["maxWalletOI"]
filled     = order_size_usd ≤ max_wallet_oi
filled_usd = min(order_size_usd, max_wallet_oi)
```

If unfilled: `executed = "PARTIAL"`.

### Max Leverage

Depends on `isPnlTypeAllowed` from `storagePairParams`:

```python
if isPnlTypeAllowed == 1:
    max_leverage = leverages["pnlMaxLeverage"]
else:
    max_leverage = leverages["maxLeverage"]
```

### Total Cost (Avantis special case)

```python
# Spread only occurs once (opening), NOT doubled
effective_spread = spread_bps   # not 2×
total_cost = spread_bps + open_fee_bps + close_fee_bps
```

---

## 5. Ostium

**Type:** Oracle-based perpetuals, specialised for RWAs  
**Pricing:** Bid/ask oracle price from Ostium's own price feed

### Price Feed

```
GET https://metadata-backend.ostium.io/PricePublish/latest-price?asset={symbol}

→ { "mid": float, "bid": float, "ask": float, "isMarketOpen": bool }
```

Retried up to 5 times with 1 s delay between attempts.

### Fees

Loaded on startup from the Ostium pairs API:

```
GET https://app.ostium.com/api/pairs

taker_fee_bps = float(pair["takerFeeP"]) / 10_000.0
maker_fee_bps = float(pair["makerFeeP"]) / 10_000.0
max_leverage  = float(pair["maxLeverage"]) / 100.0
```

**Season override** — if a current season is active, fees are replaced:

```
GET https://onlypoints.ostium.io/api/seasons/current

new_fee_bps = float(asset["newFee"]) × 100.0
# Overrides both taker_fee_bps AND maker_fee_bps for the affected asset
```

### Spread Calculation

#### Assets with `priceImpactK` (dynamic spread)

Uses a Pade approximation to decay accumulated buy/sell volume over time, then calculates spread:

**Volume decay:**

```python
decay_factor_half = decay_rate × dt / 2
numerator   = PRECISION_18 - decay_factor_half   # (or 0 if underflow)
denominator = PRECISION_18 + decay_factor_half
decay_multiplier = numerator × PRECISION_18 / denominator

decayed_volume = raw_volume × decay_multiplier / PRECISION_18
# Convert to USD: decayed_volume / (100 × PRECISION_10)
```

**Spread formula (per side):**

```python
market_spread_bps = (ask - bid) / mid × 10_000
market_spread_half = market_spread_bps / 2

# For BUY (long open): uses decayed buy volume
avg_volume_buy  = decayed_buy_usd + order_size_usd / 2
dynamic_buy_bps = avg_volume_buy × priceImpactK / PRECISION_27 × 10_000
buy_spread_bps  = market_spread_half + dynamic_buy_bps

# For SELL (short open): uses decayed sell volume
avg_volume_sell  = decayed_sell_usd + order_size_usd / 2
dynamic_sell_bps = avg_volume_sell × priceImpactK / PRECISION_27 × 10_000
sell_spread_bps  = market_spread_half + dynamic_sell_bps

# Reported as average
avg_spread_bps = (buy_spread_bps + sell_spread_bps) / 2
```

#### Assets without `priceImpactK` (static spread)

```python
buy_spread_bps  = (ask - bid) / mid × 10_000 / 2
sell_spread_bps = (ask - bid) / mid × 10_000 / 2
```

### Fee Assignment

```python
open_fee_bps  = taker_fee_bps   # (may be season-overridden)
close_fee_bps = 0.0             # Ostium charges no close fee
```

### Total Cost

```python
# Slippage is doubled (spread applies on open and close)
effective_spread = 2 × avg_spread_bps
total_cost = effective_spread + open_fee_bps + 0
```

---

## 6. Extended

**Type:** Order-book perpetuals on Starknet  
**Base URL:** `https://api.starknet.extended.exchange/api/v1`  
**Auth:** Requires `EXTENDED_API_KEY` in `.env` (sent as `X-API-Key` header)

### Slippage

Uses `ExecutionCalculator` on the Extended order book:

```
GET /api/v1/info/markets/{market}/orderbook

→ { "bid": [{"price": str, "qty": str}, ...],
     "ask": [{"price": str, "qty": str}, ...] }
```

### Fees

```
GET /api/v1/user/fees?market={market}

# Response may be a list or dict — backend handles both shapes
taker_bps = float(takerFeeRate) × 10_000
maker_bps = float(makerFeeRate) × 10_000
```

If the fee call returns `null`/error, the exchange is **excluded entirely** from the result.

### Max Leverage

```
GET /api/v1/info/markets?market={market}

max_leverage = float(tradingConfig["maxLeverage"])
```

### Fee Assignment

```python
open_fee_bps  = taker_fee_bps
close_fee_bps = taker_fee_bps
```

---

## Side-by-Side Summary

| | Hyperliquid | Lighter | Aster | Avantis | Ostium | Extended |
|---|---|---|---|---|---|---|
| **Pricing** | CLOB | CLOB | CLOB | Oracle ± spread | Oracle ± spread | CLOB |
| **Slippage method** | Book walk | Book walk | Book walk | Risk API / static | Dynamic formula | Book walk |
| **Spread one-way?** | No (2×) | No (2×) | No (2×) | **Yes (1×)** | No (2×) | No (2×) |
| **Fee source** | `perpDexs` + `userFees` API | `orderBookDetails` API | `/commissionRate` (**auth**) | Socket API (skew formula) | Pairs API + seasons override | `/user/fees` (**auth**) |
| **Close fee** | = open fee | = open fee | = open fee | Separate `closeFeeP` | 0 | = open fee |
| **Growth mode discount** | **Yes (10× reduction)** | No | No | No | No | No |
| **Liquidity flag** | Book depth | Book depth | Book depth | `maxWalletOI` cap | Always filled | Book depth |
| **Maker slippage** | Zeroed | Zeroed | Zeroed | **Unchanged** | **Unchanged** | Zeroed |

---

## Hyperliquid Fee Deep Dive

This is the most nuanced fee calculation because it involves multiple multiplier layers.

```
Inputs from API:
  base_taker_rate  (e.g. 0.00045 = 0.045%)
  deployer_fee_scale (e.g. 0.5, from perpDexs for "xyz" dex)
  growth_enabled   (bool, per asset from metaAndAssetCtxs)

Protocol constants (hardcoded):
  GROWTH_MODE_SCALE    = 0.1
  NO_GROWTH_MODE_SCALE = 1.0

Derived:
  scale_if_hip3 = deployer_fee_scale + 1   if deployer_fee_scale < 1
               OR deployer_fee_scale × 2   if deployer_fee_scale ≥ 1

  growth_scale = 0.1 (growth ON) or 1.0 (growth OFF)

Final:
  taker_fee_bps = base_taker × 100 × scale_if_hip3 × growth_scale × 100
```

The `× 100 × ... × 100` double multiplication converts the decimal rate to a percentage and then to bps:

```
base_taker = 0.00045        (decimal fraction)
× 100     = 0.045           (percentage)
× scale_if_hip3 (e.g. 1.5) = 0.0675
× growth_scale (0.1)        = 0.00675
× 100     = 0.675 bps
```

If growth mode is **off** (`growth_scale = 1.0`), the same example gives `6.75 bps` — 10× higher. This is why checking growth mode status matters significantly for fee accuracy.

---

## Avantis Fee Deep Dive

The opening fee responds to pool skew — going with the majority is more expensive.

```
Example: long_oi = $8M, short_oi = $2M
Trader wants to go LONG with $100K

new_long_oi = $8M + $100K = $8.1M
total_oi    = $8.1M + $2M = $10.1M
open_interest_pct = floor(100 × 2M / 10.1M) = floor(19.8) = 19

pct_index = floor(19 / 10) = 1   (second bucket)
param1, param2 = skewEqParams[1]  (e.g. [0, 350])

fee_bps = (0 × 19 + 350) / 10_000 × 100 = 3.5 bps
```

Now the same trade going SHORT (adding to the minority):

```
new_short_oi = $2M + $100K = $2.1M
open_interest_pct = floor(100 × 8M / (2.1M + 8M)) = floor(79.2) = 79

pct_index = floor(79 / 10) = 7   (eighth bucket)
param1, param2 = skewEqParams[7]  (e.g. [0, 450])

fee_bps = (0 × 79 + 450) / 10_000 × 100 = 4.5 bps
```

Going short when the pool is already heavily long costs more than going long here.

---

## Ostium Dynamic Spread Deep Dive

The Pade approximation decays historical volume so old trades have less impact:

```
dt = current_unix_time - last_update_timestamp

decay_factor_half = decay_rate × dt / 2

  numerator = max(0, PRECISION_18 - decay_factor_half)
denominator = PRECISION_18 + decay_factor_half

decay_multiplier = numerator × PRECISION_18 / denominator

decayed_volume = raw_volume × decay_multiplier / PRECISION_18
# Convert: decayed_volume_usd = decayed_volume / (100 × 10^10)
```

Then spread for a BUY order:

```
market_spread_half = (ask - bid) / mid × 10_000 / 2

avg_volume = decayed_buy_usd + (order_size_usd / 2)
dynamic_bps = avg_volume × priceImpactK / 10^27 × 10_000

buy_spread_bps = market_spread_half + dynamic_bps
```

Larger `order_size_usd` → larger `avg_volume` → larger `dynamic_bps`. High recent buy volume (even after decay) also raises the spread for buyers.

---

## API Response → UI Field Mapping

```
Backend field           → UI Venue field
─────────────────────────────────────────────────────
opening_slippage_bps    → venue.openingSlippageBps
closing_slippage_bps    → venue.closingSlippageBps
open_fee_bps
+ close_fee_bps         → venue.feeBps  (summed in toVenue())
max_leverage            → venue.maxLeverage
symbol                  → venue.symbol
timestamp               → venue.updatedAt
filled (false)          → venue.hasInsufficientLiquidity = true
filled_usd              → venue.availableLiquidityUsd
buy.filled_usd          → venue.maxBuyUsd
sell.filled_usd         → venue.maxSellUsd
```

`executed = "PARTIAL"` also sets `hasInsufficientLiquidity = true` in the frontend `toVenue()` transform.

---

## Supported Assets & Exchange Coverage

| Asset | HL symbol | Lighter ID | Aster symbol | Avantis pair | Ostium symbol | Extended symbol |
|---|---|---|---|---|---|---|
| XAU | GOLD | 92 | XAUUSDT | 21 | XAUUSD | XAU-USD |
| XAG | SILVER | 93 | XAGUSDT | 20 | XAGUSD | XAG-USD |
| EURUSD | EUR | 96 | ✗ | 11 | EURUSD | EUR-USD |
| GBPUSD | GBP | 97 | ✗ | 13 | GBPUSD | ✗ |
| USDJPY | JPY | 98 | ✗ | 12 | USDJPY | USDJPY-USD |
| AAPL | AAPL | 113 | AAPLUSDT | 82 | AAPLUSD | ✗ |
| MSFT | MSFT | 115 | MSFTUSDT | 84 | MSFTUSD | ✗ |
| GOOG | GOOGL | 116 | GOOGUSDT | 87 | GOOGUSD | ✗ |
| AMZN | AMZN | 114 | AMZNUSDT | 83 | AMZNUSD | ✗ |
| META | META | 117 | METAUSDT | 85 | METAUSD | ✗ |
| NVDA | NVDA | 110 | NVDAUSDT | 81 | NVDAUSD | ✗ |
| TSLA | TSLA | 112 | TSLAUSDT | 86 | TSLAUSD | ✗ |
| SPY | ✗ | 128 | ✗ | 78 | SPYUSD | ✗ |
| QQQ | ✗ | 129 | QQQUSDT | 79 | QQQUSD | ✗ |
| COIN | COIN | 109 | COINUSDT | 80 | COINUSD | ✗ |

A `✗` means the exchange does not list that asset and it will be absent from the comparison result.
