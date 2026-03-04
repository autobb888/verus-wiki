---
label: General
icon: question
order: 100
description: "Frequently asked questions about the Verus blockchain — what it is, how it differs from Ethereum, and its origins."
---

# General FAQ

Common questions about the Verus protocol, answered directly.

---

## What is Verus?

**Verus is a blockchain protocol with self-sovereign identity, protocol-level DeFi, CPU mining, and zero-knowledge privacy — all built into layer 1 with no smart contracts.**

Verus (VRSC) launched in May 2018 as a fair launch with no ICO, no premine, and no developer tax. It provides features that most blockchains implement through smart contracts — identity, decentralized exchange, multi-chain interoperability, and privacy — directly at the protocol level, validated by every node in the network.

Key capabilities:
- **VerusID**: Human-readable, revocable, recoverable on-chain identity
- **Basket currencies**: Protocol-level AMM with MEV resistance
- **50/50 hybrid mining/staking**: CPU-mineable with VerusHash 2.2
- **Sapling privacy**: Full zero-knowledge shielded transactions
- **PBaaS**: Launch independent, interoperable blockchains
- **Ethereum bridge**: Trustless, decentralized bridge to Ethereum

Learn more: [Key Concepts](/getting-started/key-concepts/) | [The Hidden Power of Verus](/introduction/the-hidden-power-of-verus/)

---

## How is Verus different from Ethereum?

**Verus builds DeFi and identity into the protocol itself, while Ethereum relies on smart contracts. This eliminates contract exploits, MEV, and high gas fees.**

| Aspect | Verus | Ethereum |
|--------|-------|----------|
| DeFi | Protocol-level AMM | Smart contracts (Uniswap, etc.) |
| Identity | VerusID (protocol-native) | ENS (smart contract) |
| MEV | Resistant (simultaneous execution) | Rampant |
| Privacy | Sapling zk-SNARKs | No native privacy |
| Fees | ~0.0001 VRSC | Variable gas fees |
| Smart contracts | No (not needed) | Yes (EVM/Solidity) |
| Mining | CPU (VerusHash 2.2) | N/A (Proof of Stake) |
| Token launch | CLI command, no code | Requires Solidity contract |

The trade-off: Ethereum has a much larger ecosystem and supports arbitrary programmable logic. Verus's features are powerful but fixed — you can't write custom smart contract logic, because the protocol provides the most-needed features natively.

Learn more: [Verus Facts — Comparison Table](/verus-facts/#verus-vs-other-blockchains)

---

## Is Verus a fork of Zcash?

**Yes, originally. Verus forked from Komodo (which forked from Zcash), but has been so heavily modified that the codebase is now fundamentally different.**

The Zcash heritage gives Verus its Sapling zero-knowledge proof system for private transactions. However, Verus has added:

- An entirely new identity system (VerusID)
- Protocol-level DeFi (basket currencies and AMM)
- PBaaS multi-chain architecture
- VerusHash 2.2 mining algorithm
- A native marketplace with atomic swaps
- VDXF structured data standard
- On-chain file storage
- A trustless Ethereum bridge
- 201 CLI commands (vs ~80 in base Zcash)

The relationship is similar to how Android started from Linux — the foundation is there, but the end product is a different system entirely.

---

## Who created Verus?

**Verus was created by Michael Toutonghi, former VP and Technical Fellow at Microsoft, where he co-invented the .NET platform.**

The project launched in 2018 with a fair launch model: no ICO, no premine, no investor allocation, and no developer tax. Development is funded by the community. The protocol is open-source under the MIT license.

- **GitHub**: [github.com/VerusCoin](https://github.com/VerusCoin)
- **Website**: [verus.io](https://verus.io)

---

## Is Verus decentralized?

**Yes. Verus has no central authority, no admin keys, no governance token voting, and no way for developers to freeze or modify the protocol without a network-wide upgrade.**

Key decentralization properties:
- **Fair launch**: No premine or insider allocation
- **CPU mining**: VerusHash 2.2 keeps mining accessible to regular hardware
- **No smart contract admin**: Protocol features have no "owner" who can change rules
- **No dev tax**: Community-funded development
- **Hybrid consensus**: Both miners and stakers secure the network

---

## What is VRSC used for?

**VRSC is the native currency of Verus, used for transaction fees, VerusID registration, staking, mining rewards, and as reserve backing for basket currencies.**

Specific uses:
- **Transaction fees**: 0.0001 VRSC per transaction
- **VerusID registration**: ~100 VRSC for a root identity (~80 with referral)
- **SubID registration**: As low as 0.01 VRSC (set by namespace owner)
- **Staking**: Lock VRSC to earn block rewards
- **Mining rewards**: Earned by mining blocks with CPU
- **Currency reserves**: Used as reserve backing in basket currencies
- **Marketplace**: Buy and sell currencies, tokens, and identities

---

## How do I get started with Verus?

**Download the software, sync the blockchain, and create a wallet address. The whole process takes about 30 minutes (mostly waiting for sync).**

1. [Install Verus](/getting-started/installation/) — Download Verus Desktop (GUI) or CLI
2. [First Steps](/getting-started/first-steps/) — Start the daemon and sync
3. [Wallet Setup](/getting-started/wallet-setup/) — Create addresses and receive VRSC
4. [Key Concepts](/getting-started/key-concepts/) — Understand VerusID, currencies, mining, staking, privacy

For AI agents: [Agent Bootstrap Guide](/for-agents/agent-bootstrap/)
