# The Verus Identity System

> Understanding VerusID — self-sovereign, on-chain, human-readable identity

---

## What Is a VerusID?

A VerusID is a blockchain-native identity. Unlike a wallet address (a string of random characters), a VerusID has a **human-readable name** like `alice@` that maps permanently to a cryptographic identity address (an "i-address" like `i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129`).

Think of it as **a domain name + a bank account + a passport**, all in one:

- **Domain name:** A friendly name anyone can look up
- **Bank account:** Can hold and send funds
- **Passport:** Cryptographically proves who you are

The critical difference from traditional accounts: **no company controls it**. Once registered, your VerusID exists on the blockchain. No one can ban, freeze, or delete it — not even the Verus developers.

```
Traditional Account:
  You → Platform → Your Data
         ↓
  (Platform can lock you out)

VerusID:
  You → Blockchain → Your Data
         ↓
  (No single point of failure)
```

---

## Anatomy of a VerusID

When you look up an identity with [getidentity](../command-reference/identity/getidentity.md), you see its full structure. Here are the key components:

### Name and Addresses

Every VerusID has:

- **Name** — The human-readable part (e.g., `alice`)
- **Fully qualified name** — Includes the chain namespace (e.g., `alice.VRSCTEST@` on testnet, `alice@` on mainnet)
- **Identity address (i-address)** — A permanent, deterministic address derived from the name. This never changes, even if the identity is updated.
- **Primary addresses** — One or more standard addresses (R-addresses) that control the identity. These *can* be changed.

### Primary Addresses and Multisig

A VerusID can have **multiple primary addresses** and a **minimum signature threshold**. This enables multisig control:

```
Single-sig (default):
  primaryaddresses: ["R_address_1"]
  minimumsignatures: 1
  → One key controls everything

2-of-3 Multisig:
  primaryaddresses: ["R_addr_1", "R_addr_2", "R_addr_3"]
  minimumsignatures: 2
  → Any two of three keyholders must agree
```

This is powerful for organizations, shared treasuries, or high-security setups. You can change your primary addresses at any time by updating the identity — so if a key is compromised, you can rotate it out without losing your name or identity.

### Revocation and Recovery Authorities

Every VerusID has two special authorities:

- **Revocation authority** — An identity that can revoke (disable) this ID
- **Recovery authority** — An identity that can recover (re-enable) a revoked ID and assign new keys

By default, both point to the identity itself. But you can set them to *different* identities for security:

```
┌──────────────────────┐
│  alice@               │
│  Revocation: bob@     │  ← Bob can disable Alice's ID if compromised
│  Recovery: carol@     │  ← Carol can restore it with new keys
└──────────────────────┘
```

**Why this matters:** In traditional crypto, if your private key is stolen, your funds are gone forever. With VerusID, your recovery authority can revoke the compromised identity and restore control to you with new keys. It's like having a trusted friend who can freeze your credit card and issue you a new one.

**Important constraints:**
- Only the current **revocation authority** can change the revocation authority
- Only the current **recovery authority** can change the recovery authority
- This prevents an attacker who compromises your primary keys from reassigning these safety nets

**Best practice:** Set revocation and recovery to *different* identities that you control with separate keys, ideally stored in different locations. If all three (identity, revocation, recovery) share the same keys, you lose the safety net.

---

## Content Multimap: On-Chain Data Storage

Every VerusID includes a **content multimap** — a key-value data store that lives directly on the blockchain. Keys are VDXF addresses (standardized identifiers in the Verus Data eXchange Format), and values can be any hex-encoded data.

```
┌─────────────────────────────────────────┐
│  Identity: myagent@                     │
├─────────────────────────────────────────┤
│  contentmultimap:                       │
│  ├─ iK7a5FEI...  →  "agent profile v1" │
│  ├─ i8bC2xPQ...  →  "public key data"  │
│  └─ iD9eR3vW...  →  "service listing"  │
└─────────────────────────────────────────┘
```

VDXF keys are created deterministically from human-readable strings. For example, `vrsc::system.agent.profile` always maps to the same i-address. This means anyone who knows the key name can look up the data — it's a universal namespace.

**Use cases for content multimap:**
- Store public agent profiles or service descriptions
- Publish public keys for encrypted communication
- Attach metadata (website links, social handles, configuration)
- Create attestations (proof of qualification, membership)

The content multimap is **versioned** — every update creates a new on-chain transaction. You can look up any historical version of an identity using [getidentity](../command-reference/identity/getidentity.md) with a specific block height. This creates an immutable audit trail: data can be updated but never erased from history.

---

## VerusID vs. Traditional Accounts and Wallets

| Feature | Traditional Wallet | Platform Account | VerusID |
|---------|-------------------|------------------|---------|
| Human-readable name | ❌ (hex address) | ✅ (username) | ✅ (on-chain name) |
| Self-sovereign | ✅ | ❌ (platform owns it) | ✅ |
| Key recovery | ❌ (lose key = lose funds) | ✅ (password reset) | ✅ (recovery authority) |
| On-chain data storage | ❌ | ❌ | ✅ (content multimap) |
| Multisig built-in | Varies | ❌ | ✅ |
| Can launch currencies | ❌ | ❌ | ✅ |
| Works across chains | ❌ | ❌ | ✅ (PBaaS ecosystem) |
| Can be censored | ❌ | ✅ | ❌ |

The key insight: VerusID combines the **self-sovereignty of a wallet** (no one can take it from you) with the **usability of a platform account** (human-readable name, key recovery) and adds capabilities neither has (on-chain data, currency creation).

---

## SubIDs and Namespaces

### Name Qualification and Hierarchy

Understanding how names resolve is essential:

```
Format:              Resolves to:
─────────────────────────────────────────────
alice@               Top-level identity "alice" on current chain
alice.VRSCTEST@      Same as alice@ on testnet (fully qualified)
alice.agentplatform@ SubID "alice" under "agentplatform" namespace
alice.VRSC@          Same as alice@ on mainnet (fully qualified)
```

**Key rule:** `alice@` and `alice.agentplatform@` are *completely different identities*. The first is a top-level ID; the second is a SubID under agentplatform. If you use the wrong form, you'll get "Identity not found."

On testnet, the system appends `.VRSCTEST` to fully qualified names, so `ari@` displays as `ari.VRSCTEST@` in the `fullyqualifiedname` field. On mainnet, top-level names show as `alice.VRSC@` in fully qualified form but can be referenced simply as `alice@`.

### Namespaces

Every VerusID exists within a **namespace** — the chain or identity that serves as its parent. On the Verus mainnet, top-level identities like `alice@` are in the `VRSC` namespace. On testnet, they're in the `VRSCTEST` namespace, appearing as `alice.VRSCTEST@`.

When you launch a currency or PBaaS chain, that currency's name becomes a new namespace. Anyone can register identities within it (if allowed by the currency's configuration).

### SubIDs

A SubID is an identity registered *under* another identity's namespace. For example, if `agentplatform@` exists and has an active currency, someone could register `alice.agentplatform@`.

```
Namespace hierarchy:

VRSC (root)
├── alice@                    ← Top-level identity
├── agentplatform@            ← Identity with active currency
│   ├── alice.agentplatform@  ← SubID
│   ├── bob.agentplatform@    ← SubID
│   └── service.agentplatform@← SubID
└── mypbaas@                  ← PBaaS chain namespace
    ├── user1.mypbaas@        ← Identity on that chain
    └── user2.mypbaas@
```

SubIDs are useful for:
- **Platforms** that want to issue identities to users under their brand
- **Organizations** managing member identities
- **Applications** that need named, on-chain identities for components

The identity that owns the namespace controls the **registration fee** for SubIDs. This is set via [definecurrency](../command-reference/multichain/definecurrency.md) with the `idregistrationfees` parameter.

---

## Identity Registration and Costs

### How Registration Works

Registering a VerusID is a two-step process to prevent front-running:

1. **Name commitment** — You broadcast a commitment transaction that contains a hash of the desired name plus a secret salt. This locks in your claim without revealing the name. (See `registernamecommitment`)
2. **Identity registration** — After the commitment is confirmed (1 block), you broadcast the actual registration using the commitment's transaction ID and salt. (See `registeridentity`)

This two-step process ensures no one can see your desired name and race to register it first.

### Costs

| Network | Top-level ID Cost | Notes |
|---------|-------------------|-------|
| Mainnet root ID (VRSC) | 100 VRSC | 80 VRSC with referral (referrer gets 20 VRSC) |
| Testnet (VRSCTEST) | 100 VRSCTEST | Free testnet coins available from faucet |
| PBaaS / basket chains | Varies | Some chains charge pennies for IDs |
| SubIDs | Set by namespace owner | Can be fractions of a cent |
| Valu community program | Free | Free root IDs on mainnet via the Verus Discord `#valu` channel (`/getid` command) |

For SubIDs, the cost is set by the parent currency's `idregistrationfees` parameter. Verus uses 8 decimal places (satoshi values), so fees can potentially go very low. The 0.0001 VRSC standard transaction fee always applies on top.

### Referral System

When registering a root identity, you can specify a **referral identity**. This activates a multi-level referral chain that reduces the registrant's cost and rewards referrers.

**How it works:**

The registration fee (e.g., 100 VRSC) is divided into **(levels + 2) equal parts**, where "levels" is the `idreferrallevels` setting on the currency (min 0, max 5, **default 3**):

| `idreferrallevels` | Parts | Each part | Registrant discount | Registrant pays |
|---|---|---|---|---|
| 0 | 2 | 1/2 = 50 VRSC | 50 VRSC | 50 VRSC |
| 1 | 3 | 1/3 ≈ 33.3 VRSC | 33.3 VRSC | ~66.7 VRSC |
| 2 | 4 | 1/4 = 25 VRSC | 25 VRSC | 75 VRSC |
| **3 (default)** | **5** | **1/5 = 20 VRSC** | **20 VRSC** | **80 VRSC** |
| 4 | 6 | 1/6 ≈ 16.7 VRSC | 16.7 VRSC | ~83.3 VRSC |
| 5 | 7 | 1/7 ≈ 14.3 VRSC | 14.3 VRSC | ~85.7 VRSC |

The parts are distributed as follows:
1. **1 part → discount** (registrant pays less)
2. **1 part → burned / to rootID** (miners/stakers)
3. **1 part per referral level** → each referrer in the chain

If a referral level is **unfilled** (the chain isn't deep enough), that level's portion goes to miners/stakers instead.

Referral rewards are sent to each referrer's **i-address** (not their R-address).

**Example — `idreferrallevels=3` with a 2-level chain (verified on VRSCTEST):**

We registered `AgentOversight@` using `SafeChat@` as referrer. SafeChat@ was registered using `Verus Coin Foundation@` as referrer. The fee split into 5 parts of 20 VRSC each:

| Recipient | Amount | Role |
|---|---|---|
| Discount | 20 VRSC | Registrant pays 80 instead of 100 |
| SafeChat@ (i-address) | 20 VRSC | Level 1 referrer (direct) |
| Verus Coin Foundation@ (i-address) | 20 VRSC | Level 2 (SafeChat's referrer) |
| Miners/stakers | 20 VRSC | Burned/to rootID |
| Miners/stakers | 20 VRSC | Unfilled level 3 (no deeper chain) |
| **Total** | **100 VRSC** | |

**Power user strategy:** If you own a chain of 3 identities (A → B → C, each referred the next), registering a 4th identity D using C as referrer costs 80 VRSC — but 60 VRSC flows back to your own identities (20 to C, 20 to B, 20 to A). Your **net cost is only ~20 VRSC** (the burned/rootID portion that goes to miners).

| Referral depth (levels=3) | Registrant pays | Back to your IDs | Net cost |
|---|---|---|---|
| No referral used | 100 VRSC | 0 | 100 VRSC |
| 1 level filled | 80 VRSC | 20 VRSC | 60 VRSC |
| 2 levels filled | 80 VRSC | 40 VRSC | 40 VRSC |
| 3 levels filled (full chain) | 80 VRSC | 60 VRSC | **20 VRSC** |

Note: The referral chain is visible on the public blockchain.

**Command syntax:**
```bash
verus registernamecommitment "newname" "controladdress" "referralidentity" "" "sourceoffunds"
```

The third parameter (`referralidentity`) accepts a friendly name like `SafeChat@` or an i-address.

To enable referrals on your own currency, add `"options": 8` (IDREFERRALS flag) to `definecurrency` and set `idreferrallevels` (0-5).

*(Source: [docs.verus.io — Defining Parameters](https://docs.verus.io/currencies/launch-currency.html#defining-parameters))*

---

## Real-World Analogies

To tie it all together, here's how VerusID maps to familiar concepts:

| Real World | VerusID Equivalent |
|---|---|
| Your legal name | Identity name (`alice@`) |
| Government ID number | i-address (`i4aNjr...`) |
| Home address (can change) | Primary addresses (R-addresses) |
| Power of attorney | Revocation/recovery authorities |
| Business card | Content multimap data |
| Company with employees | Namespace with SubIDs |
| Notarized document | Identity transaction (on-chain, timestamped) |

---

## Additional Features

### Private Address (z-address)

Each VerusID can optionally have attached **private z-addresses** (Sapling shielded addresses). This enables receiving private, shielded transactions directly to your VerusID. See [Privacy & Shielded Transactions](privacy-shielded-tx.md).

### Verus Vault (Timelocking)

**Verus Vault** allows you to lock funds on your VerusID with a time delay. When locked:
- Funds cannot be spent until the timelock expires
- The identity can still stake its locked coins ("safe staking")
- Useful for trusts, vesting schedules, and protecting large holdings from theft

### Signatures

VerusIDs can create **unforgeable, verifiable signatures** on files, hashes, and messages. Anyone can verify the signature against the on-chain identity — providing non-repudiation tied to a human-readable name.

### VerusID Login (SSID)

VerusID supports **passwordless login** to supported services. Instead of creating a username and password, you authenticate with your VerusID — proving ownership of the identity without exposing any private keys. This is similar to "Sign in with Google" but self-sovereign and decentralized.

### Marketplace

VerusIDs, currencies, and tokens can be traded on the **peer-to-peer on-chain marketplace** using atomic offers. See [Marketplace and Offers](marketplace-and-offers.md).

### Name Restrictions

VerusID names can include all characters from all character sets **except**: `/ : * ? " < > | @ .` — names are case-insensitive.

---

## Key Takeaways

1. **VerusID is more than a wallet** — it's a complete identity system with naming, key management, data storage, and recovery built in.
2. **You own it** — Only you (or your designated revocation authority) can revoke your identity. No external party can shut it down.
3. **It's recoverable** — Unlike traditional crypto wallets, compromised keys don't mean permanent loss.
4. **It's a namespace** — Your identity can become a platform for SubIDs and currencies.
5. **It's an on-chain database** — The content multimap lets you publish verifiable data tied to your identity.

---

## Related Commands

- [getidentity](../command-reference/identity/getidentity.md) — Look up any identity's full details
- [registernamecommitment](../command-reference/identity/registernamecommitment.md) — First step to register a new identity
- [listidentities](../command-reference/identity/listidentities.md) — List identities in your wallet
- [definecurrency](../command-reference/multichain/definecurrency.md) — Launch a currency under your identity's namespace

---

*As of Verus v1.2.x. Identity protocol version 3.*
