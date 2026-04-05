# On-Chain File Storage (Multipart Data)

Verus has a complete decentralized file storage system built into its identity layer. Files and data objects can be stored directly on-chain, split across multiple transaction outputs or even multiple blocks, with cryptographic verification and optional encryption.

This is one of the least documented features of the protocol — this page is the first comprehensive guide to how it works.

!!!success Proven at Scale
An 18.6MB PDF was stored and retrieved with perfect byte-for-byte SHA256 verification on vrsctest — 19 chunks across 19 transactions, fully automated. The methods below are battle-tested.
!!!

## Overview

The system has three layers:

| Layer | What It Does | Key Component |
|-------|-------------|---------------|
| **Data Creation** | Build structured data with MMR integrity | `signdata` RPC |
| **Storage** | Store data in identity contentmultimap, auto-chunk if too large | `updateidentity` + `BreakApart()` |
| **Retrieval** | Aggregate data across blocks, reassemble chunks | `getidentitycontent` + `Reassemble()` |

---

## Proven Storage Methods

There are three tested methods for storing file data on-chain. Each has different cost, complexity, and size characteristics.

### Method 1: `updateidentity` + Data Wrapper ⭐ RECOMMENDED

The simplest and cheapest method. Place a `"data"` object inside a `contentmultimap` value — this triggers the daemon to internally call `signdata`, wrap the result in `CNotaryEvidence`, encrypt with a random Sapling key (publishing the `ivk` for retrieval), and auto-chunk via `BreakApart()` if the data exceeds ~6KB.

**Cost:** ~6–7 VRSCTEST per 999KB chunk

```bash
# Create a JSON-RPC request file (required for large payloads — CLI has arg length limits)
cat > /tmp/upload-chunk.json << 'EOF'
{
  "jsonrpc": "1.0",
  "method": "updateidentity",
  "params": [{
    "parent": "iE2CDG1vRDAG5EqZp5KJW3Gx8NNAe9KVC3",
    "name": "trial1",
    "primaryaddresses": ["RCizCfGxAbFuHp8dGnEHQwTwBtu3pdkQWD"],
    "minimumsignatures": 1,
    "contentmultimap": {
      "iRwRJ2JxndAkmdRGs7yLF6iheFReBzKkLR": [{
        "data": {
          "address": "trial1.filestorage@",
          "filename": "/tmp/chunks/chunk_aa",
          "createmmr": true,
          "label": "chunk-0",
          "mimetype": "application/octet-stream"
        }
      }]
    }
  }]
}
EOF

# Send via curl
curl --user "$RPCUSER:$RPCPASS" --data-binary @/tmp/upload-chunk.json \
  -H 'content-type: text/plain;' http://127.0.0.1:$RPCPORT/
```

!!!danger Critical: The `"data"` wrapper placement
The `"data"` object **MUST** be inside `contentmultimap`, not at the top level of the identity update. A top-level `"data"` field does NOT trigger BreakApart — it will be silently ignored.

```json
// ❌ WRONG — top-level data, no chunking happens
{"name": "id", "data": {"filename": "/path/to/file"}}

// ✅ CORRECT — data inside contentmultimap triggers BreakApart
{"name": "id", "contentmultimap": {"<vdxf-key>": [{"data": {"filename": "/path/to/file"}}]}}
```
!!!

### Method 2: `sendcurrency` to z-address

Send file data to a shielded address. The daemon creates VDXF cryptocondition outputs (transparent, not shielded memo fields) encrypted to the z-address viewing key.

**Cost:** ~10.3 VRSCTEST per 999KB chunk

```bash
# Generate z-address and get viewing key
verus -chain=vrsctest z_getnewaddress
verus -chain=vrsctest z_exportviewingkey "zs1..."

# Upload a chunk
verus -chain=vrsctest sendcurrency '*' '[{
  "address": "zs1vq3khkucu9pfya3xwseajhqds5m0ass68dakefuaq53smys92p3ll7dl89atn9t7fdpmjwssnvx",
  "amount": 0.0001,
  "data": {
    "filename": "/tmp/chunk_aa.bin",
    "createmmr": true,
    "label": "chunk-0"
  }
}]'
```

**Pros:** Built-in encryption, private access control (share EVK to grant read access).
**Cons:** Most expensive method, async operation (returns opid), txids must be tracked manually.

### Method 3: Raw `contentmultimap` (Small Data Only)

For data under ~5KB, hex-encode it and place directly in `contentmultimap`. Essentially free (just the tx fee).

```bash
# Convert text to hex
echo -n "hello world" | xxd -p | tr -d '\n'

verus -chain=vrsctest updateidentity '{
  "parent": "iE2CDG1vRDAG5EqZp5KJW3Gx8NNAe9KVC3",
  "name": "trial1",
  "primaryaddresses": ["RCizCfGxAbFuHp8dGnEHQwTwBtu3pdkQWD"],
  "minimumsignatures": 1,
  "contentmultimap": {
    "iDMrLivrh1fnidgxsBmUJxyf5hoZV7dHE2": "68656c6c6f20776f726c64"
  }
}'
```

**Limit:** ~5KB max. Above ~5.5KB → `bad-txns-failed-precheck`. Data above ~5KB may be **silently truncated** with no error.

### Method Comparison

| | updateidentity + data ⭐ | sendcurrency | Raw contentmultimap |
|---|---|---|---|
| **Cost per 999KB** | ~6–7 VRSCTEST | ~10.3 VRSCTEST | ~0.0001 (tx fee) |
| **Max per call** | 1,000,000 bytes | 1,000,000 bytes | ~5KB |
| **Auto-chunking** | ✅ Yes | ✅ Yes | ❌ No |
| **Encryption** | ✅ Auto (ivk published) | ✅ To z-address | ❌ None |
| **Linked to identity** | ✅ Yes | ❌ Manual tracking | ✅ Yes |
| **Operation** | Synchronous | Async (opid) | Synchronous |

### Cost Breakdown

| Input Size | On-chain Size | Overhead |
|-----------|--------------|----------|
| 10KB | ~12KB | ~20% |
| 100KB | ~107KB | ~7% |
| 500KB | ~528KB | ~5.6% |
| 999KB | ~1,030KB | ~3% |

**Cost per KB** (updateidentity method): ~0.0067 VRSCTEST/KB (~6.8 VRSCTEST/MB)

### Hard Limit

Every storage call has a hard limit of exactly **1,000,000 bytes** per invocation, enforced in `signdata` before processing. For files larger than ~999KB, split them into chunks first:

```bash
split -b 999000 myfile.pdf /tmp/chunks/chunk_
```

---

## Retrieval

### Via `decryptdata` (for data wrapper / updateidentity uploads)

```bash
# Step 1: Get encrypted descriptors from the identity
verus -chain=vrsctest getidentitycontent "trial1.filestorage@"

# Step 2: For each chunk key, extract the first datadescriptor entry
# Each key has 2 entries: [0] = encrypted data reference, [1] = signature proof

# Step 3: Decrypt and retrieve the chunk
verus -chain=vrsctest decryptdata '{
  "datadescriptor": {
    "version": 1,
    "flags": 13,
    "objectdata": "<objectdata_hex_from_step2>",
    "epk": "<epk_from_step2>",
    "ivk": "<ivk_from_step2>"
  },
  "ivk": "<same_ivk>",
  "txid": "<txid_of_the_updateidentity_call>",
  "retrieve": true
}'
```

**Returns:**
```json
[{
  "version": 1,
  "flags": 98,
  "mimetype": "application/octet-stream",
  "objectdata": "<hex_encoded_file_data>",
  "label": "chunk-0",
  "salt": "..."
}]
```

Convert `objectdata` hex to binary to get the original chunk bytes.

**Key points:**
- The `txid` parameter is **required** — the on-chain reference uses `txid=0000...0000` (self-referencing), so `decryptdata` needs the real txid to locate the BreakApart outputs.
- The `ivk` is published in the identity output — anyone can retrieve the data.
- Retrieval is fast (~1–5 seconds per chunk).

### Via `decryptdata` with EVK (for sendcurrency uploads)

```bash
verus -chain=vrsctest decryptdata '{
  "datadescriptor": {
    "version": 1, "flags": 0,
    "objectdata": {
      "iP3euVSzNcXUrLNHnQnR9G6q8jeYuGSxgw": {
        "type": 0, "version": 1, "flags": 1,
        "output": {"txid": "0000000000000000000000000000000000000000000000000000000000000000", "voutnum": 0},
        "objectnum": 0, "subobject": 0
      }
    }
  },
  "txid": "<chunk_txid>",
  "retrieve": true,
  "evk": "<extended_viewing_key>"
}'
```

### Via `getidentitycontent` (metadata / encrypted descriptors)

```bash
# All content
verus getidentitycontent "myidentity@"

# Specific height range
verus getidentitycontent "myidentity@" 100000 100500

# Specific VDXF key
verus getidentitycontent "myidentity@" 0 0 false 0 "iXXX..."

# Include mempool (unconfirmed)
verus getidentitycontent "myidentity@" 0 -1
```

!!!warning z_listreceivedbyaddress does NOT work for retrieval
Data stored via `sendcurrency` with `data.filename` is stored in transparent VDXF cryptocondition outputs, NOT in shielded memo fields. `z_listreceivedbyaddress` returns entries but memo fields are empty.
!!!

---

## Schema Design: Namespace Pattern

For organized file storage, use a namespace identity with a TOKEN currency and VDXF DefinedKeys. This makes your file storage discoverable by any wallet.

```
filestorage@  (namespace identity — TOKEN currency, schema registry)
│
├── DefinedKeys (25 keys):
│     chunk.0 .. chunk.18, manifest, filename, mimetype,
│     filesize, hash, chunkcount
│
└── trial1.filestorage@  (sub-ID — one per stored file)
      └── contentmultimap:
            ├── filestorage::chunk.0  → encrypted data (999KB)
            ├── filestorage::chunk.1  → encrypted data (999KB)
            ├── ...
            ├── filestorage::filename → "document.pdf"
            ├── filestorage::mimetype → "application/pdf"
            ├── filestorage::filesize → "18586159"
            ├── filestorage::hash     → "<sha256>"
            └── filestorage::chunkcount → "19"
```

### Setup Steps

1. **Register namespace identity** with a TOKEN currency (`definecurrency` with `options: 32, proofprotocol: 2`)
2. **Mint tokens** (required before sub-IDs can be registered)
3. **Register VDXF keys** — get i-addresses via `getvdxfid`:
   ```bash
   verus -chain=vrsctest getvdxfid "filestorage::chunk.0"
   # Returns: { "vdxfid": "iRwRJ2JxndAkmdRGs7yLF6iheFReBzKkLR", ... }
   ```
4. **Store DefinedKeys** on the namespace identity under key `iD3yzD6KnrSG75d8RzirMD6SyvrAS2HxjH`
5. **Register sub-IDs** per file (e.g., `trial1.filestorage@`)
6. **Upload chunks** to the sub-ID's contentmultimap using VDXF key i-addresses

---

## Key Gotchas

### 1. Sub-IDs on centralized currencies need full identity spec
```json
{
  "parent": "<currency_i-address>",
  "name": "<sub-id-name>",
  "primaryaddresses": ["<R-address>"],
  "minimumsignatures": 1,
  "contentmultimap": { ... }
}
```
Omitting `parent`, `primaryaddresses`, or `minimumsignatures` causes `bad-txns-failed-precheck`.

### 2. Sequential identity updates only
Each `updateidentity` spends the previous identity output. You **cannot parallelize** uploads to the same identity — each must wait for the previous to confirm (~60s per block).

### 3. Silent truncation of raw contentmultimap data
Raw hex strings >~5KB in contentmultimap are silently truncated — no error returned. Always use the `"data"` wrapper for anything above a few KB.

### 4. Track your txids
The system does NOT store upload txids in identity metadata. Track them during upload or store them in a manifest. Without txids, `decryptdata` cannot locate BreakApart chunks.

### 5. CPU-intensive processing
Each 999KB chunk takes 3–5 minutes to process (encryption + BreakApart into ~177 outputs). Mining competes for CPU — consider reducing mining threads during bulk uploads.

### 6. `definecurrency` requires manual broadcast
`definecurrency` returns the transaction object but does NOT auto-broadcast. Extract the hex and call `sendrawtransaction` manually.

### 7. Two entries per chunk key in `getidentitycontent`
Each chunk key returns two datadescriptor entries: `[0]` is the encrypted data reference (use this), `[1]` is the signature proof.

---

## How Data Gets Stored (Protocol Detail)

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

1. Split your data into segments, each under the 1,000,000-byte limit
2. Store each segment via a separate `updateidentity` call with the data wrapper
3. Use different VDXF keys per chunk (e.g., `chunk.0`, `chunk.1`, ...)
4. `getidentitycontent` retrieves all entries; `decryptdata` retrieves each chunk by txid

## Size Limits

| What | Limit | Notes |
|------|-------|-------|
| Single script element | ~6,000 bytes | `MAX_SCRIPT_ELEMENT_SIZE_PBAAS` |
| Chunk after overhead | ~5,744 bytes | Element minus 256 byte overhead |
| Data wrapper input | 1,000,000 bytes | Hard limit in `signdata` |
| Single transaction | 2,000,000 bytes (2MB) | Can fill an entire block |
| Single block | 2,000,000 bytes (2MB) | `MAX_BLOCK_SIZE` |
| Multiple blocks | **Unlimited** | Via sequential `updateidentity` txs |

### Practical Examples

| File Size | Chunks Needed | Time (~60s/block + processing) | Est. Cost (updateidentity) |
|-----------|--------------|-------------------------------|---------------------------|
| 5 KB | 1 | ~1 minute | ~0.0001 (raw) or ~6 VRSCTEST |
| 100 KB | 1 | ~4 minutes | ~6 VRSCTEST |
| 500 KB | 1 | ~4 minutes | ~6 VRSCTEST |
| 1 MB | 1 | ~4 minutes | ~6–7 VRSCTEST |
| 5 MB | 6 | ~30 minutes | ~40 VRSCTEST |
| 10 MB | 11 | ~55 minutes | ~72 VRSCTEST |
| 18.6 MB | 19 | ~2 hours | ~125 VRSCTEST |

---

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

---

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

This is the key mechanism for cross-block data retrieval. When you store a large file across multiple blocks, you can create a reference that says "get all data from identity X, key Y, between blocks 1000 and 1003."

### 3. URL Reference (`CURLRef`)
Points to external data:
- URL string (up to 4096 characters)
- Optional data hash for verification

This enables hybrid on-chain/off-chain storage: store the hash on-chain, data off-chain, and the protocol can verify integrity.

## Data Operations on contentmultimap

The `GetAggregatedIdentityMultimap` function supports these operations via `ContentMultiMapRemoveKey`:

| Action | Operation | Effect |
|--------|-----------|--------|
| 1 | `ACTION_REMOVE_ONE_KEYVALUE` | Remove one specific value under a key (by hash) |
| 2 | `ACTION_REMOVE_ALL_KEYVALUE` | Remove all values matching a hash under a key |
| 3 | `ACTION_REMOVE_ALL_KEY` | Remove a VDXF key and all its values |
| 4 | `ACTION_CLEAR_MAP` | Clear all entries from the map |

This means you can update and delete on-chain data — the aggregation system processes these operations in block order.

Pass `contentmultimapremove` as a field in the `updateidentity` JSON. It is processed **before** any `contentmultimap` additions in the same transaction, so you can atomically remove old values and write new ones in a single call.

### Action 3: Remove Entire Key

Removes a VDXF key and all its values from the contentmultimap.

```bash
verus updateidentity '{
  "name": "myidentity",
  "contentmultimapremove": {
    "version": 1,
    "action": 3,
    "entrykey": "iLy373iaKafmRCY43ahty4m8aLQx32y8Fh"
  }
}'
```

### Action 4: Clear Entire Map

Wipes all entries from the contentmultimap. Useful for schema migrations.

```bash
verus updateidentity '{
  "name": "myidentity",
  "contentmultimapremove": {
    "version": 1,
    "action": 4
  }
}'
```

### Action 1: Remove One Value by Hash

Removes a single value under a key, identified by its hash.

```bash
verus updateidentity '{
  "name": "myidentity",
  "contentmultimapremove": {
    "version": 1,
    "action": 1,
    "entrykey": "iLy373iaKafmRCY43ahty4m8aLQx32y8Fh",
    "valuehash": "<hex_hash_of_value>"
  }
}'
```

### Action 2: Remove All Values Matching Hash

Same as action 1 but removes **all** values matching the hash under the key (useful if the same value was written multiple times).

### JSON Format Reference

```
contentmultimapremove {
  version: 1              // Always 1
  action: 1 | 2 | 3 | 4
  entrykey?: string       // Required for actions 1–3 (VDXF i-address)
  valuehash?: string      // Required for actions 1–2 (hex hash of value)
}
```

### Key Findings from Testing

1. **`updateidentity` appends — it does NOT replace.** To update a value, you must first remove the old one with `contentmultimapremove`, then write the new value. A plain `updateidentity` adds entries on top of existing ones.

2. **Atomic remove + write.** `contentmultimapremove` and `contentmultimap` can be in the same `updateidentity` call. The remove is processed first.

3. **Action 4 (clear) confirmed on VRSCTEST** — cleared an identity with 8 parent group keys and re-wrote 25 flat entries successfully.

4. **Action 3 (remove key) confirmed on VRSCTEST** — individual VDXF keys removed cleanly.

5. **`getidentitycontent` still shows history after removal** — `contentmultimapremove` only affects the current aggregated state (visible via `getidentity`). Historical entries remain in `getidentitycontent`.

6. **`returntx=true` for dry runs** — pass `true` as the second argument to `updateidentity` to get a signed raw transaction without broadcasting it.

### Practical Use Case: Schema Migration

```bash
# Phase 1: Clear everything (atomic — also writes new format in same tx if desired)
verus updateidentity '{"name":"myid","contentmultimapremove":{"version":1,"action":4}}'

# Wait for confirmation (~60s)

# Phase 2: Write new format
verus updateidentity '{"name":"myid","contentmultimap":{"iAddr1":["hexvalue1"],"iAddr2":["hexvalue2"]}}'
```

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

- **Cost**: Each transaction requires fees. Storing large data means paying proportionally more in transaction fees. See the [cost breakdown](#cost-breakdown) above for real numbers.
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
| `ContentMultiMapRemove` | `src/pbaas/identity.cpp` (daemon), `src/pbaas/ContentMultiMapRemove.ts` (TS) | — |
| `GetAggregatedIdentityMultimap` | `src/pbaas/identity.cpp` | 454 |
| `signdata` | `src/wallet/rpcwallet.cpp` | 1231 |
| `updateidentity` (chunking trigger) | `src/rpc/pbaasrpc.cpp` | 16186 |
| `getidentitycontent` | `src/rpc/pbaasrpc.cpp` | 17215 |
| `hashdata` (hidden) | `src/rpc/misc.cpp` | 746 |
| `MAX_SCRIPT_ELEMENT_SIZE_PBAAS` | `src/script/script.h` | 36 |
| `MAX_BLOCK_SIZE` | `src/consensus/consensus.h` | 22 |

## Related Pages

- [Data Descriptor](data-descriptor.md) — Deep dive into `CDataDescriptor`, `CMMRDescriptor`, and the structured data format used by `signdata`
- [VDXF Data Pipeline](vdxf-data-pipeline.md) — End-to-end flow from `signdata` through `updateidentity` to on-chain storage, including the encryption and BreakApart pipeline
