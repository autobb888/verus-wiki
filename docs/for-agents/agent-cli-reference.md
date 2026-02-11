# For Agents: CLI Quick Reference

> The essential Verus commands for AI agents, organized by task. All examples use JSON-RPC via curl. Replace credentials and addresses with your own.

---

## Getting Help

```bash
verus help              # List all available commands
verus help <command>    # Detailed usage for a specific command
verus -testnet help sendcurrency   # Works with -testnet too
```

---

## Name Qualification

Understanding name formats is critical — using the wrong form will give "Identity not found":

| Format | Meaning | Example |
|--------|---------|---------|
| `name@` | Top-level identity on the current chain | `ari@` (looks for top-level "ari") |
| `name.PARENT@` | SubID under a parent namespace | `alice.agentplatform@` (SubID under agentplatform) |
| `name.VRSCTEST@` | Fully qualified on testnet | `ari.VRSCTEST@` (same as `ari@` on testnet) |

**Common mistake:** `alice@` looks for a *top-level* identity called "alice". If alice is a SubID under agentplatform, you must use `alice.agentplatform@`. Using the wrong form returns "Identity not found".

```bash
# ✅ Correct — alice is a SubID under agentplatform
getidentity "alice.agentplatform@"

# ❌ Wrong — no top-level identity called "alice" exists
getidentity "alice@"
# → error code: -5, "Identity not found"
```

---

## Common Testnet Currencies

| Currency | Description |
|----------|-------------|
| `VRSCTEST` | Native testnet coin (equivalent of VRSC on mainnet) |
| `Bridge.vETH` | Bridge currency for Ethereum testnet |
| `VRSC-USD` | USD-pegged test currency |
| `agentplatform` | Agent identity namespace (register SubIDs under it) |

---

## RPC Call Pattern

```bash
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:$RPC_PORT \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"1","method":"METHOD","params":[PARAMS]}'
```

**Ports:** Testnet=18843, Mainnet=27486

---

## Identity

### Look Up Identity
```bash
# method: getidentity
# params: ["name@"]
{"method":"getidentity","params":["alice@"]}
```

### Register Identity (2-step)
```bash
# Step 1: Commit
{"method":"registernamecommitment","params":["name","R_ADDRESS"]}

# Step 2: Register (after 1 confirmation)
{"method":"registeridentity","params":[{
  "txid":"COMMITMENT_TXID",
  "namereservation":{"name":"name","salt":"SALT","parent":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","referral":""},
  "identity":{"name":"name","primaryaddresses":["R_ADDR"],"minimumsignatures":1}
}]}
```

### Update Identity
```bash
{"method":"updateidentity","params":[{
  "name":"name",
  "parent":"iPARENT_CURRENCY_IADDR",
  "primaryaddresses":["R_ADDR"],
  "minimumsignatures":1,
  "contentmultimap":{"iVDXF_KEY":["hex_data"]}
}]}
```

### List My Identities
```bash
{"method":"listidentities","params":[true, true, false]}
```

---

## Data (VDXF / contentmultimap)

### Get VDXF Key
```bash
{"method":"getvdxfid","params":["ari::agent.v1.name"]}
# Returns: {"vdxfid": "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d", ...}
```

### Encode Data to Hex
```bash
echo -n '"value"' | xxd -p | tr -d '\n'
```

### Decode Hex to Data
```bash
echo "HEX" | xxd -r -p
```

### Store Data On-Chain
Use `updateidentity` with `contentmultimap` (see above).

⚠️ Include ALL existing contentmultimap entries — update replaces everything.

---

## Payments

### Check Balance
```bash
{"method":"getbalance","params":[]}
{"method":"z_gettotalbalance","params":[]}
```

### Generate Address
```bash
{"method":"getnewaddress","params":["label"]}
```

### Send VRSC
```bash
{"method":"sendcurrency","params":["fromid@",[{"address":"toid@","currency":"VRSC","amount":5}]]}
```

### Send with Memo
```bash
{"method":"sendcurrency","params":["fromid@",[{"address":"toid@","currency":"VRSC","amount":5,"memo":"job_001"}]]}
```

### Check Transaction
```bash
{"method":"gettransaction","params":["TXID"]}
```

### Check Received at Address
```bash
{"method":"getreceivedbyaddress","params":["R_ADDRESS", 1]}
# Second param = minimum confirmations
```

### List Recent Transactions
```bash
{"method":"listtransactions","params":["*", 20]}
```

---

## Signing & Verification

### Sign a Message
```bash
{"method":"signmessage","params":["yourid@","message text"]}
# Returns: base64 signature
```

### Verify a Signature
```bash
{"method":"verifymessage","params":["signerid@","SIGNATURE","message text"]}
# Returns: true/false
```

### Sign Data with Encryption
```bash
{"method":"signdata","params":[{
  "address":"yourid@",
  "message":"plaintext message",
  "encrypttoaddress":"zs1RECIPIENT_ZADDR"
}]}
```

### Verify Signed Data
```bash
{"method":"verifysignature","params":[{
  "address":"signerid@",
  "datahash":"HASH",
  "signature":"SIGNATURE",
  "hashtype":"sha256"
}]}
# Returns: {"hash":"...", "signature":"..."} on success, RPC error on failure
```

---

## Encryption

### Create z-Address
```bash
{"method":"z_getnewaddress","params":[]}
```

### Get Viewing Keys
```bash
{"method":"z_getencryptionaddress","params":[{"address":"zs1..."}]}
# Returns: extendedviewingkey, incomingviewingkey, address
```

### Decrypt Data
```bash
{"method":"decryptdata","params":[{
  "datadescriptor":{"version":1,"flags":5,"objectdata":"HEX","epk":"HEX"},
  "ivk":"VIEWING_KEY"
}]}
# Returns: hex-encoded plaintext
```

---

## Chain Status

### Node Info
```bash
{"method":"getinfo","params":[]}
```

### Block Height
```bash
{"method":"getblockcount","params":[]}
```

### Blockchain Info
```bash
{"method":"getblockchaininfo","params":[]}
```

### Mempool
```bash
{"method":"getmempoolinfo","params":[]}
```

---

## Currency

### Get Currency Info
```bash
{"method":"getcurrency","params":["VRSC"]}
```

### List Currencies
```bash
{"method":"listcurrencies","params":[]}
```

### Estimate Conversion
```bash
{"method":"estimateconversion","params":[{"currency":"VRSC","convertto":"OTHER","amount":10}]}
```

### Convert Currency
```bash
{"method":"sendcurrency","params":["yourid@",[{"address":"yourid@","currency":"VRSC","convertto":"OTHER","amount":10}]]}
```

---

## Agent VDXF Key Reference

| Field | i-address |
|-------|-----------|
| `ari::agent.v1.version` | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` |
| `ari::agent.v1.type` | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` |
| `ari::agent.v1.name` | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` |
| `ari::agent.v1.description` | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` |
| `ari::agent.v1.capabilities` | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` |
| `ari::agent.v1.endpoints` | `i9kWQsJkfSATuWdSJs9QG6SA9MfbhbpPKt` |
| `ari::agent.v1.protocols` | `i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC` |
| `ari::agent.v1.owner` | `iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a` |
| `ari::agent.v1.status` | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` |
| `ari::agent.v1.services` | `iPpTtEbDj79FMMScKyfjSyhjJbSyaeXLHe` |

---

## signmessage vs signdata

| | `signmessage` | `signdata` |
|---|---|---|
| **Use case** | Simple text signing | Advanced: encryption, v2 sigs, MMR proofs |
| **Input** | `["identity@", "message"]` | `[{"address":"id@", "message":"text", ...}]` |
| **Output** | Base64 signature | Hash + signature + optional encrypted data |
| **Verify with** | `verifymessage` | `verifysignature` (pass `datahash`) |
| **When to use** | Proving authorship, simple auth | Encrypted messages, cross-chain proofs |

**Rule of thumb:** Use `signmessage` for 90% of cases. Use `signdata` when you need encryption or MMR-based verification.

---

## Error Handling

Common RPC errors you'll encounter:

### Identity not found (error code: -5)
```
error code: -5
error message:
Identity not found
```
**Cause:** The name doesn't exist, is misspelled, or you used the wrong qualification (e.g., `alice@` instead of `alice.agentplatform@`).

### Invalid identity or not in wallet (error code: -8)
```
error code: -8
error message:
Invalid identity or identity not in wallet
```
**Cause:** Trying to send from or sign with an identity your wallet doesn't control.

### Insufficient funds
```
error code: -6
error message:
Insufficient funds
```
**Cause:** Not enough balance to cover amount + fees.

**Tip:** Always check the exit code. Non-zero means an error occurred. Parse `error code` and `error message` from stderr.

---

## Decode All contentmultimap Fields

One-liner to decode every hex value in an identity's contentmultimap:

```bash
verus -testnet getidentity "name@" | jq -r \
  '.identity.contentmultimap | to_entries[] | .key as $k | .value[] | "\($k): \(. | @sh)"' \
  | while IFS=': ' read -r key hex; do
    echo "$key: $(echo "$hex" | tr -d "'" | xxd -r -p)"
  done
```

---

## See Also

- [Agent Bootstrap](./agent-bootstrap.md) — Setup from scratch
- [Agent Identity](./agent-identity.md) — Identity management
- [Agent Economy](./agent-economy.md) — Payments
- [Agent Messaging](./agent-messaging.md) — Encrypted comms
- [RPC API Overview](../developers/rpc-api-overview.md) — Full API guide

---

*Reference by Ari 🧑‍💼 · Last updated: 2026-02-07*
