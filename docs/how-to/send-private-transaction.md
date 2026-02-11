# How to Send a Private Transaction

This guide walks you through sending a fully private transaction on Verus using shielded addresses.

> **Prerequisites**: Daemon running and synced, wallet with VRSC. See [First Steps](../getting-started/first-steps.md).

## Step 1: Create a Shielded Address

```bash
./verus z_getnewaddress
```

Output: `zsYourNewShieldedAddress...`

Save this address — you'll use it to hold private funds.

## Step 2: Shield Your Coins

Move VRSC from your transparent address to your shielded address.

### Option A: Using z_sendmany

```bash
./verus z_sendmany "RYourTransparentAddress" '[{"address":"zsYourShieldedAddress","amount":25.0}]'
```

### Option B: Shield Mining Rewards

If your VRSC comes from mining:

```bash
./verus z_shieldcoinbase "*" "zsYourShieldedAddress"
```

Both commands return an **operation ID**. Check progress:

```bash
./verus z_getoperationstatus '["opid-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]'
```

Wait for `"status": "success"` and at least 1 confirmation.

## Step 3: Send Privately

Send from your shielded address to the recipient's shielded address:

```bash
./verus z_sendmany "zsYourShieldedAddress" '[{"address":"zsRecipientAddress","amount":10.0}]'
```

This is a **fully private** transaction — sender, receiver, and amount are all hidden on the blockchain.

### With an Encrypted Memo

The memo field must be a **hex-encoded string**, not plain text. Convert your message to hex first:

```bash
# Convert text to hex
echo -n "Payment for services" | xxd -p
# Output: 5061796d656e7420666f72207365727669636573

# Send with hex memo
./verus z_sendmany "zsYourShieldedAddress" '[{"address":"zsRecipientAddress","amount":10.0,"memo":"5061796d656e7420666f72207365727669636573"}]'
```

The memo is encrypted and visible only to the recipient (up to 512 bytes of hex data).

## Step 4: Check Your Shielded Balance

```bash
# Specific address
./verus z_getbalance "zsYourShieldedAddress"

# All balances
./verus z_gettotalbalance
```

Output:
```json
{
  "transparent": "75.00000000",
  "private": "15.00000000",
  "total": "90.00000000"
}
```

## Step 5: View Transaction Details

```bash
./verus z_viewtransaction "txid-from-operation-result"
```

Shows the decoded transaction from your wallet's perspective, including amounts and memos.

To get the txid from a completed operation:

```bash
./verus z_getoperationresult '["opid-xxx"]'
```

The `txid` is in the result object.

## Sending to a Transparent Address (Partial Privacy)

You can send from shielded to transparent — the **source** stays hidden but the **destination** is public:

```bash
./verus z_sendmany "zsYourShieldedAddress" '[{"address":"RRecipientTransparentAddress","amount":10.0}]'
```

## Quick Reference

| Step | Command |
|------|---------|
| Create shielded address | `z_getnewaddress` |
| Shield coins | `z_sendmany` from R to zs |
| Shield mining rewards | `z_shieldcoinbase` |
| Send privately | `z_sendmany` from zs to zs |
| Check balance | `z_getbalance`, `z_gettotalbalance` |
| View transaction | `z_viewtransaction` |
| Check operation | `z_getoperationstatus` |

## Related

- [Privacy & Shielded Transactions](../concepts/privacy-shielded-tx.md) — How privacy works under the hood
- [Wallet Setup](../getting-started/wallet-setup.md) — Address types and basics
