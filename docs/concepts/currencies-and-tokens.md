# Currencies and Tokens on Verus

> How to create tokens, basket currencies, and entire blockchains — without writing code

---

## Overview

On Verus, anyone with a VerusID can create a new currency. There are no smart contracts to write, no audits to pass, no permission to seek. You run a single command — [definecurrency](../command-reference/multichain/definecurrency.md) — and the blockchain handles the rest.

There are three types of currencies you can create, each with increasing complexity:

```
┌─────────────────────────────────────────────────────┐
│  Currency Types on Verus                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Simple Token (options: 32)                         │
│  → A standalone token. No reserves, no backing.     │
│  → Like creating an ERC-20 on Ethereum.             │
│                                                     │
│  Fractional Basket (options: 33)                    │
│  → Backed by one or more reserve currencies.        │
│  → Built-in AMM for automatic trading.              │
│  → Like a Uniswap pool, but at the protocol level.  │
│                                                     │
│  PBaaS Chain (options: 264)                         │
│  → An entirely new blockchain.                      │
│  → Own consensus, own miners, own identity system.  │
│  → Connected to Verus via cross-chain notarization. │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Simple Tokens

A simple token is the most basic currency type. It exists on the Verus blockchain as a named asset with a supply you control.

### Key Parameters

- **options: 32** — The `TOKEN` flag (0x20)
- **proofprotocol** — Controls who can mint and burn tokens

### Proof Protocol: Decentralized vs. Centralized

The `proofprotocol` setting determines the fundamental nature of your token:

| proofprotocol | Name | Meaning |
|---|---|---|
| 1 | PROOF_PBAASMMR | Decentralized — Verus MMR proof, no notaries required. Supply fixed at launch. |
| 2 | PROOF_CHAINID | Centralized — currency controller (rootID owner) can mint/burn tokens. For basket currencies, minting/burning affects the reserve ratio. |
| 3 | PROOF_ETHNOTARIZATION | Ethereum ERC-20 mapped — token supply follows an Ethereum contract. Used for bridged tokens. |

**proofprotocol: 2 (centralized)** is useful for:
- Stablecoins (mint/burn to maintain peg)
- Service credits (mint as needed, burn when redeemed)
- Platform tokens where the issuer needs supply control
- Testing and prototyping

**proofprotocol: 1 (decentralized)** is for tokens where fixed supply is a feature — similar to Bitcoin's 21 million cap.

### Creating a Simple Token

```bash
verus definecurrency '{
  "name": "mytoken",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"myidentity@": 1000000}]
}'
```

This creates a token called `mytoken` with 1,000,000 tokens pre-allocated to `myidentity@`. Because `proofprotocol` is 2, the identity holder can mint more later.

---

## Fractional Basket Currencies

A fractional basket currency is backed by **reserve currencies**. It has a built-in automated market maker (AMM) that allows anyone to convert between the basket currency and its reserves at any time.

This is covered in depth in [Basket Currencies and DeFi](basket-currencies-defi.md). Here's the summary:

- **options: 33** — `FRACTIONAL` (0x01) + `TOKEN` (0x20) = 0x21 = 33. Add `ID_REFERRALS` (0x08) for 41, or other flags as needed
- **currencies** — Array of reserve currency names or i-addresses
- **weights** — How much each reserve currency contributes (must sum to 1.0; minimum 0.1 per reserve; up to 10 currencies total)
- **initialsupply** — Total supply of the basket token after launch

```bash
verus definecurrency '{
  "name": "mybasket",
  "options": 33,
  "currencies": ["VRSCTEST", "USDC"],
  "weights": [0.5, 0.5],
  "initialsupply": 1000000,
  "initialcontributions": [100000, 500000],
  "idregistrationfees": 5,
  "idreferrallevels": 3
}'
```

---

## PBaaS Chains

PBaaS (Public Blockchains as a Service) chains are **entirely new blockchains** launched from Verus. They have their own:

- Block production (mining/staking)
- Identity namespace
- Transaction history
- Currency system

But they remain connected to Verus through **notarization** — periodic proofs posted back to the Verus chain that prove the state of the PBaaS chain.

- **options: 264** — `IS_PBAAS_CHAIN` (0x100) + `IDREFERRALS` (0x8) = 0x108 = 264
- Requires `nodes` (bootstrap nodes for the new network)
- Requires `eras` (block reward schedule)
- Can include a gateway converter for cross-chain trading

```bash
verus definecurrency '{
  "name": "mychain",
  "options": 264,
  "idregistrationfees": 100,
  "idreferrallevels": 3,
  "notarizationreward": 0.0001,
  "eras": [{"reward": 600000000, "halving": 1051924, "eraend": 0}],
  "nodes": [{"networkaddress": "1.2.3.4:12345", "nodeidentity": "mynode@"}],
  "blocktime": 60
}'
```

---

## Currency Lifecycle

Every currency goes through a lifecycle from definition to active trading:

```
  ┌──────────┐     ┌──────────────┐     ┌────────┐     ┌───────┐
  │  Define   │ ──→ │ Preconvert   │ ──→ │ Launch │ ──→ │ Trade │
  │           │     │ (optional)   │     │        │     │       │
  └──────────┘     └──────────────┘     └────────┘     └───────┘
```

### 1. Define

You call `definecurrency` with your parameters. This creates a pending currency definition on the blockchain. The currency is not yet active.

**Requirements:**
- You must own the VerusID matching the currency name
- That identity must not already have an active currency
- You must pay the definition fee

### 2. Preconvert (Fractional Baskets Only)

For basket currencies, there's a **preconversion period** before launch. During this time, people can contribute reserve currencies in exchange for basket tokens at the initial price.

Key preconversion parameters:
- **minpreconversion** — Minimum reserves needed for the currency to launch. If not met, contributors are refunded.
- **maxpreconversion** — Maximum reserves accepted (caps participation)
- **prelaunchdiscount** — Early contributors can get a discount
- **prelaunchcarveout** — Percentage of preconverted reserves kept by the creator

### 3. Launch

Once the preconversion period ends (at the specified `startblock`), the currency activates. For baskets, the initial price is determined by the ratio of contributed reserves to initial supply.

### 4. Trade

After launch:
- **Simple tokens** can be sent via `sendcurrency`
- **Basket currencies** can be converted to/from their reserves via `sendcurrency` using the built-in AMM
- **PBaaS chains** operate independently with cross-chain bridges back to Verus

---

## Currency as Namespace

When you define a currency, its name becomes a **namespace** for identities. This means:

- People can register SubIDs under your currency's name (e.g., `user.mycurrency@`)
- You control the registration fee via `idregistrationfees`
- You control referral levels via `idreferrallevels`

This creates a natural business model: launch a currency, set a SubID registration fee, and earn revenue as people register identities in your namespace.

```
mycurrency (currency + namespace)
├── alice.mycurrency@     ← pays idregistrationfees
├── bob.mycurrency@       ← pays idregistrationfees
└── service.mycurrency@   ← pays idregistrationfees
```

---

## Minting and Burning (Centralized Tokens)

For tokens with `proofprotocol: 2`, the identity holder can:

- **Mint** new tokens — increasing total supply
- **Burn** tokens — decreasing total supply

This is done through `sendcurrency` with special mint/burn operations. The identity holder acts as the central authority for supply management.

**Important:** Only the identity that matches the currency name can mint/burn. If `mytoken@` is the currency, only the holder of the `mytoken` VerusID can mint or burn `mytoken` tokens.

This makes centralized tokens on Verus **accountable** — there's always a known identity behind the supply decisions, unlike anonymous smart contract deployments on other chains.

---

## Costs to Launch

| Currency Type | Network | Approximate Cost |
|---|---|---|
| Simple Token | Mainnet | 200 VRSC |
| Simple Token | Testnet | 200 VRSCTEST |
| Fractional Basket | Mainnet | 200 VRSC |
| Fractional Basket | Testnet | 200 VRSCTEST |
| PBaaS Chain | Mainnet | 10,000 VRSC |
| PBaaS Chain | Testnet | 10,000 VRSCTEST |

*Plus the cost of a VerusID (~100 VRSC for a root ID on mainnet, 80 with referral (as low as ~20 net with a full referral chain)). Free IDs available via Valu; subIDs and PBaaS chain IDs can cost pennies or less.*

**Where the fees go:**
- **Token/Basket (200 VRSC):** Goes to Verus miners and stakers
- **PBaaS Chain (10,000 VRSC):** 5,000 goes to Verus block producers, 5,000 goes to block producers of the newly launched chain

These fees serve as an anti-spam measure — launching a currency should be a deliberate act, not something done carelessly.

---

## Options Bitfield Reference

The `options` parameter is a bitfield. Combine flags by adding their values:

| Flag | Value (decimal) | Hex | Meaning |
|---|---|---|---|
| OPTION_FRACTIONAL | 1 | 0x01 | Fractional reserve basket |
| OPTION_ID_ISRESTRICTED | 2 | 0x02 | Only the controlling ID (rootID) can create subIDs |
| OPTION_ID_STAKING | 4 | 0x04 | All IDs on chain stake equally (ID-based staking, not value-based) |
| OPTION_ID_REFERRALS | 8 | 0x08 | Enable ID referral rewards |
| OPTION_ID_REFERRALSREQUIRED | 16 | 0x10 | Referral required to register an ID |
| OPTION_TOKEN | 32 | 0x20 | Is a token (not a native coin) |
| OPTION_SINGLECURRENCY | 64 | 0x40 | Restrict PBaaS chain or gateway to single currency |
| OPTION_GATEWAY | 128 | 0x80 | Is a gateway currency |
| OPTION_IS_PBAAS_CHAIN | 256 | 0x100 | Is a PBaaS blockchain |
| OPTION_GATEWAY_CONVERTER | 512 | 0x200 | Is a gateway converter |
| OPTION_GATEWAY_NAMECONTROLLER | 1024 | 0x400 | Gateway name controller |
| OPTION_NFT_TOKEN | 2048 | 0x800 | Single-satoshi NFT with tokenized control of root ID |

**Common combinations:**
- **32** (TOKEN) — Simple token
- **33** (FRACTIONAL + TOKEN) — Basket currency
- **40** (TOKEN + IDREFERRALS) — Token with ID referrals
- **41** (FRACTIONAL + TOKEN + IDREFERRALS) — Basket with referrals
- **264** (IS_PBAAS_CHAIN + IDREFERRALS) — PBaaS chain with referrals

---

## Key Takeaways

1. **No code required** — Currency creation is a single CLI command, not a smart contract deployment.
2. **Three tiers** — Simple tokens for basic assets, baskets for DeFi, PBaaS chains for full blockchains.
3. **Identity-linked** — Every currency is tied to a VerusID, ensuring accountability.
4. **Namespace bonus** — Every currency automatically becomes a namespace for SubID registration.
5. **Configurable supply** — Choose between fixed supply (proofprotocol 1) or centrally managed (proofprotocol 2).

---

## Related Commands

- [definecurrency](../command-reference/multichain/definecurrency.md) — Create a new currency
- [getcurrency](../command-reference/multichain/getcurrency.md) — Look up currency details
- [listcurrencies](../command-reference/multichain/listcurrencies.md) — List all currencies
- [sendcurrency](../command-reference/multichain/sendcurrency.md) — Send, convert, and trade currencies
- [getidentity](../command-reference/identity/getidentity.md) — Check the identity behind a currency

---

*As of Verus v1.2.x.*
