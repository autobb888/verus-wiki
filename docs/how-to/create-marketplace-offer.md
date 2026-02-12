# How To: Create a Marketplace Offer

> Buy, sell, and trade currencies, tokens, and identities using on-chain atomic swaps

---

## Prerequisites

- Verus CLI installed and synced (`verusd` running)
- Wallet with funds for the offer + transaction fees
- For identity sales: the identity must have a small balance for the tx fee

---

## Creating an Offer (Selling)

### Sell Currency for Currency

```bash
# Offer 100 VRSCTEST for 0.1 vETH
verus makeoffer "*" '{
  "changeaddress": "RYourChangeAddress",
  "expiryheight": 930000,
  "offer": {
    "currency": "VRSCTEST",
    "amount": 100
  },
  "for": {
    "address": "RYourPaymentAddress",
    "currency": "vETH",
    "amount": 0.1
  }
}'
```

### Sell an Identity for Currency

```bash
# Step 1: Fund the identity for the tx fee
verus sendtoaddress "myidentity@" 0.1

# Step 2: Wait for 1 confirmation (~1 minute)

# Step 3: Create the offer
verus makeoffer "myidentity@" '{
  "changeaddress": "RYourChangeAddress",
  "expiryheight": 930000,
  "offer": {
    "identity": "myidentity@"
  },
  "for": {
    "address": "RYourPaymentAddress",
    "currency": "VRSCTEST",
    "amount": 50
  }
}'
```

> ⚠️ **The identity must have funds** to cover the transaction fee. This is the #1 error people hit.

### Offer Currency for an Identity (Bidding)

```bash
# Bid 25 VRSCTEST for the identity "coolname@"
verus makeoffer "*" '{
  "changeaddress": "RYourChangeAddress",
  "expiryheight": 935000,
  "offer": {
    "currency": "VRSCTEST",
    "amount": 25
  },
  "for": {
    "name": "coolname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RYourOwnerAddress"],
    "minimumsignatures": 1
  }
}'
```

### Setting Expiry

The `expiryheight` is the block height at which the offer expires. To calculate:

```bash
# Get current block height
verus getblockcount
# Example: 926000

# Set expiry ~1 day from now (~1440 blocks at ~1 min/block)
# expiryheight = 926000 + 1440 = 927440
```

If omitted, the default is current height + 20 blocks (~20 minutes).

---

## Taking an Offer (Buying)

### Step 1: Find Offers

```bash
# Find offers for an identity
verus getoffers "coolname@" false true

# Find offers for a currency
verus getoffers "VRSCTEST" true true
```

The third parameter (`true`) includes raw transaction hex needed for `takeoffer`.

### Step 2: Review the Offer

The response shows:
- **offer** — what the seller is giving up
- **accept** — what the seller wants in return
- **blockexpiry** — when the offer expires
- **txid** — the offer transaction ID (needed for `takeoffer`)

### Step 3: Take the Offer

#### Buy an Identity

```bash
verus takeoffer "*" '{
  "txid": "abc123def456...",
  "changeaddress": "RYourChangeAddress",
  "deliver": {
    "currency": "VRSCTEST",
    "amount": 50
  },
  "accept": {
    "name": "coolname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RYourNewOwnerAddress"],
    "minimumsignatures": 1
  }
}'
```

> ⚠️ **The `primaryaddresses` in `accept` determines who controls the identity after the swap.** Double-check this.

#### Buy Currency

```bash
verus takeoffer "*" '{
  "txid": "abc123def456...",
  "changeaddress": "RYourChangeAddress",
  "deliver": {
    "currency": "vETH",
    "amount": 0.1
  },
  "accept": {
    "currency": "VRSCTEST",
    "amount": 100
  }
}'
```

---

## Listing Your Open Offers

```bash
# List active offers from your wallet
verus listopenoffers

# Include expired (unreclaimed) offers
verus listopenoffers true
```

---

## Closing / Cancelling Offers

### Cancel Specific Offers

```bash
verus closeoffers '["txid1", "txid2"]' "RDestinationAddress"
```

This cancels the offers and sends the locked funds to the specified address.

### Reclaim All Expired Offers

```bash
verus closeoffers
```

This reclaims funds from all expired offers in your wallet. **Run this periodically** to avoid leaving funds locked.

---

## Complete Workflow Example

### Scenario: Alice sells `premiumname@` to Bob for 100 VRSC

**Alice (Seller):**
```bash
# 1. Fund the identity
verus sendtoaddress "premiumname@" 0.1

# 2. Wait for confirmation

# 3. Create the offer (expires in ~24 hours)
CURRENT=$(verus getblockcount)
EXPIRY=$((CURRENT + 1440))

verus makeoffer "premiumname@" "{
  \"changeaddress\": \"RAliceAddress\",
  \"expiryheight\": $EXPIRY,
  \"offer\": {\"identity\": \"premiumname@\"},
  \"for\": {\"address\": \"RAliceAddress\", \"currency\": \"VRSCTEST\", \"amount\": 100}
}"
# Returns: txid "offer123..."
```

**Bob (Buyer):**
```bash
# 1. Find the offer
verus getoffers "premiumname@" false true

# 2. Take it
verus takeoffer "*" '{
  "txid": "offer123...",
  "changeaddress": "RBobAddress",
  "deliver": {"currency": "VRSCTEST", "amount": 100},
  "accept": {
    "name": "premiumname",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "primaryaddresses": ["RBobAddress"],
    "minimumsignatures": 1
  }
}'
```

**Result (after 1 confirmation):**
- Alice receives 100 VRSCTEST
- Bob now controls `premiumname@`
- Swap is atomic — both happen or neither happens

---

## Common Errors

| Error | Cause | Solution |
|---|---|---|
| `Insufficient funds for posting offer for identity on chain` | Identity has no balance for tx fee | Send 0.1 VRSC to the identity first |
| `Unable to fund currency delivery` | Wallet can't cover the offered amount | Check balance; use `"*"` as fromaddress |
| `Invalid or unconfirmed commitment transaction id` | Using unconfirmed transaction | Wait for 1+ confirmations |
| Empty `getoffers` response | Offer not yet confirmed | Wait ~1 minute for block confirmation |
| `Invalid identity` | Identity doesn't exist or isn't in wallet | Verify with `getidentity "name@"` |

---

## Tips

1. **Always fund identities before selling** — Send 0.1 VRSC to the identity before calling `makeoffer`
2. **Set appropriate expiry** — 1440 blocks ≈ 1 day, 10080 blocks ≈ 1 week
3. **Close expired offers** — Run `closeoffers` regularly to reclaim locked funds
4. **Use `returntx: true` to preview** — Add `true` as the third parameter to `makeoffer` to see the transaction without posting it
5. **Verify before taking** — Always inspect offer details with `getoffers` before committing funds

---

## Related

- [Marketplace and Offers](../concepts/marketplace-and-offers.md) — How the marketplace works
- [makeoffer](../command-reference/marketplace.md#makeoffer) — Command reference
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — For AMM-based conversions instead

---

*As of Verus v1.2.x.*
