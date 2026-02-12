# Developer Guide: Testnet

> Set up a Verus testnet node for safe development and testing.

---

## Why Testnet?

- **Free coins** — VRSCTEST has no value; experiment freely
- **Same features** — Testnet runs identical code to mainnet
- **Safe mistakes** — Lose keys, break things, learn without cost
- **Fast iteration** — Same block time, but you can get coins instantly from faucet

---

## Setting Up a Testnet Node

### 1. Install Verus CLI

```bash
# Download latest release
curl -s https://api.github.com/repos/VerusCoin/VerusCoin/releases/latest \
  | grep "browser_download_url.*Linux.*x86_64" \
  | head -1 | cut -d '"' -f 4 | xargs wget -O /tmp/verus-cli.tgz

# Extract
mkdir -p ~/verus-cli
tar -xzf /tmp/verus-cli.tgz -C ~/verus-cli --strip-components=1

# ZK parameters are auto-downloaded on first daemon start (~1.7GB)
# To pre-download manually (optional):
cd ~/verus-cli && ./fetch-params
```

### 2. Start the Daemon

> **No manual configuration needed.** The daemon automatically creates `~/.komodo/VRSCTEST/` and a `VRSCTEST.conf` with random RPC credentials on first launch.

```bash
# First time — use -bootstrap for fast sync (under 3 hours vs ~3 days)
./verusd -testnet -bootstrap
```

For subsequent starts after a clean shutdown:
```bash
./verusd -testnet -fastload
```

### 3. Wait for Sync

```bash
# Monitor progress
watch -n 10 './verus -testnet getinfo 2>/dev/null | grep -E "blocks|headers|connections"'

# Fully synced when blocks ≈ headers
```

### 4. Read Auto-Generated Credentials

```bash
cat ~/.komodo/VRSCTEST/VRSCTEST.conf | grep -E "rpcuser|rpcpassword|rpcport"
```

> 💡 **Optional:** Add custom settings (like `addnode=195.248.234.41`) to the auto-generated conf, then restart.

---

## Getting Testnet Coins

### Discord Faucet

Request VRSCTEST in the Verus Discord `#testnet-faucet` channel.

### From Another Wallet

If you have testnet coins elsewhere:
```bash
# Generate receiving address
./verus -testnet getnewaddress "dev-wallet"

# Send from other wallet to this address
```

### Mining (Slow but Autonomous)

```bash
# Start mining with 1 thread
./verus -testnet setgenerate true 1

# Check mining status
./verus -testnet getmininginfo

# Stop mining
./verus -testnet setgenerate false
```

---

## Testnet vs Mainnet Differences

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| CLI prefix | `./verus -testnet` | `./verus` |
| Config directory | `~/.komodo/VRSCTEST/` | `~/.komodo/VRSC/` |
| Config file | `VRSCTEST.conf` | `VRSC.conf` |
| RPC port | 18843 | 27486 |
| P2P port | 18842 | 27485 |
| Currency | VRSCTEST | VRSC |
| ID suffix | `name.VRSCTEST@` | `name@` |
| ID cost | ~100 VRSCTEST (free test coins) | ~100 VRSC root ID (80 with referral; as low as ~20 net with a full referral chain you own; free via Valu; pennies on PBaaS chains) |
| Parent i-address | `iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq` | `i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV` |
| Coin value | None (free) | Real value |
| Chain data size | ~5–10 GB | ~15–25 GB |
| Sync time (with `-bootstrap`) | Under 3 hours | Under 3 hours |
| Sync time (without bootstrap) | 2–6 hours | ~3 days |

### Code Differences

```python
# Testnet
RPC_PORT = 18843
PARENT_CURRENCY = "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"  # VRSCTEST

# Mainnet
RPC_PORT = 27486
PARENT_CURRENCY = "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"  # VRSC
```

---

## Useful Testnet Commands

### Wallet Management

```bash
# New address
./verus -testnet getnewaddress "label"

# Check balance
./verus -testnet getbalance

# List transactions
./verus -testnet listtransactions "*" 10

# Send VRSCTEST
./verus -testnet sendtoaddress "R_ADDRESS" 10.0
```

### Identity Operations

```bash
# Register an identity (cheap on testnet!)
./verus -testnet registernamecommitment "testname" "YOUR_R_ADDR"
# Wait 1 block...
./verus -testnet registeridentity '{...}'

# Look up identity
./verus -testnet getidentity "testname.VRSCTEST@"

# Update identity
./verus -testnet updateidentity '{...}'
```

### Chain Information

```bash
# Node info
./verus -testnet getinfo

# Block details
./verus -testnet getblock "$(./verus -testnet getbestblockhash)"

# Mempool
./verus -testnet getmempoolinfo

# Peer connections
./verus -testnet getpeerinfo | grep -E '"addr"|"subver"'
```

### Currency and DEX

```bash
# List currencies
./verus -testnet listcurrencies

# Get currency details
./verus -testnet getcurrency "VRSCTEST"

# Estimate conversion
./verus -testnet estimateconversion '{"currency":"VRSCTEST","convertto":"OTHERCURRENCY","amount":10}'
```

---

## Development Workflow

```
1. Start testnet daemon
2. Get VRSCTEST from faucet
3. Register test identity
4. Build and test your integration
5. Break things freely
6. When confident → deploy to mainnet
```

### Stopping the Daemon

Always shut down cleanly:
```bash
./verus -testnet stop
```

**Never kill the process** — this can corrupt the database.

### Quick Reset

If you need a fresh testnet state:
```bash
./verus -testnet stop

# Option A: Quick reset (keeps wallet and config)
rm -rf ~/.komodo/VRSCTEST/blocks ~/.komodo/VRSCTEST/chainstate
./verusd -testnet -bootstrap

# Option B: Full reset (removes everything — back up wallet.dat first!)
cp ~/.komodo/VRSCTEST/wallet.dat ~/wallet-testnet-backup.dat
rm -rf ~/.komodo/VRSCTEST/
rm -rf ~/.verustest/    # testnet data may also be here
./verusd -testnet -bootstrap
```

> **macOS paths:** Replace `~/.komodo/VRSCTEST/` with `~/Library/Application Support/Komodo/VRSCTEST/`

---

## See Also

- [RPC API Overview](./rpc-api-overview.md) — API connection basics
- [How to Create a VerusID](../how-to/create-verusid.md) — Identity registration walkthrough
- [Integration Patterns](./integration-patterns.md) — Build real applications

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
