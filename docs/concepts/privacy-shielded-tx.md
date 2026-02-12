# Privacy & Shielded Transactions

Verus supports full transaction privacy using **Sapling zero-knowledge proofs**. This guide explains how privacy works, the commands involved, and best practices.

## Transparent vs Shielded Addresses

| | Transparent | Shielded |
|---|------------|----------|
| **Prefix** | `R...` | `zs...` |
| **Balances** | Public on blockchain | Hidden |
| **Amounts** | Visible | Encrypted |
| **Sender/Receiver** | Visible | Hidden |
| **Memo field** | No | Yes (512 bytes, encrypted) |
| **Speed** | Fast | Slightly slower (proof generation) |

Both types coexist on the same chain. You choose your privacy level per transaction.

## How It Works — Sapling Protocol

Verus uses the **Sapling** upgrade of Zcash's zero-knowledge proof system. When you send a shielded transaction:

1. A **zero-knowledge proof** proves the transaction is valid without revealing details
2. The sender, receiver, and amount are encrypted on-chain
3. Only the parties involved (and anyone with a viewing key) can see the details

Sapling proofs are fast to generate (a few seconds) and small in size.

## Sending Private Transactions

### Create a Shielded Address

```bash
./verus z_getnewaddress
```

Returns a `zs...` address.

> **Important limitation:** Z-addresses can only hold the **native blockchain currency** (e.g., VRSC on the Verus chain). Tokens and basket currencies cannot be held in shielded addresses.

> **Tip:** If your VerusID has a linked z-address, you can send native currency to it using the `VerusID@:private` syntax (e.g., `sendcurrency "*" '[{"address":"MyID@:private","amount":10}]'`).

### Shield Transparent Coins

Move coins from a transparent address to a shielded one:

```bash
./verus z_sendmany "RYourTransparentAddress" '[{"address":"zsYourShieldedAddress","amount":10.0}]'
```

This returns an **operation ID** (e.g., `opid-abc123`). Check its status:

```bash
./verus z_getoperationstatus '["opid-abc123"]'
```

### Shield Mining/Staking Rewards

> **Note:** As of block **800,200** on mainnet, coinbase shielding is **no longer required** before spending mining/staking rewards. Prior to this block, coinbase outputs had to be shielded (sent to a z-address and back) before they could be spent transparently.

Miners can shield coinbase rewards directly:

```bash
./verus z_shieldcoinbase "RYourMiningAddress" "zsYourShieldedAddress"
```

Or shield from all transparent addresses:

```bash
./verus z_shieldcoinbase "*" "zsYourShieldedAddress"
```

### Send Privately (Shielded → Shielded)

For maximum privacy, send from a shielded address to another shielded address:

```bash
./verus z_sendmany "zsYourShieldedAddress" '[{"address":"zsRecipientAddress","amount":5.0,"memo":"encrypted memo here"}]'
```

The optional `memo` field lets you include an encrypted message (up to 512 bytes) visible only to the recipient.

### Check Shielded Balances

```bash
# Single shielded address
./verus z_getbalance "zsYourShieldedAddress"

# All balances (transparent + shielded)
./verus z_gettotalbalance
```

### View a Shielded Transaction

```bash
./verus z_viewtransaction "txid"
```

Shows decoded details of a shielded transaction — inputs, outputs, amounts, and memos — from your wallet's perspective.

## Viewing Keys

Viewing keys let a third party **see** your shielded transactions without the ability to **spend** your funds. Useful for audits, tax reporting, or monitoring.

### Export a Viewing Key

```bash
./verus z_exportviewingkey "zsYourShieldedAddress"
```

### Import a Viewing Key

```bash
./verus z_importviewingkey "viewing-key-string"
```

After importing, the wallet rescans the blockchain to find matching transactions.

> ⚠️ **Viewing keys reveal all transactions for that address.** Share them only with trusted parties.

## Encryption Addresses

VerusIDs can have encryption addresses for receiving encrypted messages:

```bash
./verus z_getencryptionaddress "zsYourShieldedAddress"
```

This is used in protocol-level encrypted messaging between VerusIDs.

## Privacy Best Practices

### Do ✅

- **Use shielded-to-shielded** transactions for maximum privacy
- **Shield all at once** rather than in recognizable amounts
- **Wait between shielding and spending** to break timing correlation
- **Use unique shielded addresses** for different purposes
- **Shield mining rewards** with `z_shieldcoinbase` before spending

### Don't ❌

- **Don't shield and immediately unshield** the same amount — this links the transactions
- **Don't reuse shielded addresses** publicly — each exposure reduces privacy
- **Don't send exact round-trip amounts** (e.g., shield 10, unshield 10) — amount correlation
- **Don't ignore transparent change** — it can leak information

### Privacy Levels

| Transaction Type | Privacy Level |
|-----------------|---------------|
| Transparent → Transparent | None (fully public) |
| Transparent → Shielded | Partial (shielding is visible, destination hidden) |
| Shielded → Shielded | **Full** (sender, receiver, amount all hidden) |
| Shielded → Transparent | Partial (source hidden, destination visible) |

## Transaction Flow Summary

```
Mining Reward (coinbase)
  └─ z_shieldcoinbase ──→ Shielded Pool
                              │
Transparent Balance            │
  └─ z_sendmany ──────→ Shielded Pool
                              │
                     z_sendmany (zs→zs)
                              │
                         Full Privacy ✓
```

## Related

- [Send a Private Transaction](../how-to/send-private-transaction.md) — Step-by-step how-to
- [Wallet Setup](../getting-started/wallet-setup.md) — Address types explained
- [Command Reference: Wallet](../command-reference/wallet.md) — All z_* commands
