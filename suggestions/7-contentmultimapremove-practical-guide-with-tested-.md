# [Suggestion #7] contentmultimapremove practical guide with tested examples

**Section:** Concepts
**Submitted by:** Anonymous
**Date:** 2026-03-28

---

## Suggested Addition: Practical contentmultimapremove Guide

The current contentmultimapremove section on the On-Chain File Storage page is just a reference table with no examples. We tested all four actions on VRSCTEST and can provide practical documentation.

### How contentmultimapremove Works

Pass contentmultimapremove as a field in the updateidentity JSON. It is processed BEFORE any contentmultimap additions in the same transaction.

### Action 3: Remove Entire Key

Removes a VDXF key and all its values from the contentmultimap.

```bash
verus -testnet updateidentity '{
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
verus -testnet updateidentity '{
  "name": "myidentity",
  "contentmultimapremove": {
    "version": 1,
    "action": 4
  }
}'
```

### Action 1: Remove One Value by Hash

```json
{"version":1,"action":1,"entrykey":"iAddr","valuehash":"hexhash"}
```

### Action 2: Remove All Values Matching Hash

Same as action 1 but removes ALL values matching the hash under the key.

### JSON Format Reference

```
ContentMultiMapRemove {
  version: 1           // Always 1
  action: 1 | 2 | 3 | 4
  entrykey?: string    // Required for actions 1-3 (VDXF i-address)
  valuehash?: string   // Required for actions 1-2 (hex hash of value)
}
```

### Key Findings from Testing

1. updateidentity APPENDS to contentmultimap — it does NOT replace it. This is commonly misunderstood. To update a field, you must first remove the old value with contentmultimapremove, then write the new value.

2. contentmultimapremove + contentmultimap can be in the same updateidentity call. The remove is processed first.

3. Action 4 (clear) confirmed working on VRSCTEST — cleared an identity with 8 parent group keys and re-wrote 25 flat entries.

4. Action 3 (remove key) confirmed working — individual VDXF keys removed cleanly.

5. getidentitycontent still shows history after removal — contentmultimapremove only affects current state (getidentity). Historical entries remain in getidentitycontent.

6. returntx=true works for dry runs — pass true as second arg to get signed raw tx without broadcasting.

### Practical Use Case: Schema Migration

```bash
# Phase 1: Clear everything
verus updateidentity '{"name":"myid","contentmultimapremove":{"version":1,"action":4}}'
# Wait for confirmation
# Phase 2: Write new format
verus updateidentity '{"name":"myid","contentmultimap":{"iAddr1":["hexvalue1"],"iAddr2":["hexvalue2"]}}'
```

### Source Code

verus-typescript-primitives: src/pbaas/ContentMultiMapRemove.ts
Daemon: src/pbaas/identity.cpp GetAggregatedIdentityMultimap