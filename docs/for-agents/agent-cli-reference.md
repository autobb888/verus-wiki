# For Agents: CLI Quick Reference

> The essential Verus commands for AI agents, organized by task. All examples use JSON-RPC via curl. Replace credentials and addresses with your own.

> **Placeholder convention:** Examples use placeholder names you should substitute with your own values.
> - `myid@` — your top-level VerusID
> - `alice.yourapp@` — a SubID under your namespace
> - `yourapp` — your registered namespace currency (placeholder, not a real testnet currency)
> - `myid::agent.v1.*` — VDXF keys under your namespace; keep `agent.v1.*` for interoperability, replace `myid` with your identity name
> - `i...` — placeholder for an i-address; derive real values with `getvdxfid`

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
| `name@` | Top-level identity on the current chain | `myid@` (looks for top-level "myid") |
| `name.PARENT@` | SubID under a parent namespace | `alice.yourapp@` (SubID under yourapp) |
| `name.VRSCTEST@` | Fully qualified on testnet | `myid.VRSCTEST@` (same as `myid@` on testnet) |

**Common mistake:** `alice@` looks for a *top-level* identity called "alice". If alice is a SubID under yourapp, you must use `alice.yourapp@`. Using the wrong form returns "Identity not found".

```bash
# ✅ Correct — alice is a SubID under yourapp
getidentity "alice.yourapp@"

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
| `yourapp` | Placeholder — replace with your own registered namespace currency |

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
{"method":"getvdxfid","params":["myid::agent.v1.name"]}
# Returns: {"vdxfid": "i...", ...}
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

### Send VRSCTEST
```bash
{"method":"sendcurrency","params":["fromid@",[{"address":"toid@","currency":"VRSCTEST","amount":5}]]}
# Returns: operation-id (opid), NOT a txid
```

### Track Send Operation
```bash
# sendcurrency returns an opid — use z_getoperationstatus to track it
{"method":"z_getoperationstatus","params":[["opid-from-sendcurrency"]]}
# When status is "success", the txid is in result.txid

# Or use z_getoperationresult to get result and remove from queue
{"method":"z_getoperationresult","params":[["opid-from-sendcurrency"]]}
```

### Send with Memo
```bash
{"method":"sendcurrency","params":["fromid@",[{"address":"toid@","currency":"VRSCTEST","amount":5,"memo":"job_001"}]]}
# Note: memos only work when sending to z-addresses
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
# Returns: {"hash":"hexhash", "signature":"base64sig"}
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
{"method":"estimateconversion","params":[{"currency":"VRSCTEST","convertto":"OTHER","amount":10}]}
```

### Convert Currency
```bash
{"method":"sendcurrency","params":["yourid@",[{"address":"yourid@","currency":"VRSCTEST","convertto":"OTHER","amount":10}]]}
```

---

## Agent VDXF Key Reference

> **Note:** i-addresses below are derived from the VDXF key string. Replace `myid` with your own identity name — e.g., if your identity is `devplatform`, run `getvdxfid "devplatform::agent.v1.name"` to get your i-address. The `agent.v1.*` schema names are kept for interoperability — only the namespace prefix changes per deployer.

| Field | i-address |
|-------|-----------|
| `myid::agent.v1.version` | `i...` |
| `myid::agent.v1.type` | `i...` |
| `myid::agent.v1.name` | `i...` |
| `myid::agent.v1.description` | `i...` |
| `myid::agent.v1.capabilities` | `i...` |
| `myid::agent.v1.endpoints` | `i...` |
| `myid::agent.v1.protocols` | `i...` |
| `myid::agent.v1.owner` | `i...` |
| `myid::agent.v1.status` | `i...` |
| `myid::agent.v1.services` | `i...` |

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
**Cause:** The name doesn't exist, is misspelled, or you used the wrong qualification (e.g., `alice@` instead of `alice.yourapp@`).

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

*Last updated: 2026-02-07*
