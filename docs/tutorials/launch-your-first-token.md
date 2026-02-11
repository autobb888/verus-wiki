# Tutorial: Launch Your First Token on Verus

> Create your own cryptocurrency token on testnet — step by step, from scratch.

**Estimated time:** 30–45 minutes  
**Difficulty:** Beginner–Intermediate  
**What you'll learn:** What tokens are, why you'd create one, and exactly how to launch and mint your own.

## What Is a Token?

A **token** on Verus is a custom currency that lives on the Verus blockchain. Unlike starting a whole new blockchain, a token runs on top of Verus — lightweight and instant.

**Why would you create a token?**
- 🎮 In-game currency for a project
- 🏢 Organization membership tokens
- 💰 Loyalty or reward points
- 🤖 Platform credits (like API usage tokens)
- 🧪 Experimentation and learning

On Verus, tokens are **real DeFi primitives** — they can be part of liquidity baskets, converted via on-chain AMMs, and bridged to other chains.

## What You Need

- Verus CLI installed and synced to **testnet**
- A registered **VerusID** (this becomes your token name) — see [Your First VerusID tutorial](your-first-verusid.md)
- ~200 VRSCTEST in your wallet (currency definition fee)
- The VerusID must NOT already have a currency defined on it

## Step 1: Verify Your Setup

### Check daemon is running and synced

```bash
./verus -testnet getinfo
```

Confirm `blocks` ≈ `headers` and `connections` > 0.

### Check your VerusID exists

```bash
./verus -testnet getidentity "YOUR_TOKEN_NAME@"
```

**What you should see:** Your identity details. If `Identity not found`, create one first.

### Check no currency exists yet

```bash
./verus -testnet getcurrency "YOUR_TOKEN_NAME"
```

**What you should see:** `Cannot find currency`. If it returns data, this identity already has a currency — use a different one.

### Check your balance

```bash
./verus -testnet getbalance
```

You need ~200 VRSCTEST for the definition fee.

## Step 2: Understand Your Options

Before defining, decide on two key settings:

### Proof Protocol: Who Controls Supply?

| Value | Name | Meaning | Use When |
|-------|------|---------|----------|
| `2` | Centralized | **You** can mint and burn tokens anytime | Project tokens, platform credits, testing |
| `1` | Decentralized | **Nobody** can mint after launch; supply is fixed | Community tokens, fair-launch coins |

**For this tutorial, we'll use `2` (centralized)** so you can mint tokens.

### Options: What Type of Currency?

| Value | Type | Description |
|-------|------|-------------|
| `32` | Simple Token | Basic token — mint, send, burn |
| `33` | Fractional Basket | AMM-backed token with reserve currencies (advanced) |

**For this tutorial, we'll use `32` (simple token).**

## Step 3: Define Your Token

Here's the command. **Replace `YOUR_TOKEN_NAME` with your VerusID name:**

```bash
./verus -testnet definecurrency '{
  "name": "YOUR_TOKEN_NAME",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"YOUR_TOKEN_NAME@": 1000}]
}'
```

### What each field means:

| Field | Value | Why |
|-------|-------|-----|
| `name` | Your VerusID name | The token inherits the identity's name |
| `options` | `32` | TOKEN type (lives on this blockchain) |
| `proofprotocol` | `2` | Centralized — you can mint/burn |
| `idregistrationfees` | `0.01` | Cost to register sub-identities under this namespace |
| `idreferrallevels` | `0` | No referral rewards for sub-identity registration |
| `preallocations` | `[{"YOUR_TOKEN_NAME@": 1000}]` | Mint 1000 tokens to yourself at launch |

### Concrete example:

Let's say your VerusID is `mytoken@`:

```bash
./verus -testnet definecurrency '{
  "name": "mytoken",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"mytoken@": 1000}]
}'
```

**What you should see:**
```json
{
  "txid": "abc123def456789...",
  "tx": {
    ...
  },
  "hex": "0400008085..."
}
```

📝 **Save the `txid`** — you'll use it to check confirmation.

## Step 4: Wait for Confirmation

```bash
./verus -testnet gettransaction "YOUR_DEFINITION_TXID"
```

Wait until `"confirmations"` is at least 1 (~1 minute).

## Step 5: Verify Your Token Exists

```bash
./verus -testnet getcurrency "YOUR_TOKEN_NAME"
```

**What you should see:**
```json
{
  "name": "mytoken",
  "version": 1,
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01000000,
  "currencyid": "iABC123...",
  "supply": 1000.00000000,
  ...
}
```

🎉 **Your token exists!** Notice `supply: 1000` from the preallocation.

## Step 6: Check Your Token Balance

```bash
./verus -testnet getcurrencybalance "*" "YOUR_TOKEN_NAME"
```

**What you should see:**
```json
{
  "YOUR_TOKEN_NAME": 1000.00000000
}
```

You have 1000 of your tokens from the preallocation.

## Step 7: Send Tokens to Someone

```bash
./verus -testnet sendcurrency "*" '[{
  "address": "RECIPIENT_ADDRESS_OR_ID",
  "amount": 10,
  "currency": "YOUR_TOKEN_NAME"
}]'
```

**Example:**
```bash
./verus -testnet sendcurrency "*" '[{
  "address": "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5",
  "amount": 10,
  "currency": "mytoken"
}]'
```

**What you should see:**
```
opid-a1b2c3d4-e5f6-7890-...
```

That's an operation ID — the transaction is processing.

## Step 8: Mint More Tokens

Since you used `proofprotocol: 2`, you can create new tokens anytime:

```bash
./verus -testnet sendcurrency "YOUR_TOKEN_NAME@" '[{
  "address": "YOUR_ADDRESS",
  "amount": 5000,
  "currency": "YOUR_TOKEN_NAME",
  "mintnew": true
}]'
```

**Example:**
```bash
./verus -testnet sendcurrency "mytoken@" '[{
  "address": "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5",
  "amount": 5000,
  "currency": "mytoken",
  "mintnew": true
}]'
```

> ⚠️ **Important:** The `fromaddress` (first parameter) **must** be the token's controlling identity (`"mytoken@"`), not `"*"`. Only the identity that owns the currency can mint.

Check the new supply:

```bash
./verus -testnet getcurrency "YOUR_TOKEN_NAME" | grep supply
```

**What you should see:**
```
"supply": 6000.00000000
```

(1000 preallocation + 5000 minted = 6000)

## Step 9: Burn Tokens (Optional)

Remove tokens from circulation permanently:

```bash
./verus -testnet sendcurrency "*" '[{
  "address": "YOUR_ADDRESS",
  "amount": 100,
  "currency": "YOUR_TOKEN_NAME",
  "burn": true
}]'
```

Supply decreases by the burned amount.

## What You've Built

You now have a fully functional cryptocurrency token that can:
- ✅ Be sent between any Verus addresses or VerusIDs
- ✅ Be minted (new supply) by you at any time
- ✅ Be burned (reducing supply)
- ✅ Act as a namespace for sub-identities
- ✅ Be used in DeFi baskets and conversions (advanced)

## What Could Go Wrong

| Problem | What You See | Solution |
|---------|-------------|---------|
| Identity not found | `Identity not found` | Create the VerusID first with `registernamecommitment` + `registeridentity` |
| Currency already exists | `Currency already defined` | Use a different VerusID — each ID can only have one currency |
| Not enough funds | `Insufficient funds` | Need ~200 VRSCTEST for currency definition |
| Can't mint | `Cannot mint currency` | Check: (1) `fromaddress` must be the currency's ID, (2) `proofprotocol` must be 2 |
| JSON parse error | `Error parsing JSON` | Check your JSON carefully — matching quotes, commas, brackets |
| Token not in wallet | Balance shows 0 | Wait for confirmation; check with `getcurrencybalance` |

## Going Further

### Fractional Basket (AMM Token)

Want a token backed by reserves with automatic market-making? Change your definition:

```bash
./verus -testnet definecurrency '{
  "name": "YOUR_TOKEN_NAME",
  "options": 33,
  "currencies": ["VRSCTEST"],
  "weights": [1.0],
  "initialsupply": 100000,
  "initialcontributions": [1000],
  "idregistrationfees": 1,
  "idreferrallevels": 0
}'
```

This creates a token backed by VRSCTEST reserves with built-in conversion.

### Mainnet Notes

- Definition fee: ~200 VRSC (real money!)
- **Test on testnet first** — always
- Currency definitions are **permanent** — there's no undo
- Choose your name carefully — it represents your project forever

## Next Steps

- [Manage SubIDs](../how-to/manage-subids.md) under your token namespace
- Explore [sendcurrency](../command-reference/multichain/sendcurrency.md) for conversions and cross-chain transfers
- Read about [fractional basket currencies](../how-to/launch-token.md#option-c-fractional-basket-currency-amm) for DeFi

---

*Tutorial by Ari 🧑‍💼 · Last updated: 2026-02-07*
