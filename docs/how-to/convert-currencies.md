# How To: Convert Currencies

> Swap between currencies using the protocol-level AMM — estimate first, then execute

---

## Prerequisites

- Verus CLI installed and synced (`verusd` running)
- Wallet with sufficient balance of the source currency
- Knowledge of available basket currencies (conversion paths)

---

## Step 1: Find Available Conversion Paths

Not all currencies can convert directly. Conversions work between **reserve currencies** and their **basket (fractional) currency**. Use `getcurrencyconverters` to find paths:

```bash
# Find converters between VRSC and a USD token
verus getcurrencyconverters '["VRSCTEST","USD"]'
```

This returns basket currencies that have both VRSCTEST and USD as reserves — meaning you can convert between them.

### Understanding Conversion Paths

```
Direct conversions (one step):
  Reserve → Basket       (e.g., VRSCTEST → VRSC-USD)
  Basket  → Reserve      (e.g., VRSC-USD → VRSCTEST)

Cross-conversions via basket (two steps internally, one command):
  Reserve A → Reserve B  (e.g., VRSCTEST → USD via VRSC-USD)
  Requires the "via" parameter
```

---

## Step 2: Estimate the Conversion

**Always estimate before executing.** Use [estimateconversion](../command-reference/multichain.md#estimateconversion) to see what you'll receive:

### Reserve → Basket (Direct)

```bash
verus estimateconversion '{"currency":"VRSCTEST","convertto":"VRSC-USD","amount":10}'
```

Example output:
```json
{
  "inputcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "netinputamount": 9.99750000,
  "outputcurrencyid": "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD",
  "estimatedcurrencyout": 53.30897428
}
```

Read this as: "Sending 10 VRSCTEST (net 9.9975 after fees) will yield approximately 53.31 VRSC-USD."

### Reserve → Reserve (Via Basket)

```bash
verus estimateconversion '{"currency":"VRSCTEST","convertto":"USD","via":"VRSC-USD","amount":100}'
```

Example output:
```json
{
  "netinputamount": 99.95000000,
  "estimatedcurrencyout": 568.27012650
}
```

Read this as: "100 VRSCTEST ≈ 568.27 USD through the VRSC-USD basket."

### Understanding the Fees

Compare `amount` vs `netinputamount`:
- **amount**: What you specified (e.g., 100)
- **netinputamount**: What actually enters the conversion (e.g., 99.95)
- **Difference**: Conversion fees (0.025% basket↔reserve, 0.05% reserve↔reserve) + standard 0.0001 VRSC tx fee

---

## Step 3: Execute the Conversion

Use [sendcurrency](../command-reference/multichain.md#sendcurrency) with the `convertto` parameter:

### Reserve → Basket

```bash
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 10,
  "currency": "VRSCTEST",
  "convertto": "VRSC-USD"
}]'
```

### Basket → Reserve

```bash
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 50,
  "currency": "VRSC-USD",
  "convertto": "VRSCTEST"
}]'
```

### Reserve → Reserve (Via Basket)

```bash
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 100,
  "currency": "VRSCTEST",
  "convertto": "USD",
  "via": "VRSC-USD"
}]'
```

**Note:** For reserve-to-reserve conversions, you **must** use the `via` parameter to specify which basket to route through.

---

## Step 4: Verify the Result

The command returns an operation ID. Check the status:

```bash
# Check operation status
verus z_getoperationstatus '["opid-abc123-..."]'

# Check your balance
verus getbalance

# Check currency balances
verus getcurrencybalance '*'
```

---

## Multi-Hop Conversions

Sometimes there's no single basket connecting two currencies. You can chain conversions:

```
Example: Convert TokenA → TokenB
  No direct basket has both TokenA and TokenB

  Solution — two steps:
  1. TokenA → VRSC  (via BasketA which has TokenA + VRSC)
  2. VRSC → TokenB  (via BasketB which has VRSC + TokenB)
```

```bash
# Step 1: TokenA → VRSC
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 100,
  "currency": "TokenA",
  "convertto": "VRSCTEST",
  "via": "BasketA"
}]'

# Wait for confirmation (~1 block)

# Step 2: VRSC → TokenB
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 50,
  "currency": "VRSCTEST",
  "convertto": "TokenB",
  "via": "BasketB"
}]'
```

---

## Fees and Slippage

### Fee Structure

| Fee | Rate | Description |
|---|---|---|
| Conversion fee | ~0.025% | Goes into basket reserves (benefits all holders) |
| Transaction fee | 0.0001 VRSC | Standard flat transaction fee |
| **Total** | **~0.045%** | Visible in `netinputamount` vs `amount` |

### Slippage

The estimated output from `estimateconversion` may differ from the actual output because:
- Other conversions in the same block affect the price
- All conversions in a block execute at the **same final price** (MEV-resistant)
- Large conversions relative to reserve size cause more price impact

**Tips to minimize slippage:**
1. Check reserve sizes with `getcurrency "BasketName"` — larger reserves = less slippage
2. Split large conversions across multiple blocks
3. Compare the estimate to the actual result and adjust future amounts accordingly

---

## Common Errors

| Error | Cause | Solution |
|---|---|---|
| `Source currency cannot be converted to destination` | No valid conversion path | Use `getcurrencyconverters` to find paths; use `via` for reserve↔reserve |
| `Insufficient funds` | Not enough source currency | Check balance with `getbalance` |
| `Currency not found` | Typo in currency name | Verify with `getcurrency "name"` |
| No output / zero estimated | Amount too small | Increase amount or check if basket has liquidity |

---

## Quick Reference

```bash
# Find conversion paths
verus getcurrencyconverters '["CurrencyA","CurrencyB"]'

# Estimate (direct)
verus estimateconversion '{"currency":"SRC","convertto":"DST","amount":N}'

# Estimate (via basket)
verus estimateconversion '{"currency":"SRC","convertto":"DST","via":"BASKET","amount":N}'

# Execute (direct)
verus sendcurrency '*' '[{"address":"DEST","amount":N,"currency":"SRC","convertto":"DST"}]'

# Execute (via basket)
verus sendcurrency '*' '[{"address":"DEST","amount":N,"currency":"SRC","convertto":"DST","via":"BASKET"}]'
```

---

## Related

- [estimateconversion](../command-reference/multichain.md#estimateconversion) — Estimate command reference
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — Send/convert command reference
- [Basket Currencies and DeFi](../concepts/basket-currencies-defi.md) — How the AMM works
- [Bridge and Cross-Chain](../concepts/bridge-and-crosschain.md) — Converting bridged assets

---

*As of Verus v1.2.x.*
