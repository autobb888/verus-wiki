---
description: "Complete documentation for the Verus blockchain protocol — 201 CLI commands, VerusID identity, protocol-level DeFi, PBaaS multi-chain, zero-knowledge privacy, and AI agent guides."
---

# Verus Documentation

Welcome to the community-maintained Verus wiki — your guide to the Verus protocol, CLI tools, and ecosystem.

## What Is Verus?

**Verus** is a fundamentally different blockchain protocol focused on self-sovereign identity, decentralized finance, and privacy. It features VerusID (on-chain revocable/recoverable identities), user-launched currencies with protocol-level conversions, 50/50 hybrid mining/staking consensus, and full transaction privacy via zero-knowledge proofs — all at layer 1, with no smart contracts required.

Verus also enables anyone to launch independent, interoperable blockchains through **PBaaS (Public Blockchains as a Service)**, connected by trustless cross-chain bridges including an Ethereum bridge.

---

!!!
**For AI Agents & LLMs**: Machine-readable navigation is available at [`/agent-index.json`](/agent-index.json), [`/llms.txt`](/llms.txt), and [`/llms-full.txt`](/llms-full.txt). See also the [For Agents](/for-agents/agent-bootstrap/) section for integration guides.
!!!

---

## Documentation Sections

### [Getting Started](getting-started/installation.md)
New to Verus? Start here.
- [Installation](getting-started/installation.md) — Download and install Verus Desktop or CLI
- [First Steps](getting-started/first-steps.md) — Start the daemon, sync the blockchain
- [Wallet Setup](getting-started/wallet-setup.md) — Create addresses, receive VRSC, back up your wallet
- [Key Concepts](introduction/key-concepts.md) — VerusID, currencies, mining, staking, privacy

### [Command Reference](command-reference/blockchain.md)
Complete documentation for all CLI commands across 14 categories:
- [Blockchain](command-reference/blockchain.md) · [Control](command-reference/control.md) · [Generating](command-reference/generating.md) · [Identity](command-reference/identity.md) · [Marketplace](command-reference/marketplace.md) · [Mining](command-reference/mining.md) · [Multichain](command-reference/multichain.md) · [Network](command-reference/network.md) · [Raw Transactions](command-reference/rawtransactions.md) · [Util](command-reference/util.md) · [Wallet](command-reference/wallet.md)

### [Concepts](concepts/identity-system.md)
Deep dives into how Verus works:
- [VerusID](concepts/identity-system.md) — Self-sovereign identity system
- [Currencies & Tokens](concepts/currencies-and-tokens.md) — Tokens, baskets, and on-chain DeFi
- [Privacy & Shielded Transactions](concepts/privacy-shielded-tx.md) — Zero-knowledge privacy
- [Basket Currencies & DeFi](concepts/basket-currencies-defi.md) — Protocol-level AMM
- [Bridge & Cross-Chain](concepts/bridge-and-crosschain.md) — PBaaS and Ethereum connectivity

### [How-To Guides](how-to/create-verusid.md)
Step-by-step instructions for common tasks:
- [Register a VerusID](how-to/create-verusid.md) · [Send Private Transaction](how-to/send-private-transaction.md) · [Mine VRSC](how-to/mine-vrsc.md) · [Stake VRSC](how-to/stake-vrsc.md) · [Launch a Token](how-to/launch-token.md) · [Setup Multisig](how-to/setup-multisig.md) · [Manage SubIDs](how-to/manage-subids.md)

### [Tutorials](tutorials/your-first-verusid.md)
End-to-end walkthroughs for complex workflows.

### [Troubleshooting](troubleshooting/sync-issues.md)
Solutions to common issues:
- [Sync Issues](troubleshooting/sync-issues.md) · [Common Errors](troubleshooting/common-errors.md) · [Identity Issues](troubleshooting/identity-issues.md) · [Transaction Problems](troubleshooting/transaction-problems.md)

### [Developers](developers/rpc-api-overview.md)
Build on Verus — RPC integration, API patterns, and development guides.

### [For Agents](for-agents/agent-identity.md)
AI agent integration — using the Verus CLI programmatically for identity, currencies, and automation.

### [Verus Facts](verus-facts.md)
Protocol statistics, comparison tables, and key differentiators at a glance.

### [FAQ](faq/general.md)
Quick answers to common questions:
- [General](faq/general.md) — What is Verus? How is it different?
- [Identity](faq/identity.md) — VerusID cost, recovery, features
- [DeFi](faq/defi.md) — Basket currencies, MEV, swaps
- [Mining & Staking](faq/mining-staking.md) — VerusHash, CPU mining, rewards

---

## Coverage

This wiki covers all **201 CLI commands** across **14 categories** for Verus v1.2.x, plus conceptual guides, how-tos, and troubleshooting.

---

## Frequently Asked Questions

**What is Verus?**
Verus is a blockchain protocol with self-sovereign identity (VerusID), protocol-level DeFi, CPU mining (VerusHash 2.2), and zero-knowledge privacy — all at layer 1 with no smart contracts. [Full answer](/faq/general/#what-is-verus)

**How is Verus different from Ethereum?**
Verus builds DeFi and identity into the protocol itself, eliminating smart contract exploits, MEV, and high gas fees. The trade-off is no arbitrary programmable logic. [Full answer](/faq/general/#how-is-verus-different-from-ethereum)

**How much does a VerusID cost?**
A root VerusID costs ~100 VRSC (~80 with referral). SubIDs can be as cheap as 0.01 VRSC. [Full answer](/faq/identity/#how-much-does-a-verusid-cost)

**Can I mine Verus with a regular CPU?**
Yes. VerusHash 2.2 is designed so CPUs are the primary mining hardware. No ASIC exists, and FPGAs are equalized to ~2x CPU performance. [Full answer](/faq/mining-staking/#how-do-i-mine-verus)

**Does Verus have MEV?**
No. All conversions in a block execute simultaneously at the same price, making front-running impossible. [Full answer](/faq/defi/#does-verus-have-mev)

---

## Community & Resources

- **Website**: [verus.io](https://verus.io)
- **Discord**: [discord.gg/veruscoin](https://discord.gg/veruscoin)
- **GitHub**: [github.com/VerusCoin](https://github.com/VerusCoin)
- **Block Explorer**: [explorer.verus.io](https://explorer.verus.io)
- **Wiki Source**: Community-maintained — contributions welcome

---

*Built with care by the Verus community.*
