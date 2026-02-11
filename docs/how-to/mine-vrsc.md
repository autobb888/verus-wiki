# How To: Mine VRSC

> Use your CPU to mine Verus blocks and earn rewards.

**Estimated time:** 10 minutes to start mining  
**Cost:** Electricity only  
**Difficulty:** Beginner

## Prerequisites

- Verus CLI installed and daemon fully synced ([setup guide](../../../research/verus-cli-setup-guide.md))
- A modern CPU (Verus is CPU-only — GPUs and ASICs cannot be used to mine Verus)
- Terminal access

## About VerusHash 2.2

Verus uses **VerusHash 2.2**, a mining algorithm specifically designed for CPUs only. GPUs and ASICs **cannot mine Verus** — the algorithm leverages AES-NI instructions in a way that makes GPU/ASIC implementation infeasible. This keeps mining accessible and fair: anyone with a CPU (including mobile phones and ARM devices) can mine competitively.

## Steps

### 1. Ensure You Have a Wallet Address

```bash
./verus -testnet getnewaddress "mining"
```

Mining rewards will be sent to addresses in your wallet.

### 2. Start Solo Mining

```bash
./verus -testnet setgenerate true NUM_THREADS
```

Replace `NUM_THREADS` with the number of CPU threads to use:

```bash
# Mine with 4 threads
./verus -testnet setgenerate true 4

# Mine with all available threads
./verus -testnet setgenerate true -1
```

**Expected output:** (none — silence means success)

> 💡 **Tip:** Leave 1-2 threads free for system stability. If you have 8 threads, use 6.

### 3. Verify Mining Is Active

```bash
./verus -testnet getmininginfo
```

**Expected output:**
```json
{
  "blocks": 926961,
  "difficulty": 56478309.28295863,
  "errors": "",
  "genproclimit": 4,
  "localhashps": 2500000,
  "networkhashps": 16857317,
  "pooledtx": 0,
  "testnet": true,
  "generate": true,
  "staking": false,
  "numthreads": 4,
  "mergemining": 0
}
```

**Key fields:**
- `"generate": true` — mining is enabled
- `"numthreads": 4` — number of CPU threads mining
- `"localhashps"` — your local hash rate (higher = better)
- `"networkhashps"` — total network hash rate

### 4. Monitor Your Hashrate

```bash
./verus -testnet getlocalsolps
```

Returns your solutions per second. Higher is better.

### 5. Check for Rewards

```bash
./verus -testnet listtransactions "*" 10
```

Mined blocks appear as `"category": "generate"` transactions.

### 6. Stop Mining

```bash
./verus -testnet setgenerate false
```

### 7. Mine AND Stake Simultaneously

You can mine with CPU threads while also staking:

```bash
# Mine with 4 threads + stake
./verus -testnet setgenerate true 4
```

Any value > 0 enables both mining and staking (if you have mature coins).

## Solo Mining vs Pool Mining

| Factor | Solo Mining | Pool Mining |
|--------|------------|-------------|
| Rewards | Full block reward when you find a block | Proportional share of all blocks found |
| Consistency | Very inconsistent (feast or famine) | Steady, smaller payouts |
| Difficulty | Need significant hashrate to compete | Low hashrate still earns |
| Setup | Built into Verus CLI | Requires pool software |
| Fees | None | 0-2% pool fee typically |

**Recommendation:** For most users, **staking is more practical** than solo mining on mainnet. If you want to mine, use a pool — solo mining on an average desktop CPU is no longer practical given current network hashrate. Staking requires no special hardware and earns comparable rewards.

## Pool Mining

For pool mining, you need a separate mining application instead of the built-in miner.

### Popular Verus Mining Pools

| Pool | URL | Fee |
|------|-----|-----|
| Luckpool | https://luckpool.net/verus | ~1% |
| Zergpool | https://zergpool.com | ~0.5% |
| CoinBlockers | https://verus.coinblockers.com | ~1% |

> ⚠️ Pool availability changes — check current pools at [verus.io](https://verus.io) or the Verus Discord.

### Pool Mining Setup (CCMiner)

1. Download a VerusHash-compatible miner (e.g., CCMiner, nheqminer)
2. Configure with your pool and wallet address:

```bash
ccminer -a verushash -o stratum+tcp://POOL_ADDRESS:PORT -u YOUR_VRSC_ADDRESS.WORKER_NAME
```

Replace:
- `POOL_ADDRESS:PORT` — from your chosen pool
- `YOUR_VRSC_ADDRESS` — your Verus R-address
- `WORKER_NAME` — any name to identify this miner

## CPU Requirements

| CPU Feature | Impact |
|------------|--------|
| AES-NI support | **Required** for competitive hashrate |
| Core count | More cores = more threads = higher hashrate |
| Clock speed | Higher is better per-thread |
| Cache size | Larger L3 cache helps |

**Typical hashrates (rough estimates):**
- Intel i5 (4 cores): ~2-4 MH/s
- Intel i7 (8 cores): ~5-10 MH/s
- AMD Ryzen 7 (8 cores): ~8-15 MH/s
- AMD Ryzen 9 (16 cores): ~15-30 MH/s
- Server Xeon (32+ cores): ~30-60 MH/s

## Auto-Start Mining on Boot

Add to your Verus config (`~/.komodo/VRSC/VRSC.conf`):

```ini
gen=1
genproclimit=4
```

## What Could Go Wrong

| Problem | Cause | Solution |
|---------|-------|---------|
| `"localhashps": 0` | Mining just started | Wait 30-60 seconds for hashrate to register |
| Very low hashrate | CPU doesn't support AES-NI | Check with `lscpu | grep aes` on Linux |
| No blocks found after days | Normal for solo mining | Switch to pool mining for consistent rewards |
| High CPU temperature | Too many threads | Reduce thread count; check cooling |
| System unresponsive | Using all CPU threads | Use fewer threads (`setgenerate true N` where N < total cores) |

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
