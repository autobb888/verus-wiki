# How To: Backup and Restore Your Wallet

> Protect your funds and identities with proper wallet backups

---

## Prerequisites

- Verus CLI installed with `verusd` running
- Access to the Verus data directory

---

## Method 1: backupwallet (Quick Backup)

Creates a copy of the `wallet.dat` file.

### Step 1: Run the Backup

```bash
verus backupwallet "mybackup20260207"
```

> ⚠️ **The filename must be alphanumeric only** — no spaces, dots, slashes, or special characters. `mybackup20260207` works. `my-backup.dat` does **not**.

### Step 2: Locate the Backup

The backup is saved to the directory configured via the `-exportdir` startup option. If `-exportdir` is not set, it defaults to the Verus data directory:
- **Linux:** `~/.komodo/VRSC/mybackup20260207`
- **macOS:** `~/Library/Application Support/Komodo/VRSC/mybackup20260207`
- **Windows:** `%APPDATA%\Komodo\VRSC\mybackup20260207`

For testnet, replace `VRSC` with `vrsctest`.

> 💡 **Tip:** Set `-exportdir=/path/to/backups` in your config or startup flags to control where backups are saved.

### Step 3: Move to Safe Storage

Copy the backup file to a secure location:

```bash
cp ~/.komodo/VRSC/mybackup20260207 /path/to/secure/storage/
```

---

## Method 2: dumpwallet (Full Export)

Exports all private keys and addresses to a human-readable text file. This is the most complete backup method.

### Step 1: Export

```bash
verus dumpwallet "fullexport20260207"
```

> ⚠️ Same naming rules — **alphanumeric only**.

### Step 2: Secure the Export

The exported file contains **all private keys in plain text**. Anyone with this file has full access to your funds.

```bash
# Move to secure location
cp ~/.komodo/VRSC/fullexport20260207 /path/to/secure/storage/

# Optionally encrypt
gpg -c /path/to/secure/storage/fullexport20260207
# Enter a strong passphrase when prompted

# Delete the unencrypted version
rm /path/to/secure/storage/fullexport20260207
```

### What's in the Export

The dump file contains:
- All private keys (WIF format)
- All addresses (transparent and shielded)
- Key metadata (creation time, labels)
- All private keys for transparent and shielded addresses

---

## Restoring from Backup

### Restore wallet.dat (from backupwallet)

1. **Stop the daemon:**
   ```bash
   verus stop
   ```

2. **Replace the wallet file:**
   ```bash
   # Backup the current wallet first!
   cp ~/.komodo/VRSC/wallet.dat ~/.komodo/VRSC/wallet.dat.old

   # Copy your backup in
   cp /path/to/secure/storage/mybackup20260207 ~/.komodo/VRSC/wallet.dat
   ```

3. **Restart the daemon:**
   ```bash
   verusd -fastload
   ```

4. **Rescan the blockchain** (to find all transactions):
   ```bash
   verus stop
   verusd -rescan
   ```

### Restore from dumpwallet (using importwallet)

1. **Copy the export file** to the Verus data directory:
   ```bash
   cp /path/to/secure/storage/fullexport20260207 ~/.komodo/VRSC/
   ```

2. **Import:**
   ```bash
   verus importwallet "fullexport20260207"
   ```

   > ⚠️ Same alphanumeric filename rules apply.

3. **Wait for rescan.** The import triggers a blockchain rescan to find all transactions associated with the imported keys. This can take a while depending on chain length.

---

## Backing Up Individual Keys

For specific addresses or identities:

### Export a Single Private Key

```bash
verus dumpprivkey "RYourAddress"
```

Save the output (WIF-format private key) securely.

### Import a Single Private Key

```bash
verus importprivkey "YourPrivateKeyWIF" "" true
```

The third parameter triggers a rescan.

---

## Best Practices

### Backup Frequency

| Event | Action |
|---|---|
| After creating a new identity | Backup immediately |
| After receiving funds to a new address | Backup soon |
| After any `getnewaddress` call | Backup (new key generated) |
| Weekly (routine) | Scheduled backup |
| Before any wallet upgrade | Backup beforehand |

### Storage

1. **Multiple copies** — Keep backups in at least 2 physically separate locations
2. **Encrypt** — Always encrypt backup files with a strong passphrase (GPG, VeraCrypt, etc.)
3. **Offline storage** — Store at least one copy on an air-gapped device or physical media (USB drive)
4. **Test restores** — Periodically verify your backups work by restoring to a test environment
5. **Label clearly** — Include the date and chain (mainnet vs testnet) in the filename

### Security

- **Never share** wallet files or private key exports
- **Never store unencrypted** backups on cloud storage (Dropbox, Google Drive, etc.)
- **Delete intermediate files** — If you decrypt a backup for restoration, delete the decrypted copy after
- **Secure the passphrase** — Store your encryption passphrase separately from the backup

---

## Common Errors

| Error | Cause | Solution |
|---|---|---|
| `Error: Filename must be alphanumeric` | Special characters in filename | Use only letters and numbers: `backup20260207` |
| `Error: wallet.dat not found` | Wrong data directory | Check your OS-specific path (see above) |
| `Error importing wallet` | File not in data directory | Copy the file to `~/.komodo/VRSC/` first |
| Missing transactions after restore | Rescan needed | Restart with `verusd -rescan` |
| Missing z-address funds | z-keys not in backup | Use `dumpwallet` (not `backupwallet`) for complete export including z-keys |

---

## Quick Reference

```bash
# Quick backup
verus backupwallet "backup20260207"

# Full export (all keys)
verus dumpwallet "export20260207"

# Import full export
verus importwallet "export20260207"

# Export single key
verus dumpprivkey "RAddress"

# Import single key
verus importprivkey "WIFkey" "" true

# Rescan blockchain after restore
verusd -rescan
```

---

## Related

- [VerusID Concepts](../concepts/verusid.md) — Understanding identities you're backing up
- [sendcurrency](../command-reference/multichain/sendcurrency.md) — Moving funds after restoration

---

*As of Verus v1.2.x.*
