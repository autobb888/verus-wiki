# Basket Currencies and DeFi on Verus

> Protocol-level automated market making, MEV resistance, and decentralized finance without smart contracts

---

## What Is a Basket Currency?

A basket currency is a token **backed by reserves** of one or more other currencies. Think of it like a mutual fund or ETF: the basket token represents a weighted share of the currencies in its reserves.

The critical feature: Verus has a **built-in automated market maker (AMM)** at the protocol level. Anyone can convert between a basket currency and its reserves at any time, with pricing determined by the reserve ratios — not by order books, not by smart contracts, but by the blockchain's consensus rules themselves.

```
┌─────────────────────────────────────────┐
│         MYBASKET (basket currency)       │
│         Total Supply: 1,000,000          │
├─────────────────────────────────────────┤
│  Reserves:                               │
│  ├─ VRSC:  100,000 (weight: 50%)        │
│  └─ USDC:  500,000 (weight: 50%)        │
│                                          │
│  1 MYBASKET ≈ 0.1 VRSC + 0.5 USDC      │
│  (price adjusts with supply/demand)      │
└─────────────────────────────────────────┘
```

When someone buys MYBASKET with VRSC, VRSC flows into reserves and MYBASKET tokens are minted. When someone sells MYBASKET for VRSC, tokens are burned and VRSC flows out of reserves. The price adjusts automatically based on the reserve ratios.

---

## How It Differs from Ethereum DEXes

If you've used Uniswap, SushiSwap, or Curve, basket currencies will feel familiar — but the implementation is fundamentally different:

| Feature | Ethereum DEX (Uniswap) | Verus Basket |
|---|---|---|
| Implementation | Smart contract (Solidity code) | Protocol-level (consensus rules) |
| Bug risk | Contract can have bugs, exploits | Logic is part of the blockchain itself |
| MEV/front-running | Rampant — bots extract value | Resistant — simultaneous execution |
| Upgradability | Contract owner can change rules | Rules are fixed at launch |
| Gas costs | High and variable | Standard transaction fees |
| Liquidity provision | LP tokens, impermanent loss | Reserve-based, different dynamics |
| Audit required | Yes (and still gets hacked) | No — same code secures every basket |

### The Smart Contract Risk Problem

On Ethereum, every DEX is a smart contract — a program running on the blockchain. These programs can have bugs. History is littered with DeFi exploits:

- Reentrancy attacks
- Flash loan manipulation
- Oracle manipulation
- Governance attacks

Verus baskets eliminate this entire category of risk. The AMM logic is part of the Verus node software itself, validated by every node in the network. It's as fundamental as the rule that says "you can't spend coins you don't have." There's no separate contract to exploit.

---

## MEV Resistance: Fair Pricing

MEV (Maximal Extractable Value) is one of the biggest problems in DeFi. On Ethereum:

1. You submit a trade
2. A bot sees your pending trade in the mempool
3. The bot front-runs you — buying before you, driving the price up
4. Your trade executes at a worse price
5. The bot sells immediately after, pocketing the difference

**You lose money. The bot profits. This happens on every single Ethereum block.**

Verus solves this with **simultaneous execution**: all conversions within a single block execute at the **same price**. There is no ordering advantage.

```
Ethereum (sequential execution):
  Tx 1: Bot buys    → price goes up
  Tx 2: You buy     → you pay more
  Tx 3: Bot sells   → bot profits from your loss

Verus (simultaneous execution):
  Tx 1: Bot buys  ┐
  Tx 2: You buy   ├→ ALL execute at the SAME price
  Tx 3: Bot sells ┘
  
  No ordering advantage = no front-running = no MEV
```

This doesn't just reduce MEV — it eliminates the economic incentive for it entirely. There's no profit in front-running when everyone gets the same price.

---

## Making Conversions

Conversions happen through the [sendcurrency](../command-reference/multichain.md#sendcurrency) command. You specify a source currency, a destination currency, and the amount:

```bash
# Convert 100 VRSC to MYBASKET
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 100,
  "convertto": "MYBASKET",
  "currency": "VRSCTEST"
}]'

# Convert 50 MYBASKET back to VRSC
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 50,
  "convertto": "VRSCTEST",
  "currency": "MYBASKET"
}]'
```

The blockchain calculates the conversion rate based on current reserve ratios. You don't set a price — the protocol determines it.

### Cross-Conversion (Reserve to Reserve)

You can also convert between two reserve currencies *through* the basket, without needing to hold the basket currency:

```bash
# Convert VRSC to USDC through MYBASKET
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 100,
  "convertto": "USDC",
  "via": "MYBASKET",
  "currency": "VRSCTEST"
}]'
```

This is like exchanging dollars for euros through a currency exchange — the basket is the exchange.

---

## Preconversion and Launch

Before a basket currency goes live, there's a **preconversion period** where early participants contribute reserve currencies in exchange for basket tokens at the initial price.

### The Launch Process

```
1. DEFINE
   Creator calls definecurrency with:
   - Reserve currencies and weights
   - Initial supply
   - Initial contributions (from creator)
   - Min/max preconversion limits
   - Prelaunch discount (optional)

2. PRECONVERT (before startblock)
   Anyone can contribute reserve currencies
   Tokens are allocated proportionally
   
3. LAUNCH CHECK (at startblock)
   If minpreconversion met → currency activates
   If not met → all contributions refunded

4. ACTIVE
   AMM is live, conversions begin
   Price floats based on supply/demand
```

### Preconversion Parameters

| Parameter | Purpose |
|---|---|
| `initialcontributions` | Creator's initial reserves (sets starting ratio) |
| `initialsupply` | Total basket tokens after launch |
| `minpreconversion` | Minimum reserves per currency to launch |
| `maxpreconversion` | Maximum reserves accepted per currency |
| `prelaunchdiscount` | % discount for preconversion participants |
| `prelaunchcarveout` | % of preconverted reserves kept by creator |

### Initial Pricing

The initial price of a basket token is determined by:

```
Price = Total Reserve Value / Initial Supply

Example:
  Reserves: 100,000 VRSC + 500,000 USDC
  Supply: 1,000,000 MYBASKET
  
  If VRSC = $5:
  Total reserve value = (100,000 × $5) + $500,000 = $1,000,000
  Price per MYBASKET = $1,000,000 / 1,000,000 = $1.00
```

After launch, the price adjusts dynamically as people buy (reserves grow, price rises) and sell (reserves shrink, price drops).

---

## Multi-Reserve Baskets

Baskets can have **multiple reserve currencies** (up to 10, including the native currency), each with a different weight. This enables sophisticated financial instruments:

```
Index Fund Basket:
┌──────────────────────────────────────┐
│  CRYPTO-INDEX                         │
│  ├─ VRSC    (weight: 0.40)  40%      │
│  ├─ BTC     (weight: 0.30)  30%      │
│  ├─ ETH     (weight: 0.20)  20%      │
│  └─ DAI     (weight: 0.10)  10%      │
└──────────────────────────────────────┘

Stablecoin Basket:
┌──────────────────────────────────────┐
│  STABLE-USD                           │
│  ├─ DAI     (weight: 0.34)  34%      │
│  ├─ USDC    (weight: 0.33)  33%      │
│  └─ USDT    (weight: 0.33)  33%      │
└──────────────────────────────────────┘
```

The weights determine the target composition. The AMM's pricing mechanism naturally incentivizes the reserves to stay near their target weights — if one reserve is over-represented, it becomes cheaper to buy through that reserve, attracting conversions that rebalance the basket.

---

## Use Cases

### 1. Stablecoins

Create a basket backed by multiple stablecoins (DAI, USDC, USDT). The result is a **meta-stablecoin** that's more resilient than any single stablecoin — if one depeg, the basket absorbs the impact across all reserves.

### 2. Index Funds

A basket of multiple crypto assets, weighted by market cap or equal-weight. Buying one token gives exposure to a diversified portfolio. No fund manager needed — the blockchain handles rebalancing through the AMM.

### 3. Liquidity Pools

Any basket with active trading volume is a liquidity pool. The reserves provide liquidity, and the AMM provides pricing. Unlike Uniswap LPs, the liquidity is part of the basket itself — there are no separate LP tokens to manage.

### 4. Synthetic Assets

By carefully choosing reserves and weights, you can create tokens that roughly track external assets. For example, a basket that's long on one asset and inversely weighted to another.

### 5. Cross-Currency Exchange

A basket with VRSC and a bridged USD stablecoin provides a built-in exchange between crypto and dollar-denominated assets. Anyone can swap at any time with no counterparty risk.

### 6. Agent Economy Tokens

AI agents can create service tokens backed by real reserves. The backing gives the token intrinsic value — it's always redeemable for the reserves — while the AMM provides instant liquidity.

---

## Fractional Reserve Mechanics

The term "fractional" in fractional basket currencies refers to the **reserve ratio** — the total weight of all reserves relative to the supply. A basket can be 100% backed by its reserves, 5%, or anything in between. This ratio determines how the AMM behaves:

- **100% reserve (weights sum to 1.0):** Price is very stable. The basket tracks the weighted average of its reserves closely.
- **Lower reserve ratios (weights sum to less than 1.0):** More volatile. Price amplifies movements in the underlying reserves. The basket behaves more like a leveraged position.
- **Minimum:** Each reserve currency must have a weight of at least **10%** (0.1). The total reserve ratio (sum of all weights) can range from 5% to 100%.

```
High Reserve Ratio (stable):
  Reserve goes up 10% → Basket goes up ~10%
  Reserve goes down 10% → Basket goes down ~10%

Low Reserve Ratio (amplified):
  Reserve goes up 10% → Basket goes up >10%
  Reserve goes down 10% → Basket goes down >10%
```

The reserve ratio is set at creation and doesn't change. Choose wisely based on your use case.

---

## Fees

Conversions through basket currencies incur small fees, split between reserves and block producers:

| Conversion Type | Total Fee | To Reserves | To Block Reward |
|---|---|---|---|
| Basket ↔ reserve | 0.025% | 0.0125% | 0.0125% |
| Reserve ↔ reserve (via basket) | 0.05% | 0.025% | 0.025% |

This means:
- Every trade slightly increases the reserves (half the fee stays in the basket)
- The basket naturally appreciates over time (more reserves per token)
- Miners and stakers earn the other half of conversion fees
- This is analogous to trading fees in a Uniswap pool going to LPs, but split with network validators

The fee structure incentivizes trading volume and rewards both long-term basket holders and network participants.

---

## Key Takeaways

1. **Protocol-level AMM** — No smart contracts means no contract risk. The AMM is as secure as the blockchain itself.
2. **MEV-resistant** — Simultaneous execution eliminates front-running. Everyone in a block gets the same price.
3. **Multi-reserve** — Baskets can hold multiple currencies with custom weights, enabling index funds, stablecoins, and more.
4. **Always liquid** — As long as reserves exist, conversions are always possible. No reliance on external liquidity providers.
5. **Fair launch** — Preconversion periods with minimum thresholds ensure currencies only launch with adequate backing.
6. **No code required** — Creating a basket is a single `definecurrency` command, not a smart contract deployment.

---

## Related Commands

- [definecurrency](../command-reference/multichain.md#definecurrency) — Create a basket currency
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — Convert between currencies
- [getcurrency](../command-reference/multichain.md#getcurrency) — Check reserve ratios and currency details
- [getcurrencyconverters](../command-reference/multichain.md#getcurrencyconverters) — Find available conversion paths

---

*As of Verus v1.2.x.*
