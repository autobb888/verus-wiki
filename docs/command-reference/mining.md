---
label: Mining
icon: terminal
---


# Mining Commands


---

## getblocksubsidy

> **Category:** Mining | **Version:** v1.2.14+

Returns block subsidy reward for a given block height, accounting for mining slow start and founders reward.

**Syntax**
```bash
verus getblocksubsidy [height]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| height | numeric | No | The block height. Defaults to current chain height if omitted. |

**Result**
```json
{
  "miner": x.xxx    // (numeric) The mining reward amount
}
```

**Examples**

**Basic Usage**
```bash
## Current block reward
./verus -testnet getblocksubsidy

## Actual Output (tested on VRSCTEST)
{
  "miner": 6.00000000
}
```

**Specific Height**
```bash
./verus -testnet getblocksubsidy 1000

## Actual Output (tested on VRSCTEST)
{
  "miner": 6.00000000
}
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getblocksubsidy","params":[1000]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Check current block reward for profitability calculations
- Verify reward schedule at different block heights
- Monitor halving/reduction schedule

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Block height out of range | Height exceeds current chain height significantly | Use a valid block height |

**Related Commands**
- [`getmininginfo`](getmininginfo.md) — comprehensive mining status
- [`getblocktemplate`](getblocktemplate.md) — get data for constructing blocks

**Notes**
- VRSCTEST block reward is 6 VRSCTEST per block
- The help text references "KMD" in the result description — this is inherited from the Komodo codebase; the actual currency is VRSC/VRSCTEST

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getblocktemplate

> **Category:** Mining | **Version:** v1.2.14+

Returns data needed to construct a block to work on. Supports BIP 0022 template and proposal modes.

**Syntax**
```bash
verus getblocktemplate ["jsonrequestobject"]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| jsonrequestobject | string (JSON) | No | Request object with optional `mode`, `miningdistribution`, and `capabilities` fields |

**Request Object Structure**
```json
{
  "mode": "template",
  "miningdistribution": {
    "recipientaddress": relativeweight,
    ...
  },
  "capabilities": ["longpoll", "coinbasetxn", "coinbasevalue", "proposal", "serverlist", "workid"]
}
```

**Result**
```json
{
  "version": n,                        // (numeric) Block version
  "previousblockhash": "xxxx",         // (string) Hash of current highest block
  "finalsaplingroothash": "xxxx",      // (string) Final sapling root hash
  "transactions": [],                  // (array) Non-coinbase transactions to include
  "coinbasetxn": { ... },              // (object) Coinbase transaction info
  "target": "xxxx",                    // (string) Hash target
  "mintime": xxx,                      // (numeric) Min timestamp for next block (epoch seconds)
  "mutable": ["time", "transactions", "prevblock"],
  "noncerange": "00000000ffffffff",
  "sigoplimit": n,                     // (numeric) Sigop limit
  "sizelimit": n,                      // (numeric) Block size limit
  "curtime": ttt,                      // (numeric) Current timestamp (epoch seconds)
  "bits": "xxx",                       // (string) Compressed target
  "height": n                          // (numeric) Next block height
}
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getblocktemplate

## Actual Output (tested on VRSCTEST, truncated)
{
  "capabilities": ["proposal"],
  "version": 65540,
  "previousblockhash": "31e25bb6f23bf71424b2c39142329d8dc2985ecdc28ca05247a734bf6e2b2a39",
  "finalsaplingroothash": "1486454686b458641e8cd2465320bf3693926007ba7c4a6497b51d5a1c4723bd",
  "transactions": [],
  "coinbasetxn": {
    "data": "0400008085202f8901...",
    "hash": "1c82e90c9b8871cecc416d6a330b681c354100ea9fcd183a392e50c68189cd76",
    "depends": [],
    "fee": 0,
    "sigops": 1,
    "coinbasevalue": 600000000,
    "required": true
  },
  "target": "00000004792b0000000000000000000000000000000000000000000000000000",
  "mintime": 1770447385,
  "mutable": ["time", "transactions", "prevblock"],
  "noncerange": "00000000ffffffff",
  "sigoplimit": 60000,
  "sizelimit": 2000000,
  "curtime": 1770448016,
  "bits": "1d04792b",
  "height": 926962
}
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getblocktemplate","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Building custom mining software
- Pool software block construction
- Submitting block proposals for validation

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Node is not connected | No peers connected | Ensure node is synced and has peer connections |
| Node is downloading blocks | Blockchain not fully synced | Wait for sync to complete |

**Related Commands**
- [`submitblock`](submitblock.md) — submit a constructed block
- [`submitmergedblock`](submitmergedblock.md) — submit a merged-mined block
- [`getblocksubsidy`](getblocksubsidy.md) — check block reward
- [`getmininginfo`](getmininginfo.md) — current mining status

**Notes**
- The `coinbasevalue` is in satoshis (600000000 = 6.0 VRSCTEST)
- The `miningdistribution` parameter allows splitting coinbase reward across multiple addresses
- See [BIP 0022](https://en.bitcoin.it/wiki/BIP_0022) for full specification
- The `solution` field in the response contains the Equihash solution template

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getlocalsolps

> **Category:** Mining | **Version:** v1.2.14+

Returns the average local solutions per second since this node was started. Same info shown on the metrics screen.

**Syntax**
```bash
verus getlocalsolps
```

**Parameters**
None.

**Result**
```
xxx.xxxxx     (numeric) Solutions per second average
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getlocalsolps

## Actual Output (tested on VRSCTEST)
0
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getlocalsolps","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Monitor local mining performance
- Verify mining hardware is working
- Compare local rate to network rate

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Returns 0 | Mining/staking not active | Enable with `setgenerate true` |

**Related Commands**
- [`getnetworksolps`](getnetworksolps.md) — network-wide solution rate
- [`getmininginfo`](getmininginfo.md) — comprehensive mining status
- [`setgenerate`](../generating/setgenerate.md) — enable/disable mining

**Notes**
- Returns 0 when mining is not active
- This is a local metric only — it reflects this node's hashrate, not the network

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getminingdistribution

> **Category:** Mining | **Version:** v1.2.14+

Retrieves the current mining reward distribution configuration.

**Syntax**
```bash
verus getminingdistribution
```

**Parameters**
None.

**Result**
Returns `null` if not set. If set:
```json
{
  "uniquedestination1": value,    // (string: number) destination address and relative weight
  "uniquedestination2": value,
  ...
}
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getminingdistribution

## Actual Output (tested on VRSCTEST) — no distribution set
(empty/null response)
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getminingdistribution","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Check current reward split before mining
- Verify distribution was set correctly after using `setminingdistribution`
- Audit mining reward destinations

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty/null result | No distribution configured | Use `setminingdistribution` to configure |

**Related Commands**
- [`setminingdistribution`](setminingdistribution.md) — set the mining reward distribution
- [`getblocktemplate`](getblocktemplate.md) — also accepts `miningdistribution` parameter
- [`getmininginfo`](getmininginfo.md) — general mining status

**Notes**
- When no distribution is set, all rewards go to the default mining address
- The values are relative weights, not absolute amounts (e.g., `{"addr1": 0.5, "addr2": 0.5}` splits 50/50)

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getmininginfo

> **Category:** Mining | **Version:** v1.2.14+

Returns a JSON object containing mining-related information including block count, difficulty, staking supply, and generation status.

**Syntax**
```bash
verus getmininginfo
```

**Parameters**
None.

**Result**
```json
{
  "blocks": nnn,                // (numeric) Current block height
  "currentblocksize": nnn,      // (numeric) Last block size
  "currentblocktx": nnn,        // (numeric) Last block transaction count
  "averageblockfees": xxx.xxx,  // (numeric) Avg block fees over past 100 blocks
  "difficulty": xxx.xxx,        // (numeric) Current difficulty
  "stakingsupply": xxx.xxx,     // (numeric) Estimated total staking supply
  "errors": "...",              // (string) Current errors
  "generate": true|false,       // (boolean) Mining/generation on or off
  "genproclimit": n,            // (numeric) Processor limit (-1 = no generation)
  "localhashps": xxx.xxx,        // (numeric) Local hash rate (actual field name; help says `localsolps`)
  "networkhashps": x,            // (numeric) Estimated network hash rate (actual field name; help says `networksolps`)
  "pooledtx": n,                // (numeric) Mempool size
  "testnet": true|false,        // (boolean) Testnet flag
  "chain": "xxxx",             // (string) Network name (main, test, regtest)
  "staking": true|false,        // (boolean) Staking active
  "numthreads": n,              // (numeric) CPU threads mining
  "mergemining": n,             // (numeric) Number of merge-mined chains
  "mergeminedchains": []        // (optional, array) Merge-mined chain names
}
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getmininginfo

## Actual Output (tested on VRSCTEST)
{
  "blocks": 926961,
  "currentblocksize": 0,
  "currentblocktx": 0,
  "averageblockfees": 0.09729953,
  "difficulty": 56478309.28295863,
  "stakingsupply": 31566038.74104909,
  "errors": "",
  "genproclimit": 0,
  "localhashps": 0,
  "networkhashps": 16857317,
  "pooledtx": 0,
  "testnet": true,
  "chain": "main",
  "generate": false,
  "staking": false,
  "numthreads": 0,
  "mergemining": 0
}
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getmininginfo","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Monitor mining/staking status
- Check network difficulty and hashrate
- Verify staking supply and mempool state
- Confirm merge mining configuration

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| None typical | This command rarely errors | — |

**Related Commands**
- [`getgenerate`](../generating/getgenerate.md) — focused generate/staking status
- [`setgenerate`](../generating/setgenerate.md) — enable/disable mining/staking
- [`getnetworksolps`](getnetworksolps.md) — detailed network hashrate
- [`getlocalsolps`](getlocalsolps.md) — local solution rate

**Notes**
- The `chain` field shows "main" even on testnet — this refers to the chain type within VRSCTEST
- `localhashps` and `networkhashps` in actual output differ slightly from help text field names (`localsolps`/`networksolps`)
- `stakingsupply` shows the estimated total coins available for staking across the network
- `averageblockfees` is useful for estimating mining profitability beyond the base block reward

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getnetworkhashps

> **Category:** Mining | **Version:** v1.2.14+

**DEPRECATED** — Use [`getnetworksolps`](getnetworksolps.md) instead. Kept for backwards compatibility.

Returns the estimated network solutions per second based on the last n blocks.

**Syntax**
```bash
verus getnetworkhashps [blocks] [height]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| blocks | numeric | No | Number of blocks to average over. Default: 120. Use -1 for difficulty averaging window. |
| height | numeric | No | Estimate at the time of this block height. Default: -1 (current). |

**Result**
```
x    (numeric) Estimated solutions per second
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getnetworkhashps

## Actual Output (tested on VRSCTEST)
16857317
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getnetworkhashps","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| None typical | — | — |

**Related Commands**
- [`getnetworksolps`](getnetworksolps.md) — preferred replacement
- [`getlocalsolps`](getlocalsolps.md) — local solution rate

**Notes**
- Identical functionality to `getnetworksolps` — use that instead
- Kept only for backward compatibility with older mining software

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getnetworksolps

> **Category:** Mining | **Version:** v1.2.14+

Returns the estimated network solutions per second based on the last n blocks.

**Syntax**
```bash
verus getnetworksolps [blocks] [height]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| blocks | numeric | No | Number of blocks to average over. Default: 120. Use -1 for difficulty averaging window. |
| height | numeric | No | Estimate at the time of this block height. Default: -1 (current). |

**Result**
```
x    (numeric) Estimated solutions per second
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getnetworksolps

## Actual Output (tested on VRSCTEST)
16857317
```

**At a Specific Height**
```bash
./verus -testnet getnetworksolps 120 900000

## Actual Output (tested on VRSCTEST)
24731593
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getnetworksolps","params":[120,900000]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Monitor network hashrate trends
- Compare current vs historical network power
- Estimate mining difficulty changes

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| None typical | — | — |

**Related Commands**
- [`getlocalsolps`](getlocalsolps.md) — local node solution rate
- [`getmininginfo`](getmininginfo.md) — includes network hashrate
- [`getnetworkhashps`](getnetworkhashps.md) — deprecated alias

**Notes**
- This is the preferred command over the deprecated `getnetworkhashps`
- Using `-1` for blocks averages over the difficulty averaging window for a more stable estimate
- Network hashrate dropped from ~24.7M Sol/s at block 900,000 to ~16.9M Sol/s at block 926,961 on VRSCTEST

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## prioritisetransaction

> **Category:** Mining | **Version:** v1.2.14+

Accepts a transaction into mined blocks at a higher (or lower) priority. Adjusts the apparent priority and fee for block selection without changing the actual transaction.

**Syntax**
```bash
verus prioritisetransaction "txid" priority_delta fee_delta
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| txid | string | Yes | The transaction id |
| priority_delta | numeric | Yes | Priority to add/subtract. Priority = coinage × value_in_satoshis / txsize |
| fee_delta | numeric | Yes | Fee value in satoshis to add (or subtract if negative). Not actually paid — only affects selection algorithm. |

**Result**
```
true    (boolean) Returns true on success
```

**Examples**

**Basic Usage**
```bash
## Boost a transaction's priority in the mempool
./verus -testnet prioritisetransaction "txid_here" 0.0 10000
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"prioritisetransaction","params":["txid_here",0.0,10000]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Miners prioritizing their own transactions
- Pool operators boosting specific transactions
- Deprioritizing spam transactions (negative fee_delta)

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Invalid or non-wallet transaction id | txid not in mempool or invalid | Provide a valid txid currently in the mempool |

**Related Commands**
- [`getmininginfo`](getmininginfo.md) — check mempool size (`pooledtx`)
- [`getblocktemplate`](getblocktemplate.md) — see which transactions are in the template

**Notes**
- This only affects the local node's block construction — it doesn't broadcast any changes
- The fee adjustment is virtual; the actual transaction fee is unchanged on-chain
- Effects persist until the transaction is mined or leaves the mempool
- Requires a valid txid in the mempool to test; documented from help output

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## setminingdistribution

> **Category:** Mining | **Version:** v1.2.14+

Sets multiple mining output addresses with relative weights for distributing block rewards.

**Syntax**
```bash
verus setminingdistribution '{"address1":weight1, "address2":weight2}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| jsonminingdistribution | object | Yes | JSON object with destination addresses as keys and relative weights as values |

Each entry:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| uniquedestination | number | Yes (at least 1) | Valid destination address with relative weight value |

**Result**
```
null on success, exception otherwise
```

**Examples**

**Basic Usage**
```bash
## Split rewards 50/50 between two addresses
./verus -testnet setminingdistribution '{"RAddress1":0.5, "RAddress2":0.5}'
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"setminingdistribution","params":[{"RAddress1":0.5,"RAddress2":0.5}]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Split mining rewards across multiple wallets
- Direct a portion of rewards to a specific identity or address
- Pool operators distributing rewards

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Invalid address | Destination address is not valid | Use valid R-addresses or VerusIDs |
| Exception on invalid JSON | Malformed JSON input | Ensure proper JSON formatting with quotes |

**Related Commands**
- [`getminingdistribution`](getminingdistribution.md) — check current distribution
- [`getblocktemplate`](getblocktemplate.md) — also accepts `miningdistribution` in request
- [`setgenerate`](../generating/setgenerate.md) — enable mining/staking

**Notes**
- Values are relative weights, not percentages — `{"a":1, "b":1}` is equivalent to `{"a":0.5, "b":0.5}`
- The distribution applies to all future blocks mined by this node
- Use `getminingdistribution` to verify the setting was applied
- Pass an empty object or call without parameters to clear the distribution

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## submitblock

> **Category:** Mining | **Version:** v1.2.14+

Attempts to submit a new block to the network. See [BIP 0022](https://en.bitcoin.it/wiki/BIP_0022) for full specification.

**Syntax**
```bash
verus submitblock "hexdata" ["jsonparametersobject"]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| hexdata | string | Yes | The hex-encoded block data to submit |
| jsonparametersobject | string (JSON) | No | Optional parameters (currently ignored except `workid`) |

**Optional Parameters Object**
```json
{
  "workid": "id"    // (string) If server provided a workid, it MUST be included
}
```

**Result**
Returns a string indicating the result:
| Value | Meaning |
|-------|---------|
| `"duplicate"` | Node already has a valid copy of this block |
| `"duplicate-invalid"` | Node has the block but it is invalid |
| `"duplicate-inconclusive"` | Node has the block but hasn't validated it |
| `"inconclusive"` | Node hasn't validated; may not be on best chain |
| `"rejected"` | Block was rejected as invalid |
| *(empty/null)* | Block accepted successfully |

**Examples**

**Basic Usage**
```bash
## Submit a mined block (hex data from mining software)
./verus -testnet submitblock "0400000..."
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"submitblock","params":["hexdata_here"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Mining pool software submitting solved blocks
- Custom mining implementations
- Testing block proposals

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `"rejected"` | Invalid block data or doesn't meet target | Verify block construction and PoW solution |
| `"duplicate"` | Block already known | Block was already submitted or received from network |

**Related Commands**
- [`getblocktemplate`](getblocktemplate.md) — get data to construct a block
- [`submitmergedblock`](submitmergedblock.md) — submit merged-mined blocks
- [`getblocksubsidy`](getblocksubsidy.md) — check expected reward

**Notes**
- Requires a fully constructed and solved block in hex format
- The `jsonparametersobject` is currently ignored by the implementation
- Successful submission returns null/empty — any string response indicates a problem
- Documented from help output; requires actual mined block data to test

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## submitmergedblock

> **Category:** Mining (Multichain) | **Version:** v1.2.14+

Attempts to submit one or more new blocks to one or more networks. Supports Verus and PBaaS merge-mined chains. If the block hash meets targets of other chains added with `addmergedblock`, it will be submitted to those chains as well.

**Syntax**
```bash
verus submitmergedblock "hexdata"
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| hexdata | string | Yes | The hex-encoded block data to submit, including embedded headers of PBaaS merge-mined chains |
| jsonparametersobject | object | No | Additional JSON parameters for block submission |

**Result**
On rejection:
```json
{ "rejected": "reject reason" }
```

On acceptance (this chain + PBaaS):
```json
{ "blockhash": "hex", "accepted": true, "pbaas_submissions": { "ChainName": "chainID_hex", ... } }
```

On acceptance (PBaaS only):
```json
{ "blockhash": "hex", "accepted": "pbaas", "pbaas_submissions": { "ChainName": "chainID_hex", ... } }
```

**Examples**

**Basic Usage**
```bash
./verus -testnet submitmergedblock "0400000..."
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"submitmergedblock","params":["hexdata_here"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Mining pools supporting PBaaS merge mining
- Submitting blocks valid for multiple chains simultaneously
- PBaaS chain operators running merge-mined networks

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `rejected` | Block doesn't meet target or is invalid | Check block construction and embedded headers |

**Related Commands**
- [`submitblock`](submitblock.md) — submit a single-chain block
- [`getblocktemplate`](getblocktemplate.md) — get block construction data
- [`getmininginfo`](getmininginfo.md) — check `mergemining` and `mergeminedchains` fields

**Notes**
- The block must contain valid embedded headers for any PBaaS chains being merge-mined
- Use `addmergedblock` to configure which PBaaS chains to merge mine
- The `pbaas_submissions` field shows which additional chains accepted the block
- A block can be accepted by PBaaS chains even if rejected by the main chain
- Documented from help output; requires actual mined block data to test

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2