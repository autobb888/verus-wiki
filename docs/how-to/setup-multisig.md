# How to Set Up Multisig with VerusID

Verus implements multisig natively through VerusID — no special scripts or contracts needed. This guide shows how to create a 2-of-3 multisig identity.

> **Prerequisites**: Daemon synced, enough VRSC for VerusID registration (~100 VRSC for a root ID, ~20 with referral; or use cheaper alternatives like subIDs or PBaaS chain IDs). See [Create a VerusID](create-verusid.md).

## What Is Multisig?

Multisig (multi-signature) requires **multiple parties to approve** a transaction before it executes. A 2-of-3 setup means any 2 out of 3 keyholders must sign.

### Use Cases

- **Shared treasury** — Team funds require multiple approvals
- **Security** — No single compromised key can drain funds
- **Business accounts** — Corporate spending controls
- **Escrow** — Third-party dispute resolution

## Step 1: Gather the Primary Addresses

You need the addresses (or VerusID i-addresses) of all signers. Each signer generates an address:

```bash
# Signer 1
./verus getnewaddress
# → R1aaaa...

# Signer 2
./verus getnewaddress
# → R2bbbb...

# Signer 3
./verus getnewaddress
# → R3cccc...
```

You can also use VerusID i-addresses (e.g., `alice@`, `bob@`, `carol@`).

## Step 2: Register a Multisig VerusID

Register the identity with multiple primary addresses and set `minimumsignatures` to 2:

```bash
./verus registernamecommitment "TeamWallet" "RControllerAddress"

# Wait for confirmation, then:
./verus registeridentity '{
  "txid": "commitment-txid",
  "namereservation": {
    "version": 1,
    "name": "TeamWallet",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "salt-from-commitment",
    "referral": "",
    "nameid": "iXXXXX..."
  },
  "identity": {
    "name": "TeamWallet",
    "primaryaddresses": [
      "R1aaaa...",
      "R2bbbb...",
      "R3cccc..."
    ],
    "minimumsignatures": 2,
    "revocationauthority": "TeamWallet@",
    "recoveryauthority": "RecoveryID@"
  }
}'
```

Key fields:
- `primaryaddresses` — All 3 signer addresses
- `minimumsignatures` — How many must sign (2 in this case)

## Step 3: Fund the Multisig Identity

Send VRSC to the identity:

```bash
./verus sendtoaddress "TeamWallet@" 100
```

## Step 4: Spending from Multisig

When spending from a multisig VerusID, the transaction needs signatures from the required number of keyholders.

### Create the Transaction (Signer 1)

```bash
./verus sendcurrency "TeamWallet@" '[{"address":"RecipientAddress","amount":25}]'
```

If Signer 1's wallet holds only one of the required keys, the daemon will produce a **partially signed transaction**. The process depends on how many keys are in the local wallet:

- **If 2+ required keys are in the same wallet**: The transaction completes automatically
- **If keys are on separate machines**: Use `signrawtransaction` to collect signatures

### Multi-Machine Signing

```bash
# Signer 1: Create raw transaction
./verus createrawtransaction '[...]' '{...}'

# Signer 1: Sign (partial)
./verus signrawtransaction "raw-tx-hex"
# Returns partially signed hex with complete: false

# Signer 2: Sign the partially signed tx
./verus signrawtransaction "partially-signed-hex"
# Returns fully signed hex with complete: true

# Either signer: Broadcast
./verus sendrawtransaction "fully-signed-hex"
```

## Changing Multisig Configuration

You can update the signers or threshold by updating the identity:

```bash
./verus updateidentity '{
  "name": "TeamWallet",
  "primaryaddresses": [
    "R1aaaa...",
    "R4dddd...",
    "R3cccc..."
  ],
  "minimumsignatures": 2
}'
```

> ⚠️ If `TeamWallet` is a **subID** (e.g., `TeamWallet.MyPlatform@`), you **must** include the `"parent"` field in the update. See [Manage SubIDs](manage-subids.md).

This requires the current minimum signatures to approve.

## Tips

- **Start with 2-of-3** — good balance of security and convenience
- **Use VerusIDs as signers** when possible — they're recoverable if keys are lost
- **Set recovery/revocation** to a separate identity you control
- **Test with small amounts** before committing significant funds
- **Document the setup** — make sure all signers know the configuration

## Related

- [Create a VerusID](create-verusid.md) — VerusID basics
- [VerusID Concepts](../concepts/verusid.md) — How identities work
