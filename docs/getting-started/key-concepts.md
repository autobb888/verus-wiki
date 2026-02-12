# Key Concepts

A quick tour of what makes Verus unique. Each topic links to a deeper guide.

## VRSC — The Native Currency

**VRSC** is the native coin of the Verus network. It's used for transaction fees, staking, mining rewards, VerusID registration, and as reserve backing for basket currencies. Total supply is uncapped but emission is predictable and decreasing.

## VerusID — Self-Sovereign Identity

VerusID is an on-chain identity system built directly into the protocol. A VerusID like `YourName@` gives you:

- **A human-readable address** — people send to `YourName@` instead of `RKjh38dkj2...`
- **Revocability & recoverability** — lost keys can be rotated without losing your identity
- **Multisig** — require multiple signatures for spending
- **Private addresses** — built-in shielded address for private transactions
- **On-chain data** — store a content hash (for attestations, references, etc.)

👉 [VerusID In Depth](../concepts/identity-system.md) · [Register a VerusID](../how-to/create-verusid.md)

## Currencies, Tokens & Baskets

Anyone can launch currencies on Verus — no smart contracts or programming required:

- **Tokens** — Simple currencies backed by nothing (or a fixed supply)
- **Basket currencies** — Backed by reserves of other currencies with automatic on-chain conversion via fractional reserve
- **Mapped currencies** — Represent external assets (bridges)

The protocol handles all conversions through its built-in **DeFi engine** — no DEX, no AMM contracts, no oracles. It's consensus-level.

👉 [Currencies & Tokens](../concepts/currencies-and-tokens.md) · [Launch a Currency](../how-to/launch-token.md)

## Mining & Staking (50/50 Hybrid)

Verus uses **Proof of Power (PoP)** — a hybrid consensus that alternates between:

- **50% Proof of Work** — mining with [VerusHash 2.2](https://verus.io/mining), designed to be competitive on CPUs
- **50% Proof of Stake** — staking VRSC to earn rewards

This means half of all blocks are mined, half are staked. You can do either or both.

👉 [How to Mine VRSC](../how-to/mine-vrsc.md) · [How to Stake VRSC](../how-to/stake-vrsc.md)

## Privacy — Transparent & Shielded

Verus supports both transparent and shielded (private) transactions using **Sapling zero-knowledge proofs**:

- **Transparent** (`R...` addresses) — like Bitcoin, visible on-chain
- **Shielded** (`zs...` addresses) — sender, receiver, and amount are all hidden

You can mix and match: shield coins when you want privacy, use transparent when you don't.

👉 [Privacy & Shielded Transactions](../concepts/privacy-shielded-tx.md) · [Send a Private Transaction](../how-to/send-private-transaction.md)

## Cross-Chain — PBaaS & Bridges

**PBaaS (Public Blockchains as a Service)** lets anyone launch independent blockchains that are connected to Verus:

- New chains inherit Verus protocol features (VerusID, currencies, privacy)
- Cross-chain currency transfers happen trustlessly via **notarization**
- The **Ethereum Bridge** connects Verus to Ethereum for cross-ecosystem transfers

👉 [Bridge & Cross-Chain](../concepts/bridge-and-crosschain.md)

## Summary Map

| Concept | What It Does | Learn More |
|---------|-------------|------------|
| VRSC | Native currency | [Wallet Setup](wallet-setup.md) |
| VerusID | On-chain identity | [Concepts](../concepts/identity-system.md) |
| Currencies | User-launched tokens & baskets | [Concepts](../concepts/currencies-and-tokens.md) |
| Mining/Staking | 50/50 hybrid consensus | [Mine](../how-to/mine-vrsc.md) · [Stake](../how-to/stake-vrsc.md) |
| Privacy | Shielded transactions | [Concepts](../concepts/privacy-shielded-tx.md) |
| PBaaS / Bridge | Launch blockchains, Ethereum connectivity | [Concepts](../concepts/bridge-and-crosschain.md) |

## Next Steps

Ready to dive deeper? Pick a concept above, or explore:

- [Command Reference](../command-reference/blockchain.md) — All CLI commands
- [How-To Guides](../how-to/create-verusid.md) — Step-by-step tutorials
- [Troubleshooting](../troubleshooting/sync-issues.md) — Common issues and fixes
