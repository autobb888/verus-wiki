---
label: Marketplace
icon: terminal
---


# Marketplace Commands


---

## closeoffers

> **Category:** Marketplace | **Version:** v1.2.x+

Closes all listed offers if they are still valid and belong to this wallet. Always closes expired offers, even if no parameters are given.

**Syntax**

```bash
closeoffers ('["txid1","txid2",...]') (transparentorprivatefundsdestination) (privatefundsdestination)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `offerids` | array | No | Array of hex transaction IDs of offers to close. If omitted, closes all expired offers. |
| 2 | `transparentorprivatefundsdestination` | string | No | Transparent or private address for closing funds |
| 3 | `privatefundsdestination` | string | No | Private (Sapling) address for native funds only |

**Result**

Returns `null` on success.

**Examples**

**Close all expired offers**

```bash
verus -testnet closeoffers
```

**Close specific offers**

```bash
verus -testnet closeoffers '["1a6d5dd71172c02c825984c77b0ffe2c1234af8823a13be8576f2309eca38ce7"]'
```

**Close offers with specific fund destination**

```bash
verus -testnet closeoffers '["txid1"]' "RMyTransparentAddress"
```

**Close with separate private fund destination**

```bash
verus -testnet closeoffers '["txid1"]' "RTransparentAddr" "zs1privateaddr..."
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Offer not found | Transaction ID doesn't reference a valid offer |
| Not your offer | Offer doesn't belong to the current wallet |

**Related Commands**

- [`makeoffer`](#makeoffer) — Create an offer
- [`listopenoffers`](#listopenoffers) — List wallet's open offers
- [`getoffers`](#getoffers) — List offers for a currency/identity
- [`takeoffer`](#takeoffer) — Accept an offer

**Notes**

- **Always run periodically** to reclaim funds locked in expired offers.
- When called with no arguments, automatically closes all expired offers in the wallet.
- Funds can be directed to both transparent and private (Sapling) addresses.
- The separate `privatefundsdestination` is for native currency only; other assets go to the first destination.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## getoffers

> **Category:** Marketplace | **Version:** v1.2.x+

Returns all open offers for a specific currency or identity.

**Syntax**

```bash
getoffers "currencyorid" (iscurrency) (withtx)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `currencyorid` | string | Yes | Currency or identity to check for offers (both sale and purchase) |
| 2 | `iscurrency` | bool | No | Default `false`. If `false`, looks for ID offers; if `true`, currency offers |
| 3 | `withtx` | bool | No | Default `false`. If `true`, returns serialized hex of the exchange transaction for signing |

**Result**

Returns all available offers for or in the indicated currency or ID, organized by offer type.

**Examples**

**Get currency offers for VRSCTEST**

```bash
verus -testnet getoffers "VRSCTEST" true
```

**Result:**

```json
{
  "currency_iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq_for_ids": [
    {
      "identityid": "iNZzqYdmfCPCcVSTBjbPT8Q7rqeFohxATu",
      "price": 1.50000000,
      "offer": {
        "offer": {
          "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 1.50000000
        },
        "accept": {
          "name": "kneipe",
          "identityid": "iNZzqYdmfCPCcVSTBjbPT8Q7rqeFohxATu",
          "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
          "original": 1
        },
        "blockexpiry": 999999,
        "txid": "1a6d5dd71172c02c825984c77b0ffe2c1234af8823a13be8576f2309eca38ce7"
      }
    },
    {
      "identityid": "iJJ7Ge6eyaqHq7F62kf7vEDYgo1mdtBd4S",
      "price": 10.00000000,
      "offer": {
        "offer": {
          "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 10.00000000
        },
        "accept": {
          "name": "i made this for you",
          "identityid": "iJJ7Ge6eyaqHq7F62kf7vEDYgo1mdtBd4S",
          "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
          "original": 1
        },
        "blockexpiry": 40000000,
        "txid": "832a488e1ea5282825e44e1c016c2b110f31d840abeb191ee8f0e4f0bba8f59e"
      }
    }
  ]
}
```

> The result shows VRSCTEST currency being offered to purchase VerusID identities like "kneipe" and "i made this for you".

**Get identity offers (default)**

```bash
verus -testnet getoffers "someid@" false
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Identity specified as source is not valid` | Invalid identity name or ID when `iscurrency=false` |
| Invalid currency | Currency name or ID not recognized when `iscurrency=true` |

**Related Commands**

- [`makeoffer`](#makeoffer) — Create an offer
- [`takeoffer`](#takeoffer) — Accept an offer
- [`listopenoffers`](#listopenoffers) — List wallet's open offers
- [`closeoffers`](#closeoffers) — Close/cancel offers

**Notes**

- Results are organized by offer direction (e.g., `currency_X_for_ids` shows currency offers wanting to buy identities).
- The `blockexpiry` field shows when each offer expires.
- Use `withtx=true` to get the raw transaction hex needed for `takeoffer` with the `tx` parameter.
- The `price` field shows the amount being offered.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## listopenoffers

> **Category:** Marketplace | **Version:** v1.2.x+

Shows offers outstanding in the current wallet.

**Syntax**

```bash
listopenoffers (unexpired) (expired)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `unexpired` | bool | No | Default `true`. List offers that are not yet expired |
| 2 | `expired` | bool | No | Default `true`. List offers that have expired |

**Result**

Returns all open offers belonging to this wallet, both unexpired and expired (based on filters).

**Examples**

**List all wallet offers**

```bash
verus -testnet listopenoffers
```

**Result (wallet with no offers):**

*(No output — the daemon returns empty/whitespace with no JSON when there are no offers. This is a daemon quirk; there is no empty array or object returned.)*

**List only unexpired offers**

```bash
verus -testnet listopenoffers true false
```

**List only expired offers**

```bash
verus -testnet listopenoffers false true
```

**Common Errors**

No specific errors — returns empty if no offers exist.

**Related Commands**

- [`makeoffer`](#makeoffer) — Create an offer
- [`getoffers`](#getoffers) — List offers for a specific currency/identity
- [`closeoffers`](#closeoffers) — Close/cancel open offers
- [`takeoffer`](#takeoffer) — Accept an offer

**Notes**

- Only shows offers created by the current wallet.
- Use `getoffers` to see all offers on the network for a specific asset.
- Expired offers should be closed with `closeoffers` to reclaim funds.
- By default both unexpired and expired offers are shown.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990

---

## makeoffer

> **Category:** Marketplace | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Creates a fully decentralized, on-chain atomic swap offer for any blockchain asset including currencies, NFTs, identities, and contractual agreements.

**Syntax**

```bash
makeoffer fromaddress '{"changeaddress":"addr","expiryheight":n,"offer":{...},"for":{...}}' (returntx) (feeamount)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `fromaddress` | string | Yes | VerusID or wildcard address (`"*"`, `"R*"`, `"i*"`) to send funds from |
| 2 | `offerparams` | object | Yes | Offer parameters (see below) |
| 3 | `returntx` | bool | No | Default `false`. If `true`, returns unsigned hex transaction instead of posting |
| 4 | `feeamount` | number | No | Default `0.0001`. Custom fee amount |

**Offer parameters object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `changeaddress` | string | Yes | Change destination for constructing transactions |
| `expiryheight` | int | No | Block height at which offer expires. Default: current + 20 blocks (~20 min) |
| `offer` | object | Yes | What you're offering — currency amount or identity |
| `for` | object | Yes | What you want in return — currency amount or identity definition |

**Offer/For as currency**

```json
{"currency": "currencynameorid", "amount": 10.0}
```

**Offer/For as identity**

```json
{"identity": "idnameoriaddress"}
```

**For as new identity (auction/purchase)**

```json
{"name": "identityname", "parent": "parentid", "primaryaddresses": ["R-address"], "minimumsignatures": 1}
```

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `txid` | string | Transaction ID on success (when `returntx` is false) |
| `hex` | string | Serialized partial transaction (when `returntx` is true) |

**Examples**

**Offer 10 VRSCTEST for an identity**

```bash
verus -testnet makeoffer "*" '{"changeaddress":"RChangeAddr","expiryheight":927100,"offer":{"currency":"VRSCTEST","amount":10},"for":{"name":"targetid","parent":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","primaryaddresses":["RPrimaryAddr"],"minimumsignatures":1}}'
```

**Offer an identity for VRSCTEST**

```bash
verus -testnet makeoffer "i*" '{"changeaddress":"RChangeAddr","offer":{"identity":"myid@"},"for":{"address":"RReceiverAddr","currency":"VRSCTEST","amount":5}}'
```

**Get unsigned transaction (for review)**

```bash
verus -testnet makeoffer "*" '{"changeaddress":"RChangeAddr","offer":{"currency":"VRSCTEST","amount":1},"for":{"currency":"Bridge.vETH","amount":0.01}}' true
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Insufficient funds | Wallet doesn't have enough of the offered asset |
| Invalid identity | Specified identity doesn't exist or isn't controlled by wallet |
| Invalid currency | Currency name or ID not recognized |
| Invalid change address | Change address is not valid |

**Related Commands**

- [`takeoffer`](#takeoffer) — Accept an existing offer
- [`getoffers`](#getoffers) — List offers for a currency or identity
- [`listopenoffers`](#listopenoffers) — List wallet's open offers
- [`closeoffers`](#closeoffers) — Close/cancel open offers

**Notes**

- Offers are **fully on-chain** and **atomic** — either both sides complete or neither does.
- Can swap any combination: currency↔currency, currency↔identity, identity↔identity.
- The `expiryheight` defaults to ~20 blocks (~20 minutes). Set higher for longer-lasting offers.
- Can be used as bids in on-chain auctions.
- Sources and destinations can be any valid transparent address capable of holding the specific asset.
- Wildcards: `"*"` = any address, `"R*"` = transparent only, `"i*"` = identity addresses only.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — would create real on-chain offers

---

## takeoffer

> **Category:** Marketplace | **Version:** v1.2.x+

⚠️ DOCUMENTED FROM HELP — Accepts a swap offer on the blockchain, creates and posts the completing transaction.

**Syntax**

```bash
takeoffer fromaddress '{"txid":"txid","changeaddress":"addr","deliver":{...},"accept":{...}}' (returntx) (feeamount)
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | `fromaddress` | string | Yes | Sapling, VerusID, or wildcard address (`"*"`, `"R*"`, `"i*"`) to send funds/fees from |
| 2 | `offerparams` | object | Yes | Offer acceptance parameters (see below) |
| 3 | `returntx` | bool | No | Default `false`. If `true`, returns hex transaction instead of posting |
| 4 | `feeamount` | number | No | Custom fee amount instead of default miner's fee |

**Offer acceptance object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `txid` | string | Conditional | Transaction ID of the offer to accept (use this OR `tx`) |
| `tx` | string | Conditional | Hex transaction to complete (use this OR `txid`) |
| `changeaddress` | string | Yes | Change destination address |
| `deliver` | object | Yes | What you're delivering — identity name/address OR `{"currency":"id","amount":n}` |
| `accept` | object | Yes | What you're accepting — `{"address":"id","currency":"id","amount":n}` OR identity definition |
| `feeamount` | number | No | Specific fee amount |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| `txid` | string | Transaction ID (when `returntx` is false) |
| `hextx` | string | Hex serialized transaction (when `returntx` is true) |

**Examples**

**Accept an offer by txid**

```bash
verus -testnet takeoffer "*" '{"txid":"1a6d5dd71172c02c825984c77b0ffe2c1234af8823a13be8576f2309eca38ce7","changeaddress":"RChangeAddr","deliver":{"currency":"VRSCTEST","amount":1.5},"accept":{"address":"RMyAddr","currency":"VRSCTEST","amount":0}}'
```

**Accept an identity offer**

```bash
verus -testnet takeoffer "i*" '{"txid":"offertxid","changeaddress":"RChangeAddr","deliver":"myid@","accept":{"address":"RMyAddr","currency":"VRSCTEST","amount":10}}'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Insufficient funds | Wallet can't afford the swap |
| Offer expired | The offer's expiry height has passed |
| Invalid offer txid | Transaction ID doesn't reference a valid offer |

**Related Commands**

- [`makeoffer`](#makeoffer) — Create an offer
- [`getoffers`](#getoffers) — List available offers
- [`listopenoffers`](#listopenoffers) — List wallet's open offers
- [`closeoffers`](#closeoffers) — Close/cancel offers

**Notes**

- The swap is **atomic** — both sides complete in a single transaction or neither does.
- You can use either `txid` (to reference an on-chain offer) or `tx` (hex transaction for offline signing workflows).
- Sapling (shielded) addresses can be used as the funding source.
- The `deliver` field specifies what you give; `accept` specifies what you receive and where.

**Tested On**

- **VRSCTEST** v1.2.14-2, block height 926990
- ⚠️ Not directly tested — would execute real on-chain swaps