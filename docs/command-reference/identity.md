---
label: Identity
icon: terminal
---

# Identity Commands


---

## getidentitieswithaddress

> **Category:** Identity | **Version:** v1.2.x+

Returns all identities that contain a specified address in their primary addresses. Requires the daemon to be started with `-idindex=1`.

**Syntax**
```bash
verus getidentitieswithaddress '{"address":"validprimaryaddress","fromheight":height,"toheight":height,"unspent":false}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | A valid primary address — returns all identities containing this address |
| fromheight | number | No | Default = 0. Search from this height forward only |
| toheight | number | No | Default = 0 (no limit). Search up to this height only |
| unspent | bool | No | Default = false. If true, only return active (unspent) ID UTXOs as of current block |

**Result**
```json
[
  {
    "identity": { ... },
    "txout": { "txhash": "...", "index": 0 }
  }
]
```

An array of matching identity objects, each with an additional `txout` field containing the transaction hash and output index.

**Examples**

**Basic Usage**
```bash
./verus -testnet getidentitieswithaddress '{"address":"RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"}'

## Actual Output (tested on VRSCTEST)
## ERROR: requires -idindex=1 when starting the daemon
```

> **⚠️ This command requires the daemon to be started with `-idindex=1`.** Without this flag, the command returns an error. The identity index is not enabled by default because it increases disk usage and sync time.

**With Height Range and Unspent Filter**
```bash
./verus -testnet getidentitieswithaddress '{"address":"RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5","fromheight":920000,"toheight":930000,"unspent":true}'
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentitieswithaddress","params":[{"address":"RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"}]}'
```

**Common Use Cases**
- **Reverse lookup**: Find which identities are controlled by a specific address
- **Audit**: Discover all identities a particular key controls
- **Multi-sig investigation**: Find identities that include a specific co-signer address

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `requires -idindex=1 when starting the daemon` | Daemon not started with identity index | Restart daemon with `-idindex=1` flag |
| Invalid address format | Not a valid R-address | Provide a valid transparent address |

**Related Commands**
- [getidentitieswithrecovery](../identity/getidentitieswithrecovery.md) — Find identities by recovery authority
- [getidentitieswithrevocation](../identity/getidentitieswithrevocation.md) — Find identities by revocation authority
- [getidentity](../identity/getidentity.md) — Look up a specific identity by name or i-address

**Notes**
- **Requires `-idindex=1`** daemon flag. This builds an address-to-identity index on disk. Without it, the command cannot function.
- To enable: stop the daemon, restart with `verusd -testnet -idindex=1`. This may require a reindex on first run.
- The `unspent` parameter is useful for filtering out historical (spent) identity UTXOs and showing only the current active state.
- This is a "reverse lookup" — instead of looking up an identity by name, you find identities by one of their constituent addresses.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2
- **Note:** Testing returned error because daemon was not started with `-idindex=1`

---

## getidentitieswithrecovery

> **Category:** Identity | **Version:** v1.2.x+

Returns all identities where a specified identity is set as the recovery authority. Requires the daemon to be started with `-idindex=1`.

**Syntax**
```bash
verus getidentitieswithrecovery '{"identityid":"idori-address","fromheight":height,"toheight":height,"unspent":false}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| identityid | string | Yes | Name (e.g., `"ari@"`) or i-address — returns all identities where this is the recovery authority |
| fromheight | number | No | Default = 0. Search from this height forward only |
| toheight | number | No | Default = 0 (no limit). Search up to this height only |
| unspent | bool | No | Default = false. If true, only return active (unspent) ID UTXOs |

**Result**
```json
[
  {
    "identity": { ... },
    "txout": { "txhash": "...", "index": 0 }
  }
]
```

An array of identity objects where the specified ID is the recovery authority.

**Examples**

**Basic Usage**
```bash
./verus -testnet getidentitieswithrecovery '{"identityid":"ari@"}'

## Actual Output (tested on VRSCTEST)
## ERROR: requires -idindex=1 when starting the daemon
```

> **⚠️ Requires `-idindex=1` daemon flag.**

**Only Active Identities**
```bash
./verus -testnet getidentitieswithrecovery '{"identityid":"ari@","unspent":true}'
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentitieswithrecovery","params":[{"identityid":"ari@"}]}'
```

**Common Use Cases**
- **Recovery authority audit**: Find all identities you are responsible for recovering
- **Security review**: Check which identities depend on a specific recovery authority
- **Identity management**: Inventory all IDs under your recovery umbrella

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `requires -idindex=1 when starting the daemon` | Daemon not started with identity index | Restart daemon with `-idindex=1` |
| `Identity not found` | The specified recovery identity doesn't exist | Verify the identity name or i-address |

**Related Commands**
- [getidentitieswithrevocation](../identity/getidentitieswithrevocation.md) — Find identities by revocation authority
- [getidentitieswithaddress](../identity/getidentitieswithaddress.md) — Find identities by primary address
- [getidentity](../identity/getidentity.md) — Look up a specific identity

**Notes**
- **Requires `-idindex=1`** daemon flag. See [getidentitieswithaddress](../identity/getidentitieswithaddress.md) for details.
- By default, an identity's recovery authority is set to itself. This means querying `"ari@"` will return `ari@` itself plus any other identities that explicitly set `ari@` as their recovery authority.
- Recovery authority is the identity that can recover (regain control of) an identity if primary keys are compromised.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2
- **Note:** Testing returned error because daemon was not started with `-idindex=1`

---

## getidentitieswithrevocation

> **Category:** Identity | **Version:** v1.2.x+

Returns all identities where a specified identity is set as the revocation authority. Requires the daemon to be started with `-idindex=1`.

**Syntax**
```bash
verus getidentitieswithrevocation '{"identityid":"idori-address","fromheight":height,"toheight":height,"unspent":false}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| identityid | string | Yes | Name (e.g., `"ari@"`) or i-address — returns all identities where this is the revocation authority |
| fromheight | number | No | Default = 0. Search from this height forward only |
| toheight | number | No | Default = 0 (no limit). Search up to this height only |
| unspent | bool | No | Default = false. If true, only return active (unspent) ID UTXOs |

**Result**
```json
[
  {
    "identity": { ... },
    "txout": { "txhash": "...", "index": 0 }
  }
]
```

An array of identity objects where the specified ID is the revocation authority.

**Examples**

**Basic Usage**
```bash
./verus -testnet getidentitieswithrevocation '{"identityid":"ari@"}'

## Actual Output (tested on VRSCTEST)
## ERROR: requires -idindex=1 when starting the daemon
```

> **⚠️ Requires `-idindex=1` daemon flag.**

**Only Active Identities**
```bash
./verus -testnet getidentitieswithrevocation '{"identityid":"ari@","unspent":true}'
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentitieswithrevocation","params":[{"identityid":"ari@"}]}'
```

**Common Use Cases**
- **Revocation authority audit**: Find all identities you can revoke
- **Security review**: Understand the scope of a revocation authority's power
- **Key rotation planning**: Before changing a revocation authority, identify all affected identities

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `requires -idindex=1 when starting the daemon` | Daemon not started with identity index | Restart daemon with `-idindex=1` |
| `Identity not found` | The specified identity doesn't exist | Verify the identity name or i-address |

**Related Commands**
- [getidentitieswithrecovery](../identity/getidentitieswithrecovery.md) — Find identities by recovery authority
- [getidentitieswithaddress](../identity/getidentitieswithaddress.md) — Find identities by primary address
- [getidentity](../identity/getidentity.md) — Look up a specific identity

**Notes**
- **Requires `-idindex=1`** daemon flag.
- Revocation authority is the identity that can *revoke* (disable) an identity. This is a critical security role.
- By default, an identity's revocation authority is itself. Querying an identity will return at least that identity itself.
- Revoking an identity prevents it from being used for signing or spending until it is recovered by the recovery authority.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2
- **Note:** Testing returned error because daemon was not started with `-idindex=1`

---

## getidentity

> **Category:** Identity | **Version:** v1.2.x+

Retrieves the full identity object for a given VerusID name or i-address, optionally at a specific block height and with transaction proof.

**Syntax**
```bash
verus getidentity "name@ || iid" (height) (txproof) (txproofheight)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name@ \|\| iid | string | Yes | Name followed by "@" or i-address of an identity |
| height | number | No | Return identity as of this height. Default = current height. Use `-1` to include mempool. |
| txproof | bool | No | Default = false. If true, returns proof of the identity transaction. |
| txproofheight | number | No | Default = same as `height`. Height from which to generate a proof. |

**Result**
Returns a JSON object containing the full identity definition, status, and metadata.

```json
{
  "friendlyname": "ari.VRSCTEST@",
  "fullyqualifiedname": "ari.VRSCTEST@",
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"
    ],
    "minimumsignatures": 1,
    "name": "ari",
    "identityaddress": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": { ... },
    "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "timelock": 0
  },
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 926607,
  "txid": "51e1261ab8f5899dc7480b9b546f0b03a9c054fb160fd9f9dbdfec62d954379c",
  "vout": 0
}
```

**Key Fields**
| Field | Description |
|-------|-------------|
| `friendlyname` | Human-readable fully-qualified name |
| `identity.version` | Identity protocol version (3 = current) |
| `identity.flags` | Bitfield: 0 = normal, 1 = activecurrency (can issue subIDs) |
| `identity.primaryaddresses` | Addresses that control spending |
| `identity.minimumsignatures` | Required signatures for multi-sig |
| `identity.identityaddress` | The i-address of this identity |
| `identity.parent` | Parent namespace i-address |
| `identity.contentmap` | Key-value content stored on the identity |
| `identity.contentmultimap` | Multi-value content (hex-encoded VDXF data) |
| `identity.revocationauthority` | Identity that can revoke this ID |
| `identity.recoveryauthority` | Identity that can recover this ID |
| `identity.timelock` | Block height before which the ID cannot be updated |
| `status` | "active" or "revoked" |
| `canspendfor` | Whether this wallet can spend for this identity |
| `cansignfor` | Whether this wallet can sign for this identity |
| `blockheight` | Block height of the latest identity transaction |
| `txid` | Transaction ID of the latest identity update |

**Examples**

**Basic Usage — Lookup by Name**
```bash
./verus -testnet getidentity "ari@"
```

**Lookup by i-Address**
```bash
./verus -testnet getidentity "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129"
```

**Lookup at a Specific Block Height**
```bash
## Get identity as it was at block 921081 (before any updates)
./verus -testnet getidentity "ari@" 921081

## Output shows empty contentmultimap (identity was freshly registered)
{
  "friendlyname": "ari.VRSCTEST@",
  "identity": {
    "version": 3,
    "primaryaddresses": ["RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"],
    "name": "ari",
    "contentmultimap": {},
    ...
  },
  "blockheight": 921081,
  ...
}
```

**Include Mempool (Unconfirmed Updates)**
```bash
./verus -testnet getidentity "ari@" -1
```

**With Transaction Proof**
```bash
./verus -testnet getidentity "ari@" 926607 true
```

**Lookup a SubID**
```bash
./verus -testnet getidentity "alice.agentplatform@"
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentity","params":["ari@"]}'
```

**Common Use Cases**
- **Verify an identity exists** before sending funds
- **Check primary addresses** to confirm ownership
- **Inspect contentmultimap** for on-chain metadata (e.g., agent profiles, VDXF data)
- **Historical lookups** to see an identity's state at a past block height
- **Proof generation** for cross-chain or SPV verification

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Identity not found` | Name doesn't exist or is misspelled | Verify the name; remember to include `@` suffix |
| `Invalid identity` | Malformed i-address | Check the i-address format |

**Related Commands**
- [getidentityhistory](../identity/getidentityhistory.md) — Get all historical versions of an identity
- [getidentitycontent](../identity/getidentitycontent.md) — Get aggregated content across identity history
- [listidentities](../identity/listidentities.md) — List identities in the local wallet
- [registernamecommitment](../identity/registernamecommitment.md) — First step to registering a new identity

**Name Qualification**

Be careful with name qualification — it's the most common source of "Identity not found" errors:

- `"alice@"` → looks for a **top-level** identity called "alice"
- `"alice.agentplatform@"` → looks for a **SubID** "alice" under the "agentplatform" namespace
- `"alice.VRSCTEST@"` → fully qualified top-level name on testnet

These are different identities! If alice only exists as a SubID under agentplatform, then `getidentity "alice@"` will return "Identity not found" while `getidentity "alice.agentplatform@"` succeeds.

**Notes**
- The `@` suffix is required when looking up by name (e.g., `"ari@"` not `"ari"`).
- On VRSCTEST, names are displayed as `name.VRSCTEST@` in `fullyqualifiedname`.
- The `contentmultimap` stores hex-encoded data keyed by VDXF i-addresses. Decode the hex to see the actual content.
- When `flags` = 1, the identity can issue subIDs (has the `activecurrency` flag set).
- `canspendfor` and `cansignfor` are wallet-relative — they indicate whether the *current wallet* has the keys.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## getidentitycontent

> **Category:** Identity | **Version:** v1.2.x+

Retrieves the aggregated content stored on an identity across all its historical updates, combining contentmap and contentmultimap values within a specified block range.

**Syntax**
```bash
verus getidentitycontent "name@ || iid" (heightstart) (heightend) (txproofs) (txproofheight) (vdxfkey) (keepdeleted)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name@ \|\| iid | string | Yes | Name followed by "@" or i-address of an identity |
| heightstart | number | No | Default = 0. Only return content from this height forward (inclusive). |
| heightend | number | No | Default = 0 (max height). Only return content up to this height (inclusive). Use `-1` to include mempool. |
| txproofs | bool | No | Default = false. If true, returns proof of the identity transaction. |
| txproofheight | number | No | Default = "height". Height from which to generate a proof. |
| vdxfkey | string | No | Default = null. Filter for specific VDXF key content only. |
| keepdeleted | bool | No | Default = false. If true, also returns deleted content items. |

**Result**
Returns identity metadata plus a combined `contentmultimap` aggregated from all identity updates in the specified range. Unlike `getidentity` which shows only the latest state, this command collects *all* content values ever written across updates.

```json
{
  "fullyqualifiedname": "ari.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 926607,
  "fromheight": 0,
  "toheight": 926957,
  "txid": "51e1261ab8f5899dc7480b9b546f0b03a9c054fb160fd9f9dbdfec62d954379c",
  "vout": 0,
  "identity": {
    "version": 3,
    "name": "ari",
    "identityaddress": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "contentmultimap": {
      "iKLo9XnNwzec2dj92kX9QQpng5EfU8XHxo": [
        "7b2276657273696f6e223a22312e30222c2274797065223a224149204167656e74227d",
        "7b2276657273696f6e223a22312e30222c2274797065223a224149204167656e74227d",
        "..."
      ]
    },
    "..."
  }
}
```

**Important:** The `contentmultimap` in this response aggregates values from *every* identity update in the height range. This means duplicate entries appear if the same key was included in multiple updates. The `fromheight` and `toheight` fields confirm the search range.

**Examples**

**Basic Usage**
```bash
./verus -testnet getidentitycontent "ari@"
```

**Content from a Specific Height Range**
```bash
## Only get content added between blocks 925000 and 926000
./verus -testnet getidentitycontent "ari@" 925000 926000
```

**Include Mempool Content**
```bash
./verus -testnet getidentitycontent "ari@" 0 -1
```

**Filter by VDXF Key**
```bash
./verus -testnet getidentitycontent "ari@" 0 0 false 0 "iKLo9XnNwzec2dj92kX9QQpng5EfU8XHxo"
```

**Include Deleted Content**
```bash
./verus -testnet getidentitycontent "ari@" 0 0 false 0 "" true
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentitycontent","params":["ari@"]}'
```

**Common Use Cases**
- **Audit trail**: See all content ever written to an identity across all updates
- **Content aggregation**: Collect all service listings, profile data, or VDXF records
- **Selective queries**: Use `vdxfkey` to search for specific content types
- **Forensic analysis**: Use `keepdeleted` to recover removed content

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Identity not found` | Name doesn't exist | Verify the name with `@` suffix |
| Empty contentmultimap | Identity has no on-chain content | This is valid — the identity simply has no stored data |

**Related Commands**
- [getidentity](../identity/getidentity.md) — Get current state of an identity (latest update only)
- [getidentityhistory](../identity/getidentityhistory.md) — Get full identity objects at each update point

**Notes**
- Unlike `getidentity` which returns only the *current* content, `getidentitycontent` aggregates across all updates. This means you'll see duplicate entries for content that was present in multiple updates.
- Content values are hex-encoded. Decode with standard hex-to-string conversion.
- The `vdxfkey` parameter is useful for efficiently querying a specific data type without downloading all content.
- `keepdeleted` is valuable for auditing — content that was removed in a later update can still be retrieved.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## getidentityhistory

> **Category:** Identity | **Version:** v1.2.x+

Retrieves the complete history of an identity, returning the full identity object at each update point within a specified block range.

**Syntax**
```bash
verus getidentityhistory "name@ || iid" (heightstart) (heightend) (txproofs) (txproofheight)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name@ \|\| iid | string | Yes | Name followed by "@" or i-address of an identity |
| heightstart | number | No | Default = 0. Only return history from this height forward (inclusive). |
| heightend | number | No | Default = 0 (max height). Only return history up to this height (inclusive). Use `-1` to include mempool. |
| txproofs | bool | No | Default = false. If true, returns proof of each identity transaction. |
| txproofheight | number | No | Default = "height". Height from which to generate proofs. |

**Result**
Returns identity metadata plus a `history` array containing the full identity object at each update, in chronological order.

```json
{
  "fullyqualifiedname": "ari.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 926607,
  "txid": "51e1261ab8f5899dc7480b9b546f0b03a9c054fb160fd9f9dbdfec62d954379c",
  "vout": 0,
  "history": [
    {
      "identity": {
        "version": 3,
        "name": "ari",
        "contentmultimap": {}
      },
      "blockhash": "208172af9b283a1f06e5775f532134d6858393b076808fe415ea960dcca74125",
      "height": 921081,
      "output": {
        "txid": "b4af174d4bee117a8f6bd4fa47e5f0195d1409302aca4aeba08acd391e5c9954",
        "voutnum": 0
      }
    },
    {
      "identity": {
        "version": 3,
        "name": "ari",
        "contentmultimap": {
          "iKLo9XnNwzec2dj92kX9QQpng5EfU8XHxo": ["..."]
        }
      },
      "blockhash": "00000000e60e18baa0daa50c6d55186face08c2f6d39ddc2557021cef7ef1130",
      "height": 921090,
      "output": { "txid": "edcfe0a06a...", "voutnum": 0 }
    }
  ]
}
```
*(Output truncated — the `ari@` identity had 8 historical updates from block 921081 to 926607)*

**History Entry Fields**
| Field | Description |
|-------|-------------|
| `identity` | Full identity object at that point in time |
| `blockhash` | Hash of the block containing this update |
| `height` | Block height of this update |
| `output.txid` | Transaction ID of the identity UTXO |
| `output.voutnum` | Output index in the transaction |

**Examples**

**Full History**
```bash
./verus -testnet getidentityhistory "ari@"
```

**History in a Block Range**
```bash
## Only show updates between blocks 925000 and 926000
./verus -testnet getidentityhistory "ari@" 925000 926000
```

**Include Mempool**
```bash
./verus -testnet getidentityhistory "ari@" 0 -1
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentityhistory","params":["ari@"]}'
```

**Common Use Cases**
- **Track identity changes** over time (address changes, content updates, authority changes)
- **Audit revocation/recovery authority changes** for security analysis
- **Reconstruct timeline** of content updates to an identity
- **Detect unauthorized modifications** by comparing expected vs. actual state at each point

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Identity not found` | Name doesn't exist | Verify name with `@` suffix |
| Empty history array | No updates in the specified range | Widen the block range |

**Related Commands**
- [getidentity](../identity/getidentity.md) — Get current identity state only
- [getidentitycontent](../identity/getidentitycontent.md) — Get aggregated content across updates

**Notes**
- Each entry in the `history` array represents a complete snapshot of the identity at that block height. You can see exactly what changed between updates by diffing consecutive entries.
- The first entry is always the identity registration (creation) transaction.
- Multiple updates can occur at the same block height (e.g., `ari@` had two updates at block 922296).
- For identities with many updates, the response can be large. Use `heightstart`/`heightend` to limit scope.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## getidentitytrust

> **Category:** Identity | **Version:** v1.2.x+

Retrieves identity trust/rating settings for the local node. These settings control which identities the node will sync data for, acting as a local allowlist/blocklist system.

**Syntax**
```bash
verus getidentitytrust '["id",...]'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ids | string array | No | If specified, only returns rating values for the listed IDs. If omitted or empty, returns all ratings. |

**Result**
```json
{
  "setratings": { "id": JSONRatingObject, ... },
  "identitytrustmode": 0
}
```

| Field | Description |
|-------|-------------|
| `setratings` | Key-value object mapping identity IDs to their rating objects |
| `identitytrustmode` | `0` = no restriction on sync, `1` = only sync IDs rated approved, `2` = sync all IDs except those on block list |

**Examples**

**Get All Trust Settings**
```bash
./verus -testnet getidentitytrust '[]'

## Actual Output (tested on VRSCTEST)
## (empty output — no trust ratings configured on this node)
```

**Query Specific Identity**
```bash
./verus -testnet getidentitytrust '["ari@"]'

## Actual Output (tested on VRSCTEST)
## (empty output — no rating set for ari@)
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"getidentitytrust","params":[["ari@"]]}'
```

**Common Use Cases**
- **Check trust configuration**: See which identities are allowed/blocked for sync
- **Audit node settings**: Verify trust mode before deploying
- **Content filtering**: Use in conjunction with `setidentitytrust` to control what data your node syncs

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Parse error | Malformed JSON array | Ensure proper JSON: `'["id1","id2"]'` |
| Empty result | No trust ratings configured | This is normal for a default node — trust mode 0 means no restrictions |

**Related Commands**
- [setidentitytrust](../identity/setidentitytrust.md) — Set trust ratings for identities
- [getidentity](../identity/getidentity.md) — Look up an identity

**Notes**
- When no trust ratings are configured and `identitytrustmode` is 0, the node syncs all identity data without restriction.
- Trust mode 1 (allowlist) is the most restrictive — only explicitly approved IDs sync.
- Trust mode 2 (blocklist) syncs everything except blocked IDs.
- This is a **local node setting** — it does not affect the blockchain or other nodes.
- The command returns empty output (not an error) when no ratings are set.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## listidentities

> **Category:** Identity | **Version:** v1.2.x+

Lists all identities in the local wallet, with options to filter by spending, signing, or watch-only capability.

**Syntax**
```bash
verus listidentities (includecanspend) (includecansign) (includewatchonly)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| includecanspend | bool | No | Default = true. Include identities the wallet can spend/authorize for. |
| includecansign | bool | No | Default = true. Include identities the wallet can only sign for (but not spend). |
| includewatchonly | bool | No | Default = false. Include identities the wallet can neither sign nor spend, but watches or co-signs for. |

**Result**
Returns an array of identity objects with wallet-specific status fields.

```json
[
  {
    "identity": {
      "version": 3,
      "flags": 0,
      "primaryaddresses": ["RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"],
      "minimumsignatures": 1,
      "name": "ari",
      "identityaddress": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
      "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": { "..." },
      "revocationauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
      "recoveryauthority": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
      "timelock": 0
    },
    "blockheight": 926607,
    "txid": "51e1261ab8f5899dc7480b9b546f0b03a9c054fb160fd9f9dbdfec62d954379c",
    "status": "active",
    "canspendfor": true,
    "cansignfor": true
  },
  {
    "identity": {
      "name": "agentplatform",
      "flags": 1,
      "identityaddress": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
      "..."
    },
    "blockheight": 926587,
    "status": "active",
    "canspendfor": true,
    "cansignfor": true
  },
  {
    "identity": {
      "name": "arimultisig",
      "primaryaddresses": [
        "RFgbPkbeFADR2tMk6sAW9teTKtzTbWnTMT",
        "RNJVffPkMQoSfF7Ww4W3QaRCRp6ajZrB4o"
      ],
      "minimumsignatures": 2,
      "..."
    },
    "status": "active",
    "canspendfor": false,
    "cansignfor": true
  }
]
```
*(Output truncated — test wallet contained 10 identities including ari@, agentplatform@, alice.agentplatform@, bob.agentplatform@, and others)*

**Notable Observations from Testing**
- `canspendfor: true` — wallet has enough keys to meet `minimumsignatures`
- `canspendfor: false, cansignfor: true` — wallet has *some* keys but not enough (e.g., `arimultisig@` requires 2 of 2 sigs, wallet only has 1 key)
- SubIDs (like `alice.agentplatform@`) appear alongside top-level IDs

**Examples**

**List All Spendable Identities (Default)**
```bash
./verus -testnet listidentities
```

**Only Signable (Not Spendable)**
```bash
./verus -testnet listidentities false true false
```

**Include Watch-Only**
```bash
./verus -testnet listidentities true true true
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"listidentities","params":[true]}'
```

**Common Use Cases**
- **Wallet inventory**: See all identities controlled by this wallet
- **Multi-sig audit**: Identify which identities the wallet can sign for but not fully spend
- **Application startup**: Enumerate available identities for a user interface

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty array `[]` | No identities in wallet | Register an identity or import keys |
| Wallet not loaded | Wallet is encrypted/locked | Unlock wallet with `walletpassphrase` |

**Related Commands**
- [getidentity](../identity/getidentity.md) — Get details for a specific identity
- [registernamecommitment](../identity/registernamecommitment.md) — Begin registering a new identity
- [registeridentity](../identity/registeridentity.md) — Complete identity registration

**Notes**
- This command only shows identities for which the local wallet has relevant keys. It does **not** search the entire blockchain.
- The distinction between `canspendfor` and `cansignfor` matters for multi-sig identities. A wallet might hold 1 of 2 required keys — it can sign but not spend alone.
- SubIDs (e.g., `alice.agentplatform@`) appear in the list if the wallet holds their keys, even if the parent identity is a different wallet.
- The `flags` field value of `1` indicates the identity has the `activecurrency` flag (can issue subIDs).

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## recoveridentity

> **Category:** Identity | **Version:** v1.2.x+

⚠️ **SENSITIVE** — Recover a revoked VerusID by providing a new identity definition with updated keys.

**Syntax**
```bash
verus recoveridentity "jsonidentity" (returntx) (tokenrecover) (feeoffer) (sourceoffunds)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| jsonidentity | object | Yes | New identity definition with updated keys/addresses |
| returntx | bool | No | If true, return signed tx instead of broadcasting. Default: false |
| tokenrecover | bool | No | If true, use tokenized ID control token for recovery. Default: false |
| feeoffer | value | No | Non-standard fee amount |
| sourceoffunds | string | No | Transparent or private address to source fees from |

**Result**
```
transactionid    (string) txid if returntx is false, or hex transaction if returntx is true
```

**Examples**

**⚠️ UNTESTED — Recovery is only possible on revoked identities**

**Basic Usage**
```bash
## Recover a revoked identity with new primary addresses
./verus -testnet recoveridentity '{"name":"myname", "primaryaddresses":["RNewAddressHere"], "minimumsignatures":1}'
```

**Full Recovery with New Authorities**
```bash
./verus -testnet recoveridentity '{
  "name": "myname",
  "primaryaddresses": ["RNewAddress1"],
  "minimumsignatures": 1,
  "revocationauthority": "newrevoker@",
  "recoveryauthority": "newrecoverer@"
}'
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"recoveridentity","params":[{"name":"myname","primaryaddresses":["RNewAddr"],"minimumsignatures":1}]}' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**
- **Key compromise recovery** — revoke the identity, then recover with fresh keys
- **Key rotation** — revoke + recover as a way to completely rotate all identity keys
- **Regain access** — recover an identity that was revoked (intentionally or by revocation authority)

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Not authorized | Wallet doesn't hold recovery authority keys | Import the recovery authority's private key |
| Identity not revoked | Cannot recover an identity that isn't revoked | Revoke first with `revokeidentity` |
| Identity not found | Invalid name or i-address | Check the identity name/address |

**Related Commands**
- [`revokeidentity`](revokeidentity.md) — Revoke an identity (required before recovery)
- [`updateidentity`](updateidentity.md) — Update identity (for non-revoked IDs)
- [`getidentity`](getidentity.md) — Check current identity status

**Notes**
- Recovery requires the **recovery authority** keys — not the primary keys or revocation authority
- The identity must be in a **revoked state** before it can be recovered
- Recovery lets you set **completely new** primary addresses, effectively rotating all keys
- You can also change the revocation and recovery authorities during recovery
- This is the last line of defense — if both primary keys AND recovery authority are compromised, the identity is lost
- Best practice: set recovery authority to a cold-storage identity or a trusted multisig
- For subIDs, include the `parent` field (same gotcha as `updateidentity`)

**Tested On**
- ⚠️ Not tested (requires a revoked identity)
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## registeridentity

> **Category:** Identity | **Version:** v1.2.x+

Register a new VerusID identity on-chain using a prior name commitment.

**Syntax**
```bash
verus registeridentity "jsonidregistration" (returntx) (feeoffer) (sourceoffunds)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| jsonidregistration | object | Yes | JSON object containing txid, namereservation, and identity definition |
| returntx | bool | No | If true, return signed tx hex instead of broadcasting. Default: false |
| feeoffer | amount | No | Fee to offer miner/staker. If omitted, uses standard price |
| sourceoffunds | string | No | Address to source funds from. Default: transparent wildcard "*" |

**jsonidregistration Structure**
```json
{
  "txid": "hexid",
  "namereservation": {
    "name": "namestr",
    "salt": "hexstr",
    "referral": "identityID",
    "parent": "",
    "nameid": "iAddress",
    "version": 1
  },
  "identity": {
    "name": "namestr",
    "primaryaddresses": ["Raddress"],
    "minimumsignatures": 1,
    "revocationauthority": "nameorID",
    "recoveryauthority": "nameorID",
    "privateaddress": "zs-address"
  }
}
```

**Result**
```
transactionid    (string) The transaction ID of the registration
```

**Examples**

**⚠️ UNTESTED — Registration requires a prior `registernamecommitment` and costs VRSC**

**Two-Step Registration Process**
```bash
## Step 1: Create a name commitment (returns txid, salt, etc.)
./verus -testnet registernamecommitment "myname" "controladdress" "referralID"

## Step 2: Register using the commitment output
./verus -testnet registeridentity '{
  "txid": "commitment_txid_hex",
  "namereservation": {
    "name": "myname",
    "salt": "salt_from_commitment",
    "referral": "referralID@",
    "parent": "",
    "nameid": "nameid_from_commitment",
    "version": 1
  },
  "identity": {
    "name": "myname",
    "primaryaddresses": ["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"],
    "minimumsignatures": 1,
    "version": 3
  }
}'
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"registeridentity","params":[{"txid":"hexid","namereservation":{"name":"myname","salt":"hexsalt","referral":""},"identity":{"name":"myname","primaryaddresses":["Raddr"],"minimumsignatures":1}}]}' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**
- **Creating a new VerusID** — the standard way to register an identity after name commitment
- **Multisig identity** — specify multiple `primaryaddresses` and set `minimumsignatures` > 1
- **With referral** — include a referral identity for fee discount

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Name commitment not found | Invalid or expired txid | Create a new `registernamecommitment` |
| Name already registered | Someone registered the name first | Choose a different name |
| Insufficient funds | Not enough VRSC for registration fee | Fund the wallet or specify `sourceoffunds` |
| Must wait for commitment to be mined | Commitment tx not yet confirmed | Wait for at least 1 confirmation |

**Related Commands**
- [`registernamecommitment`](registernamecommitment.md) — Step 1: create a name commitment (required before registeridentity)
- [`getidentity`](getidentity.md) — Look up a registered identity
- [`updateidentity`](updateidentity.md) — Modify an existing identity
- [`listidentities`](listidentities.md) — List identities in wallet

**Notes**
- Registration is a **two-step process**: first `registernamecommitment`, then `registeridentity`
- The name commitment must be mined (1 confirmation) before registration
- Name commitments expire — register promptly after commitment confirms
- Registration fee varies by chain; use `feeoffer` to override
- Identity names are **case-insensitive** and unique per parent chain
- Once registered, an identity cannot be deleted, only revoked/recovered

**Tested On**
- ⚠️ Not directly tested (destructive/costly operation)
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## registernamecommitment

> **Category:** Identity | **Version:** v1.2.x+

Registers a name commitment, which is the required first step for registering a new VerusID. The commitment hides the desired name in a hash to prevent front-running by miners, while ensuring fair name registration.

**Syntax**
```bash
verus registernamecommitment "name" "controladdress" ("referralidentity") ("parentnameorid") ("sourceoffunds")
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | The unique name to commit to. Creating a commitment for a name that already exists will succeed but can never be used. |
| controladdress | address | Yes | Address that controls this commitment. Must be in the current wallet. **Not necessarily the address that will control the final ID.** Change may go to this address. |
| referralidentity | identity | No | Friendly name or i-address used as referral — lowers network cost of the ID. |
| parentnameorid | currency | No | Parent namespace name or i-address (PBaaS only). Dictates issuance rules & pricing. |
| sourceoffunds | address/id | No | Address to use as source of funds. Default: transparent wildcard `"*"`. |

**Result**
```json
{
  "txid": "hexid",
  "namereservation": {
    "name": "namestr",
    "salt": "hexstr",
    "referral": "identityaddress",
    "parent": "namestr",
    "nameid": "address"
  }
}
```

| Field | Description |
|-------|-------------|
| `txid` | Transaction ID of the commitment transaction |
| `namereservation.name` | The name being committed to |
| `namereservation.salt` | Random salt used to hide the commitment (keep this!) |
| `namereservation.referral` | Referral identity address (if provided) |
| `namereservation.parent` | Parent namespace name |
| `namereservation.nameid` | The i-address the identity will have if registered |

**Examples**

**Basic Name Commitment**
```bash
./verus -testnet registernamecommitment "mynewid" "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"
```

**With Referral Identity**
```bash
./verus -testnet registernamecommitment "mynewid" "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5" "ari@"
```

**SubID Under a Parent Namespace**
```bash
./verus -testnet registernamecommitment "newagent" "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2" "" "agentplatform@"
```

**RPC (curl)**
```bash
curl -s -u user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  -X POST http://localhost:18843 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"wiki","method":"registernamecommitment","params":["mynewid","RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5"]}'
```

**Common Use Cases**
- **Step 1 of identity registration**: Always required before `registeridentity`
- **Name squatting prevention**: The commitment-reveal scheme prevents miners from stealing names
- **SubID creation**: Use `parentnameorid` to create identities under a namespace you control

**Two-Step Registration Process**
1. **`registernamecommitment`** — Creates a hidden commitment (this command)
2. Wait for the commitment to be mined (at least 1 confirmation)
3. **`registeridentity`** — Reveals the name and completes registration using the commitment output

```bash
## Step 1: Commit
./verus -testnet registernamecommitment "myname" "RMyAddress..."

## Step 2: Wait for confirmation, then register
./verus -testnet registeridentity '{"txid":"<txid>","namereservation":{"name":"myname","salt":"<salt>","nameid":"<nameid>"},"identity":{"name":"myname","primaryaddresses":["RMyAddress..."],"minimumsignatures":1}}'
```

**Name Rules**
Names must **not** have:
- Leading, trailing, or multiple consecutive spaces
- Any of these characters: `\ / : * ? " < > | @`

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Insufficient funds` | Not enough VRSC/VRSCTEST in wallet | Fund the control address |
| `Invalid name` | Name contains forbidden characters | Remove special characters (see Name Rules above) |
| `Invalid Verus address` | Control address not valid | Use a valid R-address from the current wallet |
| Commitment for existing name | Name already registered | The commitment succeeds but `registeridentity` will fail. Check name availability first with `getidentity`. |

**Related Commands**
- [registeridentity](../identity/registeridentity.md) — Step 2: Complete registration using the commitment
- [getidentity](../identity/getidentity.md) — Check if a name is already taken
- [listidentities](../identity/listidentities.md) — List identities in your wallet

**Notes**
- **Save the output!** The `namereservation` object (especially `salt`) is required for `registeridentity`. If lost, the commitment is wasted.
- The commitment must be mined before you can register. Wait for at least 1 block confirmation.
- Creating a commitment does **not** guarantee the name — someone else could register it first if they had an earlier commitment.
- The `controladdress` receives change from the commitment transaction. It does not need to be a primary address of the final identity.
- Commitments expire after a certain number of blocks if not used with `registeridentity`.
- On testnet, identity registration costs are minimal. On mainnet, costs vary and referrals can reduce fees.
- **Did not run live test** to avoid creating unnecessary commitments on testnet. The command structure and parameters are documented from help text and prior testing experience.

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 1.2.14-2

---

## revokeidentity

> **Category:** Identity | **Version:** v1.2.x+

⚠️ **DESTRUCTIVE** — Revoke a VerusID, disabling it from signing, spending, or being used for authentication until recovered.

**Syntax**
```bash
verus revokeidentity "nameorID" (returntx) (tokenrevoke) (feeoffer) (sourceoffunds)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| nameorID | string | Yes | The identity name (e.g., `ari@`) or i-address to revoke |
| returntx | bool | No | If true, return signed tx instead of broadcasting. Default: false |
| tokenrevoke | bool | No | If true, use tokenized ID control token for revocation. Default: false |
| feeoffer | value | No | Non-standard fee amount |
| sourceoffunds | string | No | Transparent or private address to source fees from |

**Result**
```
transactionid    (string) txid if returntx is false, or hex transaction if returntx is true
```

**Examples**

**⚠️ UNTESTED — This is a destructive operation**

**Basic Usage**
```bash
## Revoke an identity (CAUTION: identity becomes unusable until recovered)
./verus -testnet revokeidentity "myidentity@"
```

**Dry Run (inspect before broadcasting)**
```bash
## Return transaction hex without broadcasting
./verus -testnet revokeidentity "myidentity@" true
```

**Token-Based Revocation**
```bash
## Use tokenized control token for revocation authority
./verus -testnet revokeidentity "myidentity@" false true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"revokeidentity","params":["myidentity@"]}' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**
- **Compromised identity** — immediately revoke if private keys are stolen
- **Security lockdown** — revoke to prevent any transactions while investigating a breach
- **Pre-recovery** — revoke before using `recoveridentity` to rotate keys

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Not authorized | Wallet doesn't hold revocation authority keys | Import the revocation authority's private key |
| Identity not found | Invalid name or i-address | Check the identity name/address |
| Already revoked | Identity is already in revoked state | Use `recoveridentity` to restore |

**Related Commands**
- [`recoveridentity`](recoveridentity.md) — Recover a revoked identity with new keys
- [`updateidentity`](updateidentity.md) — Update identity (cannot be done while revoked)
- [`getidentity`](getidentity.md) — Check identity status (flags will show revoked state)

**Notes**
- **This is a destructive operation** — a revoked identity cannot sign, spend funds, or authenticate
- Revocation requires the **revocation authority** keys, not the primary keys
- After revocation, only `recoveridentity` (using the **recovery authority**) can restore the identity
- It's good practice to set revocation and recovery authorities to **different** identities for security
- Use `returntx true` to inspect the transaction before committing
- Revocation is an on-chain transaction — it takes effect once mined
- The revocation and recovery authority design means even if primary keys are compromised, you can revoke and recover

**Tested On**
- ⚠️ Not tested (destructive operation)
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## setidentitytimelock

> **Category:** Identity | **Version:** v1.2.x+

Enable timelocking and unlocking of fund access for an on-chain VerusID. Provides time-delayed security against unauthorized spending.

**Syntax**
```bash
verus setidentitytimelock "id@" '{"unlockatblock": height}' (returntx) (feeoffer) (sourceoffunds)
verus setidentitytimelock "id@" '{"setunlockdelay": blocks}' (returntx) (feeoffer) (sourceoffunds)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id@ | string | Yes | The identity name or i-address to timelock |
| unlockatblock | number | No* | Absolute block height at which the ID unlocks. Countdown starts immediately when mined |
| setunlockdelay | number | No* | Number of blocks to delay after an unlock request before funds become spendable |
| returntx | bool | No | If true, return signed tx instead of broadcasting. Default: false |
| feeoffer | value | No | Non-standard fee amount |
| sourceoffunds | string | No | Transparent or private address to source fees from |

*One of `unlockatblock` or `setunlockdelay` must be specified, but not both.

**Result**
```
hexstring    (string) txid if returntx is false, or hex serialized transaction if returntx is true
```

**Examples**

**⚠️ UNTESTED — Timelocking is a sensitive operation that restricts fund access**

**Set an Unlock Delay (Recommended for Security)**
```bash
## Require 100 blocks (~100 minutes) delay after unlock request before spending
./verus -testnet setidentitytimelock "myid@" '{"setunlockdelay": 100}'
```

**Set Absolute Unlock Time**
```bash
## Lock until block 1000000 — countdown starts immediately
./verus -testnet setidentitytimelock "myid@" '{"unlockatblock": 1000000}'
```

**Unlock a Delayed Identity**
```bash
## Set unlockatblock to current block to begin the unlock delay countdown
./verus -testnet setidentitytimelock "myid@" '{"unlockatblock": 926957}'
```

**Dry Run**
```bash
./verus -testnet setidentitytimelock "myid@" '{"setunlockdelay": 100}' true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"setidentitytimelock","params":["myid@",{"setunlockdelay":100}]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Cold storage security** — lock an identity so funds can't be spent instantly even if keys are compromised
- **Delayed withdrawal** — give yourself a window to revoke if unauthorized unlock is detected
- **Service integration** — services can check lock status and refuse transfers when locked

**Two Locking Modes**

**`setunlockdelay` (Relative Lock)**
- Sets a **delay period** (in blocks) that must pass after an unlock request
- Unlock request = calling `setidentitytimelock` with `unlockatblock` set to current block
- The delay countdown **only starts** when you actively request unlock
- Best for: ongoing security (like a time-lock safe)

**`unlockatblock` (Absolute Lock)**
- Locks until a **specific block height**
- Countdown starts **immediately** when the transaction is mined
- Set to current block height to begin unlocking (still subject to any unlock delay)
- Best for: scheduled unlocks or initiating the unlock process

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Cannot specify both | Both unlockatblock and setunlockdelay provided | Use only one at a time |
| Not authorized | Wallet doesn't hold identity's signing keys | Import the primary key |
| Identity not found | Invalid name or i-address | Verify the identity exists |

**Related Commands**
- [`getidentity`](getidentity.md) — Check current timelock status in identity flags
- [`updateidentity`](updateidentity.md) — General identity updates
- [`revokeidentity`](revokeidentity.md) — Revoke/recover can bypass timelock

**Notes**
- Timelocking is **per-chain** — it does not affect the same identity exported to other chains
- A timelocked identity **prevents all updates** (including contentmultimap changes) until unlocked
- **Locked funds can still stake** — timelocking does not prevent staking rewards
- The **only way to remove a timelock** is through **revoke and recover** — this is by design. Revoking and recovering a timelocked identity removes the timelock entirely
- There is no other mechanism to cancel or shorten a timelock once set
- Services supporting VerusID authentication may also honor the lock status for non-spending operations
- Average block time on Verus is ~62 seconds, so ~1394 blocks ≈ 1 day (1440 blocks ≈ 24.8 hours)
- Use `getidentity` to check the current lock state and timelock parameters

**Tested On**
- ⚠️ Not directly tested (would lock fund access)
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## setidentitytrust

> **Category:** Identity | **Version:** v1.2.x+

Set trust ratings for VerusIDs and configure identity trust mode for wallet sync filtering.

**Syntax**
```bash
verus setidentitytrust '{"clearall": bool, "setratings":{"id":JSONRatingObject,...}, "removeratings":["id",...], "identitytrustmode": n}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| clearall | bool | No | If true, clears all wallet trust lists before applying changes |
| setratings | object | No | Key-value pairs of identity names/addresses to rating objects |
| removeratings | array | No | Array of identity names/addresses to remove from trust list |
| identitytrustmode | number | No | 0 = no restriction, 1 = only sync approved IDs, 2 = sync all except blocked |

**Trust Modes**
| Mode | Behavior |
|------|----------|
| 0 | No restriction on identity sync (default) |
| 1 | Only sync identities rated as approved |
| 2 | Sync all identities except those on the block list |

**Result**
```
No return on success, error on failure.
```

**Examples**

**Set Trust Rating for an Identity**
```bash
## Set trust level for ari@
./verus -testnet setidentitytrust '{"setratings":{"ari@":{"trustlevel":2}}, "identitytrustmode":0}'

## Actual Output (tested on VRSCTEST)
## (no output — success returns nothing)
```

**Remove Trust Ratings**
```bash
./verus -testnet setidentitytrust '{"removeratings":["ari@"]}'
```

**Clear All and Set Fresh**
```bash
./verus -testnet setidentitytrust '{"clearall":true, "setratings":{"ari@":{"trustlevel":1}}, "identitytrustmode":1}'
```

**Read Trust Ratings**
```bash
## Use getidentitytrust to read (separate command)
./verus -testnet getidentitytrust '["ari@"]'
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"setidentitytrust","params":[{"setratings":{"ari@":{"trustlevel":2}},"identitytrustmode":0}]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Whitelist identities** — approve specific IDs for sync in restrictive mode
- **Block spam identities** — add untrusted IDs to block list with mode 2
- **Wallet sync optimization** — limit which identities your wallet tracks

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Invalid JSON | Malformed JSON input | Validate JSON syntax |
| Unknown identity | Identity name doesn't resolve | Use i-address instead |

**Related Commands**
- `getidentitytrust` — Read current trust ratings and mode
- [`getidentity`](getidentity.md) — Look up identity details

**Notes**
- Trust ratings are **local to your wallet** — they don't affect the blockchain
- Trust mode controls which identities your wallet syncs/tracks
- Mode 1 (approved only) is the most restrictive — useful for resource-constrained nodes
- The `setratings` and `removeratings` operations can be combined in a single call
- `clearall` is processed first, then `setratings`, then `removeratings`
- Success returns no output (null) — check with `getidentitytrust` to confirm

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## signdata

> **Category:** Identity | **Version:** v1.2.x+

Sign data with a VerusID or t-address using advanced options including VDXF keys, bound hashes, hash type selection, and MMR (Merkle Mountain Range) support.

**Syntax**
```bash
verus signdata '{"address":"id@", "message":"data", ...}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | VerusID (e.g., `ari@`) or t-address to sign with |
| message | string | No* | Plain text message to sign |
| filename | string | No* | File path to sign |
| messagehex | string | No* | Hex-encoded data to sign |
| messagebase64 | string | No* | Base64-encoded data to sign |
| datahash | string | No* | Pre-computed 256-bit hex hash to sign directly |
| vdxfdata | string | No* | VDXF-encoded data to sign |
| prefixstring | string | No | Extra string hashed during signature (must be supplied for verification) |
| vdxfkeys | array | No | Array of VDXF key i-addresses to bind to signature |
| vdxfkeynames | array | No | Array of VDXF key names or friendly IDs |
| boundhashes | array | No | Array of hex hashes to bind to signature |
| hashtype | string | No | `sha256` (default), `sha256D`, `blake2b`, or `keccak256` |
| encrypttoaddress | string | No | Sapling address to encrypt data to |
| createmmr | bool | No | If true, creates MMR from multiple data items |
| mmrdata | array | No | Array of data objects for MMR signing |
| mmrsalt | array | No | Salt values for MMR leaf privacy |
| mmrhash | string | No | Hash type for MMR (default: blake2b) |
| signature | string | No | Current partial signature for multisig IDs |
| priormmr | array | No | Prior MMR data (currently UNIMPLEMENTED in daemon) |

*One data parameter is required.

**Result**
```json
{
  "signaturedata": {
    "version": 1,
    "systemid": "iAddress",
    "hashtype": 5,
    "signaturehash": "hexhash",
    "identityid": "iAddress",
    "signaturetype": 1,
    "signature": "base64sig"
  },
  "system": "VRSCTEST",
  "systemid": "iAddress",
  "hashtype": "sha256",
  "hash": "hexhash",
  "identity": "name@",
  "canonicalname": "name@",
  "address": "iAddress",
  "signatureheight": 926957,
  "signatureversion": 2,
  "signature": "base64sig"
}
```

**Examples**

**Basic Usage — Sign a Message**
```bash
## Command
./verus -testnet signdata '{"address":"ari@", "message":"Hello from Ari - testing signdata for wiki docs"}'

## Actual Output (tested on VRSCTEST)
{
  "signaturedata": {
    "version": 1,
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "hashtype": 5,
    "signaturehash": "6972221095db42a7c97bd325ab7b6c641d3372be2ae0b435f7696c90789260c6",
    "identityid": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
    "signaturetype": 1,
    "signature": "AgXtJA4AAUEfK2i7aQevRK3PPJFttLTRk7bkXeKE8vMPd+KE3fobhnViIM496FCXFN4TN2Nh0iQ5fOlcc8VHJqCOTEDa03gvrQ=="
  },
  "system": "VRSCTEST",
  "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "hashtype": "sha256",
  "hash": "6972221095db42a7c97bd325ab7b6c641d3372be2ae0b435f7696c90789260c6",
  "identity": "ari.VRSCTEST@",
  "canonicalname": "ari.vrsctest@",
  "address": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
  "signatureheight": 926957,
  "signatureversion": 2,
  "signature": "AgXtJA4AAUEfK2i7aQevRK3PPJFttLTRk7bkXeKE8vMPd+KE3fobhnViIM496FCXFN4TN2Nh0iQ5fOlcc8VHJqCOTEDa03gvrQ=="
}
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"signdata","params":[{"address":"ari@","message":"hello world"}]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Data attestation** — sign arbitrary data with a VerusID for provable authorship
- **VDXF-bound signatures** — bind signatures to specific VDXF data types
- **Multi-object MMR** — sign multiple pieces of data in a single Merkle Mountain Range
- **Encrypted data** — sign and encrypt data to a Sapling address

**signdata vs signmessage**
| Feature | signdata | signmessage |
|---------|----------|-------------|
| Output format | Full JSON with signaturedata | Simple hash + signature |
| Signature version | v2 (includes system context) | v1 (simple) |
| VDXF keys | ✅ | ❌ |
| Bound hashes | ✅ | ❌ |
| Hash type selection | ✅ | ❌ (SHA256 only) |
| MMR support | ✅ | ❌ |
| Verification | `verifysignature` (use `datahash`) | `verifymessage` |

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| No data to sign | Missing message/filename/datahash | Provide at least one data parameter |
| Not authorized | Wallet doesn't hold signing keys for identity | Import the private key |
| Identity not found | Invalid identity name or address | Verify the identity exists |

**Related Commands**
- [`verifysignature`](verifysignature.md) — Verify a signdata signature (use `datahash` from output)
- [`signmessage`](signmessage.md) — Simpler message signing (v1 signatures)
- [`signfile`](signfile.md) — Simple file signing

**Notes**
- Returns **signature version 2** which includes system context in the hash — this means the hash differs from a simple SHA256 of the message
- To verify with `verifysignature`, use the `datahash` field from `signdata` output, NOT the original message (the message-based verification won't match due to v2 hashing)
- The `signaturedata` field contains the raw serialized signature data
- `signatureheight` records the block height at signing time, used for identity state verification
- Supports multisig via the `signature` parameter — pass partial signatures for accumulation

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## signfile

> **Category:** Identity | **Version:** v1.2.x+

Generate a SHA256D hash of a file and sign it with a VerusID or t-address.

**Syntax**
```bash
verus signfile "address or identity" "filepath/filename" ("currentsig")
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | t-address or VerusID (e.g., `ari@`) to sign with |
| filename | string | Yes | Path to local file to sign |
| cursig | string | No | Current partial signature (base64) for multisig IDs |

**Result**
```json
{
  "hash": "hexhash",
  "signature": "base64sig"
}
```

**Examples**

**Basic Usage**
```bash
## Command
./verus -testnet signfile "ari@" "/tmp/verus_test_sign.txt"

## Actual Output (tested on VRSCTEST)
{
  "hash": "720949abdd085252234efa73c02059fdc876f3c2295dd413e020d04292620c5d",
  "signature": "Ae0kDgABQR+9rcThasA9w0KYb/90a4QGRWUKgt3WZnRZOE+YDvKXKVhWMKMT15PT2MkO+Ru4i9cnt/XsGO2pMyDo42VmQ186"
}
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"signfile","params":["ari@","/tmp/verus_test_sign.txt"]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Document signing** — prove authorship or approval of a file
- **Software releases** — sign binaries or archives for verification
- **Audit trails** — create verifiable signatures for compliance documents

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| File not found | Invalid file path | Use absolute path accessible to the daemon |
| Not authorized | Wallet doesn't hold signing keys | Import the private key |
| Identity not found | Invalid identity name | Check spelling and chain suffix |

**Related Commands**
- [`verifyfile`](verifyfile.md) — Verify a file signature
- [`signmessage`](signmessage.md) — Sign a text message instead
- [`signdata`](signdata.md) — Advanced signing with VDXF keys, bound hashes, etc.

**Notes**
- The hash returned is **SHA256** (not SHA256D, despite using SHA256D internally for signing)
- The file must be accessible to the **daemon process**, not just the CLI
- Use `verifyfile` with the same file path and signature to verify
- Supports multisig accumulation via the `cursig` parameter
- The signature encodes the block height at signing time for identity state verification

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## signmessage

> **Category:** Identity | **Version:** v1.2.x+

Sign a message with the private key of a t-address or the authorities present in this wallet for a VerusID.

**Syntax**
```bash
verus signmessage "address or identity" "message" ("currentsig")
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | t-address or VerusID (e.g., `ari@`) to sign with |
| message | string | Yes | The message text to sign |
| cursig | string | No | Current partial signature (base64) for multisig IDs |

**Result**
```json
{
  "hash": "hexhash",
  "signature": "base64sig"
}
```

**Examples**

**Basic Usage**
```bash
## Command
./verus -testnet signmessage "ari@" "Hello from Ari - testing signmessage for wiki docs"

## Actual Output (tested on VRSCTEST)
{
  "hash": "c7eb4997c9887fc59c2c02e397e44735f70a0173f547a1402170e120221bd48c",
  "signature": "Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE"
}
```

**Verify the Signed Message**
```bash
./verus -testnet verifymessage "ari@" "Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE" "Hello from Ari - testing signmessage for wiki docs"
## Output: true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"signmessage","params":["ari@","Hello from Ari"]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Authentication** — prove you control a VerusID
- **Message attestation** — sign statements or agreements
- **Off-chain verification** — create portable proofs of identity

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Private key not available | Wallet doesn't hold signing keys | Import the private key or unlock wallet |
| Identity not found | Invalid identity name | Check spelling, include chain suffix if needed |
| Wallet locked | Wallet is encrypted and locked | Run `walletpassphrase` first |

**Related Commands**
- [`verifymessage`](verifymessage.md) — Verify a signmessage signature
- [`verifyhash`](verifyhash.md) — Verify using the hash directly
- [`signdata`](signdata.md) — Advanced signing with VDXF keys, bound hashes, etc.
- [`signfile`](signfile.md) — Sign a file instead of a message

**Notes**
- Returns a **v1 simple signature** — use `verifymessage` (not `verifysignature`) to verify
- The hash is SHA256 of the message
- For advanced features (VDXF keys, bound hashes, hash type selection), use `signdata` instead
- Supports multisig accumulation — pass partial signatures via `cursig`
- The signature embeds the block height at signing time

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## updateidentity

> **Category:** Identity | **Version:** v1.2.x+

Update an existing VerusID's properties on-chain (primary addresses, authorities, content, flags, etc.).

**Syntax**
```bash
verus updateidentity "jsonidentity" (returntx) (tokenupdate) (feeoffer) (sourceoffunds)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| jsonidentity | object | Yes | New definition of the identity (only changed fields needed alongside `name`) |
| returntx | bool | No | If true, return signed tx instead of broadcasting. Default: false |
| tokenupdate | bool | No | If true, use tokenized ID control token for authority. Default: false |
| feeoffer | value | No | Non-standard fee amount |
| sourceoffunds | string | No | Transparent or private address to source fees from |

**jsonidentity Fields**
```json
{
  "name": "identityname",
  "parent": "iAddress",
  "primaryaddresses": ["Raddress", ...],
  "minimumsignatures": 1,
  "revocationauthority": "nameorID",
  "recoveryauthority": "nameorID",
  "privateaddress": "zs-address",
  "contentmultimap": { ... },
  "flags": 0
}
```

**Result**
```
hexstring    (string) txid if returntx is false, or hex serialized transaction if returntx is true
```

**Examples**

**Basic Usage — Update a Root ID**
```bash
## Update ari@ identity (root-level ID on VRSCTEST)
./verus -testnet updateidentity '{"name":"ari", "contentmultimap":{"iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a":["226172694022"]}}'
```

**⚠️ CRITICAL: SubID Updates Require `parent` Field**
```bash
## WRONG — This will fail silently or update the wrong identity:
./verus -testnet updateidentity '{"name":"alice.agentplatform"}'

## CORRECT — SubIDs MUST include the parent field:
./verus -testnet updateidentity '{"name":"alice", "parent":"iKxGfbQTMPiQ95FjfJDjWW4MQzkvFqxpbB"}'
```

> **⚠️ SubID Gotcha:** When updating a sub-identity (e.g., `alice.agentplatform@`), you **must** include the `"parent"` field with the parent identity's i-address. Without it, the daemon will look for a root identity named "alice" instead of the subID "alice.agentplatform". This is the most common source of errors with `updateidentity`.

**Token-Based Update**
```bash
## Use tokenized control token instead of key-based authority
./verus -testnet updateidentity '{"name":"ari"}' false true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"updateidentity","params":[{"name":"ari","contentmultimap":{"iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a":["226172694022"]}}]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Rotate keys** — change `primaryaddresses` to new addresses for security
- **Add content** — store data in `contentmultimap` using VDXF keys
- **Change authorities** — update `revocationauthority` or `recoveryauthority`
- **Enable multisig** — add multiple addresses and increase `minimumsignatures`
- **Set private address** — add a shielded `privateaddress` for receiving private funds

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Identity not found | Wrong name or missing `parent` for subIDs | Include `parent` i-address for sub-identities |
| Not authorized | Wallet doesn't hold signing keys for identity | Import the private key or use `tokenupdate` |
| Identity is revoked | Cannot update a revoked identity | Use `recoveridentity` first |
| Insufficient funds | Not enough for transaction fee | Fund the wallet or specify `sourceoffunds` |

**Related Commands**
- [`getidentity`](getidentity.md) — View current identity state before/after update
- [`registeridentity`](registeridentity.md) — Initial identity registration
- [`revokeidentity`](revokeidentity.md) — Revoke an identity
- [`recoveridentity`](recoveridentity.md) — Recover a revoked identity

**Notes**
- The `name` field is always required to identify which ID to update
- **SubIDs require the `parent` field** — this is the #1 gotcha
- Only fields you include will be changed; omitted fields retain their current values
- You must have signing authority (keys in wallet) or use `tokenupdate`
- `tokenupdate` allows holders of the tokenized ID control token to update without primary key authority, but cannot change revocation/recovery authorities
- Updates are on-chain transactions and require confirmation
- Use `returntx` to inspect the transaction before broadcasting in sensitive cases

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## verifyfile

> **Category:** Identity | **Version:** v1.2.x+

Verify a signed file against a VerusID or t-address.

**Syntax**
```bash
verus verifyfile "address or identity" "signature" "filepath/filename" (checklatest)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | t-address or VerusID that signed the file |
| signature | string | Yes | Base64-encoded signature from `signfile` |
| filename | string | Yes | Path to the file that was signed |
| checklatest | bool | No | If true, verify against latest identity state. Default: false (uses signing height) |

**Result**
```
true|false    (boolean) Whether the signature is valid
```

**Examples**

**Basic Usage**
```bash
## Command
./verus -testnet verifyfile "ari@" "Ae0kDgABQR+9rcThasA9w0KYb/90a4QGRWUKgt3WZnRZOE+YDvKXKVhWMKMT15PT2MkO+Ru4i9cnt/XsGO2pMyDo42VmQ186" "/tmp/verus_test_sign.txt"

## Actual Output (tested on VRSCTEST)
true
```

**Check Against Latest Identity State**
```bash
## Verify using the current identity keys (not the keys at signing time)
./verus -testnet verifyfile "ari@" "signature_base64" "/tmp/verus_test_sign.txt" true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"verifyfile","params":["ari@","Ae0kDgABQR+9rcThasA9w0KYb/90a4QGRWUKgt3WZnRZOE+YDvKXKVhWMKMT15PT2MkO+Ru4i9cnt/XsGO2pMyDo42VmQ186","/tmp/verus_test_sign.txt"]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Software verification** — verify signed binaries or archives
- **Document integrity** — confirm a document hasn't been tampered with since signing
- **Audit compliance** — verify signed audit artifacts

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| false (returns false) | File modified, wrong signature, or wrong identity | Ensure file is unmodified and matches the signing identity |
| File not found | Invalid file path | Use absolute path accessible to the daemon |
| Identity not found | Invalid identity name | Check the identity name/address |

**Related Commands**
- [`signfile`](signfile.md) — Sign a file (produces the signature to verify)
- [`verifymessage`](verifymessage.md) — Verify a message signature
- [`verifyhash`](verifyhash.md) — Verify using a hash directly

**Notes**
- The file must be accessible to the **daemon process**
- By default, verification checks against the identity state at the **signing height** (recorded in the signature)
- Use `checklatest: true` to verify against the **current** identity state — useful if keys have been rotated
- If the identity was updated (key rotation) after signing, default verification still succeeds (checks historical state)

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## verifyhash

> **Category:** Identity | **Version:** v1.2.x+

Verify a signature against a pre-computed hash and a VerusID or t-address.

**Syntax**
```bash
verus verifyhash "address or identity" "signature" "hexhash" (checklatest)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | t-address or VerusID that signed the data |
| signature | string | Yes | Base64-encoded signature from `signmessage` or `signfile` |
| hexhash | string | Yes | Hex-encoded hash of the original message or file |
| checklatest | bool | No | If true, verify against latest identity state. Default: false |

**Result**
```
true|false    (boolean) Whether the signature is valid
```

**Examples**

**Basic Usage**
```bash
## Using the hash from signmessage output to verify
./verus -testnet verifyhash "ari@" "Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE" "c7eb4997c9887fc59c2c02e397e44735f70a0173f547a1402170e120221bd48c"

## Actual Output (tested on VRSCTEST)
true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"verifyhash","params":["ari@","Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE","c7eb4997c9887fc59c2c02e397e44735f70a0173f547a1402170e120221bd48c"]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Hash-only verification** — when you have the hash but not the original data
- **Remote verification** — verify without transmitting the original file/message
- **Cross-system verification** — verify signatures when only the hash was stored

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| false | Wrong hash, wrong signature, or wrong identity | Ensure hash matches what was originally signed |
| Invalid hex | Hash is not valid hex | Provide a valid 64-character hex hash |

**Related Commands**
- [`signmessage`](signmessage.md) — Sign a message (output includes hash)
- [`signfile`](signfile.md) — Sign a file (output includes hash)
- [`verifymessage`](verifymessage.md) — Verify with the original message text
- [`verifyfile`](verifyfile.md) — Verify with the original file
- [`verifysignature`](verifysignature.md) — Advanced verification for `signdata` signatures

**Notes**
- The hash must be the **SHA256** hash as returned by `signmessage` or `signfile`
- This is useful when you've stored the hash separately from the original data
- Works with signatures from both `signmessage` and `signfile`
- For `signdata` (v2) signatures, use `verifysignature` with `datahash` instead

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## verifymessage

> **Category:** Identity | **Version:** v1.2.x+

Verify a signed message against a VerusID or t-address.

**Syntax**
```bash
verus verifymessage "address or identity" "signature" "message" (checklatest)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | t-address or VerusID that signed the message |
| signature | string | Yes | Base64-encoded signature from `signmessage` |
| message | string | Yes | The original message that was signed |
| checklatest | bool | No | If true, verify against latest identity state. Default: false |

**Result**
```
true|false    (boolean) Whether the signature is valid
```

**Examples**

**Basic Usage**
```bash
## Command
./verus -testnet verifymessage "ari@" "Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE" "Hello from Ari - testing signmessage for wiki docs"

## Actual Output (tested on VRSCTEST)
true
```

**Verify with Latest Identity State**
```bash
## Check against current keys (useful after key rotation)
./verus -testnet verifymessage "ari@" "signature_base64" "message" true
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"verifymessage","params":["ari@","Ae0kDgABQSDPV6z9gmeWVtGt6SaLiRk78JnsSf8LwCQjSeGj3Bja+WkFKg8jl0M1e+z/z6OzfQVjeW+rp26qg5mWxzrD1QAE","Hello from Ari - testing signmessage for wiki docs"]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Authentication proof** — verify someone controls a VerusID
- **Message integrity** — confirm a message hasn't been altered
- **Off-chain verification** — verify VerusID signatures in external systems

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| false | Message modified, wrong signature, or wrong identity | Ensure exact message text matches what was signed |
| Identity not found | Invalid identity name | Check spelling and format |

**Related Commands**
- [`signmessage`](signmessage.md) — Sign a message (produces the signature to verify)
- [`verifyhash`](verifyhash.md) — Verify using the hash instead of the message
- [`verifyfile`](verifyfile.md) — Verify a file signature
- [`verifysignature`](verifysignature.md) — Advanced verification for `signdata` signatures

**Notes**
- The message must match **exactly** — including whitespace and case
- Use this for signatures produced by `signmessage`. For `signdata` signatures, use `verifysignature`
- By default, checks against the identity state at the **signing height** (embedded in signature)
- `checklatest: true` verifies against current identity keys — will fail if keys were rotated after signing

**Tested On**
- VRSCTEST block height: 926957
- Verus version: 2000753

---

## verifysignature

> **Category:** Identity | **Version:** v1.2.x+

Verify a signature produced by `signdata`, supporting advanced features like VDXF keys, bound hashes, and hash type selection.

**Syntax**
```bash
verus verifysignature '{"address":"id@", "signature":"base64sig", ...}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Yes | VerusID or t-address that signed the data |
| signature | string | Yes | Base64-encoded signature to verify |
| message | string | No* | Original message text |
| filename | string | No* | File path that was signed |
| messagehex | string | No* | Hex-encoded data |
| messagebase64 | string | No* | Base64-encoded data |
| datahash | string | No* | Pre-computed hash (use hash from `signdata` output) |
| prefixstring | string | No | Extra string used during signing (must match) |
| vdxfkeys | array | No | VDXF key i-addresses bound during signing |
| vdxfkeynames | array | No | VDXF key names bound during signing |
| boundhashes | array | No | Hex hashes bound during signing |
| hashtype | string | No | Hash type used: `sha256`, `sha256D`, `blake2b`, `keccak256` |
| checklatest | bool | No | If true, verify against latest identity state. Default: false |

*One data parameter is required.

**Result**
```json
{
  "signaturestatus": "verified",
  "system": "VRSCTEST",
  "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "identity": "ari.VRSCTEST@",
  "canonicalname": "ari.vrsctest@",
  "address": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
  "hashtype": "sha256",
  "hash": "hexhash",
  "height": 926958,
  "signatureheight": 926957,
  "signature": "base64sig"
}
```

**Examples**

**Verify Using datahash (Recommended for signdata signatures)**
```bash
## Use the "hash" field from signdata output as "datahash"
./verus -testnet verifysignature '{"address":"ari@", "datahash":"ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae", "signature":"AgXtJA4AAUEgXgBD28607ExvUtwYN788OyIboWOewNh5VS62b6iLhlM2fE1FFu3T793hVo4thSLPlDMLPjzyeZqQIgbafkrzGQ=="}'

## Actual Output (tested on VRSCTEST)
{
  "signaturestatus": "verified",
  "system": "VRSCTEST",
  "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "identity": "ari.VRSCTEST@",
  "canonicalname": "ari.vrsctest@",
  "address": "i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129",
  "hashtype": "sha256",
  "hash": "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae",
  "height": 926958,
  "signatureheight": 926957,
  "signature": "AgXtJA4AAUEgXgBD28607ExvUtwYN788OyIboWOewNh5VS62b6iLhlM2fE1FFu3T793hVo4thSLPlDMLPjzyeZqQIgbafkrzGQ=="
}
```

**⚠️ Important: Message-Based Verification with signdata**
```bash
## This will NOT work — signdata v2 signatures include system context in the hash:
./verus -testnet verifysignature '{"address":"ari@", "message":"test123", "signature":"..."}'
## Result: signaturestatus: "invalid"

## Instead, use the "hash" from signdata output as "datahash":
./verus -testnet verifysignature '{"address":"ari@", "datahash":"hash_from_signdata", "signature":"..."}'
## Result: signaturestatus: "verified"
```

**RPC (curl)**
```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"verifysignature","params":[{"address":"ari@","datahash":"ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae","signature":"AgXtJA4AAUEgXgBD28607ExvUtwYN788OyIboWOewNh5VS62b6iLhlM2fE1FFu3T793hVo4thSLPlDMLPjzyeZqQIgbafkrzGQ=="}]}' -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Verify signdata signatures** — the counterpart to `signdata`
- **VDXF-bound verification** — verify signatures bound to specific VDXF data types
- **Cross-system verification** — verify with just the hash when original data isn't available

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| signaturestatus: "invalid" | Hash mismatch or wrong parameters | Use `datahash` from `signdata` output, not the original message |
| Identity not found | Invalid identity | Check name/address |
| Missing signature | No signature provided | Include the `signature` field |

**Related Commands**
- [`signdata`](signdata.md) — Sign data (produces signatures verified by this command)
- [`verifymessage`](verifymessage.md) — Verify simple `signmessage` signatures
- [`verifyhash`](verifyhash.md) — Simple hash verification for `signmessage`/`signfile`

**Notes**
- **Critical:** `signdata` produces v2 signatures that include system context in the hash. Passing the original `message` to `verifysignature` will compute a different hash and return "invalid". Always use the `datahash` (the `hash` field from `signdata` output) for verification.
- Returns rich JSON with `signaturestatus` ("verified" or "invalid") instead of simple true/false
- Includes `height` (current block) and `signatureheight` (block at signing time)
- For simple `signmessage`/`signfile` signatures, use `verifymessage`/`verifyfile`/`verifyhash` instead

**Tested On**
- VRSCTEST block height: 926958
- Verus version: 2000753