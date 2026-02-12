# How To: Launch a Token on Verus

> Create your own currency token using the Verus DeFi protocol.

**Estimated time:** 15–20 minutes  
**Cost:** ~200 VRSCTEST (testnet) or ~200 VRSC (mainnet) for currency definition  
**Difficulty:** Intermediate

## Prerequisites

- Verus CLI installed and daemon fully synced
- A registered VerusID with the name you want for your token ([create one first](create-verusid.md))
- ~200 VRSCTEST/VRSC in your wallet for the definition fee
- The VerusID must NOT already have an active currency defined on it

## Understanding Token Types

| Type | Options Flag | Description |
|------|-------------|-------------|
| Simple Token | `32` (0x20) | Basic token — fixed or mintable supply |
| Fractional Basket | `33` (TOKEN + FRACTIONAL) | AMM-backed token with reserve currencies |
| PBaaS Chain | `256` (0x100) | Independent blockchain (advanced, 10,000 VRSC) |

### Proof Protocol Choices

| Value | Name | Meaning |
|-------|------|---------|
| `1` | PROOF_PBAASMMR | Decentralized — no one can mint/burn |
| `2` | PROOF_CHAINID | Centralized — ID holder can mint and burn |
| `3` | PROOF_ETHNOTARIZATION | Ethereum bridge notarization |

## Steps

### 1. Verify Your VerusID Exists

```bash
./verus -testnet getidentity "YOUR_TOKEN_NAME@"
```

The identity name will become the token name.

### 2. Verify No Currency Exists Yet

```bash
./verus -testnet getcurrency "YOUR_TOKEN_NAME"
```

Should return an error like `Currency not found`. If it returns data, this ID already has a currency.

### 3. Define the Currency

#### Option A: Simple Centralized Token

You control minting and burning. Good for loyalty points, project tokens, platform currencies.

```bash
./verus -testnet definecurrency '{
  "name": "YOUR_TOKEN_NAME",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"YOUR_ID@": 1000}]
}'
```

**Flags explained:**
- `options: 32` — TOKEN type
- `proofprotocol: 2` — Centralized (you can mint/burn)
- `idregistrationfees` — Cost for sub-identities under this namespace
- `idreferrallevels: 0` — No referral rewards for subIDs
- `preallocations` — Tokens minted to specified identities at launch

#### Option B: Decentralized Fixed-Supply Token

No one can mint after launch. Supply is set by `preallocations` only.

```bash
./verus -testnet definecurrency '{
  "name": "YOUR_TOKEN_NAME",
  "options": 32,
  "proofprotocol": 1,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"YOUR_ID@": 1000000}]
}'
```

#### Option C: Fractional Basket Currency (AMM)

An automatically-managed liquidity pool backed by reserve currencies.

```bash
./verus -testnet definecurrency '{
  "name": "YOUR_TOKEN_NAME",
  "options": 33,
  "currencies": ["VRSCTEST"],
  "weights": [1.0],
  "initialsupply": 100000,
  "initialcontributions": [1000],
  "idregistrationfees": 1,
  "idreferrallevels": 3,
  "preallocations": [{"YOUR_ID@": 10000}]
}'
```

**Additional flags:**
- `options: 33` — FRACTIONAL (1) + TOKEN (32)
- `currencies` — Reserve currencies backing the basket
- `weights` — Relative weight of each reserve (must sum to 1.0, minimum 0.1 per reserve)
- `initialsupply` — Total supply after initial contributions convert
- `initialcontributions` — Amount of each reserve deposited at launch

**Expected output:**
```json
{
  "txid": "abc123...",
  "tx": { ... },
  "hex": "0400..."
}
```

### 4. Wait for Confirmation and Launch

```bash
./verus -testnet gettransaction "YOUR_DEFINITION_TXID"
```

Wait for at least 1 confirmation for the definition tx to be mined. Then wait a **minimum of 20 blocks** (~20 minutes) for the currency to become active and usable. During this launch period, preconversions can occur for basket currencies.

### 5. Verify the Currency

```bash
./verus -testnet getcurrency "YOUR_TOKEN_NAME"
```

Should show your token definition with supply, options, etc.

### 6. Mint Tokens (Centralized Only)

If you used `proofprotocol: 2`, you can mint additional tokens:

```bash
./verus -testnet sendcurrency "YOUR_TOKEN_NAME@" '[{
  "address": "RECIPIENT_ADDRESS_OR_ID",
  "amount": 500,
  "currency": "YOUR_TOKEN_NAME",
  "mintnew": true
}]'
```

> ⚠️ The `fromaddress` **must** be the token's controlling identity (e.g., `"YOUR_TOKEN_NAME@"`).

### 7. Send Tokens

```bash
./verus -testnet sendcurrency "*" '[{
  "address": "recipient@",
  "amount": 10,
  "currency": "YOUR_TOKEN_NAME"
}]'
```

## Options Bitfield Reference

Options are combined by adding values:

| Bit | Value | Name | Description |
|-----|-------|------|-------------|
| 0 | 1 | FRACTIONAL | AMM basket currency |
| 1 | 2 | IDRESTRICTED | Only approved IDs can hold |
| 2 | 4 | IDSTAKING | IDs can stake this currency |
| 3 | 8 | IDREFERRALS | ID referral rewards enabled |
| 4 | 16 | IDREFERRALSREQUIRED | Referral required for ID registration |
| 5 | 32 | TOKEN | Token on this chain (not an independent chain) |
| 8 | 256 | IS_PBAAS_CHAIN | Independent blockchain |
| 11 | 2048 | NFT_TOKEN | Single-satoshi NFT with tokenized rootID control |

**Common combinations:**
- `32` = Simple token
- `33` = Fractional basket token (32 + 1)
- `40` = Token with ID referrals (32 + 8)
- `256` = PBaaS chain (base)
- `264` = PBaaS chain with referrals (256 + 8)

## What Could Go Wrong

| Problem | Cause | Solution |
|---------|-------|---------|
| `Identity not found` | Named identity doesn't exist | Create the VerusID first |
| `Currency already defined` | ID already has a currency | Use a different identity |
| `Insufficient funds` | Need ~200 VRSCTEST | Fund your wallet |
| `Cannot mint currency` | Wrong `fromaddress` or `proofprotocol` isn't 2 | Use the currency's ID as sender; only centralized tokens can mint |
| Token not showing in wallet | Not yet confirmed | Wait for 1+ blocks |

## Mainnet Notes

- Definition fee: ~200 VRSC (same as testnet equivalent)
- PBaaS chain definition: ~10,000 VRSC
- Test on testnet first — currency definitions are permanent
- Once a currency is defined on an identity, it cannot be redefined

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
