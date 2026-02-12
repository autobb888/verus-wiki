# Wallet Setup

Your Verus node includes a built-in wallet. This guide covers creating addresses, receiving VRSC, checking balances, and keeping your funds safe.

> **Prerequisites**: Your daemon should be running and synced. See [First Steps](first-steps.md) if you haven't done that yet.

## Creating Your First Address

Generate a new transparent address:

```bash
./verus getnewaddress
```

This returns an address starting with **R** (e.g., `RKjh38dkj2...`). This is your transparent address — like a bank account number you can share with others.

### Address Types

| Prefix | Type | Privacy |
|--------|------|---------|
| `R...` | Transparent | Visible on the blockchain (like Bitcoin) |
| `zs...` | Shielded (Sapling) | Encrypted — amounts and memo hidden |
| `i...` | VerusID | Human-readable identity address |

For now, a transparent `R` address is all you need to get started. See [Privacy & Shielded Transactions](../concepts/privacy-shielded-tx.md) to learn about shielded addresses.

## Getting Your First VRSC

You can obtain VRSC by:

1. **Receiving from someone** — Share your `R...` address
2. **Mining** — See [How to Mine VRSC](../how-to/mine-vrsc.md)
3. **Staking** — See [How to Stake VRSC](../how-to/stake-vrsc.md)
4. **Exchanges** — Purchase on supported exchanges (see [verus.io](https://verus.io))
5. **Community** — The Verus Discord community sometimes runs giveaways

## Checking Your Balance

### Simple Balance

```bash
./verus getbalance
```

Returns your total confirmed transparent balance.

### Detailed Balance

```bash
./verus z_gettotalbalance
```

Shows transparent, shielded (private), and total balances:

```json
{
  "transparent": "100.00000000",
  "private": "50.00000000",
  "total": "150.00000000"
}
```

### List Transactions

```bash
./verus listtransactions
```

Shows your recent transaction history with amounts, confirmations, and addresses.

## Backing Up Your Wallet

Your wallet file contains your private keys. **If you lose it, you lose your funds.** Back it up!

### Wallet File Location

- **Linux**: `~/.komodo/VRSC/wallet.dat`
- **macOS**: `~/Library/Application Support/Komodo/VRSC/wallet.dat`
- **Windows**: `%AppData%\Komodo\VRSC\wallet.dat`

### How to Back Up

1. **Stop the daemon** for a clean backup:
   ```bash
   ./verus stop
   ```

2. **Copy `wallet.dat`** to a safe location (USB drive, encrypted cloud storage, etc.):
   ```bash
   cp ~/.komodo/VRSC/wallet.dat ~/verus-wallet-backup.dat
   ```

3. **Restart the daemon**:
   ```bash
   ./verusd -fastload
   ```

### Backup Best Practices

- ✅ Back up after creating new addresses
- ✅ Store copies in multiple physical locations
- ✅ Use encrypted storage
- ❌ Don't email wallet files
- ❌ Don't store backups on public cloud without encryption

### Export Private Keys (Alternative)

You can also export individual private keys:

```bash
# For a transparent address
./verus dumpprivkey "RYourAddressHere"

# For a shielded address
./verus z_exportkey "zsYourAddressHere"
```

> 🔒 **Private keys = full control of funds.** Anyone with your private key can spend your coins. Store them as securely as your wallet file.

## Encrypting Your Wallet

Add password protection to your wallet:

```bash
./verus encryptwallet "your-strong-passphrase"
```

After encryption:
- The daemon will shut down — restart it
- You must unlock the wallet to send funds: `./verus walletpassphrase "passphrase" timeout_seconds`
- Staking while encrypted requires: `./verus walletpassphrase "passphrase" 99999999 true`

## Understanding Transparent vs Shielded

| Feature | Transparent (`R...`) | Shielded (`zs...`) |
|---------|---------------------|-------------------|
| Balances | Visible on-chain | Hidden |
| Amounts | Visible | Hidden |
| Sender/Receiver | Visible | Hidden |
| Use case | General transactions | Privacy-sensitive transactions |
| Speed | Instant | Slightly slower |

Most users start with transparent addresses. When you need privacy, you can move funds to a shielded address. See [Send a Private Transaction](../how-to/send-private-transaction.md) for a step-by-step guide.

## Next Steps

- [Key Concepts](key-concepts.md) — Understand the full Verus ecosystem
- [Send a Private Transaction](../how-to/send-private-transaction.md) — Use shielded addresses
- [Register a VerusID](../how-to/create-verusid.md) — Get a human-readable identity
- [Command Reference: Wallet](../command-reference/wallet.md) — All wallet-related commands
