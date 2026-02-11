---
label: Multichain
icon: terminal
---

# Multichain Commands


---

## addmergedblock

> **Category:** Multichain | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Adds a fully prepared block and its header to the current merge mining queue.

**Syntax**

```bash
addmergedblock "hexdata" ( "jsonparametersobject" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `hexdata` | string | Yes | The hex-encoded, complete, unsolved block data to add. `nTime` and `nSolution` are replaced. |
| 2 | `name` | string | Yes | Chain name symbol |
| 3 | `rpchost` | string | Yes | Host address for RPC connection |
| 4 | `rpcport` | int | Yes | Port address for RPC connection |
| 5 | `userpass` | string | Yes | Credentials for login to RPC |

Parameters 2–5 are passed as a JSON object. Default action when adding would exceed available space is to replace the choice with the least ROI if the new block provides more.

**Result**

| Value | Description |
|-------|-------------|
| `"deserialize-invalid"` | Block could not be deserialized and was rejected as invalid |
| `"blocksfull"` | Block did not exceed others in estimated ROI, and there was no room for an additional merge mined block |
| `{"nextblocktime": n}` | Block has invalid time and must be remade with time returned |

**Examples**

```bash
verus addmergedblock "hexdata" '{"currencyid":"hexstring","rpchost":"127.0.0.1","rpcport":portnum}'
```

```bash
curl --user myusername --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"addmergedblock","params":["hexdata",{"currencyid":"hexstring","rpchost":"127.0.0.1","rpcport":portnum,"estimatedroi":0.5}]}' -H 'content-type:text/plain;' http://127.0.0.1:27486/
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `deserialize-invalid` | Invalid or corrupted hex block data |
| `blocksfull` | Merge mining slots full and new block has lower ROI |

**Related Commands**

- [`getblocktemplate`](../mining/getblocktemplate.md) — Get block template for mining
- [`submitblock`](../mining/submitblock.md) — Submit a mined block

**Notes**

- Used for merge mining operations where multiple chains share proof-of-work.
- The daemon manages merge mining slots and automatically compares ROI to decide which blocks to keep.
- `nTime` and `nSolution` fields in the provided block data are replaced by the daemon.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — requires active merge mining setup

---

## clearrawmempool

> **Category:** Multichain | **Version:** v1.2.x+

Clears the mempool of all transactions or specific cache types on this node.

**Syntax**

```bash
clearrawmempool '["cachetype1","cachetype2",...]'
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `cachetypes` | array | No | Array of cache types to clear. If omitted, **all** caches are cleared. |

**Valid cache types**

| Type | Description |
|------|-------------|
| `evidence` | Notarization evidence transactions |
| `reservetransfer` | Reserve transfer transactions |
| `offermap` | Marketplace offer map cache |
| `chaintransfer` | Cross-chain transfer transactions |
| `priorconversion` | Prior conversion transactions |

**Result**

No output on success.

**Examples**

**Clear all mempool caches**

```bash
verus -testnet clearrawmempool
```

*(No output on success)*

**Clear only specific cache types**

```bash
verus -testnet clearrawmempool '["offermap","evidence"]'
```

**Clear only offer-related cache**

```bash
verus -testnet clearrawmempool '["offermap"]'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Parse error | Invalid JSON array format |

**Related Commands**

- [`getrawmempool`](../blockchain/getrawmempool.md) — View current mempool contents
- [`getmempoolinfo`](../blockchain/getmempoolinfo.md) — Get mempool statistics

**Notes**

- **Use with caution** — clearing the mempool removes unconfirmed transactions from this node's view.
- Selective clearing using cache type filters is safer than clearing everything.
- Useful for troubleshooting stuck transactions or clearing stale cross-chain data.
- Only affects the local node's mempool; does not affect other nodes on the network.
- Transactions will be re-received from peers if they are still valid.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## definecurrency

> **Category:** Multichain | **Version:** v1.2.x+

Defines a new blockchain currency, either as an independent PBaaS blockchain or as a token on this blockchain.

**Syntax**
```bash
verus definecurrency '{"name":"coinortokenname",...}' ('{"name":"fractionalgatewayname",...}') ...
```

**Parameters**
The primary argument is a JSON object with the currency definition:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | ✅ | Name of existing identity (must have no active currency) |
| options | int | optional | Bitfield: 0x1=FRACTIONAL, 0x2=IDRESTRICTED, 0x4=IDSTAKING, 0x8=IDREFERRALS, 0x10=IDREFERRALSREQUIRED, 0x20=TOKEN, 0x100=IS_PBAAS_CHAIN |
| idregistrationfees | number | ✅ | Price of an identity in native currency |
| idreferrallevels | int | ✅ | How many levels ID referrals go back in reward |
| notarizationreward | number | ✅ | Default VRSC notarization reward total for first billing period |
| proofprotocol | int | optional | 1=PROOF_PBAASMMR (decentralized), 2=PROOF_CHAINID (centralized mint/burn), 3=PROOF_ETHNOTARIZATION |
| notarizationprotocol | int | optional | 1=PBAASMMR, 2=CHAINID (sole notary), 3=ETHNOTARIZATION |
| startblock | int | optional | Block that must be notarized into block 1 of PBaaS chain |
| endblock | int | optional | Block after which currency life ends (0 = no end) |
| currencies | array | optional | Reserve currencies backing this chain |
| weights | array | optional | Weight of each reserve currency (for fractional) |
| conversions | array | optional | Pre-launch conversion ratio overrides |
| minpreconversion | array | optional | Minimum in each currency to launch |
| maxpreconversion | array | optional | Maximum in each currency allowed |
| initialcontributions | array | optional | Initial contribution in each currency |
| initialsupply | number | required (fractional) | Supply after conversion of contributions |
| prelaunchdiscount | number | optional | Discount on final price at launch for <100% fractional |
| prelaunchcarveout | number | optional | % of pre-converted amounts from reserves |
| preallocations | array | optional | `[{"identity":amount},...]` pre-allocated amounts |
| gatewayconvertername | string | optional | Name of co-launched gateway converter (PBaaS only) |
| blocktime | int | optional | Target seconds between blocks (default: 60) |
| powaveragingwindow | int | optional | Blocks to look back for DAA (default: 45) |
| notarizationperiod | int | optional | Min blocks between notarizations (default: 10 min) |
| eras | array | optional | Up to 3 eras: `[{"reward":n,"decay":n,"halving":n,"eraend":n},...]` |
| nodes | array | optional | Up to 5 nodes: `[{"networkaddress":"ip:port","nodeidentity":"name@"},...]` |
| expiryheight | int | optional | Block height at which the definition transaction expires (default: current height + 20) |

**Result**
```json
{
  "txid": "transactionid",
  "tx": "json",
  "hex": "data"
}
```

**Examples**

**Simple Token Definition (reference: agentplatform)**
The `agentplatform` token on VRSCTEST was defined with these characteristics:
```bash
## Example definition (DO NOT run — creates real currency):
./verus -testnet definecurrency '{
  "name": "agentplatform",
  "options": 32,
  "proofprotocol": 2,
  "idregistrationfees": 0.01,
  "idreferrallevels": 0,
  "preallocations": [{"ari@": 200}]
}'

## Result: agentplatform token created at block 926606
## currencyid: i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW
## proofprotocol 2 = centralized (ID holder can mint/burn)
## options 32 (0x20) = TOKEN
```

**Fractional Basket Currency (reference: VRSC-USD)**
```bash
## Example fractional currency with two reserves:
./verus -testnet definecurrency '{
  "name": "VRSC-USD",
  "options": 33,
  "currencies": ["VRSCTEST", "USD"],
  "weights": [0.5, 0.5],
  "initialsupply": 2000000,
  "initialcontributions": [200000, 1000000],
  "idregistrationfees": 5,
  "idreferrallevels": 3
}'
## options 33 = FRACTIONAL (1) + TOKEN (32)
```

**PBaaS Chain Definition**
```bash
./verus -testnet definecurrency '{
  "name": "mypbaas",
  "options": 264,
  "idregistrationfees": 100,
  "idreferrallevels": 3,
  "notarizationreward": 0.0001,
  "eras": [{"reward": 600000000, "halving": 1051924, "eraend": 0}],
  "nodes": [{"networkaddress": "1.2.3.4:12345", "nodeidentity": "mynode@"}],
  "blocktime": 60
}'
## options 264 = IS_PBAAS_CHAIN (256) + IDREFERRALS (8)
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"definecurrency","params":[{"name":"tokenname","options":32,"proofprotocol":2,"idregistrationfees":0.01,"idreferrallevels":0}]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Create a simple token** with `options: 32` (TOKEN) and `proofprotocol: 2` (centralized)
- **Create a fractional basket** with `options: 33` (FRACTIONAL+TOKEN), reserve currencies, and weights
- **Launch a PBaaS chain** with `options: 264` (IS_PBAAS_CHAIN+IDREFERRALS), eras, and nodes
- **Create a gateway converter** for cross-chain bridges using `gatewayconvertername`

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Identity not found` | Named identity doesn't exist | Create the identity first with `registernamecommitment` + `registeridentity` |
| `Currency already defined` | Identity already has an active currency | Use a different identity name |
| `Insufficient funds` | Not enough VRSC to pay definition fee | Ensure identity has funds (200 VRSCTEST for currency, 10000 for PBaaS) |
| `Invalid currency definition` | Missing required fields or invalid options | Check all required fields are present |

**Related Commands**
- [getcurrency](getcurrency.md) — verify the currency after creation
- [listcurrencies](listcurrencies.md) — list all currencies
- [sendcurrency](sendcurrency.md) — send/convert with the new currency
- [getlaunchinfo](getlaunchinfo.md) — get launch details

**Notes**
- The identity named after the currency must exist and have no active currency
- All launch funds must be available from the identity with the same name
- Once activated, the symbol cannot be reused (even if identity is transferred/revoked) unless `endblock` is set and reached
- Currency registration fee on VRSCTEST: 200 VRSCTEST; PBaaS chain: 10,000 VRSCTEST
- Options are additive bitfields: combine with OR (e.g., FRACTIONAL + TOKEN = 0x1 + 0x20 = 0x21 = 33)

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## estimateconversion

> **Category:** Multichain | **Version:** v1.2.x+

Estimates conversion from one currency to another, accounting for pending conversions, fees, and slippage.

**Syntax**
```bash
verus estimateconversion '{"currency":"name","convertto":"name","amount":n}'
verus estimateconversion '[array of conversions]'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currency | string | ✅ | Source currency name (defaults to native) |
| amount | number | ✅ | Amount to convert, denominated in source currency |
| convertto | string | optional | Destination currency (must be reserve↔fractional pair) |
| preconvert | bool | optional | Convert at market price before currency launch (default: false) |
| via | string | optional | Common fractional basket to route through when converting between two reserves |

Multiple conversions can be passed as an array for batch estimation through one basket.

**Result**
```json
{
  "inputcurrencyid": "i-address",
  "netinputamount": 99.95,
  "outputcurrencyid": "i-address",
  "estimatedcurrencyout": 568.27,
  "estimatedcurrencystate": { ... }
}
```

**Examples**

**Convert VRSCTEST → VRSC-USD (reserve → fractional)**
```bash
./verus -testnet estimateconversion '{"currency":"VRSCTEST","convertto":"VRSC-USD","amount":10}'
## Actual Output (tested on VRSCTEST)
{
  "inputcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "netinputamount": 9.99750000,
  "outputcurrencyid": "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD",
  "estimatedcurrencyout": 53.30897428,
  "estimatedcurrencystate": {
    "flags": 49,
    "currencyid": "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD",
    "reservecurrencies": [
      {
        "currencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "weight": 0.50000000,
        "reserves": 189111.88850281,
        "priceinreserve": 0.18754127
      },
      {
        "currencyid": "iFawzbS99RqGs7J2TNxME1TmmayBGuRkA2",
        "weight": 0.50000000,
        "reserves": 1075715.34495600,
        "priceinreserve": 1.06678128
      }
    ],
    "supply": 2016749.56340113
  }
}
```

**Convert Between Reserves via Basket (VRSCTEST → USD via VRSC-USD)**
```bash
./verus -testnet estimateconversion '{"currency":"VRSCTEST","convertto":"USD","via":"VRSC-USD","amount":100}'
## Actual Output (tested on VRSCTEST)
{
  "inputcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "netinputamount": 99.95000000,
  "outputcurrencyid": "iFawzbS99RqGs7J2TNxME1TmmayBGuRkA2",
  "estimatedcurrencyout": 568.27012650
}
## 100 VRSCTEST ≈ 568.27 USD (via VRSC-USD basket)
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"estimateconversion","params":[{"currency":"VRSCTEST","convertto":"VRSC-USD","amount":10}]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Price quotes** before executing `sendcurrency` with conversion
- **Slippage estimation** — compare `netinputamount` vs `amount` to see fees
- **Cross-reserve pricing** — use `via` to estimate reserve-to-reserve swaps
- **Batch estimation** — pass array to estimate multiple conversions simultaneously

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Source currency cannot be converted to destination` | No conversion path exists | Use `getcurrencyconverters` to find valid pairs; use `via` for reserve↔reserve |
| `Currency not found` | Invalid currency name | Check spelling with `getcurrency` |

**Related Commands**
- [sendcurrency](sendcurrency.md) — execute the conversion
- [getcurrencyconverters](getcurrencyconverters.md) — find available conversion pairs
- [getcurrencystate](getcurrencystate.md) — check current reserve ratios

**Notes**
- Fees are ~0.025% conversion fee + 0.02% network fee (visible in `netinputamount` vs `amount`)
- The `estimatedcurrencystate` shows the projected state AFTER the conversion
- For reserve↔reserve swaps, you MUST use `via` to specify the fractional basket
- Direct conversion only works: reserve→fractional or fractional→reserve
- Results are estimates; actual output depends on other pending conversions in the same block

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getbestproofroot

> **Category:** Multichain | **Version:** v1.2.x+

Determines and returns the index of the best (most recent, valid, qualified) proof root from a list of proof roots.

**Syntax**

```bash
getbestproofroot '{"proofroots":[...],"lastconfirmed":n}'
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `proofroots` | array | Yes (may be empty) | Ordered array of proof root objects |
| `proofroots[].version` | int | Yes | Version of proof root data structure |
| `proofroots[].type` | int | Yes | Type of proof root (chain or system specific) |
| `proofroots[].systemid` | string | Yes | System the proof root is for |
| `proofroots[].height` | int | Yes | Height of this proof root |
| `proofroots[].stateroot` | string | Yes | Merkle tree root for the specified block |
| `proofroots[].blockhash` | string | Yes | Hash identifier for the specified block |
| `proofroots[].power` | string | Yes | Work/stake power for most-work rule |
| `currencies` | array | No | Currency IDs to query for currency states |
| `lastconfirmed` | int | Yes | Index into proof root array indicating last confirmed root |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `bestindex` | int | Index of best unconfirmed proof root, or -1 |
| `latestproofroot` | object | Latest valid proof root of chain |
| `laststableproofroot` | object | Tip minus BLOCK_MATURITY or last notarized tip |
| `lastconfirmedproofroot` | object | Last confirmed proof root |
| `currencystates` | object | Currency states of target and published bridges |

**Examples**

**Query with empty proof roots**

```bash
verus -testnet getbestproofroot '{"proofroots":[],"lastconfirmed":0}'
```

**Result:**

```json
{
  "latestproofroot": {
    "version": 1,
    "type": 1,
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "height": 926990,
    "stateroot": "b55b3de4f19296085120a0b167f04bd1e2483bc65208ac0545b872fd449521e2",
    "blockhash": "000000018e6991fb0d5b595b7b7b8e4cb7f04a0b8b6704ecd0f063221d534bb1",
    "power": "000000000000007cdf67b5b86988e351000000000000000000070a048434c248"
  },
  "laststableproofroot": {
    "version": 1,
    "type": 1,
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "height": 926970,
    "stateroot": "f2ad072f1f36c4ae2aa00b99e3b813465c2a753aa5db7bcb74f4fee61185d3f6",
    "blockhash": "000000025a722d4b3383c75413efe07e8f29c5990e7b53fee65794a41adbece2",
    "power": "000000000000007cdecdbd910883658e000000000000000000070a000e8a52fb"
  }
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Parse error | Invalid JSON format in the proof roots parameter |

**Related Commands**

- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data for a currency
- [`getnotarizationproofs`](getnotarizationproofs.md) — Get notarization proofs
- [`submitacceptednotarization`](submitacceptednotarization.md) — Submit a notarization

**Notes**

- Core part of the Verus cross-chain notarization protocol.
- The `laststableproofroot` is typically at `tip - BLOCK_MATURITY` (20 blocks) behind the latest.
- Proof roots contain the Merkle state root, block hash, and cumulative chain power for validation.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## getcurrency

> **Category:** Multichain | **Version:** v1.2.x+

Returns the complete definition for any given currency or chain registered on the blockchain.

**Syntax**
```bash
verus getcurrency "currencyname"
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currencyname | string | optional | Name or i-address of the currency. Omit for current chain. Also accepts `hex:currencyidhex` format. |

**Result**
Returns a JSON object containing the full currency definition including version, options, parent chain, system ID, launch parameters, eras, nodes, and the last confirmed currency state.

Key fields:
- `currencyid` — the i-address identifier
- `options` — bitfield (0x20=TOKEN, 0x1=FRACTIONAL, 0x100=IS_PBAAS_CHAIN, etc.)
- `systemid` — system this currency runs on
- `startblock` / `endblock` — lifecycle boundaries
- `bestcurrencystate` / `lastconfirmedcurrencystate` — current supply, emissions, fees

**Examples**

**Basic Usage — Token**
```bash
./verus -testnet getcurrency agentplatform
## Actual Output (tested on VRSCTEST)
{
  "version": 1,
  "options": 32,
  "name": "agentplatform",
  "currencyid": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "notarizationprotocol": 1,
  "proofprotocol": 2,
  "launchsystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "startblock": 926606,
  "endblock": 0,
  "idregistrationfees": 0.01000000,
  "idreferrallevels": 0,
  "idimportfees": 0.02000000,
  "fullyqualifiedname": "agentplatform",
  "bestcurrencystate": {
    "flags": 48,
    "version": 1,
    "currencyid": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
    "initialsupply": 0.00000000,
    "emitted": 10.00000000,
    "supply": 210.00000000
  }
}
```

**Basic Usage — Native Chain**
```bash
./verus -testnet getcurrency VRSCTEST
## Returns full VRSCTEST chain definition including:
## - eras with reward/halving schedule
## - node list for network connectivity
## - registration fee structure
## - preallocations
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getcurrency","params":["agentplatform"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Check if a currency exists** before interacting with it
- **Get the i-address** (`currencyid`) for a currency by name
- **Inspect supply** via `bestcurrencystate.supply`
- **Check launch status** via `startblock` and currency state flags
- **Find reserve currencies** in fractional baskets via `currencies` and `weights` arrays

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Currency not found` | Name/ID doesn't exist on this chain | Check spelling, ensure currency was defined on this chain |
| No output | Daemon not synced | Wait for sync to complete |

**Related Commands**
- [listcurrencies](listcurrencies.md) — list all registered currencies
- [getcurrencystate](getcurrencystate.md) — get current state at specific height
- [definecurrency](definecurrency.md) — define a new currency
- [getlaunchinfo](getlaunchinfo.md) — get launch details

**Notes**
- `options: 32` (0x20) = TOKEN, `options: 33` (0x21) = FRACTIONAL TOKEN
- `proofprotocol: 2` means centralized (ID controller can mint/burn)
- The `bestcurrencystate` shows the latest state; `lastconfirmedcurrencystate` shows last notarized state

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getcurrencyconverters

> **Category:** Multichain | **Version:** v1.2.x+

Retrieves all fractional currencies that have the specified currencies as reserves, enabling conversion between them.

**Syntax**
```bash
verus getcurrencyconverters "currency1" "currency2" ...
verus getcurrencyconverters '{"convertto":"name","fromcurrency":"name","amount":n,"slippage":0.01}'
```

**Parameters**

**Simple Form**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currency1, currency2, ... | string(s) | ✅ | One or more currency names — returns fractional currencies that hold ALL listed as reserves |

**Advanced Form (JSON object)**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| convertto | string | ✅ | Target/destination currency |
| fromcurrency | string/array | ✅ | Source currency name, or array of objects: `[{"currency":"name","targetprice":n}]` or `[{"currency":"name","targetprice":[n,...]}]` |
| amount | number | optional | Amount of destination currency needed |
| slippage | number | optional | Max slippage (0.01 = 1%, max 50000000 = 50%) |

**Result**
Array of currency objects with their current state and last conversion amounts.

**Examples**

**Find Converters for VRSCTEST**
```bash
./verus -testnet getcurrencyconverters VRSCTEST
## Actual Output (tested on VRSCTEST, truncated)
[
  {
    "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD": {
      "version": 1,
      "options": 33,
      "name": "VRSC-USD",
      "currencyid": "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD",
      "currencies": [
        "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "iFawzbS99RqGs7J2TNxME1TmmayBGuRkA2"
      ],
      "weights": [0.50000000, 0.50000000],
      "initialsupply": 2000000.00000000,
      "initialcontributions": [200000.00000000, 1000000.00000000]
    },
    "fullyqualifiedname": "VRSC-USD",
    "height": 924671,
    ...
  },
  ...
]
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getcurrencyconverters","params":["VRSCTEST"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Discover trading pairs** — find all fractional baskets that hold a given currency
- **Build a DEX UI** — enumerate available conversion paths
- **Price discovery** — find converters with best rates for a target amount with slippage control

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty array `[]` | No fractional currencies hold the specified reserve(s) | Check currency names; only fractional baskets are returned |

**Related Commands**
- [estimateconversion](estimateconversion.md) — estimate a specific conversion
- [sendcurrency](sendcurrency.md) — execute a conversion
- [getcurrency](getcurrency.md) — get details on a specific converter

**Notes**
- Only returns **fractional** currencies (baskets with reserves)
- Simple tokens like `agentplatform` won't appear (they have no reserves)
- The advanced JSON form with `slippage` filters converters that can satisfy the trade within tolerance

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getcurrencystate

> **Category:** Multichain | **Version:** v1.2.x+

Returns the currency state(s) on the blockchain for any specified currency at a given height or range, optionally with market/volume data.

**Syntax**
```bash
verus getcurrencystate "currencynameorid" ("n") ("conversiondatacurrency")
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currencynameorid | string | ✅ | Name or i-address of currency |
| n | int/string | optional | Height or range: `"n"`, `"m,n"` (range), or `"m,n,o"` (range with step). Default: latest. |
| conversiondatacurrency | string | optional | If present, returns market data with volumes denominated in this currency |

**Result**
Array of objects, each containing `height`, `blocktime`, `currencystate`, and optionally `conversiondata` with OHLCV-style volume pairs.

**Examples**

**Basic Usage**
```bash
./verus -testnet getcurrencystate agentplatform
## Actual Output (tested on VRSCTEST)
[
  {
    "height": 926963,
    "blocktime": 1770448221,
    "currencystate": {
      "flags": 48,
      "version": 1,
      "currencyid": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
      "launchcurrencies": [],
      "initialsupply": 0.00000000,
      "emitted": 10.00000000,
      "supply": 210.00000000,
      "primarycurrencyfees": 0.00000000,
      "primarycurrencyconversionfees": 0.00000000,
      "primarycurrencyout": 10.00000000,
      "preconvertedout": 0.00000000
    }
  }
]
```

**At Specific Height**
```bash
./verus -testnet getcurrencystate agentplatform "926610"
```

**Range with Step (for charting)**
```bash
./verus -testnet getcurrencystate "VRSC-USD" "926900,926963,10"
## Returns state every 10 blocks from 926900 to 926963
```

**With Market Data**
```bash
./verus -testnet getcurrencystate "VRSC-USD" "" "VRSCTEST"
## Returns conversion volume data denominated in VRSCTEST
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getcurrencystate","params":["agentplatform"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Track supply over time** with height ranges
- **Build price charts** using `conversiondata` with OHLCV volume pairs
- **Monitor reserve ratios** for fractional currencies
- **Check fees collected** via `primarycurrencyfees` and `primarycurrencyconversionfees`

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Currency not found` | Invalid name/ID | Verify currency exists with `getcurrency` |
| Empty array `[]` | Height before currency existed | Use height >= currency's `startblock` |

**Related Commands**
- [getcurrency](getcurrency.md) — full currency definition
- [getinitialcurrencystate](getinitialcurrencystate.md) — state at launch
- [estimateconversion](estimateconversion.md) — estimate conversion with current state

**Notes**
- For fractional currencies, the state includes `reservecurrencies` with weights, reserves, and prices
- The `flags` field indicates currency state: launched, prelaunch, refunding, etc.
- Using a range with step is efficient for building historical charts

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getcurrencytrust

> **Category:** Multichain | **Version:** v1.2.x+

Returns trust ratings for currencies in the wallet, controlling which currencies are synced/displayed.

**Syntax**
```bash
verus getcurrencytrust '["currencyid",...]'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currencyids | array | optional | Array of currency i-addresses to query. Omit or `[]` for all rated currencies. |

**Result**
```json
{
  "setratings": { "currencyid": JSONRatingObject, ... },
  "currencytrustmode": n
}
```

Trust modes:
- `0` = No restriction on sync (default)
- `1` = Only sync currencies rated as approved
- `2` = Sync all except those on block list

**Examples**

**Get All Trust Ratings**
```bash
./verus -testnet getcurrencytrust
## Actual Output (tested on VRSCTEST — no ratings set):
## (empty response — no trust ratings configured)
```

**Query Specific Currency**
```bash
./verus -testnet getcurrencytrust '["i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW"]'
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getcurrencytrust","params":[]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Check wallet filtering** — see which currencies are approved/blocked
- **Audit trust settings** before changing them with `setcurrencytrust`

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty response | No trust ratings configured | This is normal — default is trust mode 0 (no filtering) |

**Related Commands**
- [setcurrencytrust](setcurrencytrust.md) — modify trust ratings
- [listcurrencies](listcurrencies.md) — list all currencies

**Notes**
- Trust ratings are wallet-local settings, not on-chain
- Default mode 0 means all currencies are visible and spendable
- Useful for wallets that want to filter spam tokens

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getexports

> **Category:** Multichain | **Version:** v1.2.x+

Returns export transfers to the specified currency/chain within an optional block height range.

**Syntax**
```bash
verus getexports "chainname" (heightstart) (heightend)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| chainname | string | ✅ | Name or i-address of the destination currency/chain |
| heightstart | int | optional | Only return exports at or above this height (default: 0) |
| heightend | int | optional | Only return exports at or below this height (default: max) |

**Result**
Array of export objects containing height, txid, export info (source/destination systems, amounts, fees), partial transaction proof, and transfer details.

**Examples**

**Get Exports for agentplatform**
```bash
./verus -testnet getexports agentplatform
## Actual Output (tested on VRSCTEST, truncated)
[
  {
    "height": 926587,
    "txid": "62b74cbb9d2ed4050c1d59d09f69bda23cc0ca8de67343b8c1e6b17c961cd657",
    "txoutnum": 4,
    "exportinfo": {
      "version": 1,
      "flags": 65,
      "sourceheightstart": 0,
      "sourceheightend": 926586,
      "sourcesystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "destinationsystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "destinationcurrencyid": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
      "totalamounts": {
        "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 100.00000000
      },
      "totalfees": {
        "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 100.00000000
      }
    },
    "transfers": []
  },
  ...
]
```

**Get Exports in Height Range**
```bash
./verus -testnet getexports VRSCTEST 926950 926963
## Returns exports to VRSCTEST within that block range
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getexports","params":["agentplatform"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Track cross-chain transfers** leaving this chain
- **Monitor bridge activity** for specific currencies
- **Verify export completion** by checking transfer details
- **Audit currency launch** exports (initial funding)

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty array `[]` | No exports in the specified range | Broaden height range or check currency name |
| `Currency not found` | Invalid chain name | Verify with `getcurrency` |

**Related Commands**
- [getimports](getimports.md) — get incoming imports
- [getpendingtransfers](getpendingtransfers.md) — pending (not yet exported) transfers
- [sendcurrency](sendcurrency.md) — create exports with `exportto`

**Notes**
- The first export for a currency is typically the launch/definition transaction
- `totalamounts` and `totalfees` show aggregate values for all transfers in that export batch
- Exports are batched — multiple transfers may be aggregated into a single export

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getimports

> **Category:** Multichain | **Version:** v1.2.x+

Returns all imports into a specific currency/chain, optionally filtered by block height range.

**Syntax**
```bash
verus getimports "chainname" (startheight) (endheight)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| chainname | string | optional | Name or i-address of the chain. Omit for current chain. |
| startheight | int | optional | Start height (default: 0) |
| endheight | int | optional | End height (default: 0 = latest) |

**Result**
Array of import objects containing import height, txid, import details (source system, amounts, token values), and the import notarization.

**Examples**

**Get All Imports for VRSCTEST**
```bash
./verus -testnet getimports VRSCTEST
## Actual Output (tested on VRSCTEST, first entry)
[
  {
    "importheight": 238,
    "importtxid": "0672a49165fd34fa387a4c497a93c7a3ccbfa093e136e136585695557f83a261",
    "importvout": 2,
    "import": {
      "version": 1,
      "flags": 15,
      "sourcesystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "sourceheight": 1,
      "importcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "numoutputs": 0
    },
    "importnotarization": {
      "version": 2,
      "isdefinition": true,
      "launchcleared": true,
      "launchconfirmed": true,
      "launchcomplete": true,
      ...
    }
  },
  ...
]
```

**Get Recent Imports**
```bash
./verus -testnet getimports VRSCTEST 926900 926963
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getimports","params":["VRSCTEST"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Track incoming cross-chain transfers**
- **Verify bridge imports** from external systems
- **Monitor currency launch imports** (initial conversions)
- **Debug cross-chain issues** by checking import notarizations

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty response | No imports in range, or currency has no imports | Broaden height range |
| `Currency not found` | Invalid chain name | Verify with `getcurrency` |

**Related Commands**
- [getexports](getexports.md) — get outgoing exports
- [getpendingtransfers](getpendingtransfers.md) — transfers awaiting export
- [sendcurrency](sendcurrency.md) — send cross-chain (creates exports that become imports)

**Notes**
- The first import for VRSCTEST (height 238) is the chain's genesis/definition import
- Import notarizations contain launch state flags (`launchcleared`, `launchconfirmed`, `launchcomplete`)
- Can return very large result sets without height filtering on long-running chains

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getinitialcurrencystate

> **Category:** Multichain | **Version:** v1.2.x+

Returns the total amount of preconversions confirmed on the blockchain for a specified currency at launch time.

**Syntax**
```bash
verus getinitialcurrencystate "name"
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | ✅ | Name or chain ID of the currency |

**Result**
```json
{
  "flags": n,
  "version": 1,
  "currencyid": "i-address",
  "launchcurrencies": [],
  "initialsupply": 0.0,
  "emitted": 0.0,
  "supply": 0.0,
  "primarycurrencyfees": 0.0,
  "primarycurrencyconversionfees": 0.0,
  "primarycurrencyout": 0.0,
  "preconvertedout": 0.0
}
```

**Examples**

**Get Initial State for agentplatform**
```bash
./verus -testnet getinitialcurrencystate agentplatform
## Actual Output (tested on VRSCTEST)
{
  "flags": 26,
  "version": 1,
  "currencyid": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW",
  "launchcurrencies": [],
  "initialsupply": 0.00000000,
  "emitted": 0.00000000,
  "supply": 0.00000000,
  "primarycurrencyfees": 0.00000000,
  "primarycurrencyconversionfees": 0.00000000,
  "primarycurrencyout": 0.00000000,
  "preconvertedout": 0.00000000
}
## flags 26 = prelaunch state flags
## supply 0 = no pre-conversions (tokens were pre-allocated, not pre-converted)
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getinitialcurrencystate","params":["agentplatform"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Verify launch conditions** — check how much was pre-converted before launch
- **Audit initial supply** — confirm the starting supply matched expectations
- **Compare initial vs current** — use with `getcurrencystate` to see growth

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Currency not found` | Invalid name/ID | Verify with `getcurrency` |

**Related Commands**
- [getcurrencystate](getcurrencystate.md) — current state (compare with initial)
- [getlaunchinfo](getlaunchinfo.md) — full launch details with proofs
- [getcurrency](getcurrency.md) — currency definition

**Notes**
- For simple tokens without pre-conversion, all values will be 0 (supply comes from preallocations)
- For fractional currencies, `launchcurrencies` will show reserve contributions
- The `flags` field encodes the launch state at the time of the snapshot
- Compare with current `getcurrencystate` to see how the currency has evolved since launch

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getlastimportfrom

> **Category:** Multichain | **Version:** v1.2.x+

Returns the last import from a specific originating system.

**Syntax**

```bash
getlastimportfrom "systemname"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `systemname` | string | Yes | Name or ID of the system to retrieve the last import from |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `lastimport` | object | Last import from the indicated system on this chain |
| `lastconfirmednotarization` | object | Last confirmed notarization of the indicated system on this chain |

**Examples**

**Query for a bridged system**

```bash
verus -testnet getlastimportfrom "VRSC"
```

**Result (when no bridge exists):**

```
error code: -8
error message: Invalid chain name or chain ID
```

> This error occurs because VRSC is not a bridged system on the VRSCTEST testnet. On mainnet with active bridges, this would return import and notarization data.

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid chain name or chain ID` | The specified system does not exist or is not a valid import source |

**Related Commands**

- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data for a currency
- [`submitimports`](submitimports.md) — Submit imports from another system
- [`getimports`](getimports.md) — Get imports for a currency

**Notes**

- Only works for systems that have an active bridge to the current chain.
- Returns both the last import transaction and the last confirmed notarization from that system.
- Useful for monitoring cross-chain import status and debugging bridge operations.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## getlaunchinfo

> **Category:** Multichain | **Version:** v1.2.x+

Returns the launch notarization data and partial transaction proof for a currency's launch.

**Syntax**
```bash
verus getlaunchinfo "currencyid"
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currencyid | string | ✅ | Hex-encoded ID or string name of the currency |

**Result**
```json
{
  "currencydefinition": {},
  "txid": "hexstr",
  "voutnum": n,
  "transactionproof": {},
  "launchnotarization": {},
  "notarynotarization": {}
}
```

**Examples**

**Get Launch Info for agentplatform**
```bash
./verus -testnet getlaunchinfo agentplatform
## Actual Output (tested on VRSCTEST):
## Error: "No valid export found"
## This is expected for simple tokens that launched without pre-conversion exports
```

**Get Launch Info for a PBaaS Chain or Fractional Currency**
```bash
./verus -testnet getlaunchinfo VRSC-USD
## Would return the full launch notarization for the VRSC-USD fractional basket
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getlaunchinfo","params":["VRSC-USD"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Verify currency launch** — get proof that a currency was properly launched
- **Cross-chain launch verification** — use the transaction proof for external validation
- **Audit launch parameters** — confirm the original currency definition at launch

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `No valid export found` | Currency launched without exports (e.g., simple tokens) or hasn't launched yet | Only currencies with pre-conversion/launch exports have launch info |
| `Currency not found` | Invalid name/ID | Check with `getcurrency` |

**Related Commands**
- [getinitialcurrencystate](getinitialcurrencystate.md) — initial state at launch
- [getcurrency](getcurrency.md) — current currency definition
- [definecurrency](definecurrency.md) — how the currency was defined

**Notes**
- Simple tokens (like `agentplatform`) that launch without pre-conversions may return "No valid export found"
- This command is primarily useful for PBaaS chains and fractional currencies with launch phases
- The `transactionproof` can be used for cross-chain verification of the launch

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getnotarizationdata

> **Category:** Multichain | **Version:** v1.2.x+

Returns the latest PBaaS notarization data for a specified currency.

**Syntax**

```bash
getnotarizationdata "currencynameorid" (getevidence) (separatecounterevidence)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `currencynameorid` | string | Yes | Hex-encoded ID or string name to search for notarizations |
| 2 | `getevidence` | bool | No | If true, returns notarization evidence as well |
| 3 | `separatecounterevidence` | bool | No | If true, counter-evidence is processed and returned with proof roots |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `version` | int | Notarization protocol version |
| `notarizations` | array | Array of notarization objects |
| `forks` | array | Fork indices |
| `lastconfirmedheight` | int | Height of last confirmed notarization |
| `lastconfirmed` | int | Index of last confirmed notarization |
| `bestchain` | int | Index of best chain |

**Examples**

**Get notarization data for VRSCTEST**

```bash
verus -testnet getnotarizationdata "VRSCTEST"
```

**Result:**

```json
{
  "version": 1,
  "notarizations": [
    {
      "index": 0,
      "txid": "0000000000000000000000000000000000000000000000000000000000000000",
      "vout": -1,
      "notarization": {
        "version": 2,
        "launchconfirmed": true,
        "proposer": {
          "address": "i3UXS5QPRQGNRDDqVnyWTnmFCTHDbzmsYk",
          "type": 4
        },
        "currencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "notarizationheight": 926990,
        "currencystate": {
          "flags": 16,
          "version": 1,
          "currencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
          "initialsupply": 0.00000000,
          "emitted": 0.00000000,
          "supply": 0.00000000
        },
        "proofroots": [
          {
            "version": 1,
            "type": 1,
            "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
            "height": 926990,
            "stateroot": "b55b3de4f19296085120a0b167f04bd1e2483bc65208ac0545b872fd449521e2",
            "blockhash": "000000018e6991fb0d5b595b7b7b8e4cb7f04a0b8b6704ecd0f063221d534bb1",
            "power": "000000000000007cdf67b5b86988e351000000000000000000070a048434c248"
          }
        ]
      }
    }
  ],
  "forks": [[0]],
  "lastconfirmedheight": 926990,
  "lastconfirmed": 0,
  "bestchain": 0
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid currency or ID | The specified currency name or ID doesn't exist |

**Related Commands**

- [`getbestproofroot`](getbestproofroot.md) — Get best proof root
- [`getnotarizationproofs`](getnotarizationproofs.md) — Get notarization proofs
- [`submitacceptednotarization`](submitacceptednotarization.md) — Submit a notarization

**Notes**

- For the native chain (VRSCTEST on testnet), this returns the current chain state as a self-notarization.
- For cross-chain currencies, this returns pending and confirmed notarizations from bridged systems.
- The `getevidence` flag adds cryptographic evidence supporting each notarization.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## getnotarizationproofs

> **Category:** Multichain | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Returns proofs for requested challenges to unconfirmed cross-chain notarizations.

**Syntax**

```bash
getnotarizationproofs '[challengerequests, ...]'
```

**Parameters**

Takes an array of challenge request objects. Two types are supported:

**Skip Challenge**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `"vrsc::evidence.skipchallenge"` or `"iCwxpRL6h3YeCRtGjgQSsqoKdZCuM4Dxaf"` |
| `evidence` | object | Yes | CNotaryEvidence object |
| `entropyhash` | string | Yes | Hex entropy hash |
| `proveheight` | int | Yes | Height to prove |
| `atheight` | int | Yes | Height at which to prove |

**Primary Proof**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `"vrsc::evidence.primaryproof"` or `"iKDesmiEkEjDG61nQSZJSGhWvC8x8xA578"` |
| `priornotarizationref` | object | Conditional | CUTXORef — either this or `priorroot` required |
| `priorroot` | object | Conditional | CProofRoot — either this or `priornotarizationref` required |
| `challengeroots` | array | No | Array of `{indexkey, proofroot}` objects |
| `evidence` | object | Yes | CNotaryEvidence object |
| `entropyhash` | string | Yes | Hex entropy hash |
| `confirmnotarization` | object | Conditional | New notarization — cannot combine with `confirmroot` |
| `confirmroot` | object | Conditional | CProofRoot — cannot combine with `confirmnotarization` |
| `fromheight` | int | Yes | Starting height |
| `toheight` | int | Yes | Ending height |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `evidence` | array | Array of CNotaryEvidence objects containing proofs for requested challenges |

**Examples**

```bash
verus -testnet getnotarizationproofs '[{"type":"iCwxpRL6h3YeCRtGjgQSsqoKdZCuM4Dxaf","evidence":{},"proveheight":100,"atheight":200}]'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Parse error | Invalid JSON challenge request format |
| Cannot have both `confirmnotarization` and `confirmroot` | Mutually exclusive fields |

**Related Commands**

- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data
- [`submitchallenges`](submitchallenges.md) — Submit evidence challenges
- [`getbestproofroot`](getbestproofroot.md) — Get best proof root

**Notes**

- Part of the Verus cross-chain consensus challenge/response protocol.
- Proofs can independently or in combination invalidate or force competing chains to provide more proofs.
- Skip challenges prove that blocks exist at certain heights; primary proofs provide full state proofs.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — requires active cross-chain notarization disputes

---

## getpendingtransfers

> **Category:** Multichain | **Version:** v1.2.x+

Returns all pending transfers for a particular chain that have not yet been aggregated into an export.

**Syntax**
```bash
verus getpendingtransfers "chainname"
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| chainname | string | optional | Name or i-address of the chain. Omit for current chain. |

**Result**
Array of pending transfer objects, or empty if no transfers are pending.

**Examples**

**Check Pending Transfers for VRSCTEST**
```bash
./verus -testnet getpendingtransfers VRSCTEST
## Actual Output (tested on VRSCTEST):
## (empty — no pending transfers at time of test)
```

**Check Pending Transfers for agentplatform**
```bash
./verus -testnet getpendingtransfers agentplatform
## (empty — no pending transfers)
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getpendingtransfers","params":["VRSCTEST"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Monitor cross-chain queue** — see transfers waiting to be exported
- **Debug stuck transfers** — check if a `sendcurrency` with `exportto` is queued
- **Pre-conversion monitoring** — track pending pre-launch conversions

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Currency not found` | Invalid chain name | Verify with `getcurrency` |

**Related Commands**
- [getexports](getexports.md) — see completed exports
- [getimports](getimports.md) — see completed imports
- [sendcurrency](sendcurrency.md) — create transfers

**Notes**
- Pending transfers are temporary — they get batched into exports at the next block
- An empty result is normal when no cross-chain activity is in progress
- Transfers appear here briefly between `sendcurrency` and the next block that processes them

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getreservedeposits

> **Category:** Multichain | **Version:** v1.2.x+

Returns all reserve deposits under control of the specified currency or chain, showing the backing reserves.

**Syntax**
```bash
verus getreservedeposits "currencyname" (returnutxos)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currencyname | string | ✅ | Full name or i-address of the controlling currency |
| returnutxos | bool | optional | If true, returns individual UTXOs with currency values (default: false) |

**Result**
```json
{
  "utxos": [...],
  "currency1_iaddress": value,
  "currency2_iaddress": value
}
```

**Examples**

**Get Reserve Deposits for VRSC-USD Basket**
```bash
./verus -testnet getreservedeposits VRSC-USD
## Actual Output (tested on VRSCTEST)
{
  "iFawzbS99RqGs7J2TNxME1TmmayBGuRkA2": 1075715.34495600,
  "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 189101.88975281
}
## Shows ~1.07M USD and ~189K VRSCTEST backing the VRSC-USD basket
```

**Get Deposits for VRSCTEST (no reserves)**
```bash
./verus -testnet getreservedeposits VRSCTEST
## Actual Output:
{}
## Empty — VRSCTEST is a native chain, not a fractional currency
```

**With UTXO Details**
```bash
./verus -testnet getreservedeposits VRSC-USD true
## Returns individual UTXOs that hold the reserve deposits
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getreservedeposits","params":["VRSC-USD"]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Verify basket backing** — confirm fractional currencies are fully backed by reserves
- **Audit reserve health** — compare reserves to supply for solvency checks
- **Track reserve changes** over time
- **UTXO analysis** — use `returnutxos: true` for detailed deposit accounting

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty `{}` | Currency has no reserves (native chain or simple token) | Only fractional currencies have reserve deposits |
| `Currency not found` | Invalid name/ID | Verify with `getcurrency` |

**Related Commands**
- [getcurrencystate](getcurrencystate.md) — includes reserve amounts in currency state
- [getcurrency](getcurrency.md) — see currency definition with reserve currencies and weights
- [getcurrencyconverters](getcurrencyconverters.md) — find currencies with reserves

**Notes**
- Only fractional currencies (baskets) have reserve deposits
- Simple tokens (like `agentplatform`) and native chains return empty `{}`
- Reserve deposits are held in special on-chain outputs controlled by the currency protocol
- The i-addresses in the result map to the reserve currency IDs (use `getcurrency` to resolve names)

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## getsaplingtree

> **Category:** Multichain | **Version:** v1.2.x+

Returns the entries for a light wallet Sapling tree state at a specified height or range.

**Syntax**

```bash
getsaplingtree "n"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `n` | string/int | No | Height or inclusive range. Formats: `"n"`, `"m,n"` (range), `"m,n,o"` (range with step). If omitted, returns latest state. |

**Result**

Array of objects:

| Field | Type | Description |
|-------|------|-------------|
| `network` | string | Currency ID of the network |
| `height` | int | Block height |
| `hash` | string | Block hash at this height |
| `time` | int | Block timestamp |
| `tree` | string | Hex-encoded Sapling commitment tree state |

**Examples**

**Get Sapling tree at specific height**

```bash
verus -testnet getsaplingtree "926990"
```

**Result:**

```json
[
  {
    "network": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "height": 926990,
    "hash": "000000018e6991fb0d5b595b7b7b8e4cb7f04a0b8b6704ecd0f063221d534bb1",
    "time": 1770449419,
    "tree": "0125e011918cd61ca18258b0bb583c7819db8b1baa9526dac97f0150224165d71b000901c9708ac265b695f0fb23c0fbf45d67231c7997e1c4f196b9f57e6ddad704b30a01a3b3a2f9f7e5138d69dbd99622ebb113f456d918e939d373abde9143a8c73f3501affbd0b08eab4485c9ff5700471153e8ca3dd729f2a2e764ee2f9df7a69cdf4f0000019423f71049e07cc2f720456034a962ff85b85c82e6251beb3aa4583daace38020001b891214ff69d3a6004d52ecbcb145a968d375d79834061d3586baaaf76faaf4a01d8b8e6065b6356e94a872598f8c7fed4cbf0dba06c0ee5943836b827a63f0139"
  }
]
```

**Get Sapling tree for a range with step**

```bash
verus -testnet getsaplingtree "926980,926990,5"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid height | Height exceeds current chain tip or is negative |

**Related Commands**

- [`getblock`](../blockchain/getblock.md) — Get block data at a height
- [`getblockchaininfo`](../blockchain/getblockchaininfo.md) — Get blockchain state info

**Notes**

- Essential for light wallet (SPV) synchronization of Sapling shielded transactions.
- The `tree` field contains the serialized Sapling note commitment tree, which light wallets need to validate and construct shielded transactions.
- Range queries with step are useful for building periodic checkpoints.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## listcurrencies

> **Category:** Multichain | **Version:** v1.2.x+

Returns definitions for all currencies registered on the blockchain, with optional filtering by launch state, system type, or converter status.

**Syntax**
```bash
verus listcurrencies ({"query"}) (startblock) (endblock)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| query | object | optional | Filter criteria (see below) |
| startblock | int | optional | Positional param after query object. Filters to currencies defined at or after this block height |
| endblock | int | optional | Positional param after startblock. Filters to currencies defined at or before this block height |

**Query Object**
| Name | Type | Description |
|------|------|-------------|
| launchstate | string | `"prelaunch"`, `"launched"`, `"refund"`, or `"complete"` |
| systemtype | string | `"local"`, `"imported"`, `"gateway"`, or `"pbaas"` |
| fromsystem | string | System name/ID to query currencies from (default: local chain) |
| converter | array | Only return fractional converters of listed currencies, e.g. `["VRSCTEST"]` |

**Result**
Array of currency objects, each containing `currencydefinition`, `bestheight`, `besttxid`, and `bestcurrencystate`.

**Examples**

**List All Currencies**
```bash
./verus -testnet listcurrencies
## Returns all currencies on VRSCTEST (can be very long)
## Example entry:
{
  "currencydefinition": {
    "name": "VRSC-USD",
    "currencyid": "i4QdaEnkSxkAK4FRhRJcq7V7WgRN2XhzMD",
    "options": 33,
    "currencies": ["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", "iFawzbS99RqGs7J2TNxME1TmmayBGuRkA2"],
    "weights": [0.50000000, 0.50000000],
    "initialsupply": 2000000.00000000,
    ...
  },
  "bestheight": 924671,
  "bestcurrencystate": { ... }
}
```

**List Only Launched Currencies**
```bash
./verus -testnet listcurrencies '{"launchstate":"launched"}'
```

**List Converters for VRSCTEST**
```bash
./verus -testnet listcurrencies '{"converter":["VRSCTEST"]}'
## Returns only fractional baskets that hold VRSCTEST as a reserve
```

**List PBaaS Chains Only**
```bash
./verus -testnet listcurrencies '{"systemtype":"pbaas"}'
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"listcurrencies","params":[]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Enumerate all tokens** on the network
- **Find active fractional baskets** for trading with `converter` filter
- **Monitor pre-launch currencies** with `launchstate: "prelaunch"`
- **Discover imported currencies** from other chains

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Empty array `[]` | No currencies match the filter | Broaden filter criteria or omit query |
| Timeout | Too many currencies to return | Use `startblock`/`endblock` to narrow range |

**Related Commands**
- [getcurrency](getcurrency.md) — get details for a specific currency
- [getcurrencyconverters](getcurrencyconverters.md) — find conversion pairs
- [getcurrencytrust](getcurrencytrust.md) — check trust ratings

**Notes**
- Output can be very large on active networks; use filters to narrow results
- The `bestcurrencystate` in each result is equivalent to calling `getcurrencystate` for that currency
- `systemtype: "local"` returns currencies running on this chain; `"imported"` returns those from other systems

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## refundfailedlaunch

> **Category:** Multichain | **Version:** v1.2.x+

Refunds any funds sent to a chain if they are eligible for refund after a failed currency launch.

**Syntax**

```bash
refundfailedlaunch "currencyid"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `currencyid` | string | Yes | i-address or full chain name of the currency to refund contributions to |

**Result**

Returns transaction information for the refund on success. No specific result format documented.

**Examples**

**Attempt refund on a non-failed currency**

```bash
verus -testnet refundfailedlaunch "VRSCTEST"
```

**Result:**

```
error code: -8
error message: Cannot refund the specified chain
```

> This error is expected — VRSCTEST launched successfully and is not eligible for refund.

**Common Errors**

| Error | Cause |
|-------|-------|
| `Cannot refund the specified chain` | Currency launched successfully or doesn't exist |
| `Invalid currency` | Currency name or ID not recognized |

**Related Commands**

- [`definecurrency`](definecurrency.md) — Define a new currency
- [`getcurrency`](getcurrency.md) — Get currency information
- [`getcurrencystate`](getcurrencystate.md) — Get current state of a currency

**Notes**

- Only works for currencies that failed to meet their minimum preconversion threshold before launch.
- Attempts to refund **all** transactions for **all** contributors, not just the caller.
- The wallet must have the ability to sign refund transactions for the relevant addresses.
- A currency launch fails when it doesn't reach its minimum required preconversions before the start block.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## sendcurrency

> **Category:** Multichain | **Version:** v1.2.x+

The most versatile command in Verus — sends, converts, bridges, mints, and burns currency in a single operation.

**Syntax**
```bash
verus sendcurrency "fromaddress" '[{"address":"dest","amount":n,...},...]' (minconfs) (feeamount) (returntxtemplate)
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| fromaddress | string | ✅ | Source address. Wildcards: `"*"` (any), `"R*"` (transparent only), `"i*"` (identity only) |
| outputs | array | ✅ | Array of output objects (see below) |
| minconfs | int | optional | Minimum confirmations for source UTXOs (default: 1) |
| feeamount | number | optional | Custom fee amount instead of default miner fee |
| returntxtemplate | bool | optional | If true, returns unsigned tx template instead of broadcasting |
| returntxtemplate | bool | optional | If true, returns unsigned tx template instead of broadcasting |

**Output Object Fields**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | ✅ | Destination address, VerusID, or `name@chain` for cross-chain |
| amount | number | ✅ | Amount to send in source currency |
| currency | string | optional | Source currency (default: native chain currency) |
| convertto | string | optional | Currency to convert to (reserve↔fractional) |
| via | string | optional | Fractional basket to route reserve↔reserve conversions through |
| exportto | string | optional | Chain/system to export to (cross-chain send) |
| feecurrency | string | optional | Currency to pay fees in |
| refundto | string | optional | Refund address for failed pre-conversions |
| memo | string | optional | Message for z-address destinations |
| preconvert | bool | optional | Convert before currency launch (default: false) |
| burn | bool | optional | Destroy tokens (subtract from supply, token only) |
| mintnew | bool | optional | Create new tokens (must send from currency's controlling ID, centralized only) |
| addconversionfees | bool | optional | Auto-calculate extra to cover conversion fees on full amount |
| exportid | bool | optional | Export full VerusID definition cross-chain |
| exportcurrency | bool | optional | Export currency definition cross-chain |
| data | object | optional | Store large, optionally signed data in outputs |

**Result**
```
"operation-id"   (string) if returntxtemplate is false
```
Or if `returntxtemplate` is true:
```json
{
  "outputtotals": { "currencyid": amount },
  "hextx": "hexstring"
}
```

**Examples**

**Simple Send**
```bash
./verus -testnet sendcurrency "*" '[{"address":"ari@","amount":1}]'
## Sends 1 VRSCTEST from any wallet address to ari@
```

**Send a Token**
```bash
./verus -testnet sendcurrency "*" '[{"address":"ari@","amount":5,"currency":"agentplatform"}]'
## Sends 5 agentplatform tokens to ari@
```

**Convert VRSCTEST → VRSC-USD**
```bash
./verus -testnet sendcurrency "*" '[{
  "address":"ari@",
  "amount":10,
  "currency":"VRSCTEST",
  "convertto":"VRSC-USD"
}]'
## Converts 10 VRSCTEST to VRSC-USD basket tokens, sent to ari@
```

**Convert Between Reserves (VRSCTEST → USD via basket)**
```bash
./verus -testnet sendcurrency "*" '[{
  "address":"ari@",
  "amount":100,
  "currency":"VRSCTEST",
  "convertto":"USD",
  "via":"VRSC-USD"
}]'
## Converts VRSCTEST → USD through the VRSC-USD fractional basket
```

**Cross-Chain Export**
```bash
./verus -testnet sendcurrency "*" '[{
  "address":"ari@",
  "amount":10,
  "currency":"VRSCTEST",
  "exportto":"vETH",
  "feecurrency":"veth"
}]'
## Exports 10 VRSCTEST to Ethereum via the bridge
```

**Mint New Tokens (Centralized Currency)**
```bash
./verus -testnet sendcurrency "agentplatform@" '[{
  "address":"ari@",
  "amount":10,
  "currency":"agentplatform",
  "mintnew":true
}]'
## Mints 10 new agentplatform tokens (must send from controlling ID)
```

**Burn Tokens**
```bash
./verus -testnet sendcurrency "*" '[{
  "address":"ari@",
  "amount":5,
  "currency":"agentplatform",
  "burn":true
}]'
## Burns 5 agentplatform tokens, removing them from supply
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"sendcurrency","params":["*",[{"address":"ari@","amount":1}]]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Simple transfers** — send native or token currency to any address/ID
- **DEX swaps** — convert between reserves and fractional currencies
- **Cross-chain bridging** — export currency to another chain via `exportto`
- **Token minting** — create new supply for centralized (proofprotocol:2) tokens
- **Token burning** — permanently destroy tokens
- **Pre-conversion** — participate in currency launches before `startblock`

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `Insufficient funds` | Wallet doesn't have enough of the specified currency | Check balance with `getbalance` or `getcurrencybalance` |
| `Source currency cannot be converted to destination` | No valid conversion path | Use `getcurrencyconverters` to find paths; use `via` for reserve↔reserve |
| `Invalid address` | Destination address/ID not found | Verify address with `getidentity` or `validateaddress` |
| `Cannot mint currency` | Sending from wrong ID or non-centralized currency | Must send from the currency's control ID; currency must have `proofprotocol: 2` |

**Related Commands**
- [estimateconversion](estimateconversion.md) — preview conversion before sending
- [getcurrencyconverters](getcurrencyconverters.md) — find conversion pairs
- [getcurrency](getcurrency.md) — check currency details
- [getexports](getexports.md) / [getimports](getimports.md) — track cross-chain transfers

**Notes**
- **Conversions are DeFi**: all conversions in the same block get the same price (no front-running)
- The `"*"` wildcard for `fromaddress` sources funds from any wallet UTXO
- Cross-chain sends require the destination chain to be running and notarized
- `mintnew` only works with `proofprotocol: 2` (centralized) currencies
- `burn` only works with tokens, not native chain currencies
- Use `returntxtemplate: true` for offline signing or fee estimation
- Operation IDs can be tracked with `z_getoperationstatus`

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## setcurrencytrust

> **Category:** Multichain | **Version:** v1.2.x+

Sets trust ratings for currencies, controlling which currencies the wallet will sync, display, and allow spending.

**Syntax**
```bash
verus setcurrencytrust '{"clearall":bool,"setratings":[...],"removeratings":[...],"currencytrustmode":n}'
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| clearall | bool | optional | Clear all existing trust ratings before applying changes |
| setratings | array | optional | `[{"currencyid": JSONRatingObject}, ...]` — set/replace ratings for currencies |
| removeratings | array | optional | `["currencyid", ...]` — remove ratings for specified currencies |
| currencytrustmode | int | optional | 0 = spend/list all, 1 = only approved, 2 = all except blocked |

**Result**
No return on success; error on failure.

**Examples**

**Set Trust Mode to Allowlist**
```bash
./verus -testnet setcurrencytrust '{"currencytrustmode":1}'
## Now only currencies explicitly rated as approved will be shown/spendable
```

**Approve a Specific Currency**
```bash
./verus -testnet setcurrencytrust '{"setratings":[{"i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW":{"trustlevel":1}}]}'
## Approves agentplatform token
```

**Remove a Rating**
```bash
./verus -testnet setcurrencytrust '{"removeratings":["i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW"]}'
```

**Reset All Trust Settings**
```bash
./verus -testnet setcurrencytrust '{"clearall":true,"currencytrustmode":0}'
## Clears all ratings and sets mode to unrestricted
```

**RPC (curl)**
```bash
curl --user user1445741888:pass... --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"setcurrencytrust","params":[{"currencytrustmode":0}]}' \
  -H 'content-type: text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- **Filter spam tokens** — set mode 2 and block unwanted currencies
- **Curated wallet** — set mode 1 and only approve known currencies
- **Reset to defaults** — clearall + mode 0

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| Invalid parameters | Malformed JSON or invalid currency ID | Check JSON syntax and verify currency IDs |

**Related Commands**
- [getcurrencytrust](getcurrencytrust.md) — view current trust settings
- [listcurrencies](listcurrencies.md) — see available currencies

**Notes**
- Trust settings are wallet-local only — they don't affect the blockchain
- Mode 1 (allowlist) is the most restrictive — only explicitly approved currencies work
- Mode 2 (blocklist) is moderate — everything works except explicitly blocked
- These settings affect `listcurrencies` output and spending ability

**Tested On**
- VRSCTEST block height: 926963
- Verus version: 1.2.14-2

---

## submitacceptednotarization

> **Category:** Multichain | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Finishes an almost complete notarization transaction based on the notary chain and current wallet.

**Syntax**

```bash
submitacceptednotarization "{earnednotarization}" "{notaryevidence}" sourceoffunds
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `earnednotarization` | object | Yes | Notarization earned on the other system, basis for this submission |
| 2 | `notaryevidence` | object | Yes | Evidence and notary signatures validating the notarization |
| 3 | `sourceoffunds` | string | No | Valid source of funds to enable privacy when notarizing multiple PBaaS chains |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `txid` | string | Transaction ID of submitted transaction, or NULL on failure |

**Examples**

```bash
verus -testnet submitacceptednotarization "{earnednotarization}" "{notaryevidence}" "sourceoffunds"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid notarization | The earned notarization object is malformed or invalid |
| Insufficient funds | Wallet cannot cover transaction fees |

**Related Commands**

- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data
- [`getnotarizationproofs`](getnotarizationproofs.md) — Get notarization proofs
- [`submitchallenges`](submitchallenges.md) — Submit evidence challenges

**Notes**

- Used by notary nodes to submit cross-chain notarizations.
- The `sourceoffunds` parameter allows privacy by using a specific funding address when notarizing multiple chains.
- Submission is subject to consensus rules — invalid notarizations will be rejected.
- Typically called by automated bridge/notary software, not end users.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — requires active notary node setup

---

## submitchallenges

> **Category:** Multichain | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Submits cryptographic challenges to existing, unconfirmed notarizations, proving the existence of an alternate chain.

**Syntax**

```bash
submitchallenges '[challengeobjects, ...]'
```

**Parameters**

Array of challenge objects:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `"vrsc::evidence.skipchallenge"` or `"vrsc::evidence.validitychallenge"` |
| `notarizationref` | object | Yes | `{"txid":"hex","voutnum":n}` — reference to the notarization being challenged |
| `forkroot` | object | No | Fork root proof |
| `challengeroot` | object | Yes | Challenge proof root |
| `evidence` | object | Yes | CNotaryEvidence supporting the challenge |

**Result**

Array of results:

| Field | Type | Description |
|-------|------|-------------|
| `txid` | string | Transaction ID of submitted challenge |
| `error` | string | Error string if challenge submission failed |

**Examples**

```bash
verus -testnet submitchallenges '[{"notarizationref":{"txid":"hexvalue","voutnum":0},"challengeroot":{},"evidence":{}}]'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Insufficient funds | Wallet lacks funds for challenge transaction fees |
| Invalid notarization reference | Referenced notarization doesn't exist or is already confirmed |

**Related Commands**

- [`getnotarizationproofs`](getnotarizationproofs.md) — Get proofs for challenges
- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data
- [`submitacceptednotarization`](submitacceptednotarization.md) — Submit a notarization

**Notes**

- Part of Verus's decentralized cross-chain dispute resolution system.
- Does not require the alternate chain to have more power — only that it moved forward multiple blocks since the prior notarization.
- Requires the local wallet to have funds for transaction fees.
- Challenge types: `skipchallenge` (i-addr: `iCwxpRL6h3YeCRtGjgQSsqoKdZCuM4Dxaf`) and `validitychallenge` (i-addr: `iCPb8ywQna7jYV2SHrGZ6vQMj7kuyWFxvb`).

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — requires active cross-chain notarization disputes

---

## submitimports

> **Category:** Multichain | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Accepts a set of exports from another system to post to the current network.

**Syntax**

```bash
submitimports '{"sourcesystemid":"systemid","notarizationtxid":"txid","notarizationtxoutnum":n,"exports":[...]}'
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourcesystemid` | string | Yes | System ID of the source chain |
| `notarizationtxid` | string | Yes | Transaction ID of the notarization backing these imports |
| `notarizationtxoutnum` | int | Yes | Output number of the notarization transaction |
| `exports` | array | Yes | Array of export objects |

**Export object fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `height` | int | Yes | Block height of the export |
| `txid` | string | Yes | Transaction ID of the export |
| `txoutnum` | int | Yes | Output number |
| `partialtransactionproof` | string | Yes | Hex-encoded partial transaction proof |
| `transfers` | array | Yes | Array of transfer objects |

**Result**

Array of objects:

| Field | Type | Description |
|-------|------|-------------|
| `currency` | string | Currency ID |
| `txid` | string | Transaction ID of the submitted import |
| `txoutnum` | int | Output number |

**Examples**

```bash
verus -testnet submitimports '{"sourcesystemid":"systemid","notarizationtxid":"txid","notarizationtxoutnum":0,"exports":[{"height":100,"txid":"hexid","txoutnum":0,"partialtransactionproof":"hexstr","transfers":[]}]}'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid source system | Source system ID is not recognized |
| Invalid notarization | Referenced notarization doesn't exist or is invalid |
| Proof verification failed | Partial transaction proof cannot be verified |

**Related Commands**

- [`getlastimportfrom`](getlastimportfrom.md) — Get last import from a system
- [`getnotarizationdata`](getnotarizationdata.md) — Get notarization data
- [`submitacceptednotarization`](submitacceptednotarization.md) — Submit a notarization

**Notes**

- Used by bridge nodes to relay cross-chain transfers.
- Each export must include a valid partial transaction proof that can be verified against the referenced notarization.
- Typically called by automated bridge software, not end users.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — requires active cross-chain bridge setup