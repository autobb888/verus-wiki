---
label: Mining & Staking
icon: cpu
order: 70
description: "Frequently asked questions about Verus mining and staking — VerusHash 2.2, CPU mining, staking requirements, and rewards."
---

# Mining and Staking FAQ

Common questions about mining and staking on Verus.

---

## How do I mine Verus?

**Run `verus setgenerate true <threads>` on your Verus node. Verus uses VerusHash 2.2, a CPU-optimized algorithm — no GPU or ASIC needed.**

Quick start:
```bash
# Start mining with 4 CPU threads
verus setgenerate true 4

# Check mining status
verus getmininginfo

# Stop mining
verus setgenerate false
```

You can also use external mining software (like ccminer) to mine in a pool. Solo mining with the built-in miner works for testing but pool mining is more practical for consistent rewards.

Learn more: [How to Mine VRSC](/how-to/mine-vrsc/) | [Mining and Staking Concepts](/concepts/mining-and-staking/)

---

## What is VerusHash?

**VerusHash 2.2 is Verus's custom mining algorithm, designed to keep CPU mining competitive against specialized hardware (FPGAs and GPUs).**

Key properties:
- Uses AES and AVX instructions that map well to modern CPUs
- FPGAs can mine but are equalized to ~2x CPU cost-performance
- No ASICs exist for VerusHash
- GPUs can mine (via ccminer) but are generally less efficient than CPUs
- A modern desktop CPU can meaningfully participate in mining

This matters because CPU accessibility supports decentralization — anyone with a computer can mine, not just those who can afford specialized hardware.

---

## Can I stake VRSC?

**Yes. Any amount of VRSC can be staked. Just run the daemon and enable staking — no minimum, no lockup, no special hardware.**

```bash
# Enable staking (0 threads = staking only, no mining)
verus setgenerate true 0

# Or mine and stake simultaneously
verus setgenerate true 4
```

Requirements:
- VRSC in your wallet (any amount)
- UTXOs must be mature (150 confirmations, ~2.5 hours)
- Daemon running and synced
- Wallet unlocked (if encrypted)

The probability of finding a staking block is proportional to the size of your UTXOs. Larger UTXOs stake more frequently.

Learn more: [How to Stake VRSC](/how-to/stake-vrsc/)

---

## What are the mining/staking rewards?

**The block reward is 3 VRSC per block on mainnet (era 9, starting at block 3,381,840), plus the transaction fee pool. On testnet (VRSCTEST), the block reward is 6 VRSCTEST. Rewards halve approximately every 2 years (~1,051,920 blocks). Half of blocks go to miners, half to stakers.**

| Fact | Value |
|------|-------|
| Current block reward | 3 VRSC (mainnet) / 6 VRSCTEST (testnet) |
| Fee pool | Yes — transaction fees included in block reward |
| Block time | ~60 seconds |
| PoW/PoS split | ~50/50 |
| Halving schedule | Approximately every 2 years (~1,051,920 blocks) |
| Next halving | ~August 2026 |
| Max supply | 83,540,184 VRSC |

Miners earn the full block reward plus transaction fees for PoW blocks they find. Stakers earn the full block reward plus transaction fees for PoS blocks they validate. There is no developer tax or foundation cut.

---

## Do I need special hardware to mine?

**No. A modern desktop or laptop CPU is the primary mining hardware for Verus. Server CPUs with more cores will mine faster, but any CPU works.**

Hardware comparison:
- **CPUs**: Primary mining hardware (best cost-performance)
- **FPGAs**: Can mine, equalized to ~2x CPU efficiency
- **GPUs**: Can mine (ccminer), generally less efficient than CPUs
- **ASICs**: Don't exist for VerusHash 2.2

This is by design. VerusHash 2.2 was specifically engineered so that CPUs remain competitive, preventing the mining centralization seen in Bitcoin (where only large ASIC farms can compete).

---

## What is the 50/50 hybrid consensus?

**Verus alternates between Proof of Work and Proof of Stake blocks at roughly a 50/50 ratio. This combines the security properties of both mechanisms.**

Why hybrid is stronger than either alone:

| Attack | PoW Only | PoS Only | Verus Hybrid |
|--------|----------|----------|--------------|
| 51% hashrate attack | Vulnerable | N/A | Need hashrate AND stake |
| Nothing-at-stake | N/A | Vulnerable | PoW blocks anchor the chain |
| ASIC centralization | High risk | N/A | VerusHash equalizes hardware |
| Wealth concentration | N/A | Rich get richer | Mining provides alternative path |

To attack Verus, you'd need to control both significant mining hashrate and significant coin holdings simultaneously.

Learn more: [Mining and Staking Concepts](/concepts/mining-and-staking/)

---

## Can I mine and stake at the same time?

**Yes. Set mining threads greater than 0 and the daemon will both mine (PoW) and stake (PoS) simultaneously.**

```bash
# Mine with 4 threads AND stake
verus setgenerate true 4
```

This maximizes your chances of earning block rewards from both PoW and PoS blocks.
