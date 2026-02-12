# First Steps with Verus

You've installed Verus — now let's get it running. This guide covers starting the daemon, syncing the blockchain, and basic configuration.

## Starting the Daemon

The Verus daemon (`verusd`) is the core software that connects to the network and maintains your copy of the blockchain.

```bash
# From your verus-cli directory — FIRST TIME (uses bootstrap for fast sync)
./verusd -bootstrap
```

On first launch, `verusd` will automatically:
1. Create the data directory (`~/.komodo/VRSC/` on Linux, `~/Library/Application Support/Komodo/VRSC/` on macOS, `%AppData%\Roaming\Komodo\VRSC\` on Windows)
2. Generate a default `VRSC.conf` with random RPC credentials
3. Download a bootstrap snapshot and sync the blockchain

> ⚠️ **You do NOT need to manually create the data directory or config file** — `verusd` creates them automatically on first run.

> 💡 **Why `-bootstrap`?** Without it, first-time sync can take **~3 days**. With `-bootstrap`, you'll be synced in **under 3 hours**.

For **testnet**, use:
```bash
./verusd -testnet -bootstrap
```

## Checking Sync Status

Your node needs to download the entire blockchain before it's fully operational. Check progress with:

```bash
./verus getinfo
```

Key fields to watch:

| Field | Meaning |
|-------|---------|
| `blocks` | Blocks your node has downloaded |
| `longestchain` | Total blocks in the network |
| `synced` | `true` when fully synchronized |
| `connections` | Number of peer connections |

For more detailed info:

```bash
./verus getblockchaininfo
```

This shows chain name, difficulty, verification progress, and consensus parameters.

### How Long Does Sync Take?

| Method | Approximate Time |
|--------|-----------------|
| `./verusd -bootstrap` (recommended for first time) | **Under 3 hours** |
| `./verusd` (no bootstrap, syncing from peers) | **~3 days** |
| `./verusd -fastload` (after clean shutdown) | **Minutes** |

**Always use `-bootstrap` for your first sync.** For subsequent starts after a clean shutdown with `verus stop`, use `-fastload` instead (see below).

## VRSC.conf Basics

The configuration file controls how your node operates. It's located at:

- **Linux**: `~/.komodo/VRSC/VRSC.conf`
- **macOS**: `~/Library/Application Support/Komodo/VRSC/VRSC.conf`
- **Windows**: `%AppData%\Komodo\VRSC\VRSC.conf`

A default config is created on first launch. Key settings:

```ini
# RPC credentials (auto-generated, keep secret)
rpcuser=your_random_username
rpcpassword=your_random_password

# RPC port (default: 27486)
rpcport=27486

# P2P port (default: 27485)
port=27485

# Optional: add specific peers
addnode=seeds.verus.io

# Optional: enable mining or staking
# mint=1           # Enable staking
# gen=1            # Enable mining
# genproclimit=2   # Number of mining threads
```

> 🔒 **Security**: Your `rpcuser` and `rpcpassword` control access to your node. Never share them. The defaults are random strings, which is good — leave them as-is unless you have a reason to change them.

### Common Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `rpcuser` | (random) | Username for RPC authentication |
| `rpcpassword` | (random) | Password for RPC authentication |
| `rpcport` | 27486 | Port for RPC connections |
| `port` | 27485 | Port for P2P network connections |
| `rpcallowip` | 127.0.0.1 | IPs allowed to connect via RPC |
| `txindex` | 1 | Keep full transaction index (recommended) |
| `mint` | 0 | Enable staking (1 = on) |
| `gen` | 0 | Enable mining (1 = on) |

After editing `VRSC.conf`, restart the daemon for changes to take effect.

## Stopping the Daemon Safely

Always shut down gracefully:

```bash
# Mainnet
./verus stop

# Testnet
./verus -testnet stop
```

This tells the daemon to finish what it's doing, save state, and exit cleanly. **Do not kill the process** (`kill -9`, closing the terminal, etc.) — this can corrupt the blockchain database.

You can verify it stopped by checking:

```bash
./verus getinfo
# Should show: error: couldn't connect to server
```

### Restarting After Clean Shutdown

If you shut down properly with `verus stop`, you can restart much faster using `-fastload`:

```bash
# Mainnet
./verusd -fastload

# Testnet
./verusd -testnet -fastload
```

The `-fastload` flag skips full chain verification since the shutdown was clean. **Only use `-bootstrap` for first-time sync or if your data is corrupted.**

## Quick Reference

| Task | Command |
|------|---------|
| Start daemon (first time) | `./verusd -bootstrap` |
| Start daemon (after clean stop) | `./verusd -fastload` |
| Check sync status | `./verus getinfo` |
| Detailed chain info | `./verus getblockchaininfo` |
| Stop daemon | `./verus stop` |
| View help | `./verus help` |

## Next Steps

- [Wallet Setup](wallet-setup.md) — Create addresses and manage your VRSC
- [Key Concepts](key-concepts.md) — Understand VerusID, staking, and more
- [Troubleshooting: Sync Issues](../troubleshooting/sync-issues.md) — If you're having trouble syncing

