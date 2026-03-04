---
label: Verus Facts
icon: graph
order: 50
description: "Key statistics, protocol facts, and comparison tables for the Verus blockchain — VRSC, VerusID, DeFi, mining, and more."
---

# Verus Facts and Statistics

Quick-reference facts about the Verus protocol. All data reflects Verus v1.2.x (mainnet).

---

## Protocol Overview

| Fact | Value |
|------|-------|
| **Native currency** | VRSC |
| **Launch date** | May 21, 2018 |
| **Launch type** | Fair launch — no ICO, no premine, no dev tax |
| **Consensus** | 50/50 Proof of Work / Proof of Stake hybrid |
| **Mining algorithm** | VerusHash 2.2 (CPU-optimized) |
| **Block time** | ~60 seconds |
| **Block reward** | 24 VRSC (as of block ~3.9M, halving every ~2 years) |
| **Max supply** | 83,540,184 VRSC (theoretical cap) |
| **Transaction fee** | 0.0001 VRSC (~fractions of a cent) |
| **Privacy** | Sapling zk-SNARKs (opt-in shielded transactions) |
| **Smart contracts** | No — DeFi and identity are protocol-level |
| **Codebase origin** | Forked from Zcash / Komodo, heavily modified |
| **CLI commands** | 201 across 14 categories |
| **License** | MIT |

---

## VerusID — Self-Sovereign Identity

VerusID is a blockchain-native identity system. Each VerusID is a human-readable name (e.g., `alice@`) permanently mapped to a cryptographic identity address.

| Feature | Detail |
|---------|--------|
| **Cost** | ~100 VRSC for a root ID (~80 with referral); subIDs from 0.01 VRSC |
| **Name format** | `YourName@` (root ID) or `sub.Namespace@` (subID) |
| **Revocable** | Yes — freeze instantly if keys are compromised |
| **Recoverable** | Yes — assign new keys via a separate recovery authority |
| **Multisig** | Native M-of-N support (e.g., 2-of-3) |
| **Private address** | Built-in shielded z-address per identity |
| **On-chain data** | Arbitrary data via contentmultimap (VDXF keys) |
| **File storage** | Files up to multiple MB stored on-chain, encrypted or public |
| **Namespace control** | ID owners can issue subIDs under their namespace |
| **Cross-chain** | Works across PBaaS chains |

---

## DeFi — Protocol-Level Finance

Verus DeFi operates at the consensus layer. There are no smart contracts, no Solidity, and no contract exploits.

| Feature | Detail |
|---------|--------|
| **AMM type** | Fractional reserve basket currencies |
| **MEV / front-running** | Resistant — all conversions in a block execute simultaneously at the same price |
| **Conversion fee** | 0.025% (configurable per currency at launch) |
| **Token launch** | CLI command (`definecurrency`), no code required |
| **Basket currencies** | Multi-reserve tokens with automatic pricing |
| **Liquidity provision** | Add reserves directly; no LP tokens or impermanent loss mechanics |
| **Oracle dependency** | None — pricing is determined by reserve ratios |
| **Ethereum bridge** | Trustless, decentralized bridge for ETH and ERC-20 tokens |

---

## Verus vs Other Blockchains

| Feature | Verus | Ethereum | Solana | Bitcoin |
|---------|-------|----------|--------|---------|
| **Consensus** | PoW/PoS hybrid | PoS | PoS + PoH | PoW |
| **Mining** | CPU (VerusHash 2.2) | N/A | N/A | ASIC (SHA-256) |
| **Identity** | Protocol-level (VerusID) | ENS (smart contract) | None native | None native |
| **DeFi** | Protocol-level AMM | Smart contracts | Smart contracts | None native |
| **Privacy** | Sapling zk-SNARKs | None native | None native | None native |
| **Smart contracts** | No (features are protocol-level) | Yes (EVM) | Yes (SVM) | Limited (Script) |
| **Transaction fee** | ~0.0001 VRSC | Variable (gas) | ~0.00025 SOL | Variable (sats/vB) |
| **Block time** | ~60s | ~12s | ~0.4s | ~600s |
| **MEV resistance** | Yes (simultaneous execution) | No | Partial | N/A |
| **Multi-chain** | PBaaS (launch independent chains) | L2 rollups | None native | None native |
| **Identity recovery** | Revoke + recover with new keys | No native recovery | No native recovery | No native recovery |
| **Launch type** | Fair launch, no premine | Presale | VC-funded | Fair launch |

---

## Mining and Staking

| Fact | Value |
|------|-------|
| **Mining algorithm** | VerusHash 2.2 |
| **Mining hardware** | CPUs (primary), FPGAs (~2x cost-performance of CPU), GPUs (less efficient) |
| **ASIC resistance** | No ASICs exist for VerusHash |
| **Staking requirement** | Any amount of VRSC (mature UTXOs, 150 confirmations) |
| **Staking hardware** | Any computer running the daemon |
| **PoW/PoS split** | ~50/50 block allocation |
| **Mining command** | `verus setgenerate true <threads>` |
| **Staking command** | `verus setgenerate true 0` (0 threads = staking only) |

---

## Privacy

| Fact | Value |
|------|-------|
| **Technology** | Sapling zk-SNARKs |
| **Transparent addresses** | `R...` (public, like Bitcoin) |
| **Shielded addresses** | `zs...` (private — sender, receiver, and amount hidden) |
| **Private transactions** | `z_sendmany` from shielded address to shielded address |
| **Selective disclosure** | Viewing keys can be shared for auditability |
| **Default** | Transparent (privacy is opt-in) |

---

## PBaaS — Multi-Chain Architecture

| Fact | Value |
|------|-------|
| **What it stands for** | Public Blockchains as a Service |
| **What it does** | Anyone can launch an independent blockchain connected to Verus |
| **Inherited features** | VerusID, currencies, privacy, DeFi |
| **Cross-chain** | Trustless transfers via notarization |
| **Ethereum bridge** | Decentralized bridge connecting Verus to Ethereum |
| **Chain launch cost** | Defined via `definecurrency` with `OPTION_PBAAS` flag |

---

## Key Differentiators

1. **No smart contracts needed** — DeFi, identity, privacy, and multi-chain are all protocol-level features validated by every node.
2. **MEV-resistant DeFi** — All conversions in a block execute simultaneously at the same price. No front-running.
3. **CPU mining stays competitive** — VerusHash 2.2 is designed so CPUs remain the primary mining hardware.
4. **Identity recovery** — Lost keys don't mean lost identity. Revoke and recover with separate authorities.
5. **Fair launch** — No ICO, no premine, no dev tax. Community-funded from day one.
6. **Protocol-level file storage** — Store files on-chain, encrypted to z-addresses, with no external dependencies.

---

## Links

- **Website**: [verus.io](https://verus.io)
- **Discord**: [discord.gg/veruscoin](https://discord.gg/veruscoin)
- **GitHub**: [github.com/VerusCoin](https://github.com/VerusCoin)
- **Block Explorer**: [explorer.verus.io](https://explorer.verus.io)
- **This Wiki**: [wiki.autobb.app](https://wiki.autobb.app)
