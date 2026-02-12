# VdxfUniValue — Universal Value Serialization

> The type system that lets Verus encode any structured data into bytes for on-chain storage

---

## What Is VdxfUniValue?

`VdxfUniValue` is Verus's **universal value serializer** — it takes structured data (strings, numbers, currency maps, signatures, descriptors, etc.) and encodes it into a compact binary format for on-chain storage. It's the bridge between JSON-friendly application data and raw blockchain bytes.

Every value stored in a contentmultimap ultimately gets serialized through VdxfUniValue. It's the encoding layer that sits beneath everything else.

```
Application Data (JSON)
        ↓
   VdxfUniValue.fromJson()
        ↓
   Binary bytes (Buffer)
        ↓
   Hex string → contentmultimap
        ↓
   On-chain storage
```

---

## Supported Data Types

VdxfUniValue recognizes a fixed set of VDXF system keys, each corresponding to a data type:

| System Key | Type | Size |
|---|---|---|
| `DataByteKey` | Single byte | 1 byte |
| `DataInt16Key` / `DataUint16Key` | 16-bit integer | 2 bytes |
| `DataInt32Key` / `DataUint32Key` | 32-bit integer | 4 bytes |
| `DataInt64Key` | 64-bit integer | 8 bytes |
| `DataUint160Key` | i-address (Hash160) | 20 bytes |
| `DataUint256Key` | 256-bit hash | 32 bytes |
| `DataStringKey` | UTF-8 string | variable |
| `DataByteVectorKey` | Raw byte vector | variable |
| `DataCurrencyMapKey` | Currency → amount map | variable |
| `DataRatingsKey` | Rating object | variable |
| `DataTransferDestinationKey` | Transfer destination | variable |
| `ContentMultiMapRemoveKey` | Multimap removal | variable |
| `CrossChainDataRefKey` | Cross-chain reference | variable |
| `DataDescriptorKey` | Data descriptor | variable |
| `MMRDescriptorKey` | MMR descriptor | variable |
| `SignatureDataKey` | Signature data | variable |
| `CredentialKey` | Credential | variable |
| `DataUint64Key` | 64-bit unsigned integer | 8 bytes |
| `DataVectorKey` | Generic vector | variable |
| `DataInt32VectorKey` | Vector of int32 | variable |
| `DataInt64VectorKey` | Vector of int64 | variable |
| `TypeDefinitionKey` | Type definition | variable |
| `EncryptionDescriptorKey` | Encryption descriptor | variable |
| `SaltedDataKey` | Salted (hashed) data | variable |
| `URLKey` | URL reference | variable |
| `UTXORefKey` | UTXO reference | variable |
| `MultimapKey` | Identity multimap key | variable |
| `MultimapRemoveKey` | Identity multimap removal | variable |
| `ProfileMediaKey` | Profile media attachment | variable |
| `ZMemoMessageKey` | Z-address memo message | variable |
| `ZMemoSignatureKey` | Z-address memo signature | variable |
| `MMRHashesKey` | MMR hashes | variable |
| `MMRLinksKey` | MMR links | variable |

Each type has its own serialization format. VdxfUniValue handles dispatch automatically based on the key.

---

## How It Works

### Encoding (JSON → Bytes)

```typescript
import { VdxfUniValue } from 'verus-typescript-primitives';
import * as VDXF_Data from 'verus-typescript-primitives/vdxf/vdxfdatakeys';

// Encode a string
const uni = VdxfUniValue.fromJson({
  [VDXF_Data.DataStringKey.vdxfid]: "Hello, Verus!"
});
const bytes = uni.toBuffer();

// Encode raw hex data
const raw = VdxfUniValue.fromJson("48656c6c6f");
const rawBytes = raw.toBuffer();

// Encode a message (shorthand)
const msg = VdxfUniValue.fromJson({ message: "Hello" });
```

### Decoding (Bytes → Structured Data)

```typescript
const uni = new VdxfUniValue();
uni.fromBuffer(someBuffer);

const json = uni.toJson();
// Returns the structured data with type keys
```

### Shorthand Inputs

VdxfUniValue accepts several shorthand formats:

```typescript
// Plain hex string → stored as raw bytes
VdxfUniValue.fromJson("48656c6c6f");

// Plain UTF-8 string (non-hex) → stored as UTF-8 bytes
VdxfUniValue.fromJson("Hello");

// Message object → stored as UTF-8 bytes
VdxfUniValue.fromJson({ message: "Hello" });

// Serialized hex → stored as raw bytes
VdxfUniValue.fromJson({ serializedhex: "48656c6c6f" });

// Serialized base64 → decoded and stored
VdxfUniValue.fromJson({ serializedbase64: "SGVsbG8=" });
```

---

## Multi-Value Arrays

VdxfUniValue internally stores an **array of key-value pairs**, supporting multiple typed values in sequence:

```typescript
const uni = VdxfUniValue.fromJson([
  { [VDXF_Data.DataStringKey.vdxfid]: "Alice" },
  { [VDXF_Data.DataUint32Key.vdxfid]: 42 },
  { [VDXF_Data.DataStringKey.vdxfid]: "Additional info" }
]);
```

This is serialized as a contiguous byte stream — each value tagged with its type key, version, and length.

---

## Binary Format

For typed values (string, byte vector, complex objects), the wire format is:

```
[20-byte key hash160] [varint version] [compact size] [data bytes]
```

For fixed-size primitives (byte, int16, int32, int64, uint160, uint256), just the raw bytes are written — no key prefix, no length:

```
[raw bytes of the value]
```

This means VdxfUniValue is **not self-describing for primitives** — you need to know the expected type from context (the contentmultimap key tells you what to expect).

---

## Role in the Data Pipeline

VdxfUniValue is the **serialization layer** in Verus's data stack:

```
┌─────────────────────────────────┐
│  DefinedKey                     │  ← Labels (what keys mean)
├─────────────────────────────────┤
│  DataDescriptor                 │  ← Containers (metadata + encryption)
├─────────────────────────────────┤
│  VdxfUniValue                   │  ← Serialization (encode/decode typed values)
├─────────────────────────────────┤
│  contentmultimap                │  ← Storage (on-chain key-value store)
├─────────────────────────────────┤
│  VerusID                        │  ← Identity (owns the data)
└─────────────────────────────────┘
```

- **DataDescriptor** uses VdxfUniValue to serialize its `objectdata` field
- **contentmultimap** values are VdxfUniValue-encoded bytes
- **DefinedKey** operates above this layer — it labels keys, not values

---

## Complex Type Examples

### Currency Map

```typescript
// Store a mapping of currency → amount
VdxfUniValue.fromJson({
  [VDXF_Data.DataCurrencyMapKey.vdxfid]: {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2S4": "100.0",
    "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV": "50.5"
  }
});
```

### Rating

```typescript
VdxfUniValue.fromJson({
  [VDXF_Data.DataRatingsKey.vdxfid]: {
    version: 1,
    trustLevel: 2,
    ratings: { "iSomeKey": "0500000000" }
  }
});
```

### Signature Data

```typescript
VdxfUniValue.fromJson({
  [VDXF_Data.SignatureDataKey.vdxfid]: {
    version: 1,
    systemID: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2S4",
    hashType: 1,
    signatureHash: "abc123...",
    identityID: "iSomeIdentity",
    sigType: 1,
    vdxfKeys: [],
    vdxfKeyNames: [],
    boundHashes: [],
    signatureAsVch: "signature_hex..."
  }
});
```

### Nested DataDescriptor

```typescript
VdxfUniValue.fromJson({
  [VDXF_Data.DataDescriptorKey.vdxfid]: {
    version: 1,
    objectdata: { message: "Nested content" },
    label: "inner-data",
    mimetype: "text/plain"
  }
});
```

---

## Fallback Behavior

When decoding, if VdxfUniValue encounters bytes it can't parse as a known type, it stores them as raw bytes under the empty key `""`:

```typescript
const uni = new VdxfUniValue();
uni.fromBuffer(unknownData);

// uni.values might contain:
// [{ "": <Buffer ...> }]
```

This ensures decoding never fails — unknown data is preserved as-is.

---

## Important Notes

1. **Encoding is one-way for primitives** — You can encode typed data into bytes, but decoding requires knowing the expected type from the contentmultimap key context.

2. **Always use array format in contentmultimap** — VdxfUniValue values go inside arrays:
   ```json
   { "contentmultimap": { "iSomeKey": ["hex_encoded_value"] } }
   ```

3. **Hex detection** — When passing a plain string, VdxfUniValue checks if it's valid hex. If yes, it's treated as raw bytes. If not, it's treated as UTF-8 text.

4. **Version field** — Currently always 1. Included for forward compatibility.

---

## Related

- [DataDescriptor — Structured Data Containers](data-descriptor.md) — Uses VdxfUniValue for objectdata
- [DefinedKey — Human-Readable VDXF Labels](definedkey-vdxf-labels.md) — Labels for VDXF keys
- [VDXF — Verus Data Exchange Format](vdxf-data-standard.md) — The overall data standard

---

*As of verus-typescript-primitives (generic-signed-request branch).*
