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
         │  "Store app profile with name, type, version"    │
         └──────────────────────┬───────────────────────────┘
                                │
         ┌──────────────────────▼───────────────────────────┐
         │             DefinedKey (Labels)                   │
         │  Register human-readable names for your keys      │
         │  yourapp::data.v1.name → i...                     │
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
         │  { "i...": ["hex_bytes"] }                        │
         │  Stored on a VerusID on-chain                     │
         └──────────────────────────────────────────────────┘
```

---

## When to Use What

### Scenario 1: Simple App Profile (Most Common)

You just want to store key-value data on an identity — name, type, version, etc.

**What you need:**
- `VdxfUniValue` — to hex-encode your values
- `DefinedKey` — so wallets show key names instead of i-addresses
- DataDescriptor — **NOT needed** (overhead not worth it for simple fields)

```bash
# Store data with plain hex-encoded values
verus updateidentity '{
  "name": "alice.yourapp@",
  "parent": "i...",
  "contentmultimap": {
    "i...": ["416c696365"],          # yourapp::data.v1.name → "Alice"
    "i...": ["4149204167656e74"]     # yourapp::data.v1.type → "AI Agent"
  }
}'
```

Then publish DefinedKeys on the namespace identity (`yourapp@`) so wallets know each i-address means the corresponding field name.

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

## Example: Setting Up a Data Schema

Here's how to set up a data schema for your app:

### Step 1: Define the Schema Keys

```bash
# Generate VDXF keys under your namespace
verus getvdxfid "yourapp::data.v1.name"
# → i...

verus getvdxfid "yourapp::data.v1.type"
# → i...

verus getvdxfid "yourapp::data.v1.version"
# → i...
# ... one call per schema key
```

> See [Generating Your VDXF Key i-Addresses](#generating-your-vdxf-key-i-addresses) below for how these IDs are derived.

### Step 2: Store Data on Sub-Identities

```bash
# Hex-encode values
echo -n "Alice" | xxd -p  # → 416c696365
echo -n "AI Agent" | xxd -p  # → 4149204167656e74
echo -n "1.0" | xxd -p  # → 312e30

# Update the identity
verus updateidentity '{
  "name": "alice.yourapp@",
  "parent": "i...",
  "contentmultimap": {
    "i...": ["312e30"],            # yourapp::data.v1.version → "1.0"
    "i...": ["4149204167656e74"],  # yourapp::data.v1.type    → "AI Agent"
    "i...": ["416c696365"],        # yourapp::data.v1.name    → "Alice"
    "i...": ["616374697665"],      # yourapp::data.v1.status  → "active"
    "i...": [                      # yourapp::data.v1.capabilities
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
  'yourapp::data.v1.name',
  'yourapp::data.v1.type',
  'yourapp::data.v1.version',
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

// Publish on yourapp@ identity
// verus updateidentity '{ "name": "yourapp@", "contentmultimap": { "<DATA_TYPE_DEFINEDKEY>": [...hexBlobs] } }'
```

### Result

After all three steps:
1. App data is stored on SubIDs with proper VDXF keys ✅
2. Keys are scoped to the `yourapp` namespace ✅
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
| Full app profile (10 fields) | ~1-2 KB |
| 26 DefinedKey labels | ~2 KB |
| **Transaction limit** | **~4 KB per update** |

A typical app profile plus all its DefinedKey labels can fit in 2 transactions.

---

## Generating Your VDXF Key i-Addresses

VDXF IDs are **deterministic** — the same namespaced string always hashes to the
same i-address. Generate yours by running `getvdxfid` for each key:

```bash
verus getvdxfid "yourapp::data.v1.name"
verus getvdxfid "yourapp::data.v1.type"
verus getvdxfid "yourapp::data.v1.version"
# ... one call per schema key
```

Each call returns the i-address to use as the `contentmultimap` key for that field.
Because the mapping is deterministic, anyone who knows your namespace string can
re-derive the same IDs.

---

## Related

- [VDXF — Verus Data Exchange Format](vdxf-data-standard.md) — Foundation concepts
- [DefinedKey — Human-Readable Labels](vdxf-data-standard.md) — Key labeling
- [DataDescriptor — Structured Containers](data-descriptor.md) — Data wrappers
- [VdxfUniValue — Universal Serialization](vdxf-uni-value.md) — Type encoding
- [The Verus Identity System](identity-system.md) — Where all this data lives

---

*As of verus-typescript-primitives (generic-signed-request branch) on VRSCTEST.*
