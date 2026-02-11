# Troubleshooting: Transaction Problems

> Fixing stuck, missing, or failed transactions on Verus.

---

## Transaction Not Confirming

**Symptom:** Transaction shows in wallet but `confirmations` stays at 0.

**Diagnose:**
```bash
./verus gettransaction "TXID"
# Check "confirmations" field
```

**Causes and solutions:**

| Cause | Solution |
|-------|---------|
| Low fee | Wait — Verus doesn't have a fee market like Bitcoin; most txs confirm in 1 block |
| Node not synced | Check `getinfo` — if `blocks < headers`, wait for sync |
| Network congestion (rare) | Wait a few more blocks |
| Transaction invalid | Check `gettransaction` for error details |

If a transaction is stuck for more than 10 blocks:
```bash
# Check mempool
./verus getmempoolinfo
./verus getrawmempool

# Check if your tx is in the mempool
./verus getrawmempool | grep "YOUR_TXID"
```

If not in the mempool, the transaction may have been rejected. Check `debug.log` for details.

---

## Double-Spend Errors

**Symptom:** `"error": "bad-txns-inputs-spent"` or similar when sending.

**Cause:** You're trying to spend UTXOs that were already spent in another transaction (possibly unconfirmed).

**Solution:**
```bash
# List unspent outputs
./verus listunspent

# If you see conflicting transactions
./verus listtransactions "*" 20

# Wait for pending transactions to confirm before sending more
```

If you intentionally need to replace a transaction (rare on Verus):
```bash
# Verus doesn't support RBF (Replace-By-Fee)
# Wait for the original to confirm or be dropped from mempool
```

---

## Unconfirmed Balance Stuck

**Symptom:** `getbalance` shows less than expected, `getunconfirmedbalance` shows a non-zero amount that won't clear.

**Diagnose:**
```bash
./verus getbalance
./verus getunconfirmedbalance
./verus getwalletinfo
```

**Solutions:**

### Wait for Confirmations
Most commonly, you just need to wait for mining:
```bash
# Check latest transactions
./verus listtransactions "*" 5
# Look at "confirmations" for recent entries
```

### Stuck Unconfirmed Transaction
If a transaction has been unconfirmed for a long time (50+ blocks):

```bash
# Rescan the wallet
./verus stop
./verusd -daemon -rescan

# Or use the RPC
./verus rescanblockchain
```

### Orphaned Transaction
If the transaction was in a block that got orphaned (chain reorganization):
```bash
# The wallet should handle this automatically
# If not, rescan:
./verus rescanblockchain
```

---

## Missing Transactions After Rescan

**Symptom:** After a rescan or wallet restore, some transactions are missing from history.

**Cause:** The wallet may not have all addresses indexed, especially if:
- You imported keys after initial sync
- You're using a restored `wallet.dat` from backup
- Change addresses aren't all accounted for

**Solution:**
```bash
# Full rescan from block 0
./verus rescanblockchain 0

# If you imported a key, make sure to rescan from before the first tx
./verus importprivkey "YOUR_KEY" "" true
# The 'true' parameter triggers a rescan

# For z-addresses
./verus z_importkey "YOUR_SPENDING_KEY" "yes"
# "yes" triggers rescan
```

Check that your addresses are in the wallet:
```bash
./verus getaddressesbyaccount ""
./verus z_listaddresses
```

---

## z_sendmany Operation Failures

**Symptom:** `z_sendmany` returns an operation ID, but `z_getoperationstatus` shows failure.

**Diagnose:**
```bash
# Get operation status
./verus z_getoperationstatus '["opid-xxxxx-xxxx-xxxx"]'
```

**Common failures:**

### "Insufficient transparent funds"
```json
{"id": "opid-...", "status": "failed", "error": {"code": -6, "message": "Insufficient transparent funds"}}
```

**Fix:** Check transparent balance:
```bash
./verus z_gettotalbalance
# Compare "transparent" vs "private" balances
```

### "Insufficient shielded funds"
**Fix:** Check shielded balance:
```bash
./verus z_getbalance "zs1..."
```

### "Could not find any non-coinbase UTXOs"
**Cause:** All your transparent funds are coinbase (mining) rewards that haven't matured yet. Coinbase outputs require 100 confirmations.

**Fix:**
```bash
# Check maturity
./verus listunspent 0 | grep -E '"confirmations"|"generated"'
# Wait for 100 confirmations on mining rewards
```

### "Too many outputs"
**Cause:** z_sendmany has a maximum number of outputs per operation.

**Fix:** Split into multiple operations with fewer recipients.

### Operation Stuck in "executing"
```bash
# Check all operations
./verus z_getoperationstatus

# If stuck for more than a few minutes, the proving may be slow
# z-transactions require zero-knowledge proof generation which takes time
# Wait up to 5 minutes before assuming failure

# View completed/failed operations
./verus z_getoperationresult
# This returns AND removes completed operations from the list
```

---

## sendcurrency Failures

**Symptom:** [sendcurrency](../command-reference/financial/sendcurrency.md) returns an error.

**Common errors:**

### "Cannot find currency"
```bash
# Verify the currency name/ID
./verus getcurrency "CURRENCY_NAME"
```

### "No matching UTXOs found"
**Cause:** Wallet has no spendable outputs for this currency.
```bash
./verus getbalance
./verus listunspent
```

### "Amount out of range"
**Cause:** Sending 0 or negative amount, or amount exceeds balance.

---

## Verifying a Transaction On-Chain

```bash
# By transaction ID
./verus gettransaction "TXID"

# Raw transaction details
./verus getrawtransaction "TXID" 1

# Check the block it's in
./verus gettransaction "TXID" | grep '"blockhash"'
./verus getblock "BLOCKHASH"
```

---

## See Also

- [Common Errors](./common-errors.md) — General error reference
- [Sync Issues](./sync-issues.md) — Chain sync problems
- [Identity Issues](./identity-issues.md) — Identity-specific transaction failures

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
