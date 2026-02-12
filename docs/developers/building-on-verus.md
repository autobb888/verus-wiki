# Developer Guide: Building on Verus

> What you can build on Verus and how the pieces fit together.

---

## What Makes Verus Different

Verus isn't just a cryptocurrency — it's a protocol with built-in primitives that other chains require smart contracts for:

| Primitive | Built Into Verus | On Ethereum |
|-----------|-----------------|-------------|
| Identity (naming, auth) | ✅ VerusID | ❌ Requires ENS + separate auth |
| On-chain data storage | ✅ contentmultimap | ❌ Requires IPFS + smart contract |
| Token creation | ✅ `definecurrency` | ❌ Requires ERC-20 contract |
| DEX / AMM | ✅ Native conversions | ❌ Requires Uniswap-style contract |
| Multi-chain | ✅ PBaaS | ❌ Requires bridges |
| Multisig | ✅ Built into every ID | ⚠️ Requires multisig wallet contract |
| Key recovery | ✅ Recovery authority | ❌ Not possible |

This means: **less code, fewer attack surfaces, no gas fee surprises.**

---

## Project Categories

### 1. Identity-Based Applications

VerusID provides naming, authentication, data storage, and key recovery — all on-chain.

**What you can build:**
- **Login with VerusID** — Replace username/password with cryptographic identity
- **Reputation systems** — Store ratings and endorsements in contentmultimap
- **Credential verification** — Attestations stored on-chain with VDXF keys
- **Profile platforms** — Decentralized user profiles (like Gravatar, but self-sovereign)

**Key APIs:**
- [getidentity](../command-reference/identity.md#getidentity) — Look up identity data
- [updateidentity](../command-reference/identity.md#updateidentity) — Store data on-chain
- [signmessage](../command-reference/identity.md#signmessage) / [verifymessage](../command-reference/identity.md#verifymessage) — Prove identity ownership
- [getvdxfid](../command-reference/vdxf.md#getvdxfid) — Create standardized data keys

**Example: Login Flow**
```
1. App presents challenge string
2. User signs challenge with their VerusID
3. App verifies signature → user authenticated
```

```python
# Server generates challenge
challenge = f"Login to MyApp at {timestamp}"

# User signs (client-side)
# verus signmessage "user@" "Login to MyApp at 1770422400"

# Server verifies
result = rpc("verifymessage", ["user@", signature, challenge])
assert result == True
```

### 2. Token and Currency Projects

Verus lets anyone create currencies, tokens, and liquidity pools with a single command.

**What you can build:**
- **Community tokens** — Loyalty points, governance tokens, game currencies
- **Stablecoins** — Basket currencies backed by multiple reserves
- **Liquidity pools** — Automated market makers with built-in conversions
- **Fundraising** — Token launches with configurable supply and pricing

**Key APIs:**
- [definecurrency](../command-reference/multichain.md#definecurrency) — Create new currencies
- [getcurrency](../command-reference/multichain.md#getcurrency) — Query currency details
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — Send and convert currencies
- [estimateconversion](../command-reference/multichain.md#estimateconversion) — Preview conversion rates

**Example: Create a Simple Token**
```bash
./verus definecurrency '{
  "name": "MYTOKEN",
  "options": 32,
  "currencies": ["VRSC"],
  "conversions": [1],
  "maxpreconversion": [10000],
  "preallocations": [{"myid@": 1000}]
}'
```

### 3. DeFi Integrations

Verus has a native DEX — no smart contracts needed.

**What you can build:**
- **Trading interfaces** — Frontends for Verus currency conversions
- **Arbitrage bots** — Monitor and exploit price differences
- **Portfolio trackers** — Track holdings across Verus currencies
- **Price oracles** — Read on-chain conversion rates

**Example: Price Monitor**
```python
def get_price(from_currency, to_currency):
    result = rpc("estimateconversion", [{
        "currency": from_currency,
        "convertto": to_currency,
        "amount": 1.0
    }])
    return result["estimatedcurrencyout"]

# Monitor price changes
while True:
    price = get_price("MYTOKEN", "VRSC")
    log_price(price)
    time.sleep(60)
```

### 4. Cross-Chain Applications

Verus's PBaaS (Public Blockchains as a Service) enables launching independent blockchains that interoperate with the Verus main chain.

**What you can build:**
- **Application-specific chains** — Your own blockchain with custom parameters
- **Cross-chain bridges** — Move assets between PBaaS chains
- **Multi-chain identity** — VerusIDs work across all PBaaS chains
- **Scalable platforms** — Offload traffic to a dedicated chain

**Key APIs:**
- [definecurrency](../command-reference/multichain.md#definecurrency) — Launch PBaaS chains
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — Cross-chain transfers
- [getcrosschain*](../command-reference/multichain.md) — Cross-chain state queries

### 5. Marketplace and Trading Platforms

**What you can build:**
- **Agent marketplace** — AI agents listing services with VerusID profiles (see [For Agents](../for-agents/agent-bootstrap.md))
- **Freelance platform** — Identity-verified service providers with on-chain reputation
- **NFT-style collectibles** — Unique tokens under identity namespaces
- **Subscription services** — Recurring payments via sendcurrency

**Example: Agent Service Listing**
```python
# Store service listing in agent's contentmultimap
services_hex = encode_hex(json.dumps([
    {"id": "code-review", "price": {"amount": 5, "currency": "VRSC"}},
    {"id": "documentation", "price": {"amount": 10, "currency": "VRSC"}}
]))

rpc("updateidentity", [{
    "name": "myagent",
    "contentmultimap": {
        SERVICES_VDXF_KEY: [services_hex]
    }
}])
```

---

## Architecture Patterns

### Minimal Stack

```
Your App  ──RPC──▶  verusd
```

No database needed for basic operations. The blockchain IS your database for identity data, balances, and transaction history.

### Production Stack

```
Frontend  ──API──▶  Your Backend  ──RPC──▶  verusd
                         │
                    Cache / DB
                  (for indexing)
```

Add a cache/database layer when you need:
- Fast search across many identities
- Historical analytics
- Custom indexing (e.g., by capability, by currency)

---

## Getting Started

1. **Set up testnet** — [Testnet Guide](./testnet-guide.md)
2. **Learn the API** — [RPC API Overview](./rpc-api-overview.md)
3. **Study the patterns** — [Integration Patterns](./integration-patterns.md)
4. **Build something** — Start small, iterate
5. **Deploy to mainnet** — When confident

---

## See Also

- [Identity System](../concepts/identity-system.md) — Deep dive on VerusID
- [For Agents](../for-agents/agent-bootstrap.md) — AI agent integration
- [Testnet Guide](./testnet-guide.md) — Safe development environment

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
