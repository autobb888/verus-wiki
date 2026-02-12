---
label: Blockchain
icon: terminal
---


# Blockchain Commands


---

## coinsupply

> **Category:** Blockchain | **Version:** v1.2.x+

Returns coin supply information at a given block height, including transparent, shielded, and total supply.

**Syntax**

```
coinsupply <height>
```

**Parameters**

| Parameter | Type    | Required | Description                                      |
|-----------|---------|----------|--------------------------------------------------|
| height    | integer | No       | Block height to query. Defaults to current height |

**Result**

```json
{
  "result": "success",    // (string) If the request was successful
  "coin": "VRSC",         // (string) The currency symbol of the native coin
  "height": 420,           // (integer) The height of this coin supply data
  "supply": "777.0",      // (float) The transparent coin supply
  "zfunds": "0.777",      // (float) The shielded coin supply (in zaddrs)
  "total": "777.777"      // (float) The total coin supply (supply + zfunds)
}
```

**Examples**

**Basic Usage**

```bash
verus coinsupply
verus coinsupply 420
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "coinsupply", "params": [420]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Check total supply** — verify circulating supply at any block height
- **Audit shielded vs transparent** — compare `supply` vs `zfunds`
- **Historical supply analysis** — query at specific heights to track emission

**Common Errors**

| Error | Cause |
|-------|-------|
| Block height out of range | Height exceeds current chain tip |

> **Note:** Querying `coinsupply` at the current height on a large chain can be slow as it iterates blocks.

**Related Commands**

- [`getblockcount`](#getblockcount) — get current block height
- [`getblockchaininfo`](#getblockchaininfo) — general chain state info

**Notes**

- When called without a height parameter, uses the current chain tip
- The `total` field equals `supply` + `zfunds`
- Can be slow on chains with many blocks as it scans the full UTXO set

**Tested On**

- **VRSCTEST** testnet, block ~926992, Verus v1.2.14-2
- Note: Command caused RPC lock during heavy load testing; help-only documentation

---

## getbestblockhash

> **Category:** Blockchain | **Version:** v1.2.x+

Returns the hash of the best (tip) block in the longest block chain.

**Syntax**

```
getbestblockhash
```

**Parameters**

None.

**Result**

```
"hex"      (string) the block hash hex encoded
```

**Examples**

**Basic Usage**

```bash
verus getbestblockhash
```

**Testnet output:**
```
0000000107058c677dbae2fa57cfde4f2ffc7dd82d157f208bcdd4d33f800741
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbestblockhash", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Check chain tip** — quickly verify what block the node considers the best
- **Monitor sync** — compare with other nodes or explorers
- **Input to getblock** — use returned hash to fetch full block data

**Common Errors**

None typical — this is a simple read-only query.

**Related Commands**

- [`getblockcount`](#getblockcount) — get the height of the best chain
- [`getblock`](#getblock) — get full block details by hash
- [`getblockhash`](#getblockhash) — get hash at a specific height

**Notes**

- Returns the hash of the tip of the chain with the most work (not necessarily most blocks)
- Very fast, no parameters needed

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getblock

> **Category:** Blockchain | **Version:** v1.2.x+

Returns data about a block by hash or height, with configurable verbosity levels.

**Syntax**

```
getblock "hash|height" ( verbosity )
```

**Parameters**

| Parameter   | Type             | Required | Description                                                  |
|-------------|------------------|----------|--------------------------------------------------------------|
| hash\|height | string/numeric  | Yes      | The block hash or block height                               |
| verbosity   | numeric          | No       | 0 = hex data, 1 = JSON object (default), 2 = JSON with tx data |

**Result**

**Verbosity 0**

```
"data"    (string) Serialized, hex-encoded block data
```

**Verbosity 1 (default)**

```json
{
  "hash": "hash",                    // (string) the block hash
  "confirmations": n,                // (numeric) number of confirmations, -1 if not on main chain
  "size": n,                         // (numeric) block size
  "height": n,                       // (numeric) block height
  "version": n,                      // (numeric) block version
  "merkleroot": "xxxx",             // (string) merkle root
  "finalsaplingroot": "xxxx",       // (string) Sapling commitment tree root
  "tx": ["transactionid", ...],     // (array) transaction ids
  "time": ttt,                       // (numeric) block time (epoch)
  "nonce": n,                        // (numeric) the nonce
  "bits": "1d00ffff",               // (string) the bits
  "difficulty": x.xxx,              // (numeric) the difficulty
  "previousblockhash": "hash",      // (string) previous block hash
  "nextblockhash": "hash"           // (string) next block hash
}
```

**Verbosity 2**

Same as verbosity 1, but `tx` contains full transaction objects (as from `getrawtransaction`).

**Examples**

**Basic Usage**

```bash
## By height (verbosity 1, default)
verus getblock 1000
```

**Testnet output (trimmed):**
```json
{
  "hash": "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0",
  "validationtype": "stake",
  "confirmations": 925997,
  "size": 3988,
  "height": 1000,
  "version": 65540,
  "merkleroot": "ee99aaccd5d98bcc5ce537294bb006e8d947b583fc6e2d0b3b3998ae9e4cd7d0",
  "finalsaplingroot": "3e49b5f954aa9d3545bc6c37744661eea48d7c34e3000d82b7f0010c30f4c2fb",
  "tx": [
    "cbd974e07c3ea76af60f2a4eac5135a8a248df701797f4072890f43c496897cc",
    "db63760e392d230939622994599b94066e5a914e2aad327c4d5de4678ad362e1"
  ],
  "time": 1713100429,
  "bits": "1d01681a",
  "difficulty": 179608081.3173367,
  "blocktype": "minted",
  "previousblockhash": "0000000042c11594856f338aac51f5b9199c3fb9a684506f00c53df29338b152",
  "nextblockhash": "00000000f014cd16d8b3746e277e96357910e4544281d7f5517b1d5ccf757830"
}
```

```bash
## By hash
verus getblock "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0"

## Hex-encoded (verbosity 0)
verus getblock 1000 0

## With full transaction data (verbosity 2)
verus getblock 1000 2
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": ["1000"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Block explorer functionality** — retrieve all data about a block
- **Transaction listing** — get all txids in a block (verbosity 1) or full tx data (verbosity 2)
- **Chain analysis** — walk the chain via `previousblockhash`/`nextblockhash`

**Common Errors**

| Error | Cause |
|-------|-------|
| Block not found | Invalid hash or height beyond chain tip |
| Block height out of range | Negative or too-large height value |

**Related Commands**

- [`getblockhash`](#getblockhash) — get hash at a specific height
- [`getblockheader`](#getblockheader) — lighter weight, header only
- [`getbestblockhash`](#getbestblockhash) — get tip block hash

**Notes**

- Accepts both hash strings and numeric heights
- Verbosity 2 can return very large responses for blocks with many transactions
- The `finalsaplingroot` field is Verus/Zcash-specific (Sapling commitment tree)

**Tested On**

- **VRSCTEST** testnet, block ~926992, Verus v1.2.14-2
- Live tested with block 1000 (staked block)

---

## getblockchaininfo

> **Category:** Blockchain | **Version:** v1.2.x+

Returns an object containing various state info regarding block chain processing.

**Syntax**

```
getblockchaininfo
```

**Parameters**

None.

**Result**

```json
{
  "chain": "xxxx",                    // (string) network type (main, test, regtest)
  "name": "xxxx",                     // (string) network name (VRSC, VRSCTEST, PBAASNAME)
  "chainid": "xxxx",                  // (string) blockchain ID (i-address)
  "blocks": 926992,                   // (numeric) blocks processed
  "headers": 926992,                  // (numeric) headers validated
  "bestblockhash": "...",             // (string) best block hash
  "difficulty": 72291476.38,          // (numeric) current difficulty
  "verificationprogress": 0.999,      // (numeric) verification progress [0..1]
  "chainwork": "xxxx",               // (string) total chain work (hex)
  "size_on_disk": 12345678,          // (numeric) estimated block data size on disk
  "commitments": 123456,             // (numeric) number of note commitments in the commitment tree
  "commitments": 123456,             // (numeric) note commitments in commitment tree
  "softforks": [                      // (array) softfork status
    {
      "id": "xxxx",                   // (string) softfork name
      "version": 4,                   // (numeric) block version
      "enforce": {
        "status": true,               // (boolean) threshold reached
        "found": 100,                 // (numeric) blocks with new version found
        "required": 51,               // (numeric) blocks required to trigger
        "window": 100                 // (numeric) window size
      },
      "reject": { }                   // (object) same fields as enforce
    }
  ],
  "upgrades": {                       // (object) network upgrade status
    "xxxxxxxx": {                     // (string) branch ID
      "name": "xxxx",                // (string) upgrade name
      "activationheight": 100,        // (numeric) activation height
      "status": "active",            // (string) upgrade status
      "info": "xxxx"                 // (string) additional info
    }
  },
  "pruned": false,                     // (boolean) if the blocks are subject to pruning
  "valuePools": [                      // (array) shielded pool chain values
    {
      "id": "sprout",                  // (string) pool name
      "chainValue": 0.00000000         // (numeric) total value held in pool
    }
  ],
  "consensus": {                      // (object) consensus branch IDs
    "chaintip": "xxxxxxxx",          // (string) current chain tip branch ID
    "nextblock": "xxxxxxxx"          // (string) next block branch ID
  }
}
```

**Examples**

**Basic Usage**

```bash
verus getblockchaininfo
```

**Testnet output (trimmed):**
```json
{
  "chain": "test",
  "name": "VRSCTEST",
  "chainid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "blocks": 926996,
  "headers": 926996,
  "bestblockhash": "00000003a59f522a082e4c34f921c2e5ef44ebe8db410b1d6484787e271df2a2",
  "difficulty": 53500896.94362766,
  "verificationprogress": 1,
  "chainwork": "00000000000000000000000000000000000000000000000000070a060d324f5b",
  "pruned": false,
  "size_on_disk": 4206361361,
  "valuePools": [
    { "id": "sprout", "chainValue": 0.00000000 },
    { "id": "sapling", "chainValue": 3880.68540983 }
  ],
  "softforks": [
    { "id": "bip34", "version": 2, "enforce": { "status": true } },
    { "id": "bip66", "version": 3, "enforce": { "status": true } },
    { "id": "bip65", "version": 4, "enforce": { "status": true } }
  ],
  "upgrades": {
    "5ba81b19": { "name": "Overwinter", "activationheight": 1, "status": "active" },
    "76b809bb": { "name": "Sapling", "activationheight": 1, "status": "active" }
  },
  "consensus": { "chaintip": "76b809bb", "nextblock": "76b809bb" }
}
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Check sync status** — compare `blocks` vs `headers`, check `verificationprogress`
- **Network identification** — verify `chain`, `name`, `chainid`
- **Upgrade monitoring** — check `upgrades` for activation status
- **Consensus tracking** — monitor `consensus.chaintip` vs `consensus.nextblock`

**Common Errors**

None typical — read-only query.

**Related Commands**

- [`getblockcount`](#getblockcount) — just the block count
- [`getbestblockhash`](#getbestblockhash) — just the tip hash
- [`getdifficulty`](#getdifficulty) — just the difficulty
- [`getchaintips`](#getchaintips) — all chain tips including forks

**Notes**

- When the chain tip is at the last block before a network upgrade activation, `consensus.chaintip != consensus.nextblock`
- The `chainid` is the i-address of the native blockchain currency
- `verificationprogress` is an estimate; 1.0 means fully synced
- PBaaS chain names appear in the `name` field

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getblockcount

> **Category:** Blockchain | **Version:** v1.2.x+

Returns the number of blocks in the best valid block chain.

**Syntax**

```
getblockcount
```

**Parameters**

None.

**Result**

```
n    (numeric) The current block count
```

**Examples**

**Basic Usage**

```bash
verus getblockcount
```

**Testnet output:**
```
926992
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Monitor sync progress** — compare with known chain height
- **Input to other commands** — use as height for `getblockhash`, `coinsupply`, etc.
- **Script automation** — check if node is caught up before running operations

**Common Errors**

None typical.

**Related Commands**

- [`getbestblockhash`](#getbestblockhash) — hash of the tip block
- [`getblockhash`](#getblockhash) — get hash at a specific height
- [`getblockchaininfo`](#getblockchaininfo) — comprehensive chain state

**Notes**

- Returns the height of the tip of the best (most-work) chain
- Very fast, lightweight query

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getblockdeltas

> **Category:** Blockchain | **Version:** v1.2.x+

Returns information about the given block and its transactions, including input/output deltas per transaction.

**Syntax**

```
getblockdeltas "blockhash"
```

**Parameters**

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| blockhash | string | Yes      | The block hash |

**Prerequisites**

⚠️ **This command requires experimental features.** You must restart the daemon with:

```
-experimentalfeatures -insightexplorer
```

Or add to config file:
```
experimentalfeatures=1
insightexplorer=1
```

**Result**

```json
{
  "hash": "hash",              // (string) block ID
  "confirmations": n,          // (numeric) confirmations
  "size": n,                   // (numeric) block size in bytes
  "height": n,                 // (numeric) block height
  "version": n,                // (numeric) block version
  "merkleroot": "hash",       // (string) Merkle root
  "deltas": [
    {
      "txid": "hash",         // (string) transaction ID
      "index": n,              // (numeric) tx offset in block
      "inputs": [
        {
          "address": "taddr", // (string) transparent address
          "satoshis": n,       // (numeric) negative of spend amount
          "index": n,          // (numeric) vin index
          "prevtxid": "hash", // (string) source utxo tx ID
          "prevout": n         // (numeric) source utxo index
        }
      ],
      "outputs": [
        {
          "address": "taddr", // (string) transparent address
          "satoshis": n,       // (numeric) amount
          "index": n           // (numeric) vout index
        }
      ]
    }
  ],
  "time": n,                   // (numeric) block time
  "mediantime": n,             // (numeric) median time of recent blocks
  "nonce": "nonce",           // (string) nonce
  "bits": "1d00ffff",         // (string) bits
  "difficulty": n,             // (numeric) difficulty
  "chainwork": "xxxx",        // (string) total chain work (hex)
  "previousblockhash": "hash",// (string) previous block hash
  "nextblockhash": "hash"     // (string) next block hash
}
```

**Examples**

**Basic Usage**

```bash
verus getblockdeltas "00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b"
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockdeltas", "params": ["00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Block explorer backends** — get per-transaction input/output details
- **Address tracking** — see which addresses were involved in a block
- **Balance auditing** — track satoshi-level flows

**Common Errors**

| Error | Cause |
|-------|-------|
| `getblockdeltas is disabled` | Daemon not started with `-experimentalfeatures -insightexplorer` |
| Block not found | Invalid block hash |

**Related Commands**

- [`getblock`](#getblock) — standard block data (no deltas)
- [`getblockheader`](#getblockheader) — header only

**Notes**

- Requires Insight Explorer experimental feature to be enabled
- Input satoshis are negative values (representing spends)
- Only shows transparent transaction data; shielded data not included in deltas

**Tested On**

- **VRSCTEST** testnet, Verus v1.2.14-2
- Help-only documentation (requires `-insightexplorer` flag)

---

## getblockhash

> **Category:** Blockchain | **Version:** v1.2.x+

Returns hash of block in best-block-chain at the given height.

**Syntax**

```
getblockhash index
```

**Parameters**

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| index     | numeric | Yes      | The block height |

**Result**

```
"hash"    (string) The block hash
```

**Examples**

**Basic Usage**

```bash
verus getblockhash 1000
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhash", "params": [1000]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Get block hash from height** — convert a known height to a hash for use with `getblock`
- **Chain walking** — iterate through blocks by height
- **Verification** — confirm a block at a given height matches expectations

**Common Errors**

| Error | Cause |
|-------|-------|
| Block height out of range | Height exceeds current chain tip or is negative |

**Related Commands**

- [`getblock`](#getblock) — get full block data (also accepts height directly)
- [`getblockcount`](#getblockcount) — get current chain height
- [`getbestblockhash`](#getbestblockhash) — get tip block hash

**Notes**

- Returns the hash for the block on the main (best) chain at the specified height
- Use with `getblock` or `getblockheader` for detailed block info

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getblockhashes

> **Category:** Blockchain | **Version:** v1.2.x+

Returns array of hashes of blocks within a timestamp range.

**Syntax**

```
getblockhashes high low ( options )
```

**Parameters**

| Parameter | Type    | Required | Description                     |
|-----------|---------|----------|---------------------------------|
| high      | numeric | Yes      | The newer block timestamp (unix epoch) |
| low       | numeric | Yes      | The older block timestamp (unix epoch) |
| options   | object  | No       | JSON options object             |

**Options Object**

| Field        | Type    | Description                                  |
|--------------|---------|----------------------------------------------|
| noOrphans    | boolean | Only include blocks on the main chain        |
| logicalTimes | boolean | Include logical timestamps with hashes       |

**Result**

Without `logicalTimes`:
```json
["hash", "hash", ...]
```

With `logicalTimes`:
```json
[
  {
    "blockhash": "hash",
    "logicalts": 12345
  }
]
```

**Examples**

**Basic Usage**

```bash
verus getblockhashes 1231614698 1231024505
```

**With Options**

```bash
verus getblockhashes 1231614698 1231024505 '{"noOrphans":false, "logicalTimes":true}'
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhashes", "params": [1231614698, 1231024505]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Time-based block queries** — find blocks within a specific time window
- **Historical analysis** — locate blocks around a particular event
- **Explorer backends** — support time-based block browsing

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid timestamps | `high` must be greater than `low` |
| No blocks found | No blocks exist in the given time range |

**Related Commands**

- [`getblockhash`](#getblockhash) — get hash by height (not time)
- [`getblock`](#getblock) — get full block data from hash

**Notes**

- Timestamps are Unix epoch seconds
- The `high` parameter is the more recent timestamp, `low` is the older one
- Large time ranges may return many results

**Tested On**

- **VRSCTEST** testnet, Verus v1.2.14-2
- Help-only documentation

---

## getblockheader

> **Category:** Blockchain | **Version:** v1.2.x+

Returns data about a block header by hash. Lighter weight than `getblock`.

**Syntax**

```
getblockheader "hash" ( verbose )
```

**Parameters**

| Parameter | Type    | Required | Description                                        |
|-----------|---------|----------|----------------------------------------------------|
| hash      | string  | Yes      | The block hash                                     |
| verbose   | boolean | No       | true for JSON object (default), false for hex data |

**Result (verbose = true)**

```json
{
  "hash": "hash",                    // (string) the block hash
  "confirmations": n,                // (numeric) confirmations, -1 if not on main chain
  "height": n,                       // (numeric) block height
  "version": n,                      // (numeric) block version
  "merkleroot": "xxxx",             // (string) merkle root
  "finalsaplingroot": "xxxx",       // (string) Sapling commitment tree root
  "time": ttt,                       // (numeric) block time (epoch seconds)
  "nonce": n,                        // (numeric) nonce
  "bits": "1d00ffff",               // (string) bits
  "difficulty": x.xxx,              // (numeric) difficulty
  "previousblockhash": "hash",      // (string) previous block hash
  "nextblockhash": "hash"           // (string) next block hash
}
```

**Result (verbose = false)**

```
"data"    (string) Serialized, hex-encoded header data
```

**Examples**

**Basic Usage**

```bash
verus getblockheader "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0"
```

**Testnet output (trimmed):**
```json
{
  "hash": "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0",
  "validationtype": "stake",
  "confirmations": 925997,
  "height": 1000,
  "version": 65540,
  "merkleroot": "ee99aaccd5d98bcc5ce537294bb006e8d947b583fc6e2d0b3b3998ae9e4cd7d0",
  "finalsaplingroot": "3e49b5f954aa9d3545bc6c37744661eea48d7c34e3000d82b7f0010c30f4c2fb",
  "time": 1713100429,
  "bits": "1d01681a",
  "difficulty": 179608081.3173367,
  "previousblockhash": "0000000042c11594856f338aac51f5b9199c3fb9a684506f00c53df29338b152",
  "nextblockhash": "00000000f014cd16d8b3746e277e96357910e4544281d7f5517b1d5ccf757830"
}
```

**Hex Output**

```bash
verus getblockheader "0000000107058c677dbae2fa57cfde4f2ffc7dd82d157f208bcdd4d33f800741" false
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockheader", "params": ["0000000107058c677dbae2fa57cfde4f2ffc7dd82d157f208bcdd4d33f800741"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Quick block info** — header data without full transaction list
- **Difficulty tracking** — monitor difficulty changes across blocks
- **Chain navigation** — walk the chain via `previousblockhash`/`nextblockhash`

**Common Errors**

| Error | Cause |
|-------|-------|
| Block not found | Invalid block hash |

**Related Commands**

- [`getblock`](#getblock) — full block data including transactions
- [`getblockhash`](#getblockhash) — get hash from height

**Notes**

- Much lighter than `getblock` — no transaction data included
- Unlike `getblock`, only accepts hash (not height) as input
- `finalsaplingroot` is the Sapling note commitment tree root after this block

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getchaintips

> **Category:** Blockchain | **Version:** v1.2.x+

Returns information about all known tips in the block tree, including the main chain and orphaned branches.

**Syntax**

```
getchaintips
```

**Parameters**

None.

**Result**

```json
[
  {
    "height": 926992,          // (numeric) height of the chain tip
    "hash": "xxxx",            // (string) block hash of the tip
    "branchlen": 0,            // (numeric) 0 for main chain
    "status": "active"         // (string) tip status
  },
  {
    "height": 926900,
    "hash": "xxxx",
    "branchlen": 1,            // (numeric) branch length to main chain
    "status": "valid-fork"     // (string) tip status
  }
]
```

**Status Values**

| Status | Description |
|--------|-------------|
| `active` | Tip of the active main chain |
| `valid-fork` | Fully validated branch, not active |
| `valid-headers` | All blocks available, never fully validated |
| `headers-only` | Not all blocks available, headers valid |
| `invalid` | Branch contains at least one invalid block |

**Examples**

**Basic Usage**

```bash
verus getchaintips
```

**Testnet output (trimmed):**
```json
[
  {
    "height": 926996,
    "hash": "00000003a59f522a082e4c34f921c2e5ef44ebe8db410b1d6484787e271df2a2",
    "branchlen": 0,
    "status": "active"
  },
  {
    "height": 926989,
    "hash": "6bd5bca95c134bbd8c021f5eb07c08dcb9ec21cf0f15ca675c4edfdaa371ff31",
    "branchlen": 1,
    "status": "valid-fork"
  },
  {
    "height": 926962,
    "hash": "000000027c1dc37b3f085c564ae1e58e7e72840cda64171b17abecec40020d6e",
    "branchlen": 1,
    "status": "headers-only"
  }
]
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintips", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Fork detection** — identify competing chain branches
- **Network health** — monitor for invalid forks or stale tips
- **Debugging** — understand chain reorganizations

**Common Errors**

None typical.

**Related Commands**

- [`getblockchaininfo`](#getblockchaininfo) — general chain state
- [`getbestblockhash`](#getbestblockhash) — tip of active chain only

**Notes**

- The active tip always has `branchlen: 0` and `status: "active"`
- Multiple tips indicate forks have been seen by the node
- `valid-fork` branches were fully validated but have less work than the active chain

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getchaintxstats

> **Category:** Blockchain | **Version:** v1.2.x+

Computes statistics about the total number and rate of transactions in the chain.

**Syntax**

```
getchaintxstats ( nblocks blockhash )
```

**Parameters**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| nblocks   | numeric | No       | Number of blocks in averaging window         |
| blockhash | string  | No       | Hash of the block which ends the window      |

**Result**

```json
{
  "time": 1770449655,                        // (numeric) timestamp of final block (epoch)
  "txcount": 1234567,                        // (numeric) total transactions in chain
  "window_final_block_hash": "...",          // (string) hash of final block in window
  "window_block_count": 2016,                // (numeric) window size in blocks
  "window_tx_count": 5000,                   // (numeric) transactions in window
  "window_interval": 120000,                 // (numeric) elapsed time in window (seconds)
  "txrate": 0.042                            // (numeric) average tx/second in window
}
```

**Examples**

**Basic Usage**

```bash
verus getchaintxstats
```

**Testnet output:**
```json
{
  "time": 1770450217,
  "txcount": 2275130,
  "window_final_block_hash": "00000003a59f522a082e4c34f921c2e5ef44ebe8db410b1d6484787e271df2a2",
  "window_block_count": 43200,
  "window_tx_count": 99691,
  "window_interval": 2674964,
  "txrate": 0.03726816510427804
}
```

```bash
verus getchaintxstats 2016
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintxstats", "params": [2016]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Network activity monitoring** — track transaction throughput over time
- **Performance analysis** — measure tx rate across different windows
- **Dashboard metrics** — feed into monitoring/alerting systems

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid block hash | Specified blockhash not found |
| Block count out of range | nblocks larger than chain height |

**Related Commands**

- [`getblockchaininfo`](#getblockchaininfo) — general chain state
- [`getmempoolinfo`](#getmempoolinfo) — pending transaction stats

**Notes**

- `window_tx_count`, `window_interval`, and `txrate` only returned when `window_block_count > 0`
- Default window size depends on implementation; specify `nblocks` for consistent results

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getdifficulty

> **Category:** Blockchain | **Version:** v1.2.x+

Returns the proof-of-work difficulty as a multiple of the minimum difficulty.

**Syntax**

```
getdifficulty
```

**Parameters**

None.

**Result**

```
n.nnn    (numeric) the proof-of-work difficulty
```

**Examples**

**Basic Usage**

```bash
verus getdifficulty
```

**Testnet output:**
```
53500896.94362766
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getdifficulty", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Mining monitoring** — track difficulty changes
- **Hash rate estimation** — derive approximate network hash rate
- **Dashboard metrics** — display current mining difficulty

**Common Errors**

None typical.

**Related Commands**

- [`getblockchaininfo`](#getblockchaininfo) — includes difficulty plus more
- [`getblock`](#getblock) — per-block difficulty

**Notes**

- Value is relative to the minimum difficulty (difficulty 1)
- Changes based on Verus's difficulty adjustment algorithm
- Verus uses VerusHash 2.0 for proof-of-work

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getmempoolinfo

> **Category:** Blockchain | **Version:** v1.2.x+

Returns details on the active state of the TX memory pool.

**Syntax**

```
getmempoolinfo
```

**Parameters**

None.

**Result**

```json
{
  "size": 5,          // (numeric) Current tx count
  "bytes": 1234,      // (numeric) Sum of all tx sizes
  "usage": 5678       // (numeric) Total memory usage for the mempool
}
```

**Examples**

**Basic Usage**

```bash
verus getmempoolinfo
```

**Testnet output:**
```json
{
  "size": 0,
  "bytes": 0,
  "usage": 0
}
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmempoolinfo", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Mempool monitoring** — check if transactions are pending
- **Network congestion** — assess mempool size/usage
- **Node health** — verify mempool is functioning normally

**Common Errors**

None typical.

**Related Commands**

- [`getrawmempool`](#getrawmempool) — list actual transactions in mempool
- [`clearrawmempool`](multichain.md#clearrawmempool) — clear the mempool

**Notes**

- `size` is the number of transactions, not bytes
- `bytes` is the total serialized size of all transactions
- `usage` reflects actual memory consumed (may differ from `bytes` due to overhead)

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getrawmempool

> **Category:** Blockchain | **Version:** v1.2.x+

Returns all transaction ids in the memory pool as a JSON array, with optional verbose details.

**Syntax**

```
getrawmempool ( verbose ) '{"include":[],"exclude":[]}'
```

**Parameters**

| Parameter  | Type    | Required | Description                                           |
|------------|---------|----------|-------------------------------------------------------|
| verbose    | boolean | No       | true for detailed JSON, false for txid array (default) |
| qualifiers | object  | No       | Filter by transaction type: `{"include":["type",...],"exclude":["type",...]}` |

**Result (verbose = false)**

```json
["txid1", "txid2", ...]
```

**Result (verbose = true)**

```json
{
  "txid": {
    "size": 250,                // (numeric) transaction size in bytes
    "fee": 0.0001,              // (numeric) transaction fee in VRSC
    "time": 1770449655,         // (numeric) time entered pool (epoch)
    "height": 926990,           // (numeric) block height when entered pool
    "startingpriority": 1000,   // (numeric) priority when entered pool
    "currentpriority": 1000,    // (numeric) current priority
    "depends": ["txid", ...]    // (array) unconfirmed parent txids
  }
}
```

**Examples**

**Basic Usage**

```bash
verus getrawmempool
verus getrawmempool true
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawmempool", "params": [true]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Monitor pending transactions** — see what's waiting to be mined
- **Fee analysis** — check fees of pending transactions
- **Dependency tracking** — identify chains of unconfirmed transactions

**Common Errors**

None typical.

**Related Commands**

- [`getmempoolinfo`](#getmempoolinfo) — summary stats about mempool
- [`clearrawmempool`](multichain.md#clearrawmempool) — clear the mempool

**Notes**

- The `qualifiers` parameter allows filtering by transaction type with `include`/`exclude` arrays
- `depends` shows unconfirmed transactions that this tx relies on
- Empty array `[]` when mempool has no pending transactions

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## getspentinfo

> **Category:** Blockchain | **Version:** v1.2.x+

Returns the txid and index where a specific transaction output was spent.

**Syntax**

```
getspentinfo {"txid":"hex","index":n}
```

**Parameters**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| txid      | string | Yes      | The transaction id (hex)       |
| index     | number | Yes      | The output index (vout number) |

Passed as a single JSON object argument.

**Result**

```json
{
  "txid": "hash",    // (string) The spending transaction id
  "index": n         // (number) The spending input index
}
```

**Examples**

**Basic Usage**

```bash
verus getspentinfo '{"txid": "0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9", "index": 0}'
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getspentinfo", "params": [{"txid": "0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9", "index": 0}]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **UTXO tracking** — determine if and where an output was spent
- **Transaction tracing** — follow the flow of funds
- **Wallet debugging** — verify spend status of specific outputs

**Common Errors**

| Error | Cause |
|-------|-------|
| Unable to get spent info | Output is unspent or txid not found |

**Related Commands**

- [`gettxout`](#gettxout) — get details of an unspent output
- [`gettxoutproof`](#gettxoutproof) — prove a tx was included in a block

**Notes**

- Only works for spent outputs; use `gettxout` for unspent outputs
- May require `-txindex` or `-spentindex` for full coverage
- The input is a JSON object, not separate parameters

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Help-only documentation

---

## gettxout

> **Category:** Blockchain | **Version:** v1.2.x+

Returns details about an unspent transaction output (UTXO).

**Syntax**

```
gettxout "txid" n ( includemempool )
```

**Parameters**

| Parameter      | Type    | Required | Description                          |
|----------------|---------|----------|--------------------------------------|
| txid           | string  | Yes      | The transaction id                   |
| n              | numeric | Yes      | The vout index                       |
| includemempool | boolean | No       | Whether to include the mempool       |

**Result**

```json
{
  "bestblock": "hash",        // (string) the block hash
  "confirmations": n,          // (numeric) number of confirmations
  "value": 10.0,               // (numeric) transaction value in VRSC
  "scriptPubKey": {
    "asm": "code",             // (string) script assembly
    "hex": "hex",              // (string) script hex
    "reqSigs": 1,              // (numeric) required signatures
    "type": "pubkeyhash",      // (string) script type
    "addresses": [             // (array) Verus addresses
      "RAddress..."
    ]
  },
  "version": n,                // (numeric) tx version
  "coinbase": false            // (boolean) whether this is a coinbase output
}
```

Returns `null` if the output is already spent.

**Examples**

**Basic Usage**

```bash
verus gettxout "txid" 1
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxout", "params": ["txid", 1]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **UTXO verification** — check if a specific output is still unspent
- **Balance checking** — verify output value and ownership
- **Coinbase detection** — check if output is from mining/staking reward

**Common Errors**

| Error | Cause |
|-------|-------|
| Returns `null` | Output is already spent or txid not found |

**Related Commands**

- [`getspentinfo`](#getspentinfo) — find where an output was spent
- [`gettxoutsetinfo`](#gettxoutsetinfo) — aggregate UTXO set statistics
- [`gettxoutproof`](#gettxoutproof) — prove inclusion in a block

**Notes**

- Returns `null` (not an error) if the output has been spent
- `includemempool` defaults to checking the UTXO set only; set `true` to also check mempool
- Useful for wallet implementations to verify UTXO availability

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## gettxoutproof

> **Category:** Blockchain | **Version:** v1.2.x+

Returns a hex-encoded proof that a transaction was included in a block.

**Syntax**

```
gettxoutproof ["txid",...] ( blockhash )
```

**Parameters**

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| txids     | array  | Yes      | JSON array of txids to create proof for        |
| blockhash | string | No       | If specified, looks for txid in this block     |

**Result**

```
"data"    (string) Serialized, hex-encoded Merkle proof data
```

**Examples**

**Basic Usage**

```bash
verus gettxoutproof '["txid1"]'
verus gettxoutproof '["txid1"]' "blockhash"
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxoutproof", "params": [["txid1"]]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **SPV verification** — prove transaction inclusion without full block data
- **Cross-chain proofs** — provide evidence of a transaction to another system
- **Audit trails** — cryptographic proof that a tx exists in a specific block

**Common Errors**

| Error | Cause |
|-------|-------|
| Transaction not yet in block | Tx is in mempool but not confirmed |
| Not all transactions found | Tx not in UTXO set and no blockhash specified |

**Related Commands**

- [`verifytxoutproof`](#verifytxoutproof) — verify a proof created by this command
- [`gettxout`](#gettxout) — check if output is unspent

**Notes**

- By default only works when the transaction has an unspent output in the UTXO set
- For spent transactions, you must either use `-txindex` or specify the `blockhash` manually
- The proof is a Merkle branch proving inclusion in the block's Merkle tree
- Verify proofs with `verifytxoutproof`

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Help-only documentation

---

## gettxoutsetinfo

> **Category:** Blockchain | **Version:** v1.2.x+

Returns statistics about the unspent transaction output (UTXO) set.

**Syntax**

```
gettxoutsetinfo
```

**Parameters**

None.

**Result**

```json
{
  "height": 926992,                    // (numeric) current block height
  "bestblock": "hex",                  // (string) best block hash
  "transactions": 500000,             // (numeric) number of transactions with UTXOs
  "txouts": 750000,                   // (numeric) number of unspent outputs
  "bytes_serialized": 12345678,       // (numeric) serialized size
  "hash_serialized": "hash",          // (string) serialized hash
  "total_amount": 55000000.00         // (numeric) total amount in UTXO set
}
```

**Examples**

**Basic Usage**

```bash
verus gettxoutsetinfo
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxoutsetinfo", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **UTXO set audit** — get aggregate statistics about all unspent outputs
- **Supply verification** — `total_amount` shows total coins in transparent UTXOs
- **Database health** — check UTXO database size and consistency

**Common Errors**

None typical, but note this call may take significant time on large chains.

**Related Commands**

- [`gettxout`](#gettxout) — get a specific UTXO
- [`coinsupply`](#coinsupply) — coin supply including shielded funds

**Notes**

- ⚠️ **This call may take some time** — it scans the entire UTXO set
- `total_amount` only includes transparent outputs (not shielded)
- Use `coinsupply` for a complete picture including shielded funds

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Help-only documentation (can be slow on large chains)

---

## minerids

> **Category:** Blockchain | **Version:** v1.2.x+

Returns miner IDs for a given block height.

**Syntax**

```
minerids height
```

**Parameters**

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| height    | numeric | Yes      | The block height |

**Result**

Returns information about miners/stakers at the specified height.

**Examples**

**Basic Usage**

```bash
verus minerids 926996
```

**Testnet output (trimmed):**
```json
{
  "mined": [
    {
      "notaryid": 0,
      "KMDaddress": "RJdoxr1CeY2wXobq59VJbMrBMcsm7ZxuB1",
      "pubkey": "0237e0d3268cebfa235958808db1efc20cc43b31100813b1f3e15cc5aa647ad2c3",
      "blocks": 0
    },
    ...
    {
      "pubkey": "external miners",
      "blocks": 2000
    }
  ],
  "numnotaries": 64
}
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "minerids", "params": [926992]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Mining analysis** — identify who mined a specific block
- **Network decentralization** — track miner distribution
- **Staking verification** — check staker identity at a height

**Common Errors**

| Error | Cause |
|-------|-------|
| `minerids needs height` | Height parameter not provided |
| Block height out of range | Height exceeds chain tip |

**Related Commands**

- [`notaries`](#notaries) — notary information at a height
- [`getblock`](#getblock) — full block data

**Notes**

- Height parameter is required (not optional)
- Related to Komodo/Verus notarization infrastructure

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Live tested with height 926996

---

## notaries

> **Category:** Blockchain | **Version:** v1.2.x+

Returns notary information for a given block height and timestamp.

**Syntax**

```
notaries height timestamp
```

**Parameters**

| Parameter | Type    | Required | Description              |
|-----------|---------|----------|--------------------------|
| height    | numeric | Yes      | The block height         |
| timestamp | numeric | Yes      | The block timestamp (epoch) |

**Result**

Returns information about notaries active at the specified height and timestamp.

**Examples**

**Basic Usage**

```bash
verus notaries 926996 1770450217
```

**Testnet output (trimmed):**
```json
{
  "notaries": [
    {
      "pubkey": "0237e0d3268cebfa235958808db1efc20cc43b31100813b1f3e15cc5aa647ad2c3",
      "BTCaddress": "1AMctL7v3iENToEdbyWBVqWybMRASwSH4C",
      "KMDaddress": "RJdoxr1CeY2wXobq59VJbMrBMcsm7ZxuB1"
    },
    ... // 64 notary entries total
  ],
  "numnotaries": 64,
  "height": 926996,
  "timestamp": 1770450217
}
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "notaries", "params": [926992, 1770449655]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Notarization tracking** — identify active notary nodes
- **Network governance** — monitor notary participation
- **Cross-chain verification** — check notarization status

**Common Errors**

| Error | Cause |
|-------|-------|
| Missing parameters | Both height and timestamp are required |

**Related Commands**

- [`minerids`](#minerids) — miner identity at a height
- [`getblock`](#getblock) — block data including timestamp

**Notes**

- Both parameters (height and timestamp) are required
- Related to the Komodo notarization system inherited by Verus
- Notaries are responsible for cross-chain security via notarization transactions

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Live tested with height 926996

---

## processupgradedata

> **Category:** Blockchain | **Version:** v1.2.x+

Processes upgrade data for network upgrades. Used internally for managing protocol upgrades.

**Syntax**

```
processupgradedata {upgradedata}
```

**Parameters**

| Parameter              | Type   | Required | Description                                  |
|------------------------|--------|----------|----------------------------------------------|
| upgradeid              | string | Yes      | The VDXF key identifier                     |
| minimumdaemonversion   | string | Yes      | Minimum daemon version required for upgrade   |
| activationheight       | number | Yes      | Block height to activate the upgrade          |
| activationtime         | number | Yes      | Epoch time to activate (upgrade-dependent)    |

Passed as a single JSON object.

**Result**

```json
{
  "txid": "hash",    // (string) The transaction id
  "index": n         // (number) The spending input index
}
```

**Examples**

**Basic Usage**

```bash
verus processupgradedata '{"upgradeid": "vdxf-key", "minimumdaemonversion": "1.2.0", "activationheight": 100000, "activationtime": 1700000000}'
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "processupgradedata", "params": [{"upgradeid": "vdxf-key", "minimumdaemonversion": "1.2.0", "activationheight": 100000, "activationtime": 1700000000}]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Network upgrades** — process and validate upgrade definitions
- **Protocol management** — handle consensus rule changes

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid upgrade data | Malformed JSON or missing required fields |

**Related Commands**

- [`getblockchaininfo`](#getblockchaininfo) — shows active upgrades and consensus info

**Notes**

- ⚠️ **Advanced/internal command** — used for protocol upgrade management
- Uses VDXF (Verus Data eXchange Format) key identifiers
- Do not use in production without understanding the upgrade process
- The `activationtime` behavior depends on the specific upgrade type

**Tested On**

- **VRSCTEST** testnet, Verus v1.2.14-2
- **Help-only documentation** — not safe to test without valid upgrade data

---

## verifychain

> **Category:** Blockchain | **Version:** v1.2.x+

Verifies the blockchain database integrity.

**Syntax**

```
verifychain ( checklevel numblocks )
```

**Parameters**

| Parameter  | Type    | Required | Description                                    |
|------------|---------|----------|------------------------------------------------|
| checklevel | numeric | No       | Verification thoroughness, 0-4 (default: 3)   |
| numblocks  | numeric | No       | Number of blocks to check (default: 288, 0=all) |

**Result**

```
true|false    (boolean) Whether verification passed
```

**Examples**

**Basic Usage**

```bash
verus verifychain
```

**Testnet output:**
```
true
```

```bash
verus verifychain 4 100
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifychain", "params": []}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Database integrity** — verify blockchain data hasn't been corrupted
- **Post-crash recovery** — check chain validity after unexpected shutdown
- **Routine maintenance** — periodic health checks

**Common Errors**

| Error | Cause |
|-------|-------|
| Returns `false` | Chain verification failed — data corruption detected |

**Related Commands**

- [`getblockchaininfo`](#getblockchaininfo) — general chain state
- [`gettxoutsetinfo`](#gettxoutsetinfo) — UTXO set statistics

**Notes**

- Higher `checklevel` values are more thorough but slower
- Default checks the last 288 blocks (~1 day at 1 min blocks)
- Set `numblocks` to 0 to verify the entire chain (very slow)
- Level 0: Read blocks from disk
- Level 1: Verify block validity
- Level 2: Verify undo data
- Level 3: Check disconnection of tip blocks (default)
- Level 4: Try reconnecting blocks

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2

---

## verifytxoutproof

> **Category:** Blockchain | **Version:** v1.2.x+

Verifies that a proof points to a transaction in a block, returning the transaction it commits to.

**Syntax**

```
verifytxoutproof "proof"
```

**Parameters**

| Parameter | Type   | Required | Description                                        |
|-----------|--------|----------|----------------------------------------------------|
| proof     | string | Yes      | The hex-encoded proof generated by `gettxoutproof` |

**Result**

```json
["txid"]    // (array of strings) The txid(s) the proof commits to, or empty array if invalid
```

**Examples**

**Basic Usage**

```bash
verus verifytxoutproof "hexproofdata..."
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifytxoutproof", "params": ["hexproofdata..."]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **SPV verification** — verify Merkle proofs from `gettxoutproof`
- **Cross-chain validation** — confirm transaction inclusion on another system
- **Audit verification** — validate proof artifacts

**Common Errors**

| Error | Cause |
|-------|-------|
| Empty array returned | Proof is invalid |
| RPC error | Block referenced by proof is not in the best chain |

**Related Commands**

- [`gettxoutproof`](#gettxoutproof) — generate the proof this command verifies

**Notes**

- Throws an RPC error if the block referenced is not in the node's best chain
- Returns an empty array (not an error) for invalid proofs
- The proof is a Merkle branch encoded in hex

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Help-only documentation

---

## z_gettreestate

> **Category:** Blockchain | **Version:** v1.2.x+

Returns information about the given block's Sprout and Sapling commitment tree state.

**Syntax**

```
z_gettreestate "hash|height"
```

**Parameters**

| Parameter   | Type   | Required | Description                                                      |
|-------------|--------|----------|------------------------------------------------------------------|
| hash\|height | string | Yes      | Block hash or height. Height can be negative (-1 = last valid block) |

**Result**

```json
{
  "hash": "hash",             // (string) hex block hash
  "height": 1000,             // (numeric) block height
  "sprout": {
    "skipHash": "hash",       // (string) hash of most recent block with more info
    "commitments": {
      "finalRoot": "hex",     // (string) Sprout commitment tree root
      "finalState": "hex"     // (string) Sprout commitment tree state
    }
  },
  "sapling": {
    "skipHash": "hash",       // (string) hash of most recent block with more info
    "commitments": {
      "finalRoot": "hex",     // (string) Sapling commitment tree root
      "finalState": "hex"     // (string) Sapling commitment tree state
    }
  }
}
```

**Examples**

**Basic Usage**

```bash
verus z_gettreestate 1000
```

**Testnet output:**
```json
{
  "hash": "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0",
  "height": 1000,
  "time": 1713100429,
  "sprout": {
    "commitments": {
      "finalRoot": "59d2cde5e65c1414c32ba54f0fe4bdb3d67618125286e6a191317917c812c6d7",
      "finalState": "000000"
    }
  },
  "sapling": {
    "commitments": {
      "finalRoot": "3e49b5f954aa9d3545bc6c37744661eea48d7c34e3000d82b7f0010c30f4c2fb",
      "finalState": "000000"
    }
  }
}
```

```bash
## By hash
verus z_gettreestate "a35c8b82c49e55117328385515dc68b5468306ba11997bea89b7069e267b7ab0"

## Latest block
verus z_gettreestate -1
```

**RPC (curl)**

```bash
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_gettreestate", "params": ["12800"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Common Use Cases**

- **Shielded transaction verification** — check commitment tree roots
- **Wallet sync** — obtain tree state for scanning shielded notes
- **Chain state debugging** — verify Sprout/Sapling commitment trees

**Common Errors**

| Error | Cause |
|-------|-------|
| Block not found | Invalid hash or height beyond chain tip |

**Related Commands**

- [`getblock`](#getblock) — includes `finalsaplingroot` in output
- [`getblockheader`](#getblockheader) — also includes `finalsaplingroot`

**Notes**

- Supports negative heights: `-1` is the last known valid block
- The `skipHash` field points to the most recent block with commitment tree changes
- Both Sprout and Sapling tree states are included
- Essential for light wallet implementations and shielded transaction scanning

**Tested On**

- **VRSCTEST** testnet, block 926992, Verus v1.2.14-2
- Live tested with height 1000