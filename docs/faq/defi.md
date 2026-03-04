---
label: DeFi
icon: sync
order: 80
description: "Frequently asked questions about Verus DeFi — basket currencies, protocol-level AMM, MEV resistance, and the Ethereum bridge."
---

# DeFi FAQ

Common questions about decentralized finance on Verus — how it works without smart contracts.

---

## How does Verus DeFi work without smart contracts?

**Verus DeFi is built directly into the protocol's consensus rules. The AMM, currency conversions, and token launches are validated by every node — like how Bitcoin validates "you can't spend coins you don't have."**

On Ethereum, DeFi runs in smart contracts — separate programs deployed on the blockchain that can have bugs, exploits, and admin keys. On Verus, the equivalent functionality is part of the node software itself:

| Ethereum DeFi | Verus DeFi |
|---------------|-----------|
| Smart contract (Solidity code) | Protocol consensus rules |
| Can have bugs/exploits | Same code secures every basket |
| Contract owner can change rules | Rules are fixed at launch |
| High gas costs | 0.0001 VRSC per transaction |
| Requires audit | No separate contract to audit |

This doesn't mean Verus is "better" for all use cases — you can't write arbitrary DeFi logic. But for the features it provides (AMM, token launch, conversions), the protocol-level approach eliminates entire categories of risk.

Learn more: [Basket Currencies and DeFi](/concepts/basket-currencies-defi/) | [Currencies and Tokens](/concepts/currencies-and-tokens/)

---

## What is a basket currency?

**A basket currency is a token backed by reserves of one or more other currencies, with automatic on-chain conversion via a protocol-level AMM. Think of it like a decentralized ETF.**

When someone buys a basket currency with one of its reserves, that reserve flows into the basket and new tokens are minted. When someone sells, tokens are burned and reserves flow out. The price adjusts automatically based on reserve ratios.

Example:
```
MYBASKET (basket currency)
├── Reserve: VRSC  (weight: 50%)
└── Reserve: USDC  (weight: 50%)

Buy MYBASKET with VRSC → VRSC enters reserves, MYBASKET minted
Sell MYBASKET for VRSC → MYBASKET burned, VRSC exits reserves
```

Basket currencies are created with a single CLI command (`definecurrency`) — no code required.

Learn more: [Basket Currencies and DeFi](/concepts/basket-currencies-defi/) | [How to Convert Currencies](/how-to/convert-currencies/)

---

## Does Verus have MEV?

**Verus is MEV-resistant by design. All currency conversions within a single block execute simultaneously at the same price, making front-running impossible.**

On Ethereum, miners/validators can reorder transactions to extract value (MEV). Bots watch the mempool and insert transactions before yours to profit from price changes. This is a major problem:

- **Sandwich attacks**: Bot buys before you, sells after you
- **Front-running**: Bot copies your trade at a better price
- **Back-running**: Bot trades immediately after a large order

On Verus, all conversions in a block are batched and executed at one price. There's no ordering advantage — a transaction submitted first gets the same price as one submitted last (within the same block). This eliminates the entire MEV category.

Learn more: [Basket Currencies and DeFi — MEV Resistance](/concepts/basket-currencies-defi/#mev-resistance-fair-pricing)

---

## How do I swap currencies on Verus?

**Use the `sendcurrency` command with a `convertto` parameter. The protocol handles the conversion through the basket currency's reserves.**

```bash
# Convert 100 VRSC to Bridge.vETH (via the basket currency)
verus sendcurrency '*' '[{"currency":"VRSC","convertto":"Bridge.vETH","amount":100,"address":"your_address@"}]'
```

You can estimate the conversion first:
```bash
verus estimateconversion '{"currency":"VRSC","convertto":"Bridge.vETH","amount":100}'
```

The conversion fee is typically 0.025% (set at currency launch). There's no slippage in the traditional sense — the price is determined by reserve ratios after all conversions in the block are applied.

Learn more: [How to Convert Currencies](/how-to/convert-currencies/)

---

## How do I launch a token on Verus?

**Use the `definecurrency` CLI command. No programming, no Solidity, no deployment scripts — just specify the parameters and the protocol creates it.**

Simple token:
```bash
verus -chain=vrsctest definecurrency '{"name":"MyToken","options":32,"preallocations":[{"my_address@":1000000}]}'
```

Basket currency (with reserves):
```bash
verus definecurrency '{"name":"MyBasket","currencies":["VRSC","Bridge.vETH"],"initialcontributions":[1000,5],"conversions":[1,1]}'
```

The token exists as a first-class protocol object — it can be sent, received, converted, and traded on the marketplace immediately.

Learn more: [How to Launch a Token](/how-to/launch-token/) | [Tutorial: Launch Your First Token](/tutorials/launch-your-first-token/)

---

## What is the Ethereum bridge?

**A trustless, decentralized bridge that connects Verus and Ethereum, allowing transfers of ETH, ERC-20 tokens, VRSC, and Verus currencies between the two networks.**

The bridge uses a notarization system — Verus notaries monitor both chains and confirm cross-chain transactions. No single entity controls the bridge; it's secured by the same consensus mechanism as the rest of the protocol.

What you can do:
- Send ETH and ERC-20 tokens from Ethereum to Verus
- Send VRSC and Verus currencies from Verus to Ethereum
- Use ETH and ERC-20 tokens in Verus DeFi (basket currencies)

Learn more: [How to Bridge from Ethereum](/how-to/bridge-from-ethereum/) | [Bridge and Cross-Chain](/concepts/bridge-and-crosschain/)
