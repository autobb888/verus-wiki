# How to Revoke and Recover a VerusID

This guide walks through the complete revoke and recover cycle for a VerusID. This is one of Verus's most powerful safety features — if your keys are compromised, you can disable the identity and recover it with new keys.

## Overview

Every VerusID has three key authorities:
- **Primary address(es)** — controls spending and signing
- **Revocation authority** — can disable (revoke) the identity
- **Recovery authority** — can re-enable and assign new keys to a revoked identity

By default, all three point to the identity itself. For real security, you should set revocation and recovery to **different** identities that you (or a trusted party) control.

## Prerequisites

- A VerusID you want to protect
- A separate VerusID to act as revocation/recovery authority
- Access to the Verus CLI (`verus` command)
- Both identities' keys must be in the respective wallets

## Step 1: Set Up Revocation and Recovery Authorities

First, assign a trusted identity as your rev/recovery authority. In this example, we'll set `ari@` as both authorities for `external1.agentplatform@`.

**From the owner's wallet** (the wallet holding the primary key for `external1.agentplatform@`):

```bash
verus -testnet updateidentity '{
  "name": "external1",
  "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
  "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129"
}'
```

| Field | Value | Meaning |
|-------|-------|---------|
| `name` | `external1` | The identity name (without parent suffix) |
| `parent` | `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` | Parent namespace i-address (required for subIDs) |
| `revocationauthority` | `i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129` | i-address of `ari@` |
| `recoveryauthority` | `i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129` | i-address of `ari@` |

> ⚠️ **Important**: Once you assign rev/recovery to another identity, only that identity can revoke or recover yours. Only the current revocation authority can change the revocation authority, and only the current recovery authority can change the recovery authority. Make sure you trust whoever controls that identity.

Wait for the transaction to confirm (1 block, ~60 seconds).

## Step 2: Verify the Setup

```bash
verus -testnet getidentity external1.agentplatform@
```

Check the output:
```json
{
  "identity": {
    "primaryaddresses": ["RFa3H1cRoZNJGsZ5oZHzLzB3r79ezHGHnQ"],
    "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129"
  },
  "status": "active",
  "canspendfor": true,
  "cansignfor": true
}
```

## Step 3: Revoke the Identity

This is done from the **revocation authority's wallet** (the wallet holding the keys for `ari@`).

```bash
verus -testnet revokeidentity "external1.agentplatform@"
```

Returns a transaction ID:
```
31c6aa273a368af8a4014dcccffa5302ab3452baeb68ed886383a315378df3d5
```

After confirmation, check the status:
```bash
verus -testnet getidentity external1.agentplatform@
```

```json
{
  "status": "revoked",
  "canspendfor": false,
  "cansignfor": false
}
```

The identity is now **disabled**:
- Cannot sign messages
- Cannot spend funds
- Cannot update itself
- Still exists on-chain and holds its funds safely

> 💡 **Funds are safe**: A revoked identity still holds all its VRSC and tokens. They're frozen, not lost. Recovery restores full access.

## Step 4: Recover with New Keys

This is done from the **recovery authority's wallet**. Generate a new address first:

```bash
verus -testnet getnewaddress
```
```
RMBy33oXB3WarCPKhnwZeho6obFmA1aG8h
```

Now recover the identity, assigning the new primary key:

```bash
verus -testnet recoveridentity '{
  "name": "external1",
  "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "primaryaddresses": ["RMBy33oXB3WarCPKhnwZeho6obFmA1aG8h"],
  "minimumsignatures": 1,
  "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
  "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129"
}'
```

Returns a transaction ID:
```
2cdfb153cd8e1665c6d49a64863990f340381bbb2aa15777fec4fe952d6772b0
```

> 💡 You can change rev/recovery during recovery too. To hand full control back to the owner, set both to the identity's own i-address.

## Step 5: Verify Recovery

After confirmation:

```bash
verus -testnet getidentity external1.agentplatform@
```

```json
{
  "identity": {
    "primaryaddresses": ["RMBy33oXB3WarCPKhnwZeho6obFmA1aG8h"],
    "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129"
  },
  "status": "active",
  "canspendfor": true,
  "cansignfor": true
}
```

The identity is **active again** with a brand new primary key. The old compromised key has no authority.

## Transferring Back to the Original Owner

If the recovery was done to protect the identity temporarily, you can transfer control back by updating the primary address to one the original owner provides:

```bash
verus -testnet updateidentity '{
  "name": "external1",
  "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "primaryaddresses": ["<owners-new-R-address>"],
  "revocationauthority": "<owners-choice>",
  "recoveryauthority": "<owners-choice>"
}'
```

## Real-World Use Cases

### Key Compromise
Your computer is hacked and your private keys are stolen. Your recovery authority (on a separate device or held by a trusted friend) can revoke the identity before the attacker drains funds, then recover it with fresh keys.

### Agent Platform Safety
An AI agent's identity is controlled by a platform. If the agent misbehaves or is compromised, the platform (as revocation authority) can instantly disable it. The agent's identity, reputation, and funds remain intact for later recovery.

### Dead Man's Switch
Set a trusted family member as recovery authority. If you lose access to your keys, they can recover your identity and all associated funds.

### Multi-Party Security
Set revocation to yourself (quick response) and recovery to a trusted third party (backup). You can freeze the identity fast, and the third party can help you recover it.

## Key Rules

| Rule | Detail |
|------|--------|
| Only revocation authority can revoke | Not even the identity owner can revoke if rev authority is different |
| Only recovery authority can recover | Recovery assigns new keys and re-enables |
| Only revocation authority can change revocation authority | Prevents attackers from reassigning safety nets |
| Only recovery authority can change recovery authority | Same protection for recovery |
| Funds are frozen, not lost | A revoked identity still holds all assets |
| Recovery can change everything | New keys, new rev/recovery authorities — full reset |
| One confirmation needed | Both revoke and recover take effect after 1 block (~60 seconds) |

## Commands Reference

| Command | Who Runs It | What It Does |
|---------|-------------|--------------|
| `updateidentity` | Identity owner | Set rev/recovery authorities |
| `revokeidentity` | Revocation authority | Disable the identity |
| `recoveridentity` | Recovery authority | Re-enable with new keys |
| `getidentity` | Anyone | Check status, authorities, keys |

## Test Data (from live testnet test)

This guide was written from a real test performed on VRSCTEST:

| Item | Value |
|------|-------|
| Identity | `external1.agentplatform@` (`iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx`) |
| Original primary | `RFa3H1cRoZNJGsZ5oZHzLzB3r79ezHGHnQ` |
| Rev/Recovery authority | `ari@` (`i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129`) |
| Revoke tx | `31c6aa273a368af8a4014dcccffa5302ab3452baeb68ed886383a315378df3d5` |
| New primary (after recovery) | `RMBy33oXB3WarCPKhnwZeho6obFmA1aG8h` |
| Recovery tx | `2cdfb153cd8e1665c6d49a64863990f340381bbb2aa15777fec4fe952d6772b0` |
