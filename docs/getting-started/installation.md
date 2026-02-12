# Installing Verus

This guide walks you through downloading and installing Verus on your computer. No prior experience needed.

## Choose Your Software

Verus offers two options:

| Option | Best For | Description |
|--------|----------|-------------|
| **Verus Desktop** | Most users | Graphical wallet with mining, staking, and VerusID management built in |
| **Verus CLI** | Advanced users, servers | Command-line tools (`verusd`, `verus`) for headless operation |

## System Requirements

- **OS**: Linux (Ubuntu 18.04+), macOS (10.14+), Windows (10+)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk**: 15+ GB free (blockchain grows over time)
- **CPU**: Any modern x86_64 processor; ARM64 supported on Linux
- **Network**: Broadband internet for initial sync

## Download

### Official Sources

- **Website**: [https://verus.io/wallet](https://verus.io/wallet)
- **GitHub Releases**: [https://github.com/VerusCoin/VerusCoin/releases](https://github.com/VerusCoin/VerusCoin/releases)

> ⚠️ **Only download from official sources.** Never trust links from unofficial channels.

### Verus Desktop

Download from [verus.io/wallet](https://verus.io/wallet) — installers available for Linux, macOS, and Windows.

### Verus CLI

Download the appropriate archive from [GitHub Releases](https://github.com/VerusCoin/VerusCoin/releases):

| Platform | Filename Pattern |
|----------|-----------------|
| Linux x86_64 | `Verus-CLI-Linux-v*-amd64.tar.gz` |
| Linux ARM64 | `Verus-CLI-Linux-v*-arm64.tar.gz` |
| macOS | `Verus-CLI-macOS-v*.tar.gz` |
| Windows | `Verus-CLI-Windows-v*.zip` |

## Install — Linux

**Dependencies (if on a fresh system):**
```bash
sudo apt-get install libcurl3 g++-multilib    # Ubuntu/Debian
```

```bash
# Extract the archive
tar -xzf Verus-CLI-Linux-v*.tar.gz

# Move into the extracted directory
cd verus-cli

# Make binaries executable (usually already set)
chmod +x verusd verus fetch-params
```

### Zcash Parameters (Auto-Downloaded)

The daemon automatically downloads the required Zcash cryptographic parameters (~1.7 GB to `~/.zcash-params/`) on first run. The official docs recommend running `fetch-params` before first start, but the daemon will handle it if you skip this step:

```bash
./fetch-params   # Recommended before first start; daemon auto-downloads if missing
```

## Install — macOS

```bash
tar -xzf Verus-CLI-macOS-v*.tar.gz
cd verus-cli
```

If macOS blocks execution, go to **System Preferences → Security & Privacy** and click **Allow**.

## Install — Windows

1. Extract the `.zip` file to a folder (e.g., `C:\verus-cli`)
2. Open **Command Prompt** or **PowerShell**
3. Navigate to the folder: `cd C:\verus-cli`

> Zcash parameters are downloaded automatically on first daemon start. You can optionally run `fetch-params.bat` to pre-download them.

## Install — ARM (Linux)

ARM64 builds (Raspberry Pi 4, etc.) follow the same Linux steps — just download the `arm64` archive:

```bash
tar -xzf Verus-CLI-Linux-v*-arm64.tar.gz
cd verus-cli
```

> 💡 **Tip**: ARM devices with limited RAM may struggle during initial sync. Consider using a [bootstrap](first-steps.md#using-a-bootstrap-for-fast-sync) to speed things up.

## Verifying Signatures

Each release includes a signature file. To verify:

```bash
# Import the Verus signing key (if you haven't already)
gpg --import verus-signing-key.asc

# Verify the archive
gpg --verify Verus-CLI-Linux-v*-amd64.tar.gz.sig Verus-CLI-Linux-v*-amd64.tar.gz
```

You should see `Good signature from "Verus Coin"`. If verification fails, **do not use the download**.

SHA256 checksums are also published with each release for additional verification.

## What's Included (CLI)

The CLI package contains these key binaries:

| Binary | Purpose |
|--------|---------|
| `verusd` | The Verus daemon — runs the blockchain node |
| `verus` | CLI client — sends commands to `verusd` |
| `fetch-params` | Downloads required Zcash cryptographic parameters |
| `fetch-bootstrap` | Downloads blockchain bootstrap for fast initial sync |

## Next Steps

- [First Steps](first-steps.md) — Start the daemon and sync the blockchain
- [Wallet Setup](wallet-setup.md) — Create your first address and receive VRSC
- [Key Concepts](key-concepts.md) — Understand what makes Verus unique
