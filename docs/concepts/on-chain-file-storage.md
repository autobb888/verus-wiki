# On-Chain File Storage (Multipart Data)

Verus has a complete decentralized file storage system built into its identity layer. Files and data objects can be stored directly on-chain, split across multiple transaction outputs or even multiple blocks, with cryptographic verification and optional encryption.

This is one of the least documented features of the protocol — this page is the first comprehensive guide to how it works.

## Overview

The system has three layers:

| Layer | What It Does | Key Component |
|-------|-------------|---------------|
| **Data Creation** | Build structured data with MMR integrity | `signdata` RPC |
| **Storage** | Store data in identity contentmultimap, auto-chunk if too large | `updateidentity` + `BreakApart()` |
| **Retrieval** | Aggregate data across blocks, reassemble chunks | `getidentitycontent` + `Reassemble()` |

## How Data Gets Stored

### Small Data (< 6KB)

For small data, it's straightforward — store it directly in the identity's `contentmultimap` via `updateidentity`. The data goes into a single transaction output.

### Medium Data (6KB – 2MB)

When data exceeds `MAX_SCRIPT_ELEMENT_SIZE` (~6,000 bytes with PBaaS active), the protocol automatically splits it:

1. `updateidentity` detects the oversized data
2. Calls `CNotaryEvidence::BreakApart()` internally
3. Each chunk gets a `CMultiPartDescriptor` header with:
   - `index` — sequential chunk number (0, 1, 2, ...)
   - `totalLength` — total bytes of the complete data
   - `start` — byte offset of this chunk
4. Each chunk becomes a separate transparent output **in the same transaction**

A single transaction can be up to **2MB** (the maximum block size), so ~348 chunks of ~5,744 bytes each can fit in one tx.

### Large Data (> 2MB)

For data larger than 2MB, you need multiple transactions across multiple blocks:

1. Split your data into segments, each under 2MB
2. Store each segment via a separate `updateidentity` call
3. Use the same VDXF key for all segments
4. `getidentitycontent` with a height range will aggregate all segments

The `CIdentityMultimapRef` system allows referencing data by identity + VDXF key + block height range, enabling reconstruction from any number of blocks.

## Size Limits

| What | Limit | Notes |
|------|-------|-------|
| Single script element | ~6,000 bytes | `MAX_SCRIPT_ELEMENT_SIZE_PBAAS` |
| Chunk after overhead | ~5,744 bytes | Element minus 256 byte overhead |
| Single transaction | 2,000,000 bytes (2MB) | Can fill an entire block |
| Single block | 2,000,000 bytes (2MB) | `MAX_BLOCK_SIZE` |
| Multiple blocks | **Unlimited** | Via sequential `updateidentity` txs |

### Practical Examples

| File Size | Transactions Needed | Blocks Needed | Time (~60s/block) |
|-----------|-------------------|---------------|-------------------|
| 5 KB | 1 | 1 | ~1 minute |
| 100 KB | 1 | 1 | ~1 minute |
| 500 KB | 1 | 1 | ~1 minute |
| 1 MB | 1 | 1 | ~1 minute |
| 2 MB | 1 | 1 | ~1 minute |
| 5 MB | 3 | 3 | ~3 minutes |
| 10 MB | 5 | 5 | ~5 minutes |

## The Key Functions

### `CNotaryEvidence::BreakApart()` — The Splitter

**Location**: `src/primitives/block.cpp:820`

This is the core chunking function. It:
1. Serializes the entire evidence object to a byte array
2. Iterates through the bytes, cutting chunks of `maxChunkSize`
3. Wraps each chunk in a `CEvidenceData` with `TYPE_MULTIPART_DATA` and a `CMultiPartDescriptor`
4. Returns a vector of `CNotaryEvidence` objects, each containing one chunk

```
Data: [AAAA BBBB CCCC DDDD EEEE]
           ↓
BreakApart(chunkSize=4)
           ↓
Chunk 0: [AAAA] index=0, start=0,  totalLength=20
Chunk 1: [BBBB] index=1, start=4,  totalLength=20
Chunk 2: [CCCC] index=2, start=8,  totalLength=20
Chunk 3: [DDDD] index=3, start=12, totalLength=20
Chunk 4: [EEEE] index=4, start=16, totalLength=20
```

### `CNotaryEvidence(evidenceVec)` — The Reassembler

**Location**: `src/primitives/block.cpp:851`

The constructor that takes a vector of evidence chunks and reassembles them:
1. Validates first chunk is TYPE_MULTIPART_DATA
2. Reads `totalLength` from first chunk
3. Iterates all chunks, validating:
   - Sequential index numbers
   - Matching total length
   - Correct byte offset
4. Concatenates all chunk data
5. Deserializes the complete original object

If any validation fails, the result is marked `VERSION_INVALID`.

### `signdata` — The MMR Builder

**Location**: `src/wallet/rpcwallet.cpp:1231`

Creates a Merkle Mountain Range from one or more data objects. Supports:
- **Files**: `"filename": "/path/to/file"`
- **Text messages**: `"message": "hello world"`
- **Hex data**: `"serializedhex": "deadbeef"`
- **Base64 data**: `"serializedbase64": "..."`
- **Pre-computed hashes**: `"datahash": "256bithex"`
- **VDXF data**: `"vdxfdata": {...}`

Returns a `CMMRDescriptor` containing:
- The MMR root hash (signed by the identity)
- All leaf hashes
- All data descriptors with the actual data

### `getidentitycontent` — The Retrieval RPC

**Location**: `src/rpc/pbaasrpc.cpp:17215`

Retrieves aggregated contentmultimap data across a height range:

```bash
verus getidentitycontent "name@" [heightstart] [heightend] [txproofs] [txproofheight] [vdxfkey] [keepdeleted]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `name@` | required | Identity to query |
| `heightstart` | 0 | Start block height |
| `heightend` | current | End block height (-1 for mempool) |
| `txproofs` | false | Include transaction proofs |
| `txproofheight` | heightend | Proof reference height |
| `vdxfkey` | null | Filter by specific VDXF key |
| `keepdeleted` | false | Include deleted entries |

This calls `GetAggregatedIdentityMultimap()` internally, which walks through every identity update in the height range and collects all contentmultimap entries.

## The Reference System

Data stored on-chain can be referenced from anywhere using `CCrossChainDataRef`, which supports three reference types:

### 1. Cross-Chain UTXO Reference (`CPBaaSEvidenceRef`)
Points to a specific transaction output:
- Transaction hash + output index
- Object number + sub-object number
- System ID (for cross-chain)
- Data hash for verification

### 2. Identity Multimap Reference (`CIdentityMultimapRef`)
Points to data stored in an identity's contentmultimap:
- Identity i-address
- VDXF key
- Block height range (start/end)
- Data hash for verification
- System ID (for cross-chain)

This is the key mechanism for cross-block data retrieval. When you store a 5MB file across 3 blocks, you can create a reference that says "get all data from identity X, key Y, between blocks 1000 and 1003."

### 3. URL Reference (`CURLRef`)
Points to external data:
- URL string (up to 4096 characters)
- Optional data hash for verification

This enables hybrid on-chain/off-chain storage: store the hash on-chain, data off-chain, and the protocol can verify integrity.

## Data Operations on contentmultimap

The `GetAggregatedIdentityMultimap` function supports these operations via `ContentMultiMapRemoveKey`:

| Operation | Effect |
|-----------|--------|
| `ACTION_CLEAR_MAP` | Clear all entries |
| `ACTION_REMOVE_ALL_KEY` | Remove all values for a specific VDXF key |
| `ACTION_REMOVE_ONE_KEYVALUE` | Remove one specific value (by hash) |
| `ACTION_REMOVE_ALL_KEYVALUE` | Remove all matching values (by hash) |

This means you can update and delete on-chain data — the aggregation system processes these operations in block order.

## Encryption

The entire system supports optional encryption via Sapling z-addresses:

```bash
verus signdata '{
  "address": "myidentity@",
  "filename": "/path/to/secret.pdf",
  "createmmr": true,
  "encrypttoaddress": "zs1..."
}'
```

When `encrypttoaddress` is specified:
- Each data descriptor is encrypted to the z-address
- The MMR root and hashes can also be encrypted
- All data can be decrypted with the incoming viewing key
- Individual sub-objects can have unique symmetric decryption keys (SSKs)

This enables **private on-chain storage** where only the z-address holder can read the data.

## The CMMRDescriptor — Structured Multi-Object Container

When you store multiple objects together, they're organized in a Merkle Mountain Range:

```
                    MMR Root (signed)
                   /                \
              Hash(0,1)          Hash(2,3)
             /        \         /        \
         Hash(0)   Hash(1)  Hash(2)   Hash(3)
            |         |        |         |
         Data 0    Data 1   Data 2    Data 3
         (file)    (file)   (text)    (image)
```

Each leaf (data object) has:
- Raw data bytes
- Optional label
- Optional MIME type
- Optional salt (privacy — hides data from hash observers)
- Optional encryption

The MMR root is signed by the identity, providing cryptographic proof that:
- All data objects are authentic
- No objects have been added, removed, or modified
- The signer authorized this exact set of data

## Hash Types

Four hash algorithms are supported throughout the system:

| Type | Name | Use |
|------|------|-----|
| `sha256` | SHA-256 | Default for single objects |
| `sha256D` | Double SHA-256 | Bitcoin-style |
| `blake2b` | BLAKE2b | Default for MMR trees (fast) |
| `keccak256` | Keccak-256 | Ethereum-compatible |

## Architecture Diagram

```
    ┌─────────────────────────────────────────────────────┐
    │                   User Data                         │
    │            (files, messages, hex, etc.)              │
    └──────────────────────┬──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  signdata   │  Build MMR, hash, sign, encrypt
                    └──────┬──────┘
                           │
                  ┌────────▼────────┐
                  │ updateidentity  │  Store in contentmultimap
                  └────────┬────────┘
                           │
                    ┌──────▼──────┐
                    │  < 6KB ?    │
                    └──┬──────┬──┘
                  YES  │      │  NO
                       │      │
              ┌────────▼┐  ┌──▼───────────┐
              │ Single  │  │ BreakApart() │
              │ output  │  │ N chunks     │
              └────┬────┘  └──┬───────────┘
                   │          │
                   │    ┌─────▼─────┐
                   │    │ Output 0  │──┐
                   │    │ Output 1  │  │ Same transaction
                   │    │ Output N  │──┘ (up to 2MB)
                   │    └─────┬─────┘
                   │          │
              ┌────▼──────────▼────┐
              │   On-Chain Block   │  Mined into blockchain
              └────────┬───────────┘
                       │
             ┌─────────▼──────────┐
             │ getidentitycontent │  Retrieve + aggregate
             └─────────┬──────────┘
                       │
              ┌────────▼────────┐
              │  Reassemble()   │  Validate + concatenate chunks
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  Original Data  │  Fully reconstructed
              └─────────────────┘
```

## Hidden/Undocumented RPC

| Command | Category | Notes |
|---------|----------|-------|
| `hashdata` | `hidden` | Not visible in `help` output. Hashes arbitrary hex data with configurable hash type and personal string. |

```bash
# Usage (undocumented):
verus hashdata "hexdata" "hashtype" "personalstring"
```

## Practical Guide: Storing a File

### Step 1: Create and sign the data

```bash
# Single file
verus signdata '{
  "address": "myidentity@",
  "filename": "/path/to/document.pdf",
  "createmmr": true,
  "label": "My Document v1.0",
  "mimetype": "application/pdf"
}'

# Multiple files in one MMR
verus signdata '{
  "address": "myidentity@",
  "createmmr": true,
  "mmrdata": [
    {"filename": "/path/to/part1.bin", "label": "Part 1"},
    {"filename": "/path/to/part2.bin", "label": "Part 2"},
    {"message": "Manifest: 2 parts, total 3MB", "label": "Manifest"}
  ]
}'
```

### Step 2: Store in identity

The `signdata` output (MMR descriptor) is stored in `contentmultimap` via `updateidentity`. If data is passed with encryption or multiple objects, `updateidentity` handles the evidence packaging and automatic chunking.

### Step 3: Retrieve

```bash
# Get all content
verus getidentitycontent "myidentity@"

# Get content from specific height range
verus getidentitycontent "myidentity@" 100000 100500

# Get content for specific VDXF key
verus getidentitycontent "myidentity@" 0 0 false 0 "iXXX..."

# Include mempool (unconfirmed)
verus getidentitycontent "myidentity@" 0 -1
```

## Use Cases

### Decentralized Document Storage
Store contracts, certificates, or legal documents permanently on-chain with cryptographic proof of authorship via the signing identity.

### NFT Media Storage
Store the actual media for NFTs on-chain rather than relying on IPFS or centralized servers. The MMR provides integrity verification.

### Encrypted Private Data
Using Sapling z-address encryption, store private data that only specific parties can decrypt. Useful for medical records, private keys, or confidential business data.

### Agent Data Storage
AI agents can store their state, models, or outputs on-chain under their VerusID, creating a permanent, verifiable record of their work.

### Cross-Chain Data Availability
Using `CCrossChainDataRef`, data stored on one PBaaS chain can be referenced and verified from another chain without moving the actual data.

### Versioned Data with History
Each `updateidentity` creates a new version. Using `getidentitycontent` with height ranges, you can retrieve any historical version of the data. The `ContentMultiMapRemoveKey` operations enable clean updates.

## Important Notes

- **Cost**: Each transaction requires fees. Storing large data means paying proportionally more in transaction fees.
- **Permanence**: On-chain data is permanent. Even "deleted" entries remain in the blockchain history — the removal operations only affect the aggregated view.
- **Block time**: Each block takes ~60 seconds. Multi-block storage of very large files will take proportionally longer.
- **Pruning**: Nodes that prune old blocks may not have historical data. Use `txproofs` parameter for portable proofs.

## Source Code References

| Component | File | Line |
|-----------|------|------|
| `CMultiPartDescriptor` | `src/primitives/block.h` | 1153 |
| `CEvidenceData` | `src/primitives/block.h` | 1170 |
| `CIdentityMultimapRef` | `src/primitives/block.h` | 2504 |
| `CCrossChainDataRef` | `src/primitives/block.h` | 2669 |
| `BreakApart()` | `src/primitives/block.cpp` | 820 |
| `Reassemble constructor` | `src/primitives/block.cpp` | 851 |
| `CMMRDescriptor` | `src/pbaas/vdxf.h` | 1391 |
| `CDataDescriptor` | `src/pbaas/vdxf.h` / `vdxf.cpp` | 697+ |
| `GetAggregatedIdentityMultimap` | `src/pbaas/identity.cpp` | 454 |
| `signdata` | `src/wallet/rpcwallet.cpp` | 1231 |
| `updateidentity` (chunking trigger) | `src/rpc/pbaasrpc.cpp` | 16186 |
| `getidentitycontent` | `src/rpc/pbaasrpc.cpp` | 17215 |
| `hashdata` (hidden) | `src/rpc/misc.cpp` | 746 |
| `MAX_SCRIPT_ELEMENT_SIZE_PBAAS` | `src/script/script.h` | 36 |
| `MAX_BLOCK_SIZE` | `src/consensus/consensus.h` | 22 |
