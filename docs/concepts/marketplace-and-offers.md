# Marketplace and Offers

> Trustless, on-chain atomic swaps for currencies, tokens, and identities — no intermediary required

---

## What Is the Verus Marketplace?

The Verus marketplace is a **decentralized, on-chain trading system** built into the protocol. It enables peer-to-peer atomic swaps of any blockchain asset — currencies, tokens, and VerusIDs — without intermediaries, escrow services, or centralized order books.

Every offer is a blockchain transaction. Every trade is an atomic swap. Either both sides complete, or neither does. There's nothing to trust except the blockchain's consensus rules.

```
┌────────────────────────────────────────────────────┐
│                VERUS MARKETPLACE                    │
│                                                     │
│  Seller                              Buyer          │
│  ┌──────────┐                  ┌──────────┐        │
│  │ makeoffer │                  │ takeoffer │        │
│  │          │                  │          │        │
│  │ Offers:  │   On-chain       │ Accepts: │        │
│  │ 10 VRSC  │ ←─ atomic ─────→ │ myid@    │        │
│  │ for      │    swap          │ for      │        │
│  │ myid@    │                  │ 10 VRSC  │        │
│  └──────────┘                  └──────────┘        │
│                                                     │
│  Either BOTH sides execute, or NEITHER does.        │
└────────────────────────────────────────────────────┘
```

---

## What Can Be Traded?

The marketplace supports trading **any combination** of these asset types:

| You Offer | You Receive | Example |
|---|---|---|
| Currency | Currency | 100 VRSC for 0.1 vETH |
| Currency | Identity | 50 VRSC for `coolname@` |
| Identity | Currency | `myoldid@` for 25 VRSC |
| Identity | Identity | `name1@` for `name2@` |
| Token | Currency | 1000 MYTOKEN for 10 VRSC |
| Token | Token | 500 TOKENA for 200 TOKENB |

This flexibility means the marketplace handles use cases that would require multiple different platforms in other ecosystems — token exchanges, NFT marketplaces, domain name auctions, and identity sales — all in one system.

---

## How Offers Work

### Creating an Offer (makeoffer)

When you create an offer with [makeoffer](../command-reference/marketplace.md#makeoffer), you specify:

1. **What you're offering** — a currency amount or an identity
2. **What you want in return** — a currency amount or an identity definition
3. **Expiry height** — when the offer expires (default: ~20 blocks / ~20 minutes)
4. **Change address** — where leftover funds go

```bash
# Offer 10 VRSC for the identity "coolname@"
verus makeoffer "*" '{
  "changeaddress": "RMyAddress",
  "expiryheight": 930000,
  "offer": {
    "currency": "VRSCTEST",
    "amount": 10
  },
  "for": {
    "name": "coolname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RMyAddress"],
    "minimumsignatures": 1
  }
}'
```

The offer is posted on-chain as a **partial transaction**. Your funds (or identity) are committed but not yet spent — they're locked until someone takes the offer, or it expires.

### Taking an Offer (takeoffer)

When you find an offer you want to accept, you use `takeoffer` to complete the swap:

```bash
# Accept the offer — pay 10 VRSC, receive "coolname@"
verus takeoffer "*" '{
  "txid": "abc123...",
  "changeaddress": "RBuyerAddress",
  "deliver": {
    "currency": "VRSCTEST",
    "amount": 10
  },
  "accept": {
    "name": "coolname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RBuyerAddress"],
    "minimumsignatures": 1
  }
}'
```

The `takeoffer` command completes the partial transaction, creating a single atomic transaction where:
- The seller's offered asset goes to the buyer
- The buyer's payment goes to the seller
- Both transfers happen in the **same transaction** — atomic and indivisible

### Finding Offers (getoffers)

Browse existing offers for any identity or currency:

```bash
# Find offers involving an identity
verus getoffers "coolname@" false true

# Find offers involving a currency
verus getoffers "VRSCTEST" true true
```

The third parameter (`true`) includes raw transaction hex, which is needed to take the offer.

### Listing Your Offers (listopenoffers)

```bash
# List your active offers
verus listopenoffers

# Include expired offers
verus listopenoffers true
```

### Closing Offers (closeoffers)

Cancel active offers or reclaim funds from expired ones:

```bash
# Cancel specific offers
verus closeoffers '["txid1", "txid2"]' "RMyAddress"

# Close all expired offers (reclaim locked funds)
verus closeoffers
```

---

## Offer Lifecycle

```
1. CREATE (makeoffer)
   ├─ Funds/identity locked in partial transaction
   ├─ Offer visible via getoffers
   └─ Offer visible in listopenoffers

2. ACTIVE (waiting for taker)
   ├─ Anyone can view the offer
   ├─ Anyone can take the offer
   └─ Seller can close/cancel at any time

3. RESOLUTION (one of three outcomes)
   ├─ TAKEN (takeoffer) → Atomic swap completes
   │   ├─ Seller receives payment
   │   └─ Buyer receives asset
   ├─ EXPIRED (expiryheight reached)
   │   └─ Seller reclaims funds via closeoffers
   └─ CANCELLED (closeoffers before expiry)
       └─ Seller reclaims funds immediately
```

---

## The Identity Marketplace

One of the most distinctive features of the Verus marketplace is **identity trading**. VerusIDs are first-class blockchain objects that can be bought, sold, and traded just like currencies.

### Selling an Identity

```bash
# Sell "premiumname@" for 100 VRSC
verus makeoffer "premiumname@" '{
  "changeaddress": "RSellerAddress",
  "expiryheight": 950000,
  "offer": {
    "identity": "premiumname@"
  },
  "for": {
    "address": "RSellerAddress",
    "currency": "VRSCTEST",
    "amount": 100
  }
}'
```

**Important:** The identity itself must have funds to cover the transaction fee. Send a small amount first:
```bash
verus sendtoaddress "premiumname@" 0.1
```

### Buying an Identity

When buying an identity, the `accept` field defines the new ownership — who controls it after the swap:

```bash
verus takeoffer "*" '{
  "txid": "offer_txid_here",
  "changeaddress": "RBuyerAddress",
  "deliver": {
    "currency": "VRSCTEST",
    "amount": 100
  },
  "accept": {
    "name": "premiumname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RBuyerAddress"],
    "minimumsignatures": 1
  }
}'
```

### Trading Existing Identities

You can make offers to **buy existing identities** from their current owners. The offer specifies the identity you want and what you're willing to pay. The current owner can accept by taking the offer, which atomically transfers ownership.

> **Note:** You cannot make offers for identities that don't exist yet. The identity must already be registered on-chain.

---

## Currency-to-Currency Trading

The marketplace also handles direct currency swaps without going through a basket AMM:

```bash
# Offer 1000 MYTOKEN for 5 VRSC
verus makeoffer "*" '{
  "changeaddress": "RMyAddress",
  "expiryheight": 940000,
  "offer": {
    "currency": "MYTOKEN",
    "amount": 1000
  },
  "for": {
    "address": "RMyAddress",
    "currency": "VRSCTEST",
    "amount": 5
  }
}'
```

This is useful when:
- There's no basket currency connecting the two tokens
- You want a specific price (limit order) rather than the AMM price
- You're trading large amounts and want to avoid AMM slippage

---

## Marketplace vs. AMM Conversions

Verus offers **two** ways to exchange assets, each suited to different scenarios:

| Feature | Marketplace (makeoffer/takeoffer) | AMM (sendcurrency + convertto) |
|---|---|---|
| Price discovery | Set by the offer creator | Determined by reserve ratios |
| Execution | Requires a counterparty to take | Instant (always-available liquidity) |
| Assets supported | Any: currencies, tokens, identities | Only basket reserve currencies |
| Order type | Limit order (fixed price) | Market order (current AMM price) |
| MEV risk | None (atomic swap) | None (simultaneous execution) |
| Slippage | None (price is fixed) | Possible on large trades |
| Best for | Identity trades, specific prices, large OTC | Quick swaps, small-medium amounts |

In practice, users often use both: the AMM for routine currency conversions, and the marketplace for identity trading and large block trades.

---

## Comparison to Centralized Exchanges

| Feature | Verus Marketplace | Centralized Exchange |
|---|---|---|
| Custody | Non-custodial (your keys, your coins) | Exchange holds your funds |
| KYC required | No | Usually yes |
| Counterparty risk | None (atomic swaps) | Exchange can be hacked, freeze funds |
| Downtime | Never (blockchain is always on) | Maintenance windows, outages |
| Trading pairs | Any asset combination | Limited to listed pairs |
| Identity trading | Native support | Not possible |
| Fees | Only blockchain transaction fees | Trading fees + withdrawal fees |
| Speed | ~1 minute per block confirmation | Instant (internal ledger) |
| Privacy | Pseudonymous (blockchain addresses) | Full identity required |

The tradeoff: centralized exchanges offer faster execution, deeper liquidity, and familiar UIs. The Verus marketplace offers trustlessness, self-custody, and unique capabilities (identity trading) that centralized platforms cannot provide.

---

## Security Considerations

1. **Verify before taking** — Always inspect offer details with `getoffers` before committing funds
2. **Set reasonable expiry** — Don't leave offers open for thousands of blocks; use `expiryheight` appropriate to your timeframe
3. **Close expired offers** — Run `closeoffers` periodically to reclaim funds locked in expired offers
4. **Double-check `primaryaddresses`** — When buying an identity, the addresses in `accept` determine who controls it. Get this wrong and you lose the identity.
5. **Fund identities before selling** — The identity must have a small balance to cover the `makeoffer` transaction fee

---

## Key Takeaways

1. **Fully on-chain** — Every offer is a blockchain transaction. No off-chain order books, no centralized matching engines.
2. **Truly atomic** — Swaps either complete entirely or not at all. No partial fills, no stuck states.
3. **Universal asset support** — Trade currencies, tokens, and identities in any combination.
4. **No intermediary** — Direct peer-to-peer trades. The blockchain is the only "exchange."
5. **Identity marketplace** — Buy, sell, and auction VerusIDs — a capability unique to Verus.
6. **Complements the AMM** — Use the marketplace for limit orders and identity trades; use baskets for instant liquidity.

---

## Related Commands

- [makeoffer](../command-reference/marketplace.md#makeoffer) — Create a swap offer
- [takeoffer](../command-reference/marketplace.md#takeoffer) — Accept an existing offer
- [getoffers](../command-reference/marketplace.md#getoffers) — Browse offers for an asset
- [listopenoffers](../command-reference/marketplace.md#listopenoffers) — List your open offers
- [closeoffers](../command-reference/marketplace.md#closeoffers) — Cancel or reclaim offers

## Related Guides

- [How To: Create a Marketplace Offer](../how-to/create-marketplace-offer.md) — Step-by-step trading guide
- [Basket Currencies and DeFi](basket-currencies-defi.md) — AMM-based conversions

---

*As of Verus v1.2.x.*
