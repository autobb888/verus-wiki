---
label: Util
icon: terminal
---


# Util Commands


---

## createmultisig

> **Category:** Util | **Version:** v1.2.14+

Creates a multi-signature address with n-of-m keys required. Returns the address and redeemScript.

**Syntax**

```
createmultisig nrequired ["key",...]
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| nrequired | numeric | Yes      | Number of required signatures out of n keys |
| keys      | array   | Yes      | Array of addresses or hex-encoded public keys |

**Result**

```json
{
  "address": "multisigaddress",
  "redeemScript": "script"
}
```

**Examples**

```bash
verus -testnet createmultisig 2 '["RTZMZHDFSTFQst8XmX2dR4DaH87cEUs3gC","RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z"]'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `a]multisignature address must require at least one key` | nrequired < 1 |
| `not enough keys supplied` | nrequired > number of keys |
| `Invalid public key` | Malformed key in the array |

**Related Commands**

- [`validateaddress`](#validateaddress) — Validate an address
- [`createrawtransaction`](rawtransactions.md#createrawtransaction) — Use the multisig address in transactions

**Notes**

- This does not add the multisig to the wallet. Use `addmultisigaddress` for that.
- The `redeemScript` is needed to spend from the multisig address.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## estimatefee

> **Category:** Util | **Version:** v1.2.14+

Estimates the approximate fee per kilobyte needed for a transaction to begin confirmation within nblocks blocks.

**Syntax**

```
estimatefee nblocks
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| nblocks   | numeric | Yes      | Target number of blocks for confirmation |

**Result**

| Type    | Description |
|---------|-------------|
| numeric | Estimated fee per kilobyte in VRSC. Returns minimum fee if not enough data. |

**Examples**

```bash
verus -testnet estimatefee 6
```

**Testnet output:**
```
0.00000100
```

**Common Errors**

None typical.

**Related Commands**

- [`estimatepriority`](#estimatepriority) — Estimate priority for zero-fee transactions

**Notes**

- Returns the minimum relay fee if not enough transactions and blocks have been observed.
- On testnet, fees are typically at the minimum (0.00000100 VRSC/kB).

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## estimatepriority

> **Category:** Util | **Version:** v1.2.14+

Estimates the approximate priority a zero-fee transaction needs to begin confirmation within nblocks blocks.

**Syntax**

```
estimatepriority nblocks
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| nblocks   | numeric | Yes      | Target number of blocks for confirmation |

**Result**

| Type    | Description |
|---------|-------------|
| numeric | Estimated priority. Returns -1.0 if not enough data. |

**Examples**

```bash
verus -testnet estimatepriority 6
```

**Testnet output:**
```
-1
```

**Common Errors**

None typical.

**Related Commands**

- [`estimatefee`](#estimatefee) — Estimate fee per kilobyte

**Notes**

- Returns -1.0 when not enough transactions and blocks have been observed.
- Priority is based on coin age (value × confirmations).
- In practice, most transactions use fees rather than relying on priority.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## invalidateblock

> **Category:** Util | **Version:** v1.2.14+

Permanently marks a block as invalid, as if it violated a consensus rule.

**Syntax**

```
invalidateblock "hash"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hash      | string | Yes      | The hash of the block to mark as invalid |

**Result**

No return value on success.

**Examples**

```bash
verus -testnet invalidateblock "000000018e6991fb0d5b595b7b7b8e4cb7f04a0b8b6704ecd0f063221d534bb1"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Block not found` | The specified block hash doesn't exist |

**Related Commands**

- [`reconsiderblock`](#reconsiderblock) — Undo the effects of `invalidateblock`

**Notes**

- ⚠️ **Dangerous**: This will cause the node to reject the specified block and all its descendants, potentially causing a chain reorganization.
- The invalidation is persistent across restarts.
- Use `reconsiderblock` to reverse this action.
- Primarily used for debugging or testing chain reorganizations.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only; not executed)

---

## jumblr_deposit

> **Category:** Util | **Version:** v1.2.14+

> ⚠️ **DEPRECATED** — Jumblr functionality is deprecated and may be removed in future versions.

Sets the deposit address for the Jumblr privacy mixing service.

**Syntax**

```
jumblr_deposit "depositaddress"
```

**Parameters**

| Parameter      | Type   | Required | Description |
|----------------|--------|----------|-------------|
| depositaddress | string | Yes      | The transparent address to use as the Jumblr deposit address |

**Result**

Confirmation of the deposit address being set.

**Examples**

```bash
verus -testnet jumblr_deposit "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
```

**Related Commands**

- [`jumblr_secret`](#jumblr_secret) — Set the secret (destination) address
- [`jumblr_pause`](#jumblr_pause) — Pause Jumblr
- [`jumblr_resume`](#jumblr_resume) — Resume Jumblr

**Notes**

- **DEPRECATED**: Jumblr is no longer actively maintained.
- Jumblr was a privacy feature that mixed coins through shielded (z) addresses.
- The deposit address is the transparent address from which funds are sent into the mixing process.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only)

---

## jumblr_pause

> **Category:** Util | **Version:** v1.2.14+

> ⚠️ **DEPRECATED** — Jumblr functionality is deprecated and may be removed in future versions.

Pauses the Jumblr privacy mixing service.

**Syntax**

```
jumblr_pause
```

**Parameters**

None.

**Result**

Confirmation that Jumblr has been paused.

**Examples**

```bash
verus -testnet jumblr_pause
```

**Related Commands**

- [`jumblr_resume`](#jumblr_resume) — Resume Jumblr
- [`jumblr_deposit`](#jumblr_deposit) — Set deposit address
- [`jumblr_secret`](#jumblr_secret) — Set secret address

**Notes**

- **DEPRECATED**: Jumblr is no longer actively maintained.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only)

---

## jumblr_resume

> **Category:** Util | **Version:** v1.2.14+

> ⚠️ **DEPRECATED** — Jumblr functionality is deprecated and may be removed in future versions.

Resumes the Jumblr privacy mixing service after a pause.

**Syntax**

```
jumblr_resume
```

**Parameters**

None.

**Result**

Confirmation that Jumblr has been resumed.

**Examples**

```bash
verus -testnet jumblr_resume
```

**Related Commands**

- [`jumblr_pause`](#jumblr_pause) — Pause Jumblr
- [`jumblr_deposit`](#jumblr_deposit) — Set deposit address
- [`jumblr_secret`](#jumblr_secret) — Set secret address

**Notes**

- **DEPRECATED**: Jumblr is no longer actively maintained.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only)

---

## jumblr_secret

> **Category:** Util | **Version:** v1.2.14+

> ⚠️ **DEPRECATED** — Jumblr functionality is deprecated and may be removed in future versions.

Sets the secret (destination) address for the Jumblr privacy mixing service.

**Syntax**

```
jumblr_secret "secretaddress"
```

**Parameters**

| Parameter     | Type   | Required | Description |
|---------------|--------|----------|-------------|
| secretaddress | string | Yes      | The transparent address to receive mixed funds |

**Result**

Confirmation of the secret address being set.

**Examples**

```bash
verus -testnet jumblr_secret "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
```

**Related Commands**

- [`jumblr_deposit`](#jumblr_deposit) — Set the deposit address
- [`jumblr_pause`](#jumblr_pause) — Pause Jumblr
- [`jumblr_resume`](#jumblr_resume) — Resume Jumblr

**Notes**

- **DEPRECATED**: Jumblr is no longer actively maintained.
- The secret address is the destination where mixed coins are sent after passing through shielded addresses.
- This address should ideally be unlinked to the deposit address for privacy.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only)

---

## reconsiderblock

> **Category:** Util | **Version:** v1.2.14+

Removes invalidity status of a block and its descendants, reconsidering them for activation. Used to undo the effects of `invalidateblock`.

**Syntax**

```
reconsiderblock "hash"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hash      | string | Yes      | The hash of the block to reconsider |

**Result**

No return value on success.

**Examples**

```bash
verus -testnet reconsiderblock "000000018e6991fb0d5b595b7b7b8e4cb7f04a0b8b6704ecd0f063221d534bb1"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Block not found` | The specified block hash doesn't exist |

**Related Commands**

- [`invalidateblock`](#invalidateblock) — Mark a block as invalid

**Notes**

- This reverses the effect of `invalidateblock`.
- The block and all its descendants will be reconsidered for the active chain.
- May trigger a chain reorganization if the reconsidered chain has more work.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only; not executed)

---

## validateaddress

> **Category:** Util | **Version:** v1.2.14+

Return information about the given transparent address.

**Syntax**

```
validateaddress "address"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| address   | string | Yes      | The transparent address to validate |

**Result**

```json
{
  "isvalid": true,
  "address": "verusaddress",
  "scriptPubKey": "hex",
  "segid": 60,
  "ismine": false,
  "iswatchonly": false,
  "isscript": false
}
```

| Field          | Type    | Description |
|----------------|---------|-------------|
| isvalid        | boolean | Whether the address is valid |
| address        | string  | The validated address |
| scriptPubKey   | string  | Hex encoded scriptPubKey |
| segid          | numeric | Segment ID |
| ismine         | boolean | Whether the address belongs to the wallet |
| issharedownership | boolean | Whether ownership is shared |
| iswatchonly    | boolean | Whether the address is watch-only |
| isscript       | boolean | Whether it's a script address |
| account        | string  | DEPRECATED. Associated account name |
| pubkey         | string  | Public key hex (if available) |
| iscompressed   | boolean | Whether the key is compressed |

**Examples**

```bash
verus -testnet validateaddress "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
```

**Testnet output:**
```json
{
  "isvalid": true,
  "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
  "scriptPubKey": "76a914fa0d06f4b97c6f570e72f480441f4f24aed0da7588ac",
  "segid": 60,
  "ismine": false,
  "issharedownership": false,
  "iswatchonly": false,
  "isscript": false
}
```

**Common Errors**

None — invalid addresses return `{"isvalid": false}`.

**Related Commands**

- [`z_validateaddress`](#z_validateaddress) — Validate shielded (z) addresses
- [`getaddressbalance`](addressindex.md#getaddressbalance) — Get balance for an address

**Notes**

- If the address is invalid, only `isvalid: false` is returned.
- `ismine` indicates whether the wallet contains the private key.
- Works with both R-addresses and i-addresses.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## z_validateaddress

> **Category:** Util | **Version:** v1.2.14+

Return information about the given shielded (z) address.

**Syntax**

```
z_validateaddress "zaddr"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| zaddr     | string | Yes      | The z address to validate |

**Result**

```json
{
  "isvalid": true,
  "address": "zaddr",
  "type": "sprout|sapling",
  "ismine": false
}
```

| Field                      | Type    | Description |
|----------------------------|---------|-------------|
| isvalid                    | boolean | Whether the address is valid |
| address                    | string  | The validated z address |
| type                       | string  | "sprout" or "sapling" |
| ismine                     | boolean | Whether the address belongs to the wallet |
| payingkey                  | string  | [sprout] Hex value of paying key (a_pk) |
| transmissionkey            | string  | [sprout] Hex value of transmission key (pk_enc) |
| diversifier                | string  | [sapling] Hex value of diversifier (d) |
| diversifiedtransmissionkey | string  | [sapling] Hex value of pk_d |

**Examples**

```bash
verus -testnet z_validateaddress "zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL"
```

**Testnet output:**
```json
{
  "isvalid": true,
  "address": "zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL",
  "type": "sprout",
  "payingkey": "f5bb3c888ccc9831e3f6ba06e7528e26a312eec3acc1823be8918b6a3a5e20ad",
  "transmissionkey": "7a58c7132446564e6b810cf895c20537b3528357dc00150a8e201f491efa9c1a",
  "ismine": false
}
```

**Common Errors**

None — invalid addresses return `{"isvalid": false}`.

**Related Commands**

- [`validateaddress`](#validateaddress) — Validate transparent addresses

**Notes**

- Sprout addresses start with `zc` and show `payingkey`/`transmissionkey`.
- Sapling addresses start with `zs` and show `diversifier`/`diversifiedtransmissionkey`.
- `ismine` indicates whether the wallet has the spending key.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2