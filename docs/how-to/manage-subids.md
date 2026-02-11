# How to Manage SubIDs

SubIDs are child identities created under a parent namespace (currency). If you own `MyCurrency`, you can create identities like `user.MyCurrency@`. This guide covers creating, configuring, and updating subIDs.

> **Prerequisites**: You must own a currency/namespace on Verus. See [Launch a Token](launch-token.md).

## What Are SubIDs?

SubIDs are VerusIDs that exist **under your namespace**:

- Parent currency: `MyPlatform`
- SubID: `alice.MyPlatform@`

The parent namespace owner controls:
- Who can create subIDs (or allow open registration)
- The registration fee
- Whether subIDs can be created at all

### Use Cases

- **Platform user accounts** — `username.YourApp@`
- **Agent registry** — `agent-name.AgentNetwork@`
- **Organization members** — `employee.Company@`
- **NFT/asset naming** — `item-001.Collection@`

## Step 1: Check Your Namespace

Verify you own the currency that will be the parent:

```bash
./verus getcurrency "MyPlatform"
```

Confirm you control the identity associated with this currency.

## Step 2: Set SubID Registration Fees

When defining your currency (at launch), the `idregistrationfees` parameter controls subID costs. If your currency is already launched, the fee structure is set.

The fee can be set as low as 1 satoshi (0.00000001) or as high as you want. A standard 0.0001 VRSC transaction fee always applies on top.

## Step 3: Create a SubID

### Register the Name Commitment

```bash
./verus registernamecommitment "alice" "RControllerAddress" "" "MyPlatform"
```

The last parameter (`"MyPlatform"`) specifies the **parent namespace**.

Wait for 1 confirmation, then use the output to register:

### Register the SubID

```bash
./verus registeridentity '{
  "txid": "commitment-txid",
  "namereservation": {
    "name": "alice",
    "salt": "salt-from-commitment",
    "referral": "",
    "parent": "iPlatformIDAddress...",
    "nameid": "iSubIDAddress..."
  },
  "identity": {
    "name": "alice",
    "parent": "iPlatformIDAddress...",
    "primaryaddresses": ["RAliceAddress..."],
    "minimumsignatures": 1,
    "revocationauthority": "alice.MyPlatform@",
    "recoveryauthority": "alice.MyPlatform@"
  }
}'
```

> ⚠️ **The `parent` field is required** in the identity object. Without it, the registration targets the root VRSC namespace instead of your currency.

## Step 4: Verify the SubID

```bash
./verus getidentity "alice.MyPlatform@"
```

This shows the full identity including primary addresses, authorities, and the parent reference.

## Updating SubIDs

The subID owner (or the parent namespace owner, depending on configuration) can update it:

```bash
./verus updateidentity '{
  "name": "alice",
  "parent": "iPlatformIDAddress...",
  "primaryaddresses": ["RNewAddress..."],
  "minimumsignatures": 1
}'
```

> ⚠️ **Always include the `parent` field** when updating subIDs. Omitting it can cause the update to target the wrong namespace.

### What Can Be Updated?

- Primary addresses (key rotation)
- Minimum signatures
- Revocation and recovery authorities
- Private address
- Content map / content multimap

## Creating a SubID for Someone Else

A common use case: someone gives you their R-address, and you register a subID under your namespace with them as the owner. Here's the complete flow:

### 1. Commit the Name

The `controladdress` in the commitment must be an address **in your wallet** (since you're paying the fee). This is NOT the final owner — just needed for the commitment transaction.

```bash
./verus registernamecommitment "username" "RYourWalletAddress" "" "MyPlatform"
```

### 2. Register with Their Address as Owner

After 1 confirmation (~62 seconds), register the identity with the **recipient's R-address** in `primaryaddresses`:

```bash
./verus registeridentity '{
  "txid": "commitment-txid-from-step-1",
  "namereservation": {
    "version": 1,
    "name": "username",
    "salt": "salt-from-step-1",
    "referral": "",
    "parent": "iPlatformIDAddress...",
    "nameid": "iSubIDAddress-from-step-1..."
  },
  "identity": {
    "name": "username",
    "parent": "iPlatformIDAddress...",
    "primaryaddresses": ["RTheirAddress..."],
    "minimumsignatures": 1
  }
}'
```

> **Important:** Include ALL fields from the `namereservation` output in step 1 — `version`, `name`, `salt`, `referral`, `parent`, and `nameid`.

### 3. Send Them Namespace Tokens (Optional)

If your namespace uses tokens for fees or services, send some to the new owner:

```bash
./verus sendcurrency "*" '[{"address":"RTheirAddress...","amount":10,"currency":"MyPlatform"}]'
```

### 4. Verify

```bash
./verus getidentity "username.MyPlatform@"
```

The identity now belongs to the recipient — they control it with their private key. You (as namespace owner) cannot modify it unless you set yourself as revocation/recovery authority.

## Batch Creation

For creating many subIDs programmatically (e.g., onboarding users):

```bash
# Script pattern for each user
NAME="user001"
PARENT="iPlatformIDAddress..."
ADDR="RUserAddress..."

# Commit
RESULT=$(./verus registernamecommitment "$NAME" "$ADDR" "" "MyPlatform")
# Parse txid and salt from $RESULT
# Wait for confirmation
# Register with parsed values
```

> 💡 **Tip**: Each commitment needs 1 confirmation before registration. For batch operations, submit all commitments first, wait for a block, then register all.

## Revoking a SubID

If a subID is compromised, the revocation authority can disable it:

```bash
./verus revokeidentity "alice.MyPlatform@"
```

The recovery authority can then restore it with new keys using `recoveridentity`.

## Cost Summary

| Action | Cost |
|--------|------|
| Create subID | Registration fee (set by parent currency) |
| Update subID | Transaction fee only (~0.0001 VRSC) |
| Revoke subID | Transaction fee only |
| Recover subID | Transaction fee only |

## Related

- [Create a VerusID](create-verusid.md) — Root-level identity registration
- [Launch a Token](launch-token.md) — Create your namespace first
- [VerusID Concepts](../concepts/verusid.md) — Identity system deep dive
