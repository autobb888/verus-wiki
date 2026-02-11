# Verus SubID Creation Guide

> How to create and manage subIDs under your own namespace on Verus

## Overview

SubIDs allow you to create identities under your namespace (e.g., `alice.yournamespace@`). This is useful for:
- Agent platforms with multiple agents
- Organizations with member identities  
- Service providers with sub-accounts

## Prerequisites

1. **VerusID** - You need an existing identity (e.g., `yournamespace@`)
2. **VRSCTEST/VRSC** - Native currency for transaction fees
3. **Wallet access** - Private key for the identity's primary address

## Step 1: Define Your Namespace Currency

To enable subID creation, your identity must be converted to a currency.

```bash
# Define currency with subID capabilities
verus -testnet definecurrency '{
  "name": "yournamespace",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0
}'
```

**Key parameters:**
- `options: 32` - TOKEN flag, enables subID creation
- `proofprotocol: 2` - Centralized control (identity owner can mint)
- `idregistrationfees: 0.01` - Cost per subID (in namespace tokens)
- `idreferrallevels: 0` - No referral rewards

**Important:** The `definecurrency` command returns a transaction but may not broadcast it automatically. Extract the `hex` field and broadcast:

```bash
# If needed, broadcast manually
verus -testnet sendrawtransaction "HEX_FROM_DEFINECURRENCY"
```

Wait for confirmation (~1 block), then verify:

```bash
verus -testnet getcurrency "yournamespace"
```

## Step 2: Mint Namespace Tokens

SubID registration requires payment in your namespace's token. Since supply starts at 0, you must mint tokens first.

```bash
# Mint tokens (send FROM the currency ID, with mintnew:true)
verus -testnet sendcurrency "YOUR_CURRENCY_I_ADDRESS" '[{
  "address": "YOUR_R_ADDRESS",
  "currency": "YOUR_CURRENCY_I_ADDRESS",
  "amount": 100,
  "mintnew": true
}]'
```

**Critical:** The `fromaddress` MUST be the currency's i-address (e.g., `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW`), not the friendly name.

Verify supply:
```bash
verus -testnet getcurrency "yournamespace" | grep supply
# Should show: "supply": 100.00000000
```

## Step 3: Create Name Commitment

Reserve the subID name with a commitment:

```bash
verus -testnet registernamecommitment "alice" "YOUR_R_ADDRESS" "" "YOUR_CURRENCY_I_ADDRESS"
```

**Note:** Use the i-address for the parent, not `yournamespace@`.

This returns:
```json
{
  "txid": "abc123...",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
    "salt": "def456...",
    "referral": "",
    "nameid": "i3pFWKrbubd3QUT5XapcDbWjvrX5DtPacd"
  }
}
```

**Save this output!** You need the exact values for registration.

Wait for confirmation (1+ blocks).

## Step 4: Register the SubID

```bash
verus -testnet registeridentity '{
  "txid": "COMMITMENT_TXID",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "YOUR_CURRENCY_I_ADDRESS",
    "salt": "SALT_FROM_COMMITMENT",
    "referral": "",
    "nameid": "NAMEID_FROM_COMMITMENT"
  },
  "identity": {
    "name": "alice",
    "parent": "YOUR_CURRENCY_I_ADDRESS",
    "primaryaddresses": ["YOUR_R_ADDRESS"],
    "minimumsignatures": 1
  }
}' false 0.01 "*"
```

**Key points:**
- Include `parent` in both `namereservation` AND `identity`
- Use `"*"` as sourceoffunds to pull from all available UTXOs
- Fee (0.01) is paid in namespace tokens

## Step 5: Add ContentMultiMap Data

Update the subID with metadata:

```bash
verus -testnet updateidentity '{
  "name": "alice",
  "parent": "YOUR_CURRENCY_I_ADDRESS",
  "contentmultimap": {
    "i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3": ["HEX_VERSION"],
    "iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R": ["HEX_TYPE"],
    "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d": ["HEX_NAME"],
    "iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U": ["HEX_DESCRIPTION"],
    "iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ": ["HEX_CAPABILITIES"],
    "iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf": ["HEX_STATUS"]
  }
}' false false 0.001 "*"
```

**Critical:** You MUST include the `parent` field for subID updates!

### Converting Data to Hex

```bash
# Example: Convert "Alice" to hex
echo -n '"Alice"' | xxd -p | tr -d '\n'
# Output: 22416c69636522
```

## Complete Example

Here's a full workflow for creating `alice.agentplatform@`:

```bash
# 1. Define currency (if not already done)
verus -testnet definecurrency '{
  "name": "agentplatform",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0
}'

# 2. Mint tokens
verus -testnet sendcurrency "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW" '[{
  "address": "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",
  "currency": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "amount": 10,
  "mintnew": true
}]'

# 3. Create commitment
verus -testnet registernamecommitment "alice" "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2" "" "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW"

# 4. Register identity (after commitment confirms)
verus -testnet registeridentity '{
  "txid": "a76a70dea2003759424fbf0ae34fd089eac250c53eda1134e55909360bc82d84",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
    "salt": "caabd8c27bd77278a7ab54bf423c753cb2d51511239164f7d9b1adc288c0211f",
    "referral": "",
    "nameid": "i3pFWKrbubd3QUT5XapcDbWjvrX5DtPacd"
  },
  "identity": {
    "name": "alice",
    "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
    "primaryaddresses": ["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"],
    "minimumsignatures": 1
  }
}' false 0.01 "*"

# 5. Verify
verus -testnet getidentity "alice.agentplatform@"
```

## Troubleshooting

### "Insufficient funds for identity registration"
- Ensure you've minted namespace tokens
- Check that tokens are at an address you control
- Use `"*"` as sourceoffunds

### "Invalid parent currency"
- Use the i-address instead of the friendly name
- Ensure the currency has launched (past startblock)

### "bad-txns-inputs-spent"
- Wait for previous transaction to confirm
- Each transaction needs its own block

### "bad-txns-failed-precheck"
- For updateidentity: include the `parent` field
- Ensure you have VRSCTEST for tx fees

## VDXF Keys Reference (ari::agent.v1.*)

| Field | VDXF Key |
|-------|----------|
| version | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` |
| type | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` |
| name | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` |
| description | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` |
| capabilities | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` |
| status | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` |

---

*Guide created: 2026-02-06*
*Based on testnet experimentation with agentplatform namespace*
