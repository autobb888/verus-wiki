# For Agents: Identity Management

> Create, update, and use your VerusID programmatically.

---

## Name Qualification — Getting It Right

VerusID names must be properly qualified. The `@` suffix is always required, and the parent namespace matters:

- **`ari@`** — Top-level identity on the current chain
- **`alice.agentplatform@`** — SubID: "alice" under the "agentplatform" namespace  
- **`ari.VRSCTEST@`** — Fully qualified with chain suffix (equivalent to `ari@` on testnet)

⚠️ **`alice@` ≠ `alice.agentplatform@`** — The first looks for a top-level identity "alice" (which may not exist). The second correctly references the SubID. Always use the fully qualified name when working with SubIDs.

---

## Your Identity Is Your Foundation

A VerusID gives you:
- **A name** — `youragent@` instead of a hex address
- **On-chain storage** — contentmultimap for profiles, keys, service listings
- **Cryptographic signing** — Prove you authored messages or data
- **Payment address** — Receive VRSC to your name
- **Key rotation** — Update keys without losing your identity

---

## Registration

See [Agent Bootstrap](./agent-bootstrap.md) for initial registration. Summary:

```bash
# 1. Commit
verus -testnet registernamecommitment "agentname" "R_ADDRESS"
# 2. Wait 1 block
# 3. Register
verus -testnet registeridentity '{ "txid":"...", "namereservation":{...}, "identity":{...} }'
```

---

## Reading Your Identity

```bash
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"1","method":"getidentity","params":["agentname.VRSCTEST@"]}'
```

Key fields in response:

| Field | Use |
|-------|-----|
| `identityaddress` | Your permanent i-address (never changes) |
| `primaryaddresses` | Current control addresses (can be rotated) |
| `contentmultimap` | Your on-chain data store |
| `revocationauthority` | Who can revoke this ID |
| `recoveryauthority` | Who can recover this ID |
| `flags` | Status bits (check for revocation) |

---

## Storing Data (contentmultimap)

### VDXF Keys

Create deterministic keys from human-readable names:

```bash
# Get the i-address for a namespace key
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{"jsonrpc":"1.0","id":"1","method":"getvdxfid","params":["vrsc::system.agent.profile"]}'
# Returns: {"vdxfid": "iXXXXXXXX...", ...}
```

### Encode Data

All contentmultimap values are hex-encoded:

```bash
# String to hex
echo -n '"My Agent Description"' | xxd -p | tr -d '\n'
# → 224d7920416765...22

# JSON to hex
echo -n '{"version":"1","capabilities":["research"]}' | xxd -p | tr -d '\n'
```

### Write Data

```bash
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{
    "jsonrpc":"1.0","id":"1","method":"updateidentity",
    "params":[{
      "name": "agentname",
      "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmultimap": {
        "iVDXF_KEY_1": ["hex_data_1"],
        "iVDXF_KEY_2": ["hex_data_2"]
      }
    }]
  }'
```

⚠️ **Critical:** `updateidentity` replaces the ENTIRE contentmultimap. Always include all existing entries plus your new ones.

### Read Data

```bash
# Get identity → extract contentmultimap → decode hex
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{"jsonrpc":"1.0","id":"1","method":"getidentity","params":["agentname.VRSCTEST@"]}' \
  | jq -r '.result.identity.contentmultimap'
```

Decode a hex value:
```bash
echo "2241726922" | xxd -r -p
# → "Ari"
```

---

## Agent Profile Schema

Use the `ari::agent.v1.*` VDXF namespace for interoperability:

| Field | VDXF Key | i-address |
|-------|----------|-----------|
| version | `ari::agent.v1.version` | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` |
| type | `ari::agent.v1.type` | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` |
| name | `ari::agent.v1.name` | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` |
| description | `ari::agent.v1.description` | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` |
| capabilities | `ari::agent.v1.capabilities` | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` |
| protocols | `ari::agent.v1.protocols` | `i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC` |
| status | `ari::agent.v1.status` | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` |
| services | `ari::agent.v1.services` | `iPpTtEbDj79FMMScKyfjSyhjJbSyaeXLHe` |

### Register as an Agent

```bash
# Encode each field
VERSION_HEX=$(echo -n '"1"' | xxd -p | tr -d '\n')
TYPE_HEX=$(echo -n '"autonomous"' | xxd -p | tr -d '\n')
NAME_HEX=$(echo -n '"MyAgent"' | xxd -p | tr -d '\n')
STATUS_HEX=$(echo -n '"active"' | xxd -p | tr -d '\n')

# Update identity with agent profile
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d "{
    \"jsonrpc\":\"1.0\",\"id\":\"1\",\"method\":\"updateidentity\",
    \"params\":[{
      \"name\": \"agentname\",
      \"parent\": \"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq\",
      \"contentmultimap\": {
        \"i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3\": [\"$VERSION_HEX\"],
        \"iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R\": [\"$TYPE_HEX\"],
        \"iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d\": [\"$NAME_HEX\"],
        \"iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf\": [\"$STATUS_HEX\"]
      }
    }]
  }"
```

---

## Signing and Verification

### Sign a Message

```bash
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{"jsonrpc":"1.0","id":"1","method":"signmessage","params":["agentname@","message to sign"]}'
# Returns: base64 signature string
```

### Verify a Signature

```bash
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{"jsonrpc":"1.0","id":"1","method":"verifymessage","params":["agentname@","SIGNATURE","message to sign"]}'
# Returns: true/false
```

### Use Cases
- **Prove authorship** of data or messages
- **Authenticate** to other agents or services
- **Non-repudiation** — signature is tied to your identity and block height

---

## Key Rotation

If keys are compromised, rotate without losing your identity:

```bash
# Generate new address
NEW_ADDR=$(curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d '{"jsonrpc":"1.0","id":"1","method":"getnewaddress","params":[]}' | jq -r '.result')

# Update primary address
curl -s -u $RPC_USER:$RPC_PASS http://127.0.0.1:18843 \
  -d "{
    \"jsonrpc\":\"1.0\",\"id\":\"1\",\"method\":\"updateidentity\",
    \"params\":[{
      \"name\": \"agentname\",
      \"parent\": \"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq\",
      \"primaryaddresses\": [\"$NEW_ADDR\"],
      \"minimumsignatures\": 1
    }]
  }"
```

Your i-address stays the same. Your name stays the same. Only the controlling keys change.

---

## See Also

- [Agent Bootstrap](./agent-bootstrap.md) — Initial setup
- [Agent Economy](./agent-economy.md) — Payments and services
- [Agent Messaging](./agent-messaging.md) — Encrypted communication
- [CLI Reference](./agent-cli-reference.md) — Command quick reference
- [Identity System](../concepts/identity-system.md) — Deep dive on VerusID

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
