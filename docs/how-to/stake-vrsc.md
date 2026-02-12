# How To: Stake VRSC

> Earn block rewards by staking your VRSC coins — no special hardware needed.

**Estimated time:** 5 minutes to enable (first reward may take hours/days)  
**Cost:** None (you keep your coins)  
**Difficulty:** Beginner

## Prerequisites

- Verus CLI installed and daemon fully synced
- VRSC (or VRSCTEST) in your wallet
- Coins must be **mature** (150+ confirmations, ~2.5 hours on mainnet)

## How Staking Works

Verus uses a hybrid PoW/PoS consensus. When you stake:
- Your wallet automatically creates stake transactions using your mature UTXOs
- Larger UTXOs = higher chance of being selected to stake a block (one large UTXO stakes better than many small ones of the same total)
- There is no minimum balance requirement (technically 0.00000001 VRSC)
- You earn the full block reward when you successfully stake
- Your coins never leave your wallet — they're not locked or at risk

## Steps

### 1. Check Your Balance

```bash
./verus -testnet getbalance
```

Ensure you have coins available. For meaningful staking, more is better.

### 2. Verify Coins Are Mature

Coins need 150+ confirmations before they're eligible for staking:

```bash
./verus -testnet listunspent 150
```

This shows only UTXOs with 150+ confirmations. If empty, your coins aren't mature yet — wait.

### 3. Enable Staking

```bash
./verus -testnet setgenerate true 0
```

The `0` means zero mining threads — staking only, no CPU mining.

**Expected output:** (none — silence means success)

### 4. Verify Staking Is Active

```bash
./verus -testnet getmininginfo
```

**Expected output:**
```json
{
  "blocks": 926961,
  "currentblocksize": 0,
  "currentblocktx": 0,
  "difficulty": 56478309.28295863,
  "stakingsupply": 31566038.74104909,
  "errors": "",
  "genproclimit": 0,
  "localhashps": 0,
  "networkhashps": 16857317,
  "pooledtx": 0,
  "testnet": true,
  "chain": "main",
  "generate": true,
  "staking": true,
  "numthreads": 0,
  "mergemining": 0
}
```

**Key fields to check:**
- `"generate": true` — generation is enabled
- `"staking": true` — staking is active
- `"numthreads": 0` — not mining (staking only)

### 5. Monitor for Rewards

Check your balance periodically:

```bash
./verus -testnet getbalance
```

Or check recent transactions:

```bash
./verus -testnet listtransactions "*" 10
```

Staking rewards appear as `"category": "stake"` or `"generate"` transactions.

### 6. Stop Staking (When Needed)

```bash
./verus -testnet setgenerate false
```

This stops **both** mining and staking.

## How Long Until My First Stake?

It depends on your balance relative to the total staking supply:

| Your Balance | Network Staking Supply | Approx. Time Between Stakes |
|-------------|----------------------|---------------------------|
| 1,000 VRSC | 30,000,000 VRSC | ~42 days |
| 10,000 VRSC | 30,000,000 VRSC | ~4 days |
| 100,000 VRSC | 30,000,000 VRSC | ~10 hours |
| 1,000,000 VRSC | 30,000,000 VRSC | ~1 hour |

**Formula:** `(Staking Supply ÷ Your Balance) ÷ 720 = days between stakes` (720 = avg PoS blocks per day at 50/50 split). These are rough estimates — staking is probabilistic.

## Auto-Start Staking on Boot

Add to your Verus config file (`~/.komodo/VRSC/VRSC.conf` or `~/.komodo/vrsctest/vrsctest.conf`):

```ini
gen=1
genproclimit=0
```

This enables staking every time the daemon starts.

## Pool Staking

You can also stake through **non-custodial staking pools** using VerusID. This lets you combine staking power with other users without giving up control of your coins:

- **Non-custodial (VerusID-based)**: Your coins remain in your wallet, but your VerusID delegates staking power to a pool. No trust required.
- **Custodial**: You send coins to a pool operator (requires trust).

Check the Verus Discord for current staking pools (e.g., Synergy Pool).

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|---------|
| `"staking": false` | No mature coins or wallet locked | Check `listunspent 150`; wait for coins to mature |
| `"generate": false` | Staking not enabled | Run `setgenerate true 0` |
| No rewards after days | Balance too small relative to network | Normal — increase balance or be patient |
| `"stakingsupply": 0` | Node not fully synced | Wait for full sync (`getinfo` — blocks should match headers) |
| Wallet is encrypted | Locked wallet can't stake | Unlock: `walletpassphrase "YOUR_PASSPHRASE" 99999999 true` (the `true` = staking only) |

## What Could Go Wrong

- **Nothing is at risk** — staking doesn't spend your coins. If staking fails, your coins remain untouched.
- **Orphaned stakes** — occasionally a stake gets orphaned (another block wins). The reward disappears but your coins are safe.
- **Daemon must stay running** — if the daemon stops, staking stops. Use `screen` or systemd for persistence.

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
