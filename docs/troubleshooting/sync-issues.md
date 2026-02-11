# Troubleshooting: Sync Issues

> Diagnosing and fixing blockchain synchronization problems.

---

## Stuck on a Specific Block

**Symptom:** `getinfo` shows `blocks` stuck at a number while `headers` is higher, or blocks stop advancing.

**Cause:** Could be a network issue, corrupted block data, or being on a fork.

**Solution:**

```bash
# Check current state
./verus getinfo | grep -E '"blocks"|"headers"|"connections"'

# If blocks < headers, daemon is still syncing — be patient
# If blocks == headers and not advancing:

# 1. Check peer count
./verus getpeerinfo | grep -c '"addr"'
# If 0 peers, see "Peer Connection Problems" below

# 2. Check for chain forks
./verus getchaintips
```

If you see a fork tip with `"status": "valid-fork"`, you may be on a stale chain. See "Fork Detection" below.

---

## Fork Detection and Recovery

**Symptom:** Your node disagrees with the network about recent blocks. Transactions seem to disappear or reappear.

**Diagnose:**

```bash
./verus getchaintips
```

Output shows all known chain tips:
```json
[
  {
    "height": 3500000,
    "hash": "000000...",
    "branchlen": 0,
    "status": "active"          ← Your current chain
  },
  {
    "height": 3499998,
    "hash": "000000...",
    "branchlen": 3,
    "status": "valid-fork"      ← Alternative chain exists
  }
]
```

**Status meanings:**
| Status | Meaning |
|--------|---------|
| `active` | Your current best chain |
| `valid-fork` | Valid alternative chain (you're on the right one) |
| `valid-headers` | Headers received but blocks not yet validated |
| `headers-only` | Only headers downloaded |
| `invalid` | Invalid chain (rejected) |

**If you suspect you're on the wrong fork:**

```bash
# Stop daemon properly
./verus stop

# Restart with reindex
./verusd -reindex
```

⚠️ Reindexing replays the entire blockchain and can take many hours. **Always stop with `verus stop`** — never kill the process, as this can corrupt the database.

---

## Bootstrap for Fast Sync

**When to use:** Fresh install, or data is corrupted and reindex would take too long.

**What it is:** The `-bootstrap` flag tells `verusd` to automatically download a blockchain snapshot and sync from there instead of from block 0.

**Steps:**

```bash
# 1. Stop daemon (if running)
./verus stop          # mainnet
./verus -testnet stop # testnet

# 2. Start with -bootstrap
./verusd -bootstrap          # mainnet
./verusd -testnet -bootstrap # testnet
```

That's it — the daemon handles the download and extraction automatically. First-time sync with `-bootstrap` takes **under 3 hours** (vs ~3 days without it).

### When to Use `-fastload` Instead

If you shut down the daemon cleanly with `verus stop`, use `-fastload` for subsequent starts:

```bash
./verusd -fastload          # mainnet
./verusd -testnet -fastload # testnet
```

`-fastload` skips full chain verification since the shutdown was clean — much faster than `-bootstrap`. Only use `-bootstrap` for first-time sync or after data corruption.

---

## When to Reindex

**Use `-reindex` when:**
- Chain data is corrupted (daemon crashes on startup)
- You've added `txindex=1` or `idindex=1` after initial sync
- You suspect you're on a wrong fork
- Bootstrap isn't available

```bash
./verus stop
./verusd -daemon -reindex    # mainnet
./verusd -testnet -daemon -reindex  # testnet
```

**Expected time:**
| Network | Approximate Reindex Time |
|---------|-------------------------|
| Testnet | 2–6 hours |
| Mainnet | 12–48 hours |

Monitor progress:
```bash
./verus getinfo | grep -E '"blocks"|"headers"'
```

---

## Peer Connection Problems

**Symptom:** `getpeerinfo` returns empty array or very few peers. Chain not syncing.

**Diagnose:**

```bash
# Check peer count
./verus getpeerinfo | grep -c '"addr"'

# Check if port is accessible
./verus getinfo | grep '"connections"'
```

**Solutions:**

### No Peers at All

```bash
# 1. Check your config has no restrictive settings
cat ~/.komodo/VRSC/VRSC.conf | grep -E "connect=|maxconnections="

# 2. Manually add seed nodes
./verus addnode "seed_node_ip:27485" "add"

# 3. Check firewall
# Default p2p ports: mainnet=27485, testnet=18842
sudo ufw allow 27485    # if using ufw
```

### Few Peers / Slow Sync

```bash
# Increase max connections in config
echo "maxconnections=64" >> ~/.komodo/VRSC/VRSC.conf

# Restart daemon
./verus stop && ./verusd -daemon
```

### Peers Connected but Not Syncing

```bash
# Check if peers are on same chain version
./verus getpeerinfo | grep -E '"subver"|"synced_headers"'

# Disconnect bad peers
./verus disconnectnode "bad_peer_ip:port"
```

---

## Daemon Won't Start

**Symptom:** `verusd` exits immediately or crashes on startup.

**Diagnose:**

```bash
# Check the debug log
tail -100 ~/.komodo/VRSC/debug.log       # mainnet
tail -100 ~/.komodo/vrsctest/debug.log    # testnet
```

**Common causes:**

| Log Message | Cause | Fix |
|-------------|-------|-----|
| "Cannot obtain lock" | Another instance running | Kill other instance or remove `.lock` file |
| "Corrupted block database" | Bad chain data | Reindex: `./verusd -daemon -reindex` |
| "Not enough disk space" | Disk full | Free up space (need ~25GB mainnet) |
| "Error loading block database" | Interrupted shutdown | Reindex |
| "Zcash parameter not found" | Missing ZK params | Restart `verusd` (auto-downloads params), or manually run `./fetch-params` |

---

## Checking Sync Progress

```bash
# Quick check
./verus getinfo | grep -E '"blocks"|"headers"|"connections"'

# Detailed sync status
./verus getblockchaininfo | grep -E '"blocks"|"headers"|"verificationprogress"'

# verificationprogress: 0.0 to 1.0 (1.0 = fully synced)
```

**Monitoring loop (run in terminal):**
```bash
while true; do
  echo "$(date): $(./verus getinfo 2>/dev/null | grep -E '"blocks"|"headers"' | tr -d ' \n')"
  sleep 60
done
```

---

## See Also

- [Common Errors](./common-errors.md) — General error reference
- [Transaction Problems](./transaction-problems.md) — Transaction-specific issues

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
