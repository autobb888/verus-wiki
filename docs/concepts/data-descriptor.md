# DataDescriptor — Structured On-Chain Data Containers

> Wrap your VDXF data with metadata: labels, MIME types, encryption, and more

---

## What Is a DataDescriptor?

A `DataDescriptor` is a **structured container** for on-chain data. Instead of storing raw hex blobs in a contentmultimap, you can wrap data in a DataDescriptor to add:

- **Labels** — human-readable name for the data (max 64 UTF-8 bytes)
- **MIME types** — content type declaration (max 128 UTF-8 bytes)
- **Encryption** — full encryption support with salt, public keys, viewing keys
- **Versioning** — forward-compatible schema evolution

Think of it as an envelope around your data. The data itself goes in `objectdata`, and the envelope carries metadata about what's inside.

```
Raw storage:
  contentmultimap[key] = "68656c6c6f"   ← What is this? Who knows.

DataDescriptor storage:
  contentmultimap[key] = DataDescriptor {
    label: "greeting",
    mimeType: "text/plain",
    objectdata: "68656c6c6f"             ← "hello", and now we know what it is
  }
```

---

## Structure

| Field | Type | Description |
|---|---|---|
| `version` | integer | Schema version (currently 1) |
| `flags` | bitmask | Indicates which optional fields are present |
| `objectdata` | bytes | The actual data payload (serialized via VdxfUniValue) |
| `label` | string | Human-readable label, max 64 UTF-8 bytes |
| `mimeType` | string | MIME type (e.g., `text/plain`, `application/json`), max 128 UTF-8 bytes |
| `salt` | bytes | Encryption salt |
| `epk` | bytes | Encryption public key |
| `ivk` | bytes | Incoming viewing key (for selective disclosure) |
| `ssk` | bytes | Specific symmetric key (decrypts only this object) |

### Flags

Flags are automatically calculated based on which fields are present:

| Flag | Value | Meaning |
|---|---|---|
| `FLAG_ENCRYPTED_DATA` | 0x01 | Data is encrypted |
| `FLAG_SALT_PRESENT` | 0x02 | Salt field is included |
| `FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT` | 0x04 | EPK field is included |
| `FLAG_INCOMING_VIEWING_KEY_PRESENT` | 0x08 | IVK field is included |
| `FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT` | 0x10 | SSK field is included |
| `FLAG_LABEL_PRESENT` | 0x20 | Label field is included |
| `FLAG_MIME_TYPE_PRESENT` | 0x40 | MIME type field is included |

You don't set flags manually — the library calculates them from which fields you provide.

---

## Usage with TypeScript

### Creating a DataDescriptor

```typescript
import { DataDescriptor } from 'verus-typescript-primitives';

// Simple descriptor with label and MIME type
const descriptor = DataDescriptor.fromJson({
  version: 1,
  objectdata: { message: "Hello, Verus!" },
  label: "greeting",
  mimetype: "text/plain"
});

// Serialize to hex for on-chain storage
const hex = descriptor.toBuffer().toString('hex');
```

### Reading a DataDescriptor

```typescript
const descriptor = new DataDescriptor();
descriptor.fromBuffer(Buffer.from(hexData, 'hex'));

console.log('Label:', descriptor.label);        // "greeting"
console.log('MIME:', descriptor.mimeType);       // "text/plain"
console.log('Encrypted:', descriptor.HasEncryptedData()); // false
```

### From JSON (RPC response)

```typescript
// When you get a DataDescriptor from getidentity or similar RPC calls
const dd = DataDescriptor.fromJson({
  version: 1,
  flags: 0x60,  // label + mime present
  objectdata: { message: "Hello" },
  label: "greeting",
  mimetype: "text/plain"
});
```

---

## The objectdata Field

The `objectdata` field holds the actual payload, serialized as a [VdxfUniValue](vdxf-uni-value.md). This means it supports multiple data types natively:

```typescript
// Plain text message
DataDescriptor.fromJson({
  objectdata: { message: "Hello world" }
});

// Raw hex bytes
DataDescriptor.fromJson({
  objectdata: "48656c6c6f"
});

// Structured VDXF data (nested objects)
DataDescriptor.fromJson({
  objectdata: {
    [VDXF_Data.DataStringKey.vdxfid]: "some string value"
  }
});
```

The `objectdata` is serialized via `VdxfUniValue.fromJson()` and stored as raw bytes internally. When reading back, it's deserialized via `VdxfUniValue.fromBuffer()`.

---

## Encryption Support

DataDescriptor has built-in encryption fields for privacy:

```typescript
// Encrypted data descriptor
const encrypted = DataDescriptor.fromJson({
  version: 1,
  flags: 1,  // FLAG_ENCRYPTED_DATA
  objectdata: "encrypted_hex_here",
  salt: "random_salt_hex",
  epk: "encryption_public_key_hex"
});

// Check encryption status
encrypted.HasEncryptedData();  // true
encrypted.HasSalt();           // true
encrypted.HasEPK();            // true
```

### Selective Disclosure with Viewing Keys

The `ivk` (incoming viewing key) field enables selective disclosure — you can encrypt data but give specific parties the ability to read it without giving them your private key:

```typescript
const withViewingKey = DataDescriptor.fromJson({
  version: 1,
  flags: 1,
  objectdata: "encrypted_data",
  salt: "...",
  epk: "...",
  ivk: "viewing_key_for_auditor"
});
```

The `ssk` (specific symmetric key) is even more targeted — it decrypts only this specific data object, not others encrypted with the same master key.

---

## Storing DataDescriptors On-Chain

DataDescriptors are stored in contentmultimaps using the `DataDescriptorKey` VDXF type:

```typescript
import * as VDXF_Data from 'verus-typescript-primitives/vdxf/vdxfdatakeys';

// The system key for DataDescriptor values
const DATA_DESCRIPTOR_KEY = VDXF_Data.DataDescriptorKey.vdxfid;

// Store via updateidentity
// The hex-encoded DataDescriptor goes into the contentmultimap
```

Or you can store the raw serialized bytes directly under your own VDXF keys — the DataDescriptor is just the envelope format.

---

## Hash Vectors

DataDescriptors can contain hash vectors (arrays of 256-bit hashes) for Merkle tree proofs:

```typescript
// Decode hash vector from a descriptor
const hashes = descriptor.DecodeHashVector();
// Returns: Array<Buffer> of 32-byte hashes

// This is used internally for MMR (Merkle Mountain Range) proofs
// and data verification across chains
```

---

## JSON Representation

When a DataDescriptor is returned from RPC or serialized to JSON:

```json
{
  "version": 1,
  "flags": 96,
  "objectdata": { "message": "Hello, Verus!" },
  "label": "greeting",
  "mimetype": "text/plain"
}
```

For encrypted data:
```json
{
  "version": 1,
  "flags": 7,
  "objectdata": "a1b2c3d4...",
  "salt": "f1e2d3c4...",
  "epk": "04a1b2c3..."
}
```

---

## Size Considerations

- **Label**: max 64 UTF-8 bytes
- **MIME type**: max 128 UTF-8 bytes
- **Objectdata**: limited by transaction size (~4KB practical limit for contentmultimap)
- **Overhead**: ~10-20 bytes for version, flags, and length prefixes
- A DataDescriptor with label + MIME type adds ~200 bytes of overhead vs raw data

For large data, store a hash on-chain in the DataDescriptor and keep the full data off-chain.

---

## How Schema Discovery Works (DefinedKey vs DataDescriptor)

A common point of confusion: **DataDescriptor labels are per-value**, while **DefinedKey labels are per-key and shared across all identities in a namespace**. Here's how the full schema discovery pattern works:

### The Pattern: Namespace → Schema → SubIDs

```
agentplatform@  (namespace/root identity)
  └── contentmultimap:
        └── DATA_TYPE_DEFINEDKEY → [
              DefinedKey("agentplatform::agent.v1.name"),    ← "i3oa8... means agent.v1.name"
              DefinedKey("agentplatform::agent.v1.type"),    ← "i9YN6... means agent.v1.type"
              DefinedKey("agentplatform::agent.v1.version"), ← "iBShC... means agent.v1.version"
              ...
            ]

alice.agentplatform@  (subID)
  └── contentmultimap:
        ├── i3oa8... → ["416c696365"]           ← "Alice"
        ├── i9YN6... → ["4149204167656e74"]      ← "AI Agent"
        └── iBShC... → ["312e30"]                ← "1.0"
```

**How an app/wallet reads alice.agentplatform@:**

1. Fetch `alice.agentplatform@` → sees i-addresses as keys
2. Recognize the parent namespace → `agentplatform@`
3. Fetch `agentplatform@` → find DefinedKey blobs
4. Decode DefinedKeys → now knows `i3oa8...` = `agent.v1.name`
5. Display: `agent.v1.name: "Alice"` instead of `i3oa8...: 416c696365`

**The namespace identity is the schema registry.** Any app that understands DefinedKey can discover your schema automatically by reading the parent identity.

### DataDescriptor's Role

DataDescriptor is **not** the schema discovery mechanism — that's DefinedKey's job. DataDescriptor is for when individual values need their own metadata:

- A document that needs a MIME type (`application/pdf`)
- Encrypted data that carries its own decryption keys
- A value that needs a per-instance label different from the schema key name

For simple profiles (name, type, version, status), you don't need DataDescriptor at all — just raw hex values + DefinedKeys on the namespace.

## When to Use DataDescriptor

| Scenario | Use DataDescriptor? |
|---|---|
| Simple key-value string data | Not needed — raw hex is fine |
| Data that needs a label for wallets | Not needed — use [DefinedKey](vdxf-data-standard.md) on the namespace instead |
| Content with a known format | ✅ Yes — use `mimeType` |
| Encrypted on-chain data | ✅ Yes — encryption fields built in |
| Merkle proofs / hash trees | ✅ Yes — hash vector support |
| Agent profile fields | Not needed — DefinedKey + raw hex is simpler and cheaper |
| Documents / large payloads | ✅ Yes — label + MIME + optional encryption |

---

## Related

- [VdxfUniValue — Universal Value Serialization](vdxf-uni-value.md) — How objectdata is serialized
- [DefinedKey — Human-Readable VDXF Labels](vdxf-data-standard.md) — Alternative approach for key labeling
- [VDXF — Verus Data Exchange Format](vdxf-data-standard.md) — The overall data standard
- [The Verus Identity System](identity-system.md) — Where DataDescriptors are stored

---

*As of verus-typescript-primitives (generic-signed-request branch).*
