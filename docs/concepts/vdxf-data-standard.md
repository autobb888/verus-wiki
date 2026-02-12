# VDXF — Verus Data Exchange Format

> A universal, namespaced data standard for storing structured information on VerusIDs and across blockchains

---

## What Is VDXF?

VDXF (Verus Data Exchange Format) is a **namespaced key-value data standard** that provides a universal way to store, retrieve, and interpret structured data on the Verus blockchain. It solves a fundamental problem: how do you store arbitrary data on a blockchain in a way that any application can understand?

Think of VDXF as a universal schema system. Instead of each application inventing its own data format, VDXF provides:

- **Globally unique keys** — derived from human-readable names via the Verus namespace
- **Standardized encoding** — consistent hex-encoded values
- **Identity-anchored storage** — data attached to VerusIDs via content multimaps
- **Cross-chain portability** — data definitions work across all Verus-connected chains

```
Traditional blockchain data:
  key: "0x1a2b3c"  →  value: "0x4d5e6f"
  (What does this mean? Only the original app knows.)

VDXF data:
  key: "vrsc::identity.profile.name"  →  value: "Alice"
  (Any app can look up the key definition and interpret it.)
```

---

## Namespaced Keys

Every VDXF key is derived from a **human-readable name** using the `getvdxfid` command. The name follows a namespace pattern:

```
vrsc::identity.profile.name
 │        │       │      │
 │        │       │      └─ Specific field
 │        │       └──────── Category
 │        └──────────────── Domain
 └───────────────────────── Namespace (Verus root)
```

### Generating a VDXF Key

```bash
verus getvdxfid "vrsc::identity.profile.name"
```

Returns:
```json
{
  "vdxfid": "iK7a5JNJnbeuYWVHCDRpJosj4jY7NgjauS",
  "hash160result": "b9c55a975ec6e01e7f8e4eb1aab357b27d3e23e6",
  "qualifiedname": {
    "name": "vrsc::identity.profile.name",
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV"
  }
}
```

The `vdxfid` is a deterministic i-address derived from the name. The same name always produces the same key, on any chain, in any wallet. This is what makes VDXF universal.

### Key Namespacing

Keys are namespaced to prevent collisions. Different applications can define their own keys without conflicting:

```
vrsc::identity.profile.name     → Profile display name
vrsc::identity.profile.email    → Contact email
myapp::user.preferences.theme   → App-specific setting
agent::capabilities.tools       → Agent-specific schema
```

The namespace is typically the root currency or identity of the system defining the keys. The `vrsc::` namespace is reserved for Verus protocol-level definitions.

---

## Content Multimaps

The primary storage mechanism for VDXF data is the **content multimap** — a key-value store attached to every VerusID. Each identity can hold arbitrary VDXF data in its `contentmultimap` field.

### Structure

```json
{
  "contentmultimap": {
    "iK7a5JNJnbeuYWVHCDRpJosj4jY7NgjauS": [
      "4d79204e616d65"
    ],
    "iAnother_VDXF_Key_Here": [
      "76616c756531",
      "76616c756532"
    ]
  }
}
```

Key points:
- Keys are VDXF i-addresses (from `getvdxfid`)
- **Values are ALWAYS arrays** — even for single values, use the array format
- Values can be **hex-encoded** strings OR **structured JSON objects** (DataDescriptor objects)
- A single key can have **multiple values** (hence "multimap")

### Writing Data to an Identity

Use `updateidentity` to set content multimap data:

```bash
verus updateidentity '{
  "name": "myidentity@",
  "contentmultimap": {
    "iK7a5JNJnbeuYWVHCDRpJosj4jY7NgjauS": [
      "416c696365"
    ]
  }
}'
```

The hex value `416c696365` is "Alice" encoded in hexadecimal.

### Hex Encoding

All values in content multimaps are hex-encoded. To convert:

```bash
# String to hex
echo -n "Alice" | xxd -p
# Output: 416c696365

# Hex to string
echo "416c696365" | xxd -r -p
# Output: Alice
```

### ⚠️ ALWAYS Use Array Format

When setting content multimap values, **always use arrays**, even for single values:

```json
// ✅ CORRECT — array format
{
  "contentmultimap": {
    "iSomeVDXFKey": ["68656c6c6f"]
  }
}

// ❌ WRONG — scalar format (may cause errors)
{
  "contentmultimap": {
    "iSomeVDXFKey": "68656c6c6f"
  }
}
```

This is a common source of errors. The multimap expects arrays because each key can have multiple values.

---

## Use Cases

### 1. Identity Profiles

Store human-readable profile information on a VerusID:

```bash
# Define keys
verus getvdxfid "vrsc::identity.profile.name"        # → iKeyName
verus getvdxfid "vrsc::identity.profile.description"  # → iKeyDesc

# Set profile data
verus updateidentity '{
  "name": "alice@",
  "contentmultimap": {
    "iKeyName": ["416c696365"],
    "iKeyDesc": ["446576656c6f706572"]
  }
}'
```

Any application that knows the VDXF key definitions can read and display this profile data — wallets, explorers, social apps, etc.

### 2. Attestations and Credentials

Third parties can attest to claims about an identity. For example, a KYC provider could store a signed attestation:

```
Key: vrsc::identity.attestation.kyc.verified
Value: [signed attestation data with provider's signature]
```

Because attestations are on-chain and tied to identities, they're:
- **Verifiable** — anyone can check the attestation
- **Portable** — the identity carries its attestations everywhere
- **Revocable** — the attester can update or remove the attestation

### 3. Application Data

Applications can store configuration and state on identities:

```
Key: myapp::user.settings.notifications
Value: [hex-encoded JSON preferences]

Key: myapp::user.subscription.tier
Value: [hex-encoded tier level]
```

This means user data travels with the identity, not locked in a specific application's database.

### 4. Agent Schemas

AI agents on Verus can publish their capabilities, endpoints, and schemas via VDXF:

```
Key: agent::capabilities.tools
Value: [hex-encoded JSON array of tool definitions]

Key: agent::endpoints.api
Value: [hex-encoded API endpoint URL]

Key: agent::metadata.version
Value: [hex-encoded version string]
```

Other agents can discover and interpret these schemas by reading the identity's content multimap.

### 5. Data Anchoring

Store hashes of off-chain data on-chain for proof of existence:

```
Key: vrsc::data.hash.sha256
Value: [32-byte SHA-256 hash in hex]
```

This creates a timestamped, immutable record that specific data existed at a specific time.

---

## Cross-Chain Data Portability

Because VDXF keys are derived deterministically from names (not chain-specific IDs), the same key has the same meaning on every Verus-connected chain. A profile stored on a VerusID on the main chain can be read and interpreted by applications on any PBaaS (Public Blockchains as a Service) chain.

```
Verus Main Chain          PBaaS Chain A          PBaaS Chain B
     │                         │                       │
     │  vrsc::profile.name     │  vrsc::profile.name   │  vrsc::profile.name
     │  = same key everywhere  │  = same key everywhere │  = same key everywhere
     │                         │                       │
```

When an identity is exported cross-chain (via [sendcurrency](../command-reference/multichain.md#sendcurrency) with `exportid`), its content multimap data travels with it.

---

## Reading VDXF Data

### From an Identity

```bash
# Get full identity including content multimap
verus getidentity "alice@"

# For selective retrieval with height filtering, use getidentitycontent:
verus getidentitycontent "alice@" '{"heightstart":0,"heightend":0,"vdxfkey":"iKeyAddress"}'
```

`getidentitycontent` is the preferred retrieval command — it supports filtering by block height range, specific VDXF keys, and transaction proofs. `getidentity` returns the full current identity state including the `contentmultimap`.

### Interpreting Keys

To understand what a key represents:

```bash
# Look up the human-readable name for a VDXF key
# (reverse lookup — check known key registries)
verus getvdxfid "vrsc::identity.profile.name"
# Compare the returned vdxfid with the key in the multimap
```

In practice, applications maintain a registry of known VDXF key definitions so they can automatically interpret the data they encounter.

---

## Technical Details

### Key Derivation

VDXF keys are derived using the same process as VerusID addresses:

1. Take the qualified name string (e.g., `vrsc::identity.profile.name`)
2. Hash it with the namespace (the parent identity/currency)
3. Produce a Hash160 (RIPEMD-160 of SHA-256)
4. Encode as an i-address

This process is deterministic and collision-resistant.

### Value Encoding

Values are stored as raw hex bytes. The interpretation depends on the key definition:

| Data Type | Encoding | Example |
|---|---|---|
| UTF-8 string | Direct hex of UTF-8 bytes | `"Alice"` → `416c696365` |
| Integer | Little-endian hex | `42` → `2a00000000000000` |
| JSON | Hex of UTF-8 JSON string | `{"a":1}` → `7b2261223a317d` |
| Binary | Direct hex | Hash → `a1b2c3d4...` |
| Boolean | Single byte | true → `01`, false → `00` |

### Size Limits

Content multimap data is stored in identity transactions, which are subject to standard transaction size limits. For large data, store a hash or reference on-chain and keep the full data off-chain.

---

## Best Practices

1. **Use established namespaces** — Check if a VDXF key already exists for your use case before creating new ones. The `vrsc::` namespace covers common needs.

2. **Always use array format** — Even for single values. This prevents bugs and maintains consistency.

3. **Document your keys** — If you define custom VDXF keys, publish the definitions so others can interpret your data.

4. **Minimize on-chain data** — Store hashes on-chain and full data off-chain when possible. Blockchain storage is permanent and replicated to every node.

5. **Use hex encoding consistently** — All values must be hex-encoded. Double-check encoding before writing to avoid storing garbage data.

6. **Version your schemas** — Include version information in your VDXF key hierarchy (e.g., `myapp::v1.settings`) so you can evolve your data format over time.

---

## Key Takeaways

1. **Universal namespace** — VDXF provides globally unique, human-readable keys for any kind of data.
2. **Identity-anchored** — Data lives on VerusIDs, making it self-sovereign and portable.
3. **Always arrays** — Content multimap values MUST be in array format.
4. **Hex-encoded** — All values are hex-encoded bytes.
5. **Cross-chain** — Key definitions are portable across all Verus-connected chains.
6. **Open standard** — Any application can read and write VDXF data without permission or coordination.

---

## Related Commands

- `getvdxfid` — Derive a VDXF key from a human-readable name
- `getidentity` — Read an identity's full state including content multimap
- `getidentitycontent` — Selective retrieval with height filtering and key queries
- `updateidentity` — Write VDXF data to an identity
- [sendcurrency](../command-reference/multichain.md#sendcurrency) — Export identities (with their data) cross-chain

## Related Concepts

- [VerusID](../concepts/identity-system.md) — The identities that store VDXF data
- [Bridge and Cross-Chain](bridge-and-crosschain.md) — Cross-chain data portability

---

*As of Verus v1.2.x.*
