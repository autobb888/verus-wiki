# Tutorial: Send and Receive VRSC (Beginner)

> Your first transactions on the Verus blockchain — from zero to sending coins.

**Estimated time:** 20–30 minutes (including sync wait)  
**Difficulty:** Absolute Beginner  
**What you'll learn:** How to get a wallet address, receive coins, check your balance, and send coins to someone else.

## What You Need

- A computer (Linux, macOS, or Windows)
- Internet connection
- Basic comfort with a terminal/command prompt

## Concepts First

Before we start, here's what's happening:

- **Wallet:** A file on your computer that holds your private keys (like passwords to your money)
- **Address (R-address):** Like a bank account number — you share this to receive coins. Starts with `R`.
- **Transaction:** A record on the blockchain that says "X coins moved from A to B"
- **Confirmation:** Each new block that's added after your transaction makes it more "confirmed" and secure

## Step 1: Install the Verus CLI

### Linux (most common for CLI users)

```bash
# Download the latest release
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/VerusCoin/VerusCoin/releases/latest \
  | grep "browser_download_url.*Linux.*x86_64" \
  | head -1 \
  | cut -d '"' -f 4)

wget -O verus-cli.tgz "$DOWNLOAD_URL"

# Extract
mkdir -p ~/verus-cli
tar -xzf verus-cli.tgz -C ~/verus-cli --strip-components=1
cd ~/verus-cli
```

### First-Time Setup: Download ZK Parameters

ZK parameters are auto-downloaded on first daemon start (~1.5GB). To pre-download manually (optional):

```bash
./fetch-params
```

**Expected output:** Progress bars downloading parameter files. Takes 5-15 minutes depending on connection.

## Step 2: Start the Daemon

We'll use **testnet** so you can practice without real money:

```bash
./verusd -testnet -bootstrap
```

**Expected output:**
```
Verus Daemon starting...
```

The daemon runs in the background. The `-bootstrap` flag speeds up initial sync.

Wait for it to sync. Check progress:

```bash
./verus -testnet getinfo
```

**Expected output:**
```json
{
  "version": 2000753,
  "protocolversion": 170020,
  "blocks": 926950,
  "headers": 926961,
  ...
}
```

When `blocks` equals `headers`, you're fully synced. This can take 10-30 minutes with bootstrap.

## Step 3: Get Your First Address

```bash
./verus -testnet getnewaddress "my-first-wallet"
```

**Expected output:**
```
RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5
```

This is your **R-address**. It's like your account number — safe to share with anyone who wants to send you coins.

> 📝 Write down your address or copy it somewhere safe. You'll need it to receive coins.

## Step 4: Receive Coins

To receive coins, you simply share your R-address with the sender. On testnet, you can:

1. **Ask in the Verus Discord** — the community often helps with testnet coins
2. **Mine some yourself** — `./verus -testnet setgenerate true 1` (might take a while)

Once someone sends you coins, check your balance:

```bash
./verus -testnet getbalance
```

**Expected output (before receiving):**
```
0.00000000
```

**Expected output (after receiving):**
```
10.00000000
```

### See the Transaction

```bash
./verus -testnet listtransactions "*" 5
```

**Expected output:**
```json
[
  {
    "address": "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5",
    "category": "receive",
    "amount": 10.00000000,
    "confirmations": 3,
    "txid": "abc123...",
    ...
  }
]
```

**Key fields:**
- `"category": "receive"` — someone sent you coins
- `"amount": 10.0` — how much you received
- `"confirmations"` — how many blocks have confirmed this transaction (more = safer)

## Step 5: Send Coins

Now let's send some coins. You need:
- A destination address or VerusID (the recipient)
- Enough balance to cover the amount + a tiny fee

### Send to an R-address

```bash
./verus -testnet sendcurrency "*" '[{"address":"RECIPIENT_R_ADDRESS","amount":1}]'
```

**Example:**
```bash
./verus -testnet sendcurrency "*" '[{"address":"RXyz789ABCdef...","amount":1}]'
```

**Expected output:**
```
opid-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This is an **operation ID**. The transaction is being processed.

### Send to a VerusID

You can also send to a VerusID (a human-readable name):

```bash
./verus -testnet sendcurrency "*" '[{"address":"alice@","amount":1}]'
```

### Check the Send

```bash
./verus -testnet listtransactions "*" 5
```

**Expected output (new entry):**
```json
{
  "address": "RXyz789ABCdef...",
  "category": "send",
  "amount": -1.00000000,
  "fee": -0.0001,
  "confirmations": 1,
  ...
}
```

- `"category": "send"` — you sent coins
- `"amount": -1.0` — negative because it left your wallet
- `"fee"` — tiny transaction fee paid to miners/stakers

## Step 6: Check Your Balance Again

```bash
./verus -testnet getbalance
```

**Expected output:**
```
8.99990000
```

The balance went down by 1.0 (sent) + 0.0001 (fee).

## Quick Command Reference

| What | Command |
|------|---------|
| Check balance | `./verus -testnet getbalance` |
| New address | `./verus -testnet getnewaddress "label"` |
| List addresses | `./verus -testnet listaddressgroupings` |
| Send coins | `./verus -testnet sendcurrency "*" '[{"address":"DEST","amount":N}]'` |
| Recent transactions | `./verus -testnet listtransactions "*" 10` |
| Check sync | `./verus -testnet getinfo` |
| Stop daemon | `./verus -testnet stop` |

## What Could Go Wrong

| Problem | Cause | Solution |
|---------|-------|---------|
| `Cannot connect to daemon` | Daemon not running | Start it: `./verusd -testnet -bootstrap` |
| `Insufficient funds` | Not enough balance | Check `getbalance`; wait for confirmations on incoming tx |
| `Invalid address` | Typo in recipient address | Double-check the R-address or VerusID |
| Balance shows 0 but coins were sent | Transaction not yet confirmed | Wait for 1+ confirmations |
| `Block index not ready` | Daemon still syncing | Wait until `blocks` = `headers` in `getinfo` |

## Moving to Mainnet

Once comfortable on testnet, switch to mainnet:

1. Start daemon without `-testnet`: `./verusd -bootstrap` (first time) or `./verusd -fastload` (after clean shutdown)
2. All commands drop the `-testnet` flag: `./verus getbalance`
3. Mainnet RPC port: 27486 (vs testnet 18843)
4. **Real VRSC has real value** — double-check addresses before sending!

## Next Steps

- [Create a VerusID](../how-to/create-verusid.md) — get a human-readable identity
- [Stake VRSC](../how-to/stake-vrsc.md) — earn passive income from your coins
- [Mine VRSC](../how-to/mine-vrsc.md) — use your CPU to earn coins

---

*Tutorial by Ari 🧑‍💼 · Last updated: 2026-02-07*
