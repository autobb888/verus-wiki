# Troubleshooting: Identity Issues

> Fixing problems with VerusID registration, updates, and management.

---

## Commitment Expired Before Registration

**Symptom:** `registeridentity` fails after a successful `registernamecommitment`.

**Cause:** Name commitments expire after ~200 blocks (~3.3 hours). If you wait too long between commitment and registration, the commitment becomes invalid.

**Solution:**
```bash
# Check how many blocks have passed since your commitment
./verus gettransaction "COMMITMENT_TXID" | grep '"confirmations"'

# If confirmations > ~200, commitment is expired
# Create a new commitment
./verus registernamecommitment "yourname" "YOUR_R_ADDRESS"

# Register within a few blocks (don't wait hours)
```

**Prevention:** Complete registration within 10–15 minutes of commitment confirmation.

---

## Identity Update Not Reflecting

**Symptom:** Called [updateidentity](../command-reference/identity/updateidentity.md) but [getidentity](../command-reference/identity/getidentity.md) still shows old data.

**Cause:** The update transaction hasn't been mined yet.

**Solution:**
```bash
# Check if the update tx is confirmed
./verus gettransaction "UPDATE_TXID"

# Wait for at least 1 confirmation, then query again
./verus getidentity "yourname@"
```

If the update transaction was rejected:
```bash
# Check debug log for errors
tail -50 ~/.komodo/VRSC/debug.log | grep -i "identity\|error"
```

---

## SubID Parent Field Issues

**Symptom:** `"bad-txns-failed-precheck"` when updating a SubID.

**Cause:** SubID updates **require** the `parent` field with the parent currency's i-address. This is the most common SubID error.

**Solution:**
```bash
# Find the parent currency's i-address
./verus getcurrency "parentcurrency" | grep '"currencyid"'

# Include parent in ALL SubID updates
./verus updateidentity '{
  "name": "mysubid",
  "parent": "iPARENT_CURRENCY_IADDRESS",
  "primaryaddresses": ["YOUR_R_ADDRESS"],
  "minimumsignatures": 1,
  "contentmultimap": { ... }
}'
```

**Common mistake:** Using the parent **identity's** i-address instead of the parent **currency's** i-address. If `alice@` created a currency called `alicecoin`, SubIDs under that currency need the `alicecoin` currency i-address, not `alice`'s identity i-address.

---

## Revoked Identity Recovery

**Symptom:** Identity is revoked (flags show revocation) and you can't use it.

**Cause:** The revocation authority revoked the identity (intentionally or due to compromise).

**Solution:**

Only the **recovery authority** can restore a revoked identity:

```bash
# Check who the recovery authority is
./verus getidentity "revokedname@"
# Look at "recoveryauthority" field

# The recovery authority must call updateidentity to restore
# This reassigns primary addresses and clears revocation
./verus updateidentity '{
  "name": "revokedname",
  "primaryaddresses": ["NEW_SAFE_R_ADDRESS"],
  "minimumsignatures": 1,
  "revocationauthority": "revokedname@",
  "recoveryauthority": "revokedname@"
}'
```

⚠️ You must control the recovery authority's keys to do this. If you set recovery to an identity you don't control, only they can recover it.

**If you set revocation and recovery to yourself (default):**
```bash
# You can recover your own identity
# The revocation authority revokes, recovery authority restores
# If both are yourself, you control both actions
```

**Prevention:** Set revocation and recovery to **different** identities with keys stored separately. See [Identity System](../concepts/identity-system.md).

---

## contentmultimap Format Errors

**Symptom:** `updateidentity` fails or stores garbled data in contentmultimap.

### Problem: Bare String vs Array

**Cause:** contentmultimap values must be **arrays**, even for single values.

```bash
# WRONG — bare string
"contentmultimap": {
  "iXXXXX": "2241726922"
}

# RIGHT — array
"contentmultimap": {
  "iXXXXX": ["2241726922"]
}
```

### Problem: Not Hex-Encoded

**Cause:** Values must be hex-encoded strings, not raw JSON.

```bash
# WRONG — raw JSON
"contentmultimap": {
  "iXXXXX": ["hello"]
}

# RIGHT — hex-encoded
# echo -n '"hello"' | xxd -p | tr -d '\n'  →  2268656c6c6f22
"contentmultimap": {
  "iXXXXX": ["2268656c6c6f22"]
}
```

### Problem: Overwriting Existing Data

**Cause:** `updateidentity` replaces the **entire** contentmultimap. If you only specify one key, all other keys are deleted.

**Solution:** Always include ALL existing contentmultimap entries when updating:

```bash
# 1. Get current identity
./verus getidentity "yourname@"

# 2. Copy ALL existing contentmultimap entries
# 3. Add your new entry
# 4. Include everything in the update

./verus updateidentity '{
  "name": "yourname",
  "contentmultimap": {
    "iEXISTING_KEY_1": ["existing_hex_1"],
    "iEXISTING_KEY_2": ["existing_hex_2"],
    "iNEW_KEY": ["new_hex_data"]
  }
}'
```

---

## Registration Fails: "Must wait for commitment"

**Symptom:** `registeridentity` returns error about commitment not being ready.

**Cause:** The commitment transaction hasn't been mined yet (0 confirmations).

**Solution:**
```bash
# Check commitment confirmations
./verus gettransaction "COMMITMENT_TXID" | grep confirmations

# Wait for at least 1 confirmation (~1 minute)
# Then retry registeridentity
```

---

## Wrong Identity Version

**Symptom:** Identity features don't work as expected.

**Cause:** Identity was created with an older protocol version.

**Diagnose:**
```bash
./verus getidentity "yourname@"
# Check "version" field — current is 3
```

**Solution:** Update the identity. The update will use the current protocol version:
```bash
./verus updateidentity '{
  "name": "yourname",
  "primaryaddresses": ["YOUR_R_ADDRESS"],
  "minimumsignatures": 1
}'
```

---

## Can't Find My Identity in Wallet

**Symptom:** `listidentities` doesn't show your registered identity.

**Cause:** The wallet doesn't have the keys associated with the identity, or you need to rescan.

**Solution:**
```bash
# List all wallet identities
./verus listidentities true true false

# If not listed, check if the identity exists on-chain
./verus getidentity "yourname@"

# If it exists but isn't in your wallet, you may need to import keys
# or the identity's primary address isn't in this wallet
```

---

## See Also

- [Common Errors](./common-errors.md) — General error reference
- [How to Create a VerusID](../how-to/create-verusid.md) — Step-by-step registration
- [Identity System](../concepts/identity-system.md) — How identities work

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
