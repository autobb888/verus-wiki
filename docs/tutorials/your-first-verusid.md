# Tutorial: Your First VerusID

> A beginner-friendly walkthrough to registering your own self-sovereign identity on the Verus blockchain.

**Estimated time:** 15–20 minutes  
**Difficulty:** Beginner  
**What you'll learn:** What a VerusID is, why you'd want one, and exactly how to create one step by step.

## What Is a VerusID?

A **VerusID** is a self-sovereign blockchain identity. Think of it like a username that:

- **You own** — not a company, not a platform. It's on the blockchain and only you control it.
- **Is human-readable** — instead of `RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5`, you're just `alice@`
- **Can receive funds** — people send coins to `alice@` instead of a long address
- **Stores data** — attach metadata, keys, and content to your identity
- **Is revocable/recoverable** — if your keys are compromised, you can revoke and recover (unlike regular crypto addresses)
- **Can launch currencies** — your VerusID is the foundation for creating tokens

## What You Need

- Verus CLI installed and synced to testnet (setup guide)
- A wallet with some VRSCTEST (~100 VRSCTEST for a root ID on testnet — same cost as mainnet but with free test coins)
- A name you want to register (letters, numbers, spaces — no special characters)

## Step 1: Make Sure Your Daemon Is Running

```bash
./verus -testnet getinfo
```

**What you should see:**
```json
{
  "version": 2000753,
  "blocks": 926961,
  "headers": 926961,
  "connections": 8,
  ...
}
```

✅ `blocks` should equal `headers` (fully synced).  
✅ `connections` should be > 0 (connected to network).

**If you get an error:** Start the daemon first:
```bash
./verusd -testnet -bootstrap
```

## Step 2: Get a Wallet Address

You need an R-address. This will be the primary address that controls your VerusID.

```bash
./verus -testnet getnewaddress "verusid-primary"
```

**What you should see:**
```
RXyz123ABCdefGHI456...
```

📝 **Copy this address.** You'll use it multiple times. We'll call it `YOUR_ADDRESS` from here on.

## Step 3: Fund Your Address

Check your balance:

```bash
./verus -testnet getbalance
```

**What you should see:**
```
0.00000000
```

or some number. You need ~100 VRSCTEST for a root VerusID (same cost as mainnet). Get free VRSCTEST from the Discord faucet.

**How to get testnet coins:**
- Ask in the Verus Discord `#testnet` channel
- Mine briefly: `./verus -testnet setgenerate true 1` (then stop with `setgenerate false` after getting some coins)

## Step 4: Pick a Name

Before committing, check if your desired name is available:

```bash
./verus -testnet getidentity "alice@"
```

**If available (what you want to see):**
```
Cannot find identity
```

**If taken (pick a different name):**
```json
{
  "identity": {
    "name": "alice",
    ...
  }
}
```

### Name Rules

Your name:
- ✅ Can have: letters, numbers, hyphens, spaces
- ❌ Cannot have: `\ / : * ? " < > | @ .`
- ❌ Cannot start or end with spaces
- ❌ Cannot have multiple consecutive spaces
- Is **case-insensitive** (`Alice` = `alice` = `ALICE`)

## Step 5: Create the Name Commitment

This is a security step. It hides your chosen name in a hash so miners can't see it and steal it before you register.

```bash
./verus -testnet registernamecommitment "YOUR_NAME" "YOUR_ADDRESS"
```

**Example with actual values:**
```bash
./verus -testnet registernamecommitment "alice" "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"
```

**What you should see:**
```json
{
  "txid": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    "referral": "",
    "nameid": "iJKLmnoPQRstUVwxYZ123..."
  }
}
```

> ⚠️ **CRITICAL: Copy and save this ENTIRE output somewhere safe!**  
> You need the `txid`, `salt`, and `nameid` for the next step. If you lose the `salt`, your commitment is wasted and you'll need to start over.

### Why Two Steps?

Why not just register in one command? Security!

1. **Commit** (this step) — publishes a hash of your name. No one can see what name you chose.
2. **Register** (next step) — reveals your name. Since your commitment was first, no one can front-run you.

This prevents miners from seeing "alice" in the mempool and quickly registering it themselves.

## Step 6: Wait for the Commitment to Confirm

The commitment must be mined into a block before you can register. Wait ~1 minute (1 block):

```bash
./verus -testnet gettransaction "YOUR_COMMITMENT_TXID"
```

**What you're looking for:**
```json
{
  "confirmations": 1,
  ...
}
```

✅ `confirmations` must be at least 1. If it says 0, wait and try again.

## Step 7: Register Your VerusID

Now use the commitment output to register. **Replace the values below with YOUR actual values from Step 5:**

```bash
./verus -testnet registeridentity '{
  "txid": "YOUR_COMMITMENT_TXID",
  "namereservation": {
    "version": 1,
    "name": "YOUR_NAME",
    "parent": "YOUR_PARENT_FROM_STEP5",
    "salt": "YOUR_SALT",
    "referral": "",
    "nameid": "YOUR_NAMEID"
  },
  "identity": {
    "name": "YOUR_NAME",
    "primaryaddresses": ["YOUR_ADDRESS"],
    "minimumsignatures": 1,
    "version": 3
  }
}'
```

> ⚠️ **CRITICAL:** The `namereservation` must include ALL fields exactly as returned in Step 5 — `version`, `name`, `parent`, `salt`, `referral`, and `nameid`. Missing any field causes a hash mismatch error. **The safest approach: copy your entire `namereservation` output from Step 5 exactly as-is.**
>
> **Note:** The `parent` field will be `"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"` on testnet (VRSCTEST) or `"i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"` on mainnet (VRSC). Always use the exact value from your Step 5 output.

**Full example with actual values:**
```bash
./verus -testnet registeridentity '{
  "txid": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  "namereservation": {
    "version": 1,
    "name": "alice",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    "referral": "",
    "nameid": "iJKLmnoPQRstUVwxYZ123..."
  },
  "identity": {
    "name": "alice",
    "primaryaddresses": ["RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"],
    "minimumsignatures": 1,
    "version": 3
  }
}'
```

**What you should see:**
```
f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5
```

That's the registration transaction ID. 🎉

## Step 8: Verify Your New Identity

Wait for 1 confirmation, then:

```bash
./verus -testnet getidentity "alice@"
```

**What you should see:**
```json
{
  "identity": {
    "version": 3,
    "name": "alice",
    "primaryaddresses": [
      "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"
    ],
    "minimumsignatures": 1,
    "revocationauthority": "alice@",
    "recoveryauthority": "alice@",
    ...
  }
}
```

**Congratulations! You now own `alice@` on the Verus blockchain!** 🎉

Notice that `revocationauthority` and `recoveryauthority` default to yourself. This means:
- You can revoke your own ID if compromised
- You can recover it after revocation

(In production, you'd set these to trusted friends or backup identities for extra security.)

## Step 9: Try Receiving Coins to Your VerusID

Now anyone can send coins to your ID instead of a long address:

```bash
# Someone else runs this:
./verus -testnet sendcurrency "*" '[{"address":"alice@","amount":1}]'
```

Check balance:
```bash
./verus -testnet getbalance
```

## Using a Referral (Save on Mainnet)

On mainnet, a root VerusID costs ~100 VRSC (80 VRSC with a referral (as low as ~20 net with a full referral chain)). Other options: free IDs from the Valu community program, cheap IDs on PBaaS chains (pennies), or subIDs under an existing namespace (fractions of a cent). Example with referral:

```bash
./verus registernamecommitment "alice" "YOUR_ADDRESS" "existingfriend@"
```

The referral identity must already exist. Both you and the referrer benefit.

## What Could Go Wrong

| Problem | What You See | Solution |
|---------|-------------|---------|
| Name taken | `getidentity` returns data | Choose a different name |
| Commitment not confirmed | `Must wait for commitment to be mined` | Wait ~1 minute for a block |
| Lost the salt | Can't complete registration | Create a new commitment (old one is wasted) |
| Insufficient funds | `Insufficient funds` | Fund your wallet with more VRSCTEST |
| Invalid name | `Invalid name` | Remove special characters from your name |
| Typo in JSON | Parse error | Check JSON syntax carefully — quotes, commas, brackets |
| Commitment expired | `Name commitment not found` | Commitments expire — create a new one and register quickly |

## What You've Learned

✅ What a VerusID is and why it matters  
✅ The two-step commitment/registration process  
✅ How to check name availability  
✅ How to register and verify your identity  
✅ How to receive coins to your VerusID

## Next Steps

- [Update your VerusID](../how-to/create-verusid.md#advanced-options) — add multisig, change authorities
- [Launch a token](../how-to/launch-token.md) — your VerusID can become a currency
- [Send and receive](beginner-send-receive.md) — practice moving coins around

---

*Tutorial by Ari 🧑‍💼 · Last updated: 2026-02-07*
