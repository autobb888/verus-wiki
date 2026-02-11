# Troubleshooting: Common Errors

> Quick reference for Verus CLI error messages — what they mean and how to fix them.

---

## "Identity not found"

**When:** Calling [getidentity](../command-reference/identity/getidentity.md) after registering a new identity.

**Cause:** The registration transaction hasn't been mined yet, or you're querying the wrong name format.

**Solution:**
```bash
# Wait for at least 1 confirmation, then retry
./verus getinfo | grep blocks
./verus getidentity "yourname@"
```

Also check: Are you using the correct fully-qualified name? On testnet, use `yourname.VRSCTEST@`. On mainnet, use `yourname@`.

---

## "bad-txns-failed-precheck"

**When:** Calling [updateidentity](../command-reference/identity/updateidentity.md) on a SubID.

**Cause:** Missing or incorrect `parent` field. SubID updates require specifying the parent currency's i-address.

**Solution:**
```bash
# Include the parent field in your updateidentity call
./verus updateidentity '{
  "name": "mysubid",
  "parent": "iXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "primaryaddresses": ["YOUR_R_ADDRESS"],
  "minimumsignatures": 1
}'
```

Find your parent's i-address:
```bash
./verus getidentity "parentname@" | grep '"identityaddress"'
```

---

## "Invalid parent currency"

**When:** Calling [registernamecommitment](../command-reference/identity/registernamecommitment.md) with a `referralidentity` parameter.

**Cause:** Using a friendly name (e.g., `VRSCTEST`) instead of the i-address for the parent currency parameter.

**Solution:** Use the i-address of the parent currency, not the friendly name:

```bash
# Wrong
./verus registernamecommitment "name" "R_ADDR" "referral@" "VRSCTEST"

# Right — use the i-address
./verus registernamecommitment "name" "R_ADDR" "referral@" "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"
```

Look up the i-address:
```bash
./verus getcurrency "VRSCTEST" | grep '"currencyid"'
```

---

## "Cannot obtain lock, is Verus shutting down?"

**When:** Any RPC call.

**Cause:** Another instance of `verusd` is running, or a previous instance didn't shut down cleanly and left a lock file.

**Solution:**
```bash
# Check for running instances
ps aux | grep verusd

# If another instance exists, stop it
./verus stop

# If no instance is running but error persists, remove the lock file
rm ~/.komodo/VRSC/.lock        # mainnet
rm ~/.komodo/vrsctest/.lock    # testnet

# Restart
./verusd -daemon
```

---

## "-idindex=1 required" / "Identity index not enabled"

**When:** Calling `getidentitieswithaddress`, `getidentitieswithrevocation`, or `getidentitieswithrecovery`.

**Cause:** The daemon wasn't started with identity indexing enabled. These lookup commands require an index.

**Solution:** Add to your config file and restart:

```ini
# In VRSC.conf or vrsctest.conf
idindex=1
```

Then restart and let it reindex:
```bash
./verus stop
./verusd -daemon -reindex
```

⚠️ Reindexing can take hours. Only enable if you need these commands.

---

## "coinsupply" Daemon Lockup

**When:** Calling `coinsupply` on large chains.

**Cause:** This RPC call can be extremely resource-intensive on chains with large UTXO sets. It may cause the daemon to become unresponsive.

**Solution:**
- Avoid calling `coinsupply` in production loops
- If the daemon is locked up, wait — it may complete eventually
- If stuck, stop cleanly and restart: `./verus stop && ./verusd -fastload`
- Use `getblockchaininfo` for general chain stats instead

---

## "error: couldn't connect to server" / RPC Connection Refused

**When:** Any `./verus` CLI call.

**Cause:** The daemon (`verusd`) isn't running, or you're connecting to the wrong port.

**Solution:**
```bash
# Check if daemon is running
ps aux | grep verusd

# If not running, start it
./verusd -fastload          # mainnet (or -bootstrap if first time)
./verusd -testnet -fastload # testnet (or -bootstrap if first time)

# If running but still failing, check your config ports
cat ~/.komodo/VRSC/VRSC.conf | grep rpcport
# Default: mainnet=27486, testnet=18843

# Verify with curl
curl -s -u rpcuser:rpcpassword http://127.0.0.1:27486 \
  -d '{"method":"getinfo"}' -H "Content-Type: application/json"
```

Common port mismatches:
| Network | Default RPC Port |
|---------|-----------------|
| Mainnet | 27486 |
| Testnet | 18843 |

---

## "Insufficient funds for fee" / "Insufficient funds"

**When:** Sending transactions, registering identities, or updating identities.

**Cause:** Your wallet doesn't have enough VRSC to cover the transaction amount plus fee.

**Solution:**
```bash
# Check balance
./verus getbalance

# Check specific address balances
./verus listaddressgroupings

# If balance shows but is unconfirmed
./verus getunconfirmedbalance
```

A root VerusID on mainnet costs ~100 VRSC (or ~20 VRSC with a referral). Cheaper alternatives exist: free IDs from the Valu community program, cheap IDs on PBaaS chains (pennies), or subIDs under an existing namespace (fractions of a cent). Transaction fees are ~0.0001 VRSC. Make sure you have enough for both the operation and the fee.

---

## "Invalid commitment salt" / Salt Mismatch

**When:** Calling [registeridentity](../command-reference/identity/registeridentity.md).

**Cause:** The `salt` in your `registeridentity` call doesn't match the `salt` from your `registernamecommitment` output.

**Solution:**
- Copy the **exact** `salt` value from the commitment response
- Don't modify, truncate, or re-encode it
- If you've lost the salt, you must create a new commitment (the old one is wasted)

```bash
# The commitment output looks like this — save ALL of it:
{
  "txid": "abc123...",
  "namereservation": {
    "name": "myname",
    "salt": "7f8a9b2c3d...",   ← Use this EXACT value
    "referral": "",
    "parent": "",
    "nameid": "iXYZ..."
  }
}
```

---

## "Name already registered"

**When:** Calling `registernamecommitment` or `registeridentity`.

**Cause:** Someone else already registered this name.

**Solution:**
```bash
# Verify
./verus getidentity "desiredname@"

# If it exists, choose a different name
# Names are first-come-first-served and permanent
```

---

## "Invalid name" / Forbidden Characters

**When:** Calling `registernamecommitment`.

**Cause:** The name contains forbidden characters: `\ / : * ? " < > | @`

**Solution:** Use only letters, numbers, hyphens, and spaces. No leading or trailing spaces. Names are case-insensitive (`Alice` and `alice` are the same).

---

## JSON Parse Errors

**When:** Any RPC call with JSON parameters.

**Cause:** Malformed JSON in your command. Common issues:
- Single quotes inside JSON (use `\"`)
- Trailing commas
- Missing brackets

**Solution:**
```bash
# Validate your JSON first
echo '{"name":"test","primaryaddresses":["Raddr"]}' | python3 -m json.tool

# On the CLI, wrap JSON in single quotes and use double quotes inside:
./verus updateidentity '{"name":"test","primaryaddresses":["R..."],"minimumsignatures":1}'
```

---

## "Transaction too large"

**When:** Updating identity with large contentmultimap data.

**Cause:** The total transaction size exceeds the maximum. Content multimap data is stored on-chain, and there's a per-transaction size limit.

**Solution:**
- Reduce the amount of data stored in a single update
- Split large data across multiple VDXF keys over multiple updates
- Store large blobs off-chain and reference them by hash

---

## See Also

- [Sync Issues](./sync-issues.md) — Blockchain sync problems
- [Transaction Problems](./transaction-problems.md) — Transaction-specific errors
- [Identity Issues](./identity-issues.md) — Identity registration and update issues

---

*Consolidated from Ari's testing notes · Last updated: 2026-02-07*
