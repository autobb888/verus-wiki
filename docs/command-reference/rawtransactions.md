---
label: Raw Transactions
icon: terminal
---


# Raw Transactions Commands


---

## createrawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Create a transaction spending the given inputs and sending to the given addresses. Returns a hex-encoded raw transaction. The transaction is **not signed** and is **not stored** in the wallet or transmitted to the network.

**Syntax**

```
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,...} (locktime) (expiryheight)
```

**Parameters**

| Parameter    | Type    | Required | Description |
|--------------|---------|----------|-------------|
| transactions | array   | Yes      | Array of input objects with `txid`, `vout`, and optional `sequence` |
| addresses    | object  | Yes      | Object with addresses as keys and amounts as values |
| locktime     | numeric | No       | Raw locktime (default 0). Non-0 also locktime-activates inputs |
| expiryheight | numeric | No       | Expiry height (default: nextblockheight+40 post-Blossom) |

**Address object format**

```json
{
  "address": 0.01,
  "address": {"currency": 0.01},
  "data": "hex"
}
```

**Result**

| Type   | Description |
|--------|-------------|
| string | Hex string of the unsigned raw transaction |

**Examples**

```bash
verus -testnet createrawtransaction '[{"txid":"myid","vout":0}]' '{"myaddress":0.01}'

## With OP_RETURN data
verus -testnet createrawtransaction '[{"txid":"myid","vout":0}]' '{"myaddress":0.01,"data":"00010203"}'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid parameter` | Malformed JSON input |
| `Invalid Verus address` | Invalid destination address |

**Related Commands**

- [`fundrawtransaction`](fundrawtransaction.md) — Add inputs to fund the transaction
- [`signrawtransaction`](signrawtransaction.md) — Sign the transaction
- [`sendrawtransaction`](sendrawtransaction.md) — Broadcast signed transaction
- [`decoderawtransaction`](decoderawtransaction.md) — Inspect the raw transaction

**Notes**

- This creates an **unsigned** transaction. Use `signrawtransaction` before broadcasting.
- Typical workflow: `createrawtransaction` → `fundrawtransaction` → `signrawtransaction` → `sendrawtransaction`.
- The `data` key creates an OP_RETURN output.
- Supports multi-currency outputs via the object value format.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help; not executed to avoid creating transactions)

---

## decoderawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Return a JSON object representing the serialized, hex-encoded transaction.

**Syntax**

```
decoderawtransaction "hexstring"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hex       | string | Yes      | The transaction hex string |

**Result**

| Field          | Type    | Description |
|----------------|---------|-------------|
| txid           | string  | The transaction id |
| overwintered   | boolean | The Overwintered flag |
| version        | numeric | The version |
| versiongroupid | string  | Version group id (Overwintered txs) |
| locktime       | numeric | The lock time |
| expiryheight   | numeric | Last valid block height for mining (Overwintered txs) |
| vin            | array   | Array of inputs |
| vout           | array   | Array of outputs |
| vjoinsplit     | array   | JoinSplit data (version >= 2) |

**Examples**

```bash
## First get a raw transaction hex
verus -testnet getrawtransaction "1f345eb81bfc9b349b39fbb87edf284c565084bacc5a7f75113ab0dcf47ee7d8"

## Then decode it
verus -testnet decoderawtransaction "0400008085202f890206d5c092..."
```

**Testnet output (truncated):**
```json
{
  "txid": "1f345eb81bfc9b349b39fbb87edf284c565084bacc5a7f75113ab0dcf47ee7d8",
  "overwintered": true,
  "version": 4,
  "versiongroupid": "892f2085",
  "locktime": 0,
  "expiryheight": 926685,
  "vin": [
    {
      "txid": "0099668458e75500a75422ff5dc5e1236da73e5624939bb47431c8a792c0d506",
      "vout": 0,
      "addresses": ["iHErKKqAxAyBPaaf4MphkYFctDamXxTA2Y"],
      "scriptSig": { "asm": "...", "hex": "..." },
      "value": 0.00000000,
      "sequence": 4294967295
    }
  ],
  "vout": [...]
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `TX decode failed` | Invalid or corrupted hex string |

**Related Commands**

- [`getrawtransaction`](getrawtransaction.md) — Get raw hex from a txid
- [`decodescript`](decodescript.md) — Decode a script
- [`createrawtransaction`](createrawtransaction.md) — Create raw transactions

**Notes**

- Read-only operation — does not modify the wallet or blockchain.
- Useful for inspecting transactions before signing or broadcasting.
- The `addresses` field in `vin` shows the spending addresses.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## decodescript

> **Category:** Rawtransactions | **Version:** v1.2.14+

Decode a hex-encoded script.

**Syntax**

```
decodescript "hex"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hex       | string | Yes      | The hex encoded script |

**Result**

```json
{
  "asm": "asm",
  "hex": "hex",
  "type": "type",
  "reqSigs": 1,
  "addresses": ["address"],
  "p2sh": "address"
}
```

| Field          | Type    | Description |
|----------------|---------|-------------|
| asm            | string  | Script public key in assembly |
| hex            | string  | Hex encoded public key |
| type           | string  | Output type (e.g., pubkeyhash, scripthash, multisig) |
| spendableoutput| boolean | Whether the output is spendable |
| reqSigs        | numeric | Required signatures |
| addresses      | array   | Decoded addresses |
| p2sh           | string  | P2SH address wrapping this script |

**Examples**

```bash
## Decode a standard P2PKH script
verus -testnet decodescript "76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac"
```

**Testnet output:**
```json
{
  "type": "pubkeyhash",
  "spendableoutput": true,
  "reqSigs": 1,
  "addresses": [
    "RMq8TyhrWAY76qY2EUcQfxW7GhNpnwvsSC"
  ],
  "p2sh": "bS8xsSnoTMoWXr26adY8pZwyLvadMh3nWr"
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Argument must be hexadecimal` | Non-hex characters in input |

**Related Commands**

- [`decoderawtransaction`](decoderawtransaction.md) — Decode a full transaction
- [`createrawtransaction`](createrawtransaction.md) — Create raw transactions

**Notes**

- Useful for analyzing scripts from transaction outputs.
- The `p2sh` field shows what the P2SH address would be if this script were wrapped.
- `spendableoutput` indicates if the script type is recognized as spendable.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## fundrawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Add inputs to a transaction until it has enough value to meet its output value. Adds one change output to the outputs. Existing inputs are not modified.

**Syntax**

```
fundrawtransaction "hexstring" '[utxos]' (changeaddress) (explicitfee)
```

**Parameters**

| Parameter     | Type   | Required | Description |
|---------------|--------|----------|-------------|
| hexstring     | string | Yes      | Hex string of the raw transaction |
| objectarray   | array  | No       | UTXOs to select from for funding |
| changeaddress | string | No       | Address to send change to |
| explicitfee   | number | No       | Use this fee instead of default (only with UTXO list) |

**Result**

```json
{
  "hex": "value",
  "fee": 0.0001,
  "changepos": 1
}
```

| Field     | Type    | Description |
|-----------|---------|-------------|
| hex       | string  | The resulting funded raw transaction (hex) |
| fee       | numeric | The fee added to the transaction |
| changepos | numeric | Position of the added change output, or -1 |

**Examples**

```bash
## Create an empty transaction
verus -testnet createrawtransaction "[]" '{"myaddress":0.01}'

## Fund it
verus -testnet fundrawtransaction "rawtransactionhex"

## Sign it
verus -testnet signrawtransaction "fundedtransactionhex"

## Send it
verus -testnet sendrawtransaction "signedtransactionhex"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Insufficient funds` | Wallet doesn't have enough balance |
| `TX decode failed` | Invalid hex string |

**Related Commands**

- [`createrawtransaction`](createrawtransaction.md) — Create the initial transaction
- [`signrawtransaction`](signrawtransaction.md) — Sign after funding
- [`sendrawtransaction`](sendrawtransaction.md) — Broadcast signed transaction

**Notes**

- Inputs added by this command are **not signed** — use `signrawtransaction` afterward.
- Previously signed inputs may need to be re-signed since inputs/outputs have been modified.
- The optional UTXO list allows controlling which inputs are used for funding.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help)

---

## getrawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Return the raw transaction data. If verbose=0, returns hex-encoded data. If verbose is non-zero, returns a JSON object with transaction details.

**Syntax**

```
getrawtransaction "txid" (verbose)
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| txid      | string  | Yes      | The transaction id |
| verbose   | numeric | No       | 0 (default) returns hex string; non-zero returns JSON object |

**Result**

**If verbose=0:** hex-encoded transaction string.

**If verbose>0:** JSON object with `txid`, `version`, `vin`, `vout`, `blockhash`, `confirmations`, `time`, `blocktime`, and more.

**Examples**

```bash
## Get raw hex
verus -testnet getrawtransaction "1f345eb81bfc9b349b39fbb87edf284c565084bacc5a7f75113ab0dcf47ee7d8"
```

**Testnet output (truncated):**
```
0400008085202f890206d5c092a7c83174b49b9324563ea76d23e1c55dff2254a70055e758846699...
```

```bash
## Get verbose JSON
verus -testnet getrawtransaction "1f345eb81bfc9b349b39fbb87edf284c565084bacc5a7f75113ab0dcf47ee7d8" 1
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `No information available about transaction` | Transaction not in mempool and no unspent output exists (need `-txindex`) |
| `Invalid or non-wallet transaction id` | Malformed txid |

**Related Commands**

- [`decoderawtransaction`](decoderawtransaction.md) — Decode raw hex to JSON
- [`sendrawtransaction`](sendrawtransaction.md) — Broadcast a transaction

**Notes**

- By default, this only works for transactions in the mempool or with unspent outputs.
- To query any transaction, start the node with `-txindex` command line option.
- Verbose mode (1) returns the same data as `decoderawtransaction` plus block info.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## sendrawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Submits a raw transaction (serialized, hex-encoded) to the local node and network.

**Syntax**

```
sendrawtransaction "hexstring" (allowhighfees)
```

**Parameters**

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| hexstring     | string  | Yes      | The hex string of the signed raw transaction |
| allowhighfees | boolean | No       | Allow high fees (default: false) |

**Result**

| Type   | Description |
|--------|-------------|
| string | The transaction hash in hex |

**Examples**

```bash
## Typical workflow
verus -testnet createrawtransaction '[{"txid":"mytxid","vout":0}]' '{"myaddress":0.01}'
verus -testnet signrawtransaction "myhex"
verus -testnet sendrawtransaction "signedhex"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `TX decode failed` | Invalid hex string |
| `Missing inputs` | Referenced inputs don't exist or are already spent |
| `Transaction already in block chain` | Transaction was already confirmed |
| `absurdly-high-fee` | Fee exceeds safety threshold (use `allowhighfees` to override) |
| `16: mandatory-script-verify-flag-failed` | Transaction not properly signed |

**Related Commands**

- [`createrawtransaction`](createrawtransaction.md) — Create the transaction
- [`signrawtransaction`](signrawtransaction.md) — Sign before sending
- [`fundrawtransaction`](fundrawtransaction.md) — Add inputs for funding

**Notes**

- The transaction must be fully signed before broadcasting.
- Typical workflow: `createrawtransaction` → `fundrawtransaction` → `signrawtransaction` → `sendrawtransaction`.
- Use `allowhighfees=true` to bypass the high-fee safety check.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help; not executed)

---

## signrawtransaction

> **Category:** Rawtransactions | **Version:** v1.2.14+

Sign inputs for a raw transaction (serialized, hex-encoded).

**Syntax**

```
signrawtransaction "hexstring" ([prevtxs]) ([privatekeys]) (sighashtype) (branchid)
```

**Parameters**

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| hexstring   | string | Yes      | The transaction hex string |
| prevtxs     | array  | No       | Previous dependent transaction outputs (or null) |
| privatekeys | array  | No       | Private keys for signing (or null to use wallet) |
| sighashtype | string | No       | Signature hash type (default: ALL) |
| branchid    | string | No       | Hex consensus branch id to sign with |

**Sighash types**

`ALL`, `NONE`, `SINGLE`, `ALL|ANYONECANPAY`, `NONE|ANYONECANPAY`, `SINGLE|ANYONECANPAY`

**prevtxs format**

```json
[
  {
    "txid": "id",
    "vout": 0,
    "scriptPubKey": "hex",
    "redeemScript": "hex",
    "amount": 0.01
  }
]
```

**Result**

```json
{
  "hex": "value",
  "complete": true,
  "errors": []
}
```

| Field    | Type    | Description |
|----------|---------|-------------|
| hex      | string  | The signed raw transaction hex |
| complete | boolean | Whether all inputs are fully signed |
| errors   | array   | Script verification errors (if any) |

**Examples**

```bash
verus -testnet signrawtransaction "myhex"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Input not found or already spent` | Referenced UTXO doesn't exist |
| `Unable to sign input, invalid stack size` | Script requires keys not in wallet |

**Related Commands**

- [`createrawtransaction`](createrawtransaction.md) — Create the transaction
- [`fundrawtransaction`](fundrawtransaction.md) — Add funding inputs
- [`sendrawtransaction`](sendrawtransaction.md) — Broadcast after signing

**Notes**

- If no private keys are provided, the wallet's keys are used.
- Check `complete` in the result — if false, more signatures are needed (e.g., multisig).
- The `branchid` parameter allows signing with consensus rules ahead of the node's current height.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help)