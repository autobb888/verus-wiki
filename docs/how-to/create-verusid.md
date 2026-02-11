# How To: Create a VerusID

> Register a self-sovereign identity on the Verus blockchain.

**Estimated time:** 10–15 minutes  
**Cost:** 100 VRSC for a root mainnet ID (80 VRSC with referral — referrer receives 20 VRSC). Alternatives: free IDs via Valu (Verus Discord `#valu` channel, `/getid`), cheap IDs on PBaaS chains, subIDs (set by namespace owner). Testnet: ~0.01 VRSCTEST (free test currency).  
**Difficulty:** Beginner

## Prerequisites

- Verus CLI installed and daemon synced ([setup guide](../../../research/verus-cli-setup-guide.md))
- A funded wallet address (R-address) with enough VRSC/VRSCTEST
- Terminal access

## Steps

### 1. Get a Wallet Address

If you don't have one yet:

```bash
./verus -testnet getnewaddress "my-wallet"
```

**Expected output:**
```
RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5
```

Save this address — you'll use it as your control address and primary address.

### 2. Fund Your Address

You need VRSC (or VRSCTEST) at this address. Check your balance:

```bash
./verus -testnet getbalance
```

**Testnet:** Request VRSCTEST from the community Discord faucet.  
**Mainnet:** Purchase VRSC from an exchange or receive from another user.

### 3. Check Name Availability

Before committing, verify your desired name isn't taken:

```bash
./verus -testnet getidentity "YOUR_DESIRED_NAME@"
```

If you get `Identity not found`, the name is available.

### 4. Create a Name Commitment

This hides your name choice to prevent front-running:

```bash
./verus -testnet registernamecommitment "YOUR_NAME" "YOUR_R_ADDRESS"
```

**Example:**
```bash
./verus -testnet registernamecommitment "alice" "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"
```

**Expected output:**
```json
{
  "txid": "abc123def456...",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "7f8a9b2c3d...",
    "referral": "",
    "nameid": "iXYZ123..."
  }
}
```

> ⚠️ **Save this entire output!** You need it for the next step. If you lose the `salt`, your commitment is wasted.

#### With a Referral (saves ~80% on mainnet)

```bash
./verus -testnet registernamecommitment "alice" "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5" "existingid@"
```

### 5. Wait for Confirmation

Wait for the commitment transaction to be mined (at least 1 block, ~1 minute):

```bash
./verus -testnet gettransaction "YOUR_COMMITMENT_TXID"
```

Look for `"confirmations": 1` or higher.

### 6. Register the Identity

Using the output from Step 4, register the identity:

```bash
./verus -testnet registeridentity '{
  "txid": "YOUR_COMMITMENT_TXID",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "YOUR_PARENT_FROM_STEP4",
    "salt": "YOUR_SALT",
    "referral": "",
    "nameid": "YOUR_NAMEID"
  },
  "identity": {
    "name": "alice",
    "primaryaddresses": ["YOUR_R_ADDRESS"],
    "minimumsignatures": 1,
    "version": 3
  }
}'
```

> ⚠️ **CRITICAL:** The `namereservation` must include ALL fields from Step 4's output — `version`, `name`, `parent`, `salt`, `referral`, and `nameid`. Missing any field causes a hash mismatch error and registration will fail. **The safest approach is to copy the entire `namereservation` object from your Step 4 output exactly as-is.**
>
> **Note:** On testnet, `parent` will be `"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"` (VRSCTEST). On mainnet, it will be `"i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"` (VRSC). Always use whatever value was returned in Step 4.

**Expected output:**
```
a1b2c3d4e5f6...   (transaction ID)
```

### 7. Verify Your Identity

After 1 confirmation:

```bash
./verus -testnet getidentity "alice@"
```

You should see your identity details including your primary address.

## Testnet vs Mainnet Differences

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Command prefix | `./verus -testnet` | `./verus` |
| Registration cost | ~0.01 VRSCTEST | ~100 VRSC root (~20 w/ referral; free via Valu; pennies on PBaaS) |
| Referral discount | Available | Available (~80% off) |
| RPC port | 18843 | 27486 |
| Currency | VRSCTEST | VRSC |

## What Could Go Wrong

| Problem | Cause | Solution |
|---------|-------|---------|
| `Insufficient funds` | Not enough VRSC in wallet | Fund your address first |
| `Identity not found` after registering | Transaction not yet confirmed | Wait for 1+ confirmations |
| Lost the commitment output | Salt is gone forever | Create a new commitment (old one is wasted) |
| `Name already registered` | Someone beat you to it | Choose a different name |
| `Invalid name` | Name has forbidden characters (`\ / : * ? " < > \| @`) | Use only letters, numbers, spaces (no leading/trailing) |
| `Must wait for commitment` | Commitment not yet mined | Wait for at least 1 block |

## Advanced Options

### Multisig Identity

Require multiple signatures to control the identity:

```bash
./verus -testnet registeridentity '{
  "txid": "YOUR_TXID",
  "namereservation": { ... },
  "identity": {
    "name": "alice",
    "primaryaddresses": ["R_ADDRESS_1", "R_ADDRESS_2"],
    "minimumsignatures": 2
  }
}'
```

### Custom Revocation/Recovery

Set separate authorities for revoking and recovering your identity:

```bash
"identity": {
  "name": "alice",
  "primaryaddresses": ["YOUR_R_ADDRESS"],
  "minimumsignatures": 1,
  "revocationauthority": "trustedfriend@",
  "recoveryauthority": "backupid@"
}
```

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
