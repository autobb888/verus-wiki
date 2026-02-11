---
label: Address Index
icon: terminal
---


# Address Index Commands


---

## getaddressbalance

> **Category:** Addressindex | **Version:** v1.2.14+

Returns the balance for one or more addresses. Requires `-addressindex=1` to be enabled.

**Syntax**

```
getaddressbalance {"addresses": ["address", ...], "friendlynames": bool}
```

**Parameters**

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| addresses     | array   | Yes      | Array of base58check encoded addresses |
| friendlynames | boolean | No       | Include friendly names keyed by currency i-addresses |

**Result**

```json
{
  "balance": 0,
  "received": 0,
  "currencybalance": {
    "iCurrencyID": 0.00000000
  },
  "currencyreceived": {
    "iCurrencyID": 0.00000000
  }
}
```

| Field    | Type    | Description |
|----------|---------|-------------|
| balance  | numeric | Current balance in satoshis |
| received | numeric | Total satoshis received (including change) |
| currencybalance | object | Per-currency balances keyed by currency i-address (values in currency units, not satoshis) |
| currencyreceived | object | Per-currency total received keyed by currency i-address (values in currency units) |

**Examples**

```bash
verus -testnet getaddressbalance '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Testnet output (address with multi-currency balance):**
```json
{
  "balance": 5288370000,
  "received": 52814070000,
  "currencybalance": {
    "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW": 109.99000000,
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 52.88370000
  },
  "currencyreceived": {
    "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW": 109.99000000,
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 528.14070000
  }
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |
| `Invalid address` | Malformed address string |

**Related Commands**

- [`getaddressutxos`](getaddressutxos.md) — Get unspent outputs for an address
- [`getaddressdeltas`](getaddressdeltas.md) — Get all changes for an address
- [`getaddresstxids`](getaddresstxids.md) — Get transaction IDs for an address

**Notes**

- Requires the daemon to be started with `-addressindex=1`.
- Balance is returned in satoshis (1 VRSC = 100,000,000 satoshis).
- Can query multiple addresses at once — balances are aggregated.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (addressindex enabled)

---

## getaddressdeltas

> **Category:** Addressindex | **Version:** v1.2.14+

Returns all changes (deltas) for an address. Requires `-addressindex=1`.

**Syntax**

```
getaddressdeltas {"addresses": ["address"], "start": n, "end": n, "chaininfo": bool, "friendlynames": bool, "verbosity": n, "vdxftag": "string"}
```

**Parameters**

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| addresses     | array   | Yes      | Array of base58check encoded addresses |
| start         | number  | No       | Start block height |
| end           | number  | No       | End block height |
| chaininfo     | boolean | No       | Include chain info (only with start/end) |
| friendlynames | boolean | No       | Include friendly names keyed by currency i-addresses |
| verbosity     | number  | No       | 0 (default) or 1 (include output info with reserve amounts) |
| vdxftag       | string  | No       | Optional X-address (indexId) to filter by VDXF tag |

**Result**

```json
[
  {
    "satoshis": 0,
    "txid": "...",
    "index": 0,
    "height": 0,
    "address": "..."
  }
]
```

**Examples**

```bash
verus -testnet getaddressdeltas '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"], "start": 926980, "end": 926990}'
```

**Testnet output:**
```json
[]
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |

**Related Commands**

- [`getaddressbalance`](getaddressbalance.md) — Current balance
- [`getaddresstxids`](getaddresstxids.md) — Just transaction IDs
- [`getaddressmempool`](getaddressmempool.md) — Mempool-only deltas

**Notes**

- Use `start` and `end` to limit the block range and improve performance.
- Positive `satoshis` = received, negative = spent.
- The `vdxftag` filter is useful for querying VDXF-tagged outputs.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getaddressmempool

> **Category:** Addressindex | **Version:** v1.2.14+

Returns all mempool deltas for an address. Requires `-addressindex=1`.

**Syntax**

```
getaddressmempool {"addresses": ["address"], "friendlynames": bool, "verbosity": n}
```

**Parameters**

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| addresses     | array   | Yes      | Array of base58check encoded addresses |
| friendlynames | boolean | No       | Include friendly names keyed by currency i-addresses |
| verbosity     | number  | No       | 0 (default) or 1 (include output info) |

**Result**

```json
[
  {
    "address": "...",
    "txid": "...",
    "index": 0,
    "satoshis": 0,
    "timestamp": 0,
    "prevtxid": "...",
    "prevout": "..."
  }
]
```

**Examples**

```bash
verus -testnet getaddressmempool '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Testnet output:**
```json
[]
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |

**Related Commands**

- [`getaddressdeltas`](getaddressdeltas.md) — Confirmed deltas
- [`getaddressbalance`](getaddressbalance.md) — Current confirmed balance

**Notes**

- Only shows unconfirmed (mempool) transactions.
- `prevtxid` and `prevout` are present for spending transactions.
- Empty result means no pending mempool transactions for the address.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getaddresstxids

> **Category:** Addressindex | **Version:** v1.2.14+

Returns the transaction IDs for one or more addresses. Requires `-addressindex=1`.

**Syntax**

```
getaddresstxids {"addresses": ["address"], "start": n, "end": n}
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| addresses | array  | Yes      | Array of base58check encoded addresses |
| start     | number | No       | Start block height |
| end       | number | No       | End block height |

**Result**

```json
[
  "transactionid",
  ...
]
```

**Examples**

```bash
verus -testnet getaddresstxids '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Testnet output:**
```json
[]
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |

**Related Commands**

- [`getaddressbalance`](getaddressbalance.md) — Balance summary
- [`getaddressdeltas`](getaddressdeltas.md) — Full delta details
- [`getaddressutxos`](getaddressutxos.md) — Unspent outputs

**Notes**

- Use `start`/`end` to limit the block range for large address histories.
- Returns deduplicated transaction IDs.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getaddressutxos

> **Category:** Addressindex | **Version:** v1.2.14+

Returns all unspent outputs for one or more addresses. Requires `-addressindex=1`.

**Syntax**

```
getaddressutxos {"addresses": ["address"], "chaininfo": bool, "friendlynames": bool, "verbosity": n}
```

**Parameters**

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| addresses     | array   | Yes      | Array of base58check encoded addresses |
| chaininfo     | boolean | No       | Include chain info with results |
| friendlynames | boolean | No       | Include friendly names keyed by currency i-addresses |
| verbosity     | number  | No       | 0 (default) or 1 (include detailed output info) |

**Result**

```json
[
  {
    "address": "...",
    "txid": "...",
    "height": 0,
    "outputIndex": 0,
    "script": "...",
    "satoshis": 0
  }
]
```

**Examples**

```bash
verus -testnet getaddressutxos '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Testnet output:**
```json
[]
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |

**Related Commands**

- [`getaddressbalance`](getaddressbalance.md) — Aggregated balance
- [`getaddresstxids`](getaddresstxids.md) — Transaction IDs only
- [`getaddressdeltas`](getaddressdeltas.md) — All changes including spent

**Notes**

- Returns only unspent outputs (UTXOs), not spent ones.
- `script` is the hex-encoded scriptPubKey.
- `satoshis` values can be used to construct raw transactions.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getsnapshot

> **Category:** Addressindex | **Version:** v1.2.14+

Returns a snapshot of (address, amount) pairs at the current height. Requires `-addressindex=1`.

**Syntax**

```
getsnapshot (top)
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| top       | number  | No       | Only return this many addresses (top N richlist) |

**Result**

```json
{
  "addresses": [
    {
      "addr": "RMEBhzvATA8mrfVK82E5TgPzzjtaggRGN3",
      "amount": "100.0"
    }
  ],
  "total": 123.45,
  "average": 61.7,
  "utxos": 14,
  "total_addresses": 2,
  "start_height": 91,
  "ending_height": 91,
  "start_time": 1531982752,
  "end_time": 1531982752
}
```

| Field           | Type    | Description |
|-----------------|---------|-------------|
| addresses       | array   | List of address/amount pairs |
| total           | numeric | Total amount in snapshot |
| average         | numeric | Average amount per address |
| utxos           | number  | Total number of UTXOs |
| total_addresses | number  | Total number of addresses |
| start_height    | number  | Block height when snapshot began |
| ending_height   | number  | Block height when snapshot finished |
| start_time      | number  | Unix epoch time snapshot started |
| end_time        | number  | Unix epoch time snapshot finished |

**Examples**

```bash
## Get top 5 addresses by balance
verus -testnet getsnapshot 5

## Get full snapshot (can be very slow on large chains)
verus -testnet getsnapshot
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Addressindex not enabled` | Node not started with `-addressindex=1` |

**Related Commands**

- [`getaddressbalance`](getaddressbalance.md) — Balance for specific addresses
- [`getaddressutxos`](getaddressutxos.md) — UTXOs for specific addresses

**Notes**

- ⚠️ **Performance warning**: Without the `top` parameter, this scans the entire UTXO set and can take a very long time on chains with many addresses.
- Useful for generating richlist data or distribution analysis.
- The snapshot is taken at the current block height.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2
- Note: Full snapshot timed out due to large UTXO set; use `top` parameter for practical use.