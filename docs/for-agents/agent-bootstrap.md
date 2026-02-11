# For Agents: Bootstrap Guide

> Go from nothing to operational on Verus. This guide assumes you're an AI agent with shell access.

---

## Overview

| Step | Command | Autonomous? |
|------|---------|-------------|
| Download CLI | `wget` / `curl` | ✅ |
| Install | `tar -xzf` | ✅ |
| Start daemon | `verusd -testnet -bootstrap` | ✅ |
| Sync chain | Wait | ✅ (under 3 hours with bootstrap) |
| Create address | `getnewaddress` | ✅ |
| Get funds | Faucet / human | ❌ Requires external help |
| Register identity | `registeridentity` | ✅ (once funded) |

**The bottleneck:** Getting initial VRSC. Everything else is fully automatable.

---

## Step 1: Download and Install

```bash
# Find latest release
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/VerusCoin/VerusCoin/releases/latest \
  | grep "browser_download_url.*Linux.*x86_64" \
  | head -1 | cut -d '"' -f 4)

# Download and extract
mkdir -p ~/verus-cli
wget -q -O /tmp/verus-cli.tgz "$DOWNLOAD_URL"
tar -xzf /tmp/verus-cli.tgz -C ~/verus-cli --strip-components=1

# ZK parameters auto-download on first daemon start (~1.5GB)
# To pre-download manually (optional):
cd ~/verus-cli && ./fetch-params
```

**Requirements:** ~2GB RAM, ~25GB disk (mainnet) or ~10GB (testnet).

## Step 2: Start and Sync

> **No manual configuration needed.** When you first run `verusd`, it automatically creates the data directory (`~/.komodo/VRSCTEST/` for testnet, `~/.komodo/VRSC/` for mainnet) and generates a config file with random RPC credentials.

```bash
# Use -bootstrap for first-time sync (under 3 hours vs ~3 days without it)
~/verus-cli/verusd -testnet -bootstrap

# Poll sync status
while true; do
  BLOCKS=$(~/verus-cli/verus -testnet getinfo 2>/dev/null | grep '"blocks"' | tr -dc '0-9')
  HEADERS=$(~/verus-cli/verus -testnet getinfo 2>/dev/null | grep '"headers"' | tr -dc '0-9')
  echo "Sync: $BLOCKS / $HEADERS"
  [ "$BLOCKS" = "$HEADERS" ] && [ -n "$BLOCKS" ] && echo "SYNCED" && break
  sleep 60
done
```

**Time with `-bootstrap`:** Under 3 hours (testnet or mainnet). Without bootstrap: testnet 2–6 hours, mainnet ~3 days.

### Reading Auto-Generated Credentials

After first launch, read the auto-generated RPC credentials:

```bash
# Testnet
cat ~/.komodo/VRSCTEST/VRSCTEST.conf | grep -E "rpcuser|rpcpassword|rpcport"

# Save for programmatic access
RPC_USER=$(grep rpcuser ~/.komodo/VRSCTEST/VRSCTEST.conf | cut -d= -f2)
RPC_PASS=$(grep rpcpassword ~/.komodo/VRSCTEST/VRSCTEST.conf | cut -d= -f2)
RPC_PORT=$(grep rpcport ~/.komodo/VRSCTEST/VRSCTEST.conf | cut -d= -f2)

cat > ~/.verus-rpc-credentials << EOF
RPC_URL=http://127.0.0.1:${RPC_PORT:-18843}
RPC_USER=$RPC_USER
RPC_PASS=$RPC_PASS
EOF
```

> 💡 **Optional:** You can add custom settings (like `addnode=`) to the auto-generated conf file. Just edit it and restart the daemon.

## Step 3: Create Address

```bash
~/verus-cli/verus -testnet getnewaddress "agent-wallet"
# Returns: R-address (save this)
```

## Step 4: Get Funded

This is the step that requires external help:

| Method | How |
|--------|-----|
| **Testnet faucet** | Ask in Verus Discord #testnet-faucet |
| **Human sponsor** | Have someone send VRSCTEST to your R-address |
| **Mining** | `./verus -testnet setgenerate true 1` (slow) |

You need ~100 VRSCTEST for identity registration + fees (free test currency from faucet). On mainnet, a root ID costs ~100 VRSC (~20 with referral), but free IDs are available via Valu, and subIDs/PBaaS chain IDs can cost pennies.

## Step 5: Register Identity

```bash
# Commitment (prevents front-running)
~/verus-cli/verus -testnet registernamecommitment "youragentname" "YOUR_R_ADDRESS"
# SAVE THE ENTIRE OUTPUT — you need txid and salt

# Wait for 1 confirmation (~1 minute)
sleep 90

# Register
~/verus-cli/verus -testnet registeridentity '{
  "txid": "COMMITMENT_TXID",
  "namereservation": {
    "name": "youragentname",
    "salt": "SALT_FROM_COMMITMENT",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "referral": ""
  },
  "identity": {
    "name": "youragentname",
    "primaryaddresses": ["YOUR_R_ADDRESS"],
    "minimumsignatures": 1
  }
}'

# Verify (after 1 confirmation)
sleep 90
~/verus-cli/verus -testnet getidentity "youragentname.VRSCTEST@"
```

## Step 6: You're Operational

With a VerusID, you can now:
- Store data on-chain → [Agent Identity](./agent-identity.md)
- Send/receive payments → [Agent Economy](./agent-economy.md)
- Encrypt communications → [Agent Messaging](./agent-messaging.md)
- Sign and verify messages → [CLI Reference](./agent-cli-reference.md)

---

## RPC Access Pattern

For all subsequent operations, use JSON-RPC:

```bash
# Generic RPC call pattern
curl -s -u "$RPC_USER:$RPC_PASS" http://127.0.0.1:18843 \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"1.0\",\"id\":\"agent\",\"method\":\"METHOD\",\"params\":[PARAMS]}"
```

See [RPC API Overview](../developers/rpc-api-overview.md) for language-specific examples.

---

## Keeping the Daemon Running

```bash
# Option 1: systemd (if you have root)
sudo tee /etc/systemd/system/verusd.service << EOF
[Unit]
Description=Verus Daemon
After=network.target

[Service]
User=$USER
ExecStart=$HOME/verus-cli/verusd -testnet -fastload
ExecStop=$HOME/verus-cli/verus -testnet stop
Restart=always

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable --now verusd

# Option 2: tmux
tmux new -d -s verusd "~/verus-cli/verusd -testnet"

# Option 3: nohup
nohup ~/verus-cli/verusd -testnet &
```

---

## Complete Bootstrap Script

```bash
#!/bin/bash
set -e

NETWORK="${1:-testnet}"
INSTALL_DIR="$HOME/verus-cli"

echo "=== Verus Agent Bootstrap ($NETWORK) ==="

# Download
URL=$(curl -s https://api.github.com/repos/VerusCoin/VerusCoin/releases/latest \
  | grep "browser_download_url.*Linux.*x86_64" | head -1 | cut -d '"' -f 4)
mkdir -p "$INSTALL_DIR"
wget -q -O /tmp/verus-cli.tgz "$URL"
tar -xzf /tmp/verus-cli.tgz -C "$INSTALL_DIR" --strip-components=1

# ZK params
[ ! -f "$HOME/.zcash-params/sprout-proving.key" ] && cd "$INSTALL_DIR" && ./fetch-params

# Set network args
if [ "$NETWORK" = "testnet" ]; then
  DARGS="-testnet"; CONF_DIR="$HOME/.komodo/VRSCTEST"; CONF="VRSCTEST.conf"; PORT=18843
else
  DARGS=""; CONF_DIR="$HOME/.komodo/VRSC"; CONF="VRSC.conf"; PORT=27486
fi

# Start with bootstrap (auto-creates dirs and conf with random RPC credentials)
"$INSTALL_DIR/verusd" $DARGS -bootstrap -daemon
sleep 10

# Read auto-generated credentials
RPC_USER=$(grep rpcuser "$CONF_DIR/$CONF" | cut -d= -f2)
RPC_PASS=$(grep rpcpassword "$CONF_DIR/$CONF" | cut -d= -f2)

# Create address
ADDR=$("$INSTALL_DIR/verus" $DARGS getnewaddress "agent-wallet")
echo "Address: $ADDR"
echo "RPC: http://127.0.0.1:$PORT (user: $RPC_USER)"
echo "⚠️  Send VRSC to $ADDR, then register your identity."
```

---

## Error Handling Tips

RPC errors return a non-zero exit code and a JSON error object. Common ones:

| Error Code | Message | Likely Cause |
|------------|---------|--------------|
| -5 | `Identity not found` | Name doesn't exist or wrong qualification (`alice@` vs `alice.agentplatform@`) |
| -8 | `Invalid identity or identity not in wallet` | Trying to sign/send from an ID you don't control |
| -6 | `Insufficient funds` | Not enough balance for amount + fees |
| -1 | Various | Invalid parameters — check `verus help <command>` |

**Best practices:**
- Always check exit codes in scripts: `verus -testnet getidentity "name@" || echo "FAILED"`
- Parse stderr for error details
- Use fully qualified names for SubIDs (e.g., `alice.agentplatform@`, not `alice@`)
- After registration, wait for 1 confirmation before querying the new identity

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
