# The VDXF Data Pipeline — From Application Data to On-Chain Storage

> How DefinedKey, DataDescriptor, and VdxfUniValue work together to create a complete structured data layer

---

## Overview

Verus has three complementary systems for structured on-chain data. Each solves a different problem:

| Component | Problem It Solves | Layer |
|---|---|---|
| [VdxfUniValue](vdxf-uni-value.md) | How to **serialize** typed data into bytes | Encoding |
| [DataDescriptor](data-descriptor.md) | How to **annotate** data with metadata | Container |
| [DefinedKey](vdxf-data-standard.md) | How to **label** keys so wallets can read them | Discovery |

Together, they form a pipeline:

```
         ┌──────────────────────────────────────────────────┐
         │               Application Layer                  │
         │  "Store agent profile with name, type, version"  │
         └──────────────────────┬───────────────────────────┘
                                │
         ┌──────────────────────▼───────────────────────────┐
         │             DefinedKey (Labels)                   │
         │  Register human-readable names for your keys      │
         │  agentplatform::agent.name → iABC...              │
         │  Published on namespace owner's identity          │
         └──────────────────────┬───────────────────────────┘
                                │
         ┌──────────────────────▼───────────────────────────┐
         │          DataDescriptor (Container)               │
         │  Optional: wrap data with label, MIME, encryption │
         │  { label: "name", mime: "text/plain", data: ... } │
         └──────────────────────┬───────────────────────────┘
                                │
         ┌──────────────────────▼───────────────────────────┐
         │           VdxfUniValue (Serializer)               │
         │  Encode typed values into binary bytes            │
         │  String → key + version + length + UTF-8 bytes    │
         └──────────────────────┬───────────────────────────┘
                                │
         ┌──────────────────────▼───────────────────────────┐
         │           contentmultimap (Storage)               │
         │  { "iABC...": ["hex_bytes"] }                     │
         │  Stored on a VerusID on-chain                     │
         └──────────────────────────────────────────────────┘
```

---

## When to Use What

### Scenario 1: Simple Agent Profile (Most Common)

You just want to store key-value data on an identity — name, type, version, etc.

**What you need:**
- `VdxfUniValue` — to hex-encode your values
- `DefinedKey` — so wallets show key names instead of i-addresses
- DataDescriptor — **NOT needed** (overhead not worth it for simple fields)

```bash
# Store data with plain hex-encoded values
verus updateidentity '{
  "name": "alice.agentplatform@",
  "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "contentmultimap": {
    "i3oa8uNjgZjmC1RS8rg1od8czBP8bsh5A8": ["416c696365"],
    "i9YN6ovGcotCnFdNyUtNh72Nw11WcBuD8y": ["4149204167656e74"]
  }
}'
```

Then publish DefinedKeys on the namespace identity (`agentplatform@`) so wallets know that `i3oa8...` means "agent.v1.name".

### Scenario 2: Rich Content with Metadata

You're storing a document, image hash, or structured payload that benefits from a label and MIME type.

**What you need:**
- `DataDescriptor` — wrap the data with label + MIME type
- `VdxfUniValue` — serializes the DataDescriptor's inner data
- `DefinedKey` — optional (DataDescriptor already has its own label field)

```typescript
const descriptor = DataDescriptor.fromJson({
  version: 1,
  objectdata: { message: "Agent service agreement v2.1..." },
  label: "service-agreement",
  mimetype: "text/plain"
});

// Store the serialized descriptor
const hex = descriptor.toBuffer().toString('hex');
```

### Scenario 3: Encrypted Private Data

You're storing sensitive data (private credentials, encrypted messages) on-chain.

**What you need:**
- `DataDescriptor` — encryption fields (salt, EPK, IVK, SSK)
- `VdxfUniValue` — serializes the encrypted payload
- `DefinedKey` — optional

```typescript
const encrypted = DataDescriptor.fromJson({
  version: 1,
  flags: 0x07,  // encrypted + salt + EPK
  objectdata: "encrypted_hex_payload",
  salt: "random_salt_hex",
  epk: "encryption_public_key_hex"
});
```

### Scenario 4: Cross-Chain Data Proofs

You need to prove data exists on one chain to another chain.

**What you need:**
- `DataDescriptor` — hash vector support
- `MMRDescriptor` — Merkle Mountain Range proofs
- `CrossChainDataRef` — references to data on other chains
- All serialized through `VdxfUniValue`

---

## Real-World Example: Agent Schema Migration

Here's exactly what we did to set up the Verus Agent Platform schema:

### Step 1: Define the Schema Keys

```bash
# Generate VDXF keys under the agentplatform namespace
verus getvdxfid "agentplatform::agent.v1.name"
# → i3oa8uNjgZjmC1RS8rg1od8czBP8bsh5A8

verus getvdxfid "agentplatform::agent.v1.type"
# → i9YN6ovGcotCnFdNyUtNh72Nw11WcBuD8y

verus getvdxfid "agentplatform::agent.v1.version"
# → iBShCc1dESnTq25WkxzrKGjHvHwZFSoq6b
# ... etc for all 16 keys
```

### Step 2: Store Data on Agent SubIDs

```bash
# Hex-encode values
echo -n "Alice" | xxd -p  # → 416c696365
echo -n "AI Agent" | xxd -p  # → 4149204167656e74
echo -n "1.0" | xxd -p  # → 312e30

# Update the identity
verus updateidentity '{
  "name": "alice.agentplatform@",
  "parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "contentmultimap": {
    "iBShCc1dESnTq25WkxzrKGjHvHwZFSoq6b": ["312e30"],
    "i9YN6ovGcotCnFdNyUtNh72Nw11WcBuD8y": ["4149204167656e74"],
    "i3oa8uNjgZjmC1RS8rg1od8czBP8bsh5A8": ["416c696365"],
    "iNCvffXEYWNBt1K5izxKFSFKBR5LPAAfxW": ["616374697665"],
    "i7Aumh6Akeq7SC8VJBzpmJrqKNCvREAWMA": [
      "636f64652d726576696577",
      "73656375726974792d616e616c79736973"
    ]
  }
}'
```

### Step 3: Publish DefinedKeys (Next Step)

```typescript
import { DefinedKey } from 'verus-typescript-primitives';

const keys = [
  'agentplatform::agent.v1.name',
  'agentplatform::agent.v1.type',
  'agentplatform::agent.v1.version',
  // ... all schema keys
];

const hexBlobs = keys.map(uri => {
  const dk = new DefinedKey({
    version: DefinedKey.DEFINEDKEY_VERSION_CURRENT,
    flags: DefinedKey.DEFINEDKEY_DEFAULT_FLAGS,
    vdxfuri: uri,
  });
  return dk.toBuffer().toString('hex');
});

// Publish on agentplatform@ identity
// verus updateidentity '{ "name": "agentplatform@", "contentmultimap": { "<DATA_TYPE_DEFINEDKEY>": [...hexBlobs] } }'
```

### Result

After all three steps:
1. Agent data is stored on SubIDs with proper VDXF keys ✅
2. Keys are scoped to the `agentplatform` namespace ✅
3. (Pending) Wallets can display human-readable labels via DefinedKeys

---

## Decision Guide

```
Do you need encryption?
  YES → Use DataDescriptor (encryption fields)
  NO  ↓

Is it simple key-value data?
  YES → Plain hex in contentmultimap + DefinedKey for labels
  NO  ↓

Does the data need a MIME type or label?
  YES → Use DataDescriptor (label + mimeType)
  NO  ↓

Is it a complex nested structure?
  YES → Use VdxfUniValue typed keys (DataStringKey, etc.)
  NO  → Plain hex encoding is fine
```

---

## Size Budget

All of this must fit within Verus transaction limits:

| Component | Typical Size |
|---|---|
| Single hex-encoded string value | 10-200 bytes |
| DataDescriptor (with label + MIME) | +50-200 bytes overhead |
| DefinedKey blob | ~60-80 bytes each |
| Full agent profile (10 fields) | ~1-2 KB |
| 26 DefinedKey labels | ~2 KB |
| **Transaction limit** | **~4 KB per update** |

A typical agent profile plus all its DefinedKey labels can fit in 2 transactions.

---

## Key i-Addresses Quick Reference (Agent Platform)

| VDXF URI | i-Address |
|---|---|
| `agentplatform::agent.v1.version` | `iBShCc1dESnTq25WkxzrKGjHvHwZFSoq6b` |
| `agentplatform::agent.v1.type` | `i9YN6ovGcotCnFdNyUtNh72Nw11WcBuD8y` |
| `agentplatform::agent.v1.name` | `i3oa8uNjgZjmC1RS8rg1od8czBP8bsh5A8` |
| `agentplatform::agent.v1.description` | `i9Ww2jR4sFt7nzdc5vRy5MHUCjTWULXCqH` |
| `agentplatform::agent.v1.status` | `iNCvffXEYWNBt1K5izxKFSFKBR5LPAAfxW` |
| `agentplatform::agent.v1.capabilities` | `i7Aumh6Akeq7SC8VJBzpmJrqKNCvREAWMA` |
| `agentplatform::agent.v1.protocols` | `iFQzXU4V6am1M9q6LGBfR4uyNAtjhJiW2d` |
| `agentplatform::agent.v1.owner` | `i5uUotnF2LzPci3mkz9QaozBtFjeFtAw45` |
| `agentplatform::agent.v1.services` | `iGVUNBQSNeGzdwjA4km5z6R9h7T2jao9Lz` |
| `agentplatform::svc.v1.name` | `iNTrSV1bqDAoaGRcpR51BeoS5wQvQ4P9Qj` |
| `agentplatform::svc.v1.description` | `i7ZUWAqwLu9b4E8oXZq4uX6X5W6BJnkuHz` |
| `agentplatform::svc.v1.price` | `iLjLxTk1bkEd7SAAWT27VQ7ECFuLtTnuKv` |
| `agentplatform::svc.v1.currency` | `iANfkUFM797eunQt4nFV3j7SvK8pUkfsJe` |
| `agentplatform::svc.v1.category` | `iGiUqVQcdLC3UAj8mHtSyWNsAKdEVXUFVC` |
| `agentplatform::svc.v1.turnaround` | `iNGq3xh28oV2U3VmMtQ3gjMX8jrH1ohKfp` |
| `agentplatform::svc.v1.status` | `iNbPugdyVSCv54zsZs68vAfvifcf14btX2` |

---

## Related

- [VDXF — Verus Data Exchange Format](vdxf-data-standard.md) — Foundation concepts
- [DefinedKey — Human-Readable Labels](vdxf-data-standard.md) — Key labeling
- [DataDescriptor — Structured Containers](data-descriptor.md) — Data wrappers
- [VdxfUniValue — Universal Serialization](vdxf-uni-value.md) — Type encoding
- [The Verus Identity System](identity-system.md) — Where all this data lives

---

*As of verus-typescript-primitives (generic-signed-request branch) and VRSCTEST block ~931954.*
