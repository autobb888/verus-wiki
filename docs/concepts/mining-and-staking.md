# Mining and Staking on Verus

> How Verus secures its network with a 50/50 hybrid of Proof of Work and Proof of Stake

---

## The Hybrid Consensus Model

Verus uses a **50/50 hybrid** of Proof of Work (PoW) and Proof of Stake (PoS). This means that roughly half of all blocks are found by miners (using computational power) and half by stakers (using coin holdings).

```
Block N   [PoW] ← Miner solves hash puzzle
Block N+1 [PoS] ← Staker selected by coin age
Block N+2 [PoW] ← Miner solves hash puzzle
Block N+3 [PoS] ← Staker selected by coin age
  ...
```

The alternation isn't strictly every-other-block, but over time the ratio balances to approximately 50/50. The protocol enforces this by adjusting difficulty independently for PoW and PoS.

### Why Hybrid?

Each consensus mechanism has weaknesses. Combining them provides stronger security:

| Attack | PoW Only | PoS Only | Verus Hybrid |
|---|---|---|---|
| 51% hashrate attack | Vulnerable | N/A | Need hashrate AND stake |
| Nothing-at-stake | N/A | Vulnerable | PoW blocks anchor the chain |
| Centralization via ASICs | High risk | N/A | VerusHash resists ASICs |
| Wealth concentration | N/A | Rich get richer | Mining provides alternative path |

To attack Verus, you'd need to control both significant hashrate *and* significant coin holdings simultaneously — a much harder proposition than attacking either mechanism alone.

---

## Proof of Work: VerusHash 2.2

### What Is VerusHash?

VerusHash 2.2 is Verus's custom mining algorithm, designed with a specific goal: **keep mining accessible to everyday CPUs**.

Most crypto mining algorithms eventually get dominated by specialized hardware:
- **SHA-256** (Bitcoin) → ASICs dominate, home mining is dead
- **Ethash** (old Ethereum) → GPUs dominated
- **RandomX** (Monero) → CPU-friendly but still FPGA-vulnerable

VerusHash 2.2 uses a combination of techniques — including large random lookups, AES instructions, and variable-length hashing — that map well to modern CPU architectures but are difficult and expensive to implement in FPGAs or ASICs.

**The result:** As of v1.2.x, CPU mining remains competitive on Verus. A modern desktop CPU can meaningfully participate in mining, which supports decentralization.

### Mining in Practice

To start mining:

```bash
# Enable mining with 4 CPU threads
verus setgenerate true 4

# Check mining status
verus getmininginfo
```

The [getmininginfo](../command-reference/mining/getmininginfo.md) command shows key metrics:

- **localhashps** — Your local hash rate
- **networkhashps** — Estimated total network hash rate
- **difficulty** — Current PoW difficulty
- **generate** — Whether mining is active
- **numthreads** — How many CPU threads are mining

### Mining Pools vs. Solo Mining

**Solo mining** means your node finds blocks independently. You get the full block reward when you find a block, but blocks may be infrequent depending on your hashrate relative to the network.

**Pool mining** means you contribute hashrate to a pool that combines many miners' power. Rewards are split proportionally. More consistent payouts, but you pay a pool fee (typically 1-2%).

For most miners, pools provide more predictable income. Solo mining is viable mainly for those with significant hashrate.

---

## Proof of Stake: Staking

### How Staking Works

Staking on Verus works differently from delegated PoS systems (like Ethereum). There's no minimum stake, no validators to delegate to, and no slashing.

Here's the process:

1. You hold VRSC in your wallet
2. You enable staking (`verus setgenerate true 0` — 0 threads means staking only, no mining)
3. Your wallet must remain **unlocked** and **online**
4. The protocol selects stakers based on **coin age** — how many coins you have and how long they've been unspent
5. When selected, your wallet automatically creates a PoS block and earns the block reward

```
Staking Selection (simplified):

  Coin Age = Amount × Time Since Last Spent

  Higher coin age → Higher probability of being selected
  
  After staking, coin age resets → prevents monopolization
```

### Staking Requirements

| Requirement | Details |
|---|---|
| Minimum amount | None (any amount can stake) |
| Coin maturity | UTXOs must have 150 confirmations (~2.5 hours) |
| Wallet state | Must be unlocked (or unlocked for staking only) |
| Node state | Must be running and synced to the network |
| Network | Must be connected to peers |

### Staking Tips

- **Keep your wallet running 24/7** for maximum staking opportunity
- **Larger UTXOs stake more often**, but after staking they reset coin age
- **Split large holdings** into multiple UTXOs for more consistent staking (though this has diminishing returns)
- Use `verus setgenerate true 0` to stake without mining (saves CPU)

---

## Block Rewards and Halving

### Reward Schedule

Verus follows a halving schedule similar to Bitcoin, but with its own parameters:

| Era | Block Range | Block Reward | Approx. Date |
|---|---|---|---|
| 1 | 1 – 10,080 | Variable | May 2018 |
| 2 | 10,081 – 1,051,924 | 24 VRSC | May 2018 – Jun 2020 |
| 3 | 1,051,925 – 2,103,848 | 12 VRSC | Jun 2020 – Jul 2022 |
| 4 | 2,103,849 – 3,155,772 | 6 VRSC | Jul 2022 – Aug 2024 |
| 5 | 3,155,773 – 4,207,696 | **3 VRSC** (current on mainnet) | Aug 2024 – ~Aug 2026 |
| 6 | 4,207,697+ | 1.5 VRSC | ~Aug 2026 onward |

Halving interval: **1,051,924 blocks** (~2 years at 62s average block time).

> **Tip:** Use `getblocksubsidy` to check the current block reward. Use `getcurrency VRSC` to see the halving interval in the `eras` field.

Each block reward is split between the miner/staker who found the block. Since blocks alternate between PoW and PoS, both miners and stakers earn comparable total rewards over time.

### Supply

Verus has no hard supply cap encoded in the protocol in the same way as Bitcoin's 21M, but the halving schedule means emission decreases geometrically. The practical supply curve approaches a limit over time.

---

## Merged Mining

Verus supports **merged mining** — the ability to mine Verus and one or more PBaaS chains simultaneously, with the same hashrate.

```
Your CPU Hashrate
       │
       ├──→ Verus (VRSC) blocks
       ├──→ PBaaS Chain A blocks
       └──→ PBaaS Chain B blocks
       
Same work, multiple rewards
```

When PBaaS chains are launched with PoW consensus, Verus miners can opt in to merged mining. The [getmininginfo](../command-reference/mining/getmininginfo.md) output includes `mergemining` (number of chains being merge-mined) and `mergeminedchains` (their names).

This is significant because:
- New chains get security from the existing Verus mining network from day one
- Miners earn additional rewards without additional hardware
- It strengthens the entire PBaaS ecosystem

---

## Staking Pools

While mining pools are straightforward (combine hashrate, split rewards), **staking pools** on Verus work differently. As of v1.2.x, there is no native delegation mechanism — your coins must be in your own wallet to stake.

However, community-organized staking arrangements exist where:
- A pool operator runs a 24/7 node
- Participants send coins to a multisig or shared wallet
- Rewards are distributed proportionally

**Caution:** Unlike mining pools, staking pools require trusting someone with your coins (unless using multisig). Always evaluate the trust model carefully.

---

## Mining Distribution

The `setminingdistribution` command allows miners to automatically distribute their mining rewards to multiple destinations:

```bash
verus setminingdistribution '[
  {"address": "RAddress1", "percentage": 50},
  {"address": "RAddress2", "percentage": 30},
  {"identity": "myid@", "percentage": 20}
]'
```

This is useful for:
- Automatically paying pool participants
- Splitting rewards between a hot wallet and cold storage
- Directing a percentage of mining income to a specific identity or project
- Tax management (separate mining income into different addresses)

---

## Practical Setup Guide

### Mining Only (CPU)

```bash
# Start mining with all available threads
verus setgenerate true -1

# Start mining with specific thread count
verus setgenerate true 4

# Stop mining
verus setgenerate false
```

### Staking Only

```bash
# Unlock wallet for staking only
verus walletpassphrase "your-passphrase" 0 true

# Enable staking (0 mining threads = staking only)
verus setgenerate true 0
```

### Mining + Staking

```bash
# Unlock wallet
verus walletpassphrase "your-passphrase" 0 true

# Mine with 4 threads AND stake
verus setgenerate true 4
```

### Check Status

```bash
# Full mining info
verus getmininginfo

# Quick generate status
verus getgenerate
```

---

## Key Takeaways

1. **50/50 hybrid** — Verus combines PoW and PoS for stronger security than either alone.
2. **CPU-friendly** — VerusHash 2.2 keeps mining accessible to regular computers.
3. **Low barrier to stake** — No minimum stake, no delegation, no slashing. Just hold coins and keep your wallet open.
4. **Merged mining** — Mine Verus and PBaaS chains simultaneously for additional rewards.
5. **Halving schedule** — Block rewards decrease over time, creating a deflationary emission curve.

---

## Related Commands

- [getmininginfo](../command-reference/mining/getmininginfo.md) — Check mining and staking status
- [setgenerate](../command-reference/generating/setgenerate.md) — Enable/disable mining and staking
- [getgenerate](../command-reference/generating/getgenerate.md) — Check generate status
- [getnetworksolps](../command-reference/mining/getnetworksolps.md) — Network hash rate details

---

*As of Verus v1.2.x. VerusHash 2.2.*
