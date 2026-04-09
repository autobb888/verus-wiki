# [Suggestion #9] contentmultimapremove — Deleting from getidentitycontent

**Section:** Concepts
**Submitted by:** Anonymous
**Date:** 2026-04-05

---

## Section: Concepts (On-Chain File Storage)

## Title: contentmultimapremove — Deleting from getidentitycontent

## Content:

### Overview

Verus supports removing entries from the aggregated identity content returned by `getidentitycontent` using a special VDXF key written into the `contentmultimap` via `updateidentity`. This is essential for cleaning up accumulated historical entries, since `getidentitycontent` aggregates ALL identity updates across the full block range — unlike `getidentity`, which only shows the current UTXO state.

### VDXF Key

| Field | Value |
|-------|-------|
| Name | `vrsc::identity.multimapremove` |
| i-address | `i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY` |
| hash160 | `d393b986e4f82db7bec82d97b186882d739ded16` |

### How It Works

The removal is **NOT a top-level JSON field** in `updateidentity`. Instead, you write a **VdxfUniValue object** under the removal VDXF key inside the `contentmultimap`. The daemon serializes this into a typed data envelope that `GetAggregatedIdentityMultimap` (in `identity.cpp`) recognizes and processes during content aggregation.

### Four Removal Actions

| Action | Name | Effect | Required Fields |
|--------|------|--------|-----------------|
| 1 | REMOVE_ONE_KEYVALUE | Remove one specific value under a key (by hash) | version, action, entrykey, valuehash |
| 2 | REMOVE_ALL_KEYVALUE | Remove all values matching a hash under a key | version, action, entrykey, valuehash |
| 3 | REMOVE_ALL_KEY | Remove a VDXF key and all its values entirely | version, action, entrykey |
| 4 | ACTION_CLEAR_MAP | Wipe all entries from the entire content map | version, action |

### JSON Format for updateidentity

The correct format uses a **nested VdxfUniValue structure** where both the outer `contentmultimap` key AND the inner object key are the removal VDXF i-address.

**Action 4 — Clear entire map:**

```bash
verus updateidentity '{
  "name": "myidentity",
  "contentmultimap": {
    "i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY": [{
      "i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY": {
        "version": 1,
        "action": 4
      }
    }]
  }
}'
```

**Action 3 — Remove a specific VDXF key and all its values:**

```bash
verus updateidentity '{
  "name": "myidentity",
  "contentmultimap": {
    "i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY": [{
      "i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY": {
        "version": 1,
        "action": 3,
        "entrykey": "iLy373iaKafmRCY43ahty4m8aLQx32y8Fh"
      }
    }]
  }
}'
```

**Atomic clear + rewrite (two sequential transactions):**

First tx — clear the map:
```bash
verus updateidentity '{"name":"myidentity","contentmultimap":{"i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY":[{"i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY":{"version":1,"action":4}}]}}'
```

Second tx (after first confirms) — write fresh data:
```bash
verus updateidentity '{"name":"myidentity","contentmultimap":{"iMyVdxfKey":["hexEncodedValue"]}}'
```

The clear must appear before the write in blockchain order so that the aggregation processes the clear first, then accumulates only the fresh entries.

### Critical Warning: Do NOT Use Raw Hex Strings

The value under the removal key **MUST** be a VdxfUniValue object (JSON with nested i-address key), **NOT** a raw hex string. Writing a raw hex string causes the daemon to auto-wrap it in a DataDescriptor, creating a binary format mismatch that `GetAggregatedIdentityMultimap` cannot deserialize.

This causes `getidentitycontent` to crash with:
```
CBaseDataStream::read(): end of data: iostream error
```
for **any query range** that includes the malformed entry. This damage is **permanent and unrecoverable** — the broken entry is baked into the blockchain history forever.

**WRONG** (causes permanent crash):
```json
{"contentmultimap":{"i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY":["0104"]}}
```

**CORRECT:**
```json
{"contentmultimap":{"i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY":[{"i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY":{"version":1,"action":4}}]}}
```

### keepdeleted Parameter

`getidentitycontent` accepts a 7th parameter `keepdeleted` (bool, default false). When set to true, removed entries are still included in results, enabling forensic recovery of deleted content.

### Binary Serialization (for developers)

The VdxfUniValue typed data envelope serializes as:

```
[20-byte hash160 of i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY]  ← objTypeKey
[VARINT version]                                             ← always 1
[CompactSize payload_length]                                 ← byte length of removal data
[VARINT version] [VARINT action]                             ← CContentMultiMapRemove fields
[20-byte entryKey hash160]                                   ← only for actions 1-3
[32-byte valueHash]                                          ← only for actions 1-2
```

This matches the C++ deserialization in `GetAggregatedIdentityMultimap`.

### Reference Implementation

**TypeScript** — `verus-typescript-primitives` (github.com/VerusCoin/verus-typescript-primitives):
- `src/pbaas/ContentMultiMapRemove.ts` — removal action class with all 4 actions
- `src/pbaas/VdxfUniValue.ts` (lines 278-284) — typed data envelope serialization
- `src/__tests__/pbaas/contentMultiMapRemove.test.ts` — round-trip tests

**C++** — VerusCoin daemon (github.com/VerusCoin/VerusCoin):
- `GetAggregatedIdentityMultimap` — `src/pbaas/identity.cpp`
- `CContentMultiMapRemove` class — `src/pbaas/identity.h`
- `ContentMultiMapRemoveKey()` — `src/pbaas/vdxf.h`

### Submitted by

junction41 — Tested and verified on VRSCTEST v1.2.15, April 2026.