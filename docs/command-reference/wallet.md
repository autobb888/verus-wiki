---
label: Wallet
icon: terminal
---


# Wallet Commands


---

## addmultisigaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Add a nrequired-to-sign multisignature address to the wallet. Each key is a Verus address or hex-encoded public key.

**Syntax**

```
addmultisigaddress nrequired ["key",...] ( "account" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | nrequired | numeric | Yes | Number of required signatures out of n keys/addresses |
| 2 | keysobject | string (JSON array) | Yes | JSON array of addresses or hex-encoded public keys |
| 3 | account | string | No | **DEPRECATED.** Must be `""` (empty string) for default account |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | A Verus address associated with the keys |

**Examples**

```bash
## Add a 2-of-2 multisig address
verus addmultisigaddress 2 '["RAddr1...","RAddr2..."]'
```

```bash
## JSON-RPC
curl --user myusername --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"addmultisigaddress","params":[2,"[\"RAddr1\",\"RAddr2\"]"]}' -H 'content-type:text/plain;' http://127.0.0.1:27486/
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `not enough keys supplied` | Fewer keys provided than `nrequired` |
| `a]multisignature address must require at least one key` | nrequired < 1 |

**Related Commands**

- [`createmultisig`](util.md#createmultisig) — Creates multisig address without adding to wallet
- [`listunspent`](#listunspent) — List UTXOs including multisig

**Notes**

- The resulting address is added to the wallet and can be used to receive funds.
- To spend from multisig, you need the required number of signatures via `signrawtransaction`.
- The `account` parameter is deprecated — pass `""` or omit.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## backupwallet

> **Category:** Wallet | **Version:** v1.2.x+

Safely copies wallet.dat to a destination filename.

**Syntax**

```
backupwallet "destination"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | destination | string | Yes | The destination filename (alphanumeric only, no paths). Saved in the `-exportdir` directory. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| path | string | The full path of the destination file. |

**Examples**

**Basic Usage**

```bash
verus -testnet backupwallet "testbackup"
```

**Output:**
```
/home/cluster/.komodo/vrsctest/testbackup
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"backupwallet","params":["mybackup"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Regular backups** — schedule periodic wallet backups
- **Pre-upgrade safety** — backup before daemon upgrades
- **Disaster recovery** — maintain offsite copies

**Common Errors**

| Error | Cause |
|-------|-------|
| `Filename is invalid as only alphanumeric characters are allowed` | Filename contains special characters, slashes, or dots |
| `Error: Wallet backup failed!` | File system error or permissions issue |

**Related Commands**

- [`dumpprivkey`](#dumpprivkey) — Export individual private keys
- [`importprivkey`](#importprivkey) — Import keys into a wallet
- [`getwalletinfo`](#getwalletinfo) — Check wallet state before backup

**Notes**

- The filename must be **alphanumeric only** — no paths, dots, or special characters.
- The file is saved to the data directory (e.g., `~/.komodo/vrsctest/`) or the `-exportdir` if configured.
- The backup is a copy of `wallet.dat` — it contains all private keys. **Store securely.**
- Delete test backups after verification.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## convertpassphrase

> **Category:** Wallet | **Version:** v1.2.14-2+

Converts a Verus Desktop, Agama, Verus Agama, or Verus Mobile passphrase to a private key and WIF format for import with `importprivkey`.

**Syntax**

```
convertpassphrase "walletpassphrase"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | walletpassphrase | string | Yes | The wallet passphrase to convert |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| walletpassphrase | string | The passphrase entered |
| address | string | Verus address corresponding to the passphrase |
| pubkey | string | Hex-encoded raw public key |
| privkey | string | Hex-encoded raw private key |
| wif | string | Private key in WIF format (use with `importprivkey`) |

**Examples**

```bash
verus convertpassphrase "my wallet passphrase words here"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Missing passphrase argument | No passphrase provided |

**Related Commands**

- [`importprivkey`](#importprivkey) — Import WIF private key into wallet
- [`dumpprivkey`](#dumpprivkey) — Export private key in WIF format

**Notes**

- Useful for migrating from Verus Desktop/Agama/Mobile wallets to CLI.
- The WIF output can be directly used with `importprivkey`.
- **Security:** Be cautious with passphrases — do not expose them in shell history.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## decryptdata

> **Category:** Wallet | **Version:** v1.2.14-2+

Decrypts a VDXF data descriptor, which is typically encrypted to a z-address. Uses viewing keys from the wallet or provided parameters to decrypt nested encryption layers.

**Syntax**

```
decryptdata '{
  "datadescriptor": {},
  "evk": "Optional Sapling extended full viewing key",
  "ivk": "Optional hex incoming viewing key",
  "txid": "hex",
  "retrieve": bool
}'
```

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| datadescriptor | object | Optional* | Data descriptor to decrypt (uses keys from descriptor & wallet) |
| iddata | object | Optional* | Identity, VDXF key, metadata to limit query, and keys to decrypt |
| evk | string | No | Extended viewing key for decoding (may not be in descriptor) |
| ivk | string | No | Incoming viewing key (hex) for decoding |
| txid | string | No | Transaction ID if data is from a tx and retrieve is true |
| retrieve | boolean | No | Default `false`. If true, retrieves data from on-chain reference and decrypts |

*Either `datadescriptor` or `iddata` is required.

**iddata sub-fields**

| Name | Type | Description |
|------|------|-------------|
| identityid | string | Identity (e.g., `id@`) |
| vdxfkey | string | VDXF key (e.g., `i-vdxfkey`) |
| startheight | numeric | Start block height for query |
| endheight | numeric | End block height for query |
| getlast | boolean | Get the last matching entry |

**Result**

Returns the decrypted data descriptor object with as much decryption as possible completed.

**Examples**

```bash
## Encrypt data first
verus signdata '{"address":"Verus Coin Foundation.vrsc@", "createmmr":true, "data":[{"message":"hello world", "encrypttoaddress":"zs1..."}]}'

## Then decrypt
verus decryptdata '{"datadescriptor":{...encrypted output...}}'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| No decryption possible | Neither viewing key nor SSK matches the encrypted data |
| Missing required fields | Neither `datadescriptor` nor `iddata` provided |

**Related Commands**

- [`signdata`](identity.md#signdata) — Sign and optionally encrypt data
- [`z_exportviewingkey`](#z_exportviewingkey) — Export viewing key for decryption
- [`verifydata`](identity.md#signdata) — Verify signed data

**Notes**

- Part of Verus's VDXF (Verus Data Exchange Format) system for identity-linked encrypted data.
- Supports nested encryption layers — will attempt to decrypt as deeply as possible.
- If only a viewing key is available (not spending key), decryption is still possible for data encrypted to that key.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## dumpprivkey

> **Category:** Wallet | **Version:** v1.2.x+

Reveals the private key corresponding to a transparent address.

**Syntax**

```
dumpprivkey "t-addr"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | t-addr | string | Yes | The transparent address (R-address) to export. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| key | string | The WIF-encoded private key. |

**Examples**

**Basic Usage**

```bash
verus -testnet dumpprivkey "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"
```

**Output:**
```
UsURC5zbdKXcapirrvFHcok8VCrUyG8FmSMzLPA2zQAFX1XAuTYE
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"dumpprivkey","params":["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Wallet migration** — export keys to import into another wallet
- **Backup** — store individual private keys securely
- **Debugging** — verify key ownership

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid Verus address` | Address format is wrong |
| `Private key for address is not known` | Address is not in this wallet |
| `Wallet is locked` | Wallet must be unlocked with `walletpassphrase` first |

**Related Commands**

- [`importprivkey`](#importprivkey) — Import a private key
- [`backupwallet`](#backupwallet) — Full wallet backup (preferred)

**Notes**

> ⚠️ **SECURITY WARNING:** The private key controls all funds at this address. Anyone with the key can spend the funds. Never share private keys. Store them encrypted and offline.

- Returns a WIF (Wallet Import Format) encoded key.
- The wallet must be unlocked if encrypted.
- For z-addresses, use `z_exportkey` instead.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## dumpwallet

> **Category:** Wallet | **Version:** v1.2.14-2+

Dumps transparent address (taddr) wallet keys in a human-readable format to a file. Does NOT include shielded (z-address) keys — use `z_exportwallet` for that.

**Syntax**

```
dumpwallet "filename" ( omitemptytaddresses )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | filename | string | Yes | Output filename (saved in `-exportdir` folder) |
| 2 | omitemptytaddresses | boolean | No | Default `false`. If true, only export addresses with UTXOs or that control IDs |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| path | string | Full path of the destination file |

**Examples**

```bash
verus dumpwallet "my-wallet-backup"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Cannot overwrite existing file` | File already exists at destination |
| `exportdir` not set | verusd not started with `-exportdir` option |

**Related Commands**

- [`importwallet`](#importwallet) — Import taddr keys from dump file
- [`z_exportwallet`](#z_exportwallet) — Export all keys (taddr + zaddr)
- [`backupwallet`](#backupwallet) — Copy wallet.dat file

**Notes**

- Only exports transparent address keys. Use `z_exportwallet` for both transparent and shielded.
- Requires `-exportdir` to be set when starting verusd.
- Cannot overwrite existing files (safety measure).
- The `omitemptytaddresses` flag should be used carefully — addresses not yet indexed may be skipped.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## encryptwallet

> **Category:** Wallet | **Version:** v1.2.14-2+

Encrypts the wallet with a passphrase. This is for first-time encryption only.

⚠️ **This command is DISABLED by default.** Requires experimental features to be enabled.

**Syntax**

```
encryptwallet "passphrase"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | passphrase | string | Yes | The passphrase to encrypt the wallet with (minimum 1 character) |

**Enabling**

To enable, restart verusd with:
```
-experimentalfeatures -developerencryptwallet
```

Or add to config file:
```
experimentalfeatures=1
developerencryptwallet=1
```

**Result**

Shuts down the server after encrypting.

**Examples**

```bash
## Encrypt the wallet
verus encryptwallet "my pass phrase"

## After restart, unlock for operations
verus walletpassphrase "my pass phrase"

## Lock again
verus walletlock
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `encryptwallet is disabled` | Experimental features not enabled |
| Wallet already encrypted | Use `walletpassphrasechange` instead |

**Related Commands**

- [`walletpassphrase`](wallet.md#encryptwallet) — Unlock encrypted wallet
- [`walletlock`](wallet.md#encryptwallet) — Lock the wallet
- [`walletpassphrasechange`](wallet.md#encryptwallet) — Change encryption passphrase

**Notes**

- **DO NOT use casually** — encrypting the wallet requires the passphrase for all future private key operations.
- The server shuts down after encryption completes.
- This is an experimental feature inherited from zcashd.
- After encryption, `dumpprivkey`, `z_exportkey`, signing, and sending all require unlocking first.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output only — **not executed**)

---

## getaccount

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Returns the account associated with the given address.

**Syntax**

```
getaccount "address"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | The Verus address for account lookup |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | The account name |

**Examples**

```bash
verus getaccount "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"
```

**Live output (testnet):**
```
agentplatform-registration
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid address | Address not recognized |

**Related Commands**

- [`setaccount`](#setaccount) — Set account for an address (deprecated)
- [`getaccountaddress`](#getaccountaddress) — Get address for an account (deprecated)
- [`listaccounts`](#listaccounts) — List all accounts (deprecated)

**Notes**

- The account system is **deprecated**. Accounts were a Bitcoin Core feature removed in later versions.
- Default account is `""` (empty string).

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## getaccountaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Returns the current Verus address for receiving payments to the specified account.

**Syntax**

```
getaccountaddress "account"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | account | string | Yes | Must be `""` for default account. Any other string causes an error. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | The account's Verus address |

**Examples**

```bash
verus getaccountaddress ""
```

**Live output (testnet):**
```
RNUj32rViHuEk5F3VEmk53q4xhMMq2wffT
```

**Related Commands**

- [`getaccount`](#getaccount) — Get account for an address (deprecated)
- [`getaddressesbyaccount`](#getaddressesbyaccount) — Get all addresses for account (deprecated)

**Notes**

- The account system is **deprecated**.
- Only `""` (empty string) is accepted as the account parameter.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## getaddressesbyaccount

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Returns the list of addresses for the given account.

**Syntax**

```
getaddressesbyaccount "account"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | account | string | Yes | Must be `""` for default account |

**Result**

JSON array of Verus addresses associated with the account.

**Examples**

```bash
verus getaddressesbyaccount ""
```

**Live output (testnet):**
```json
[
  "RB5s8g763JCWcpdsMsiTMiQ5SQdj376ipg",
  "RExj2gcJrBnrPjmaqcyk7NdvLtvaKX2LGH",
  "RFgbPkbeFADR2tMk6sAW9teTKtzTbWnTMT",
  "RNUj32rViHuEk5F3VEmk53q4xhMMq2wffT",
  "RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5",
  "RQVywYFCbASodUjjpff57RLpGpT5UUbcbT",
  "RRcQfB7G4GKFb9pShCK48V1kvuspnKrFMf",
  "RSCo6N67YCBTv6M2u8XmXbQo63EEqD148v"
]
```

**Related Commands**

- [`getaccount`](#getaccount) — Get account for address (deprecated)
- [`getaccountaddress`](#getaccountaddress) — Get address for account (deprecated)
- [`listaccounts`](#listaccounts) — List all accounts (deprecated)

**Notes**

- The account system is **deprecated**.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## getbalance

> **Category:** Wallet | **Version:** v1.2.x+

Returns the server's total available balance.

**Syntax**

```
getbalance ( "account" minconf includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | account | string | No | `""` | DEPRECATED. Must be `""` or `"*"` for total balance. |
| 2 | minconf | numeric | No | 1 | Only include transactions confirmed at least this many times. |
| 3 | includeWatchonly | bool | No | false | Also include balance in watch-only addresses. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| amount | numeric | The total amount in VRSCTEST received. |

**Examples**

**Basic Usage**

```bash
verus -testnet getbalance
```

**Output:**
```
122.88450000
```

**With Minimum Confirmations**

```bash
verus -testnet getbalance "*" 6
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getbalance","params":["*",6]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Check total wallet balance** before sending transactions
- **Verify confirmed balance** with higher minconf for large payments
- **Monitor watch-only addresses** with `includeWatchonly=true`

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid account name` | Passing an account name other than `""` or `"*"` |

**Related Commands**

- [`getcurrencybalance`](#getcurrencybalance) — Balance for a specific address/currency
- [`getunconfirmedbalance`](#getunconfirmedbalance) — Unconfirmed balance only
- [`getwalletinfo`](#getwalletinfo) — Full wallet state including balance

**Notes**

- The `account` parameter is deprecated. Always use `""` or `"*"`.
- Returns the balance for the entire wallet, not a specific address.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getcurrencybalance

> **Category:** Wallet | **Version:** v1.2.x+

Returns the balance in all currencies of a taddr or zaddr belonging to the node's wallet.

**Syntax**

```
getcurrencybalance "address" ( minconf ) ( friendlynames ) ( includeshared )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | address | string or object | Yes | — | The address to query. Supports z*, R*, i* wildcards. Can be an object with `address` and `currency` members. |
| 2 | minconf | numeric | No | 1 | Minimum confirmations to include. |
| 3 | friendlynames | boolean | No | true | Use friendly names instead of i-addresses. |
| 4 | includeshared | bool | No | false | Include outputs spendable by others too. |

**Result**

Returns an object with currency names as keys and balances as values.

**Examples**

**Basic Usage**

```bash
verus -testnet getcurrencybalance "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"
```

**Output:**
```json
{
  "VRSCTEST": 52.88540000,
  "agentplatform": 109.99000000
}
```

**With Minimum Confirmations**

```bash
verus -testnet getcurrencybalance "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2" 5
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getcurrencybalance","params":["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",5]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Check multi-currency balances** on a PBaaS chain
- **Per-address accounting** — see exactly what each address holds
- **Wildcard queries** — use `"R*"` to check all R-addresses

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid address` | Address not recognized or not in wallet |

> ⚠️ **CAUTION:** If the wallet only has an incoming viewing key for the address, spends cannot be detected and the returned balance may be larger than actual.

**Related Commands**

- [`getbalance`](#getbalance) — Total wallet balance (single currency)
- [`getwalletinfo`](#getwalletinfo) — Full wallet state
- [`listunspent`](#listunspent) — Detailed UTXO listing

**Notes**

- Unlike `getbalance`, this command shows **all currencies** held at an address.
- The `address` parameter can be an object: `{"address":"R...","currency":"VRSCTEST"}` to filter by currency.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getnewaddress

> **Category:** Wallet | **Version:** v1.2.x+

Returns a new VRSCTEST address for receiving payments.

**Syntax**

```
getnewaddress ( "account" )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | account | string | No | `""` | DEPRECATED. Must be `""` for default account. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| address | string | A new VRSCTEST transparent address (R-address). |

**Examples**

**Basic Usage**

```bash
verus -testnet getnewaddress
```

**Output:**
```
RB5s8g763JCWcpdsMsiTMiQ5SQdj376ipg
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getnewaddress","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Generate receiving address** for each incoming payment
- **Improve privacy** by using a fresh address per transaction
- **Label-based accounting** (deprecated account system)

**Common Errors**

| Error | Cause |
|-------|-------|
| `Error: Keypool ran out` | Key pool exhausted — wallet may need unlocking |

**Related Commands**

- [`getrawchangeaddress`](#getrawchangeaddress) — Address for change outputs
- [`getbalance`](#getbalance) — Check balance after receiving
- [`getcurrencybalance`](#getcurrencybalance) — Check per-address balance

**Notes**

- Each call generates a new address from the HD key pool.
- The `account` parameter is deprecated — do not pass anything other than `""`.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getrawchangeaddress

> **Category:** Wallet | **Version:** v1.2.x+

Returns a new VRSCTEST address for receiving change. For use with raw transactions, NOT normal use.

**Syntax**

```
getrawchangeaddress
```

**Parameters**

None.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| address | string | A new change address (R-address). |

**Examples**

**Basic Usage**

```bash
verus -testnet getrawchangeaddress
```

**Output:**
```
RPLRRViL6KqckYSyR2EUSBx1Dcos2F2qho
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getrawchangeaddress","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Raw transaction construction** — specify a change output manually
- **Advanced UTXO management** — control where change goes

**Common Errors**

| Error | Cause |
|-------|-------|
| `Keypool ran out` | Key pool exhausted |

**Related Commands**

- [`getnewaddress`](#getnewaddress) — For normal receiving addresses
- [`listunspent`](#listunspent) — List UTXOs for raw transaction building

**Notes**

- This is intended for raw transaction workflows only. For normal use, use `getnewaddress`.
- The wallet automatically handles change addresses during standard sends.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getreceivedbyaccount

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Returns the total amount received by addresses associated with the specified account.

**Syntax**

```
getreceivedbyaccount "account" ( minconf )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | account | string | Yes | Must be `""` for default account |
| 2 | minconf | numeric | No | Minimum confirmations (default: 1) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | numeric | Total amount received in VRSC |

**Examples**

```bash
verus getreceivedbyaccount ""
```

**Live output (testnet):**
```
766.98690000
```

**Related Commands**

- [`getreceivedbyaddress`](#getreceivedbyaddress) — Get received amount by address
- [`listreceivedbyaccount`](#listreceivedbyaccount) — List received by all accounts (deprecated)

**Notes**

- The account system is **deprecated**.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## getreceivedbyaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns the total amount received by the given Verus address in transactions with at least `minconf` confirmations.

**Syntax**

```
getreceivedbyaddress "address" ( minconf )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | The Verus address |
| 2 | minconf | numeric | No | Minimum confirmations (default: 1) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | numeric | Total amount in VRSC received at this address |

**Examples**

```bash
verus getreceivedbyaddress "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"
```

**Live output (testnet):**
```
520.23650000
```

```bash
## With minimum 6 confirmations
verus getreceivedbyaddress "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2" 6
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid address | Address not in wallet or malformed |

**Related Commands**

- [`getreceivedbyaccount`](#getreceivedbyaccount) — Get received by account (deprecated)
- [`listreceivedbyaddress`](#listreceivedbyaddress) — List received by all addresses
- [`z_getbalance`](#z_getbalance) — Get balance for any address type

**Notes**

- Only counts received amounts, not current balance (doesn't subtract sends).
- Address must belong to the wallet.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## gettransaction

> **Category:** Wallet | **Version:** v1.2.x+

Get detailed information about an in-wallet transaction.

**Syntax**

```
gettransaction "txid" ( includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | txid | string | Yes | — | The transaction id. |
| 2 | includeWatchonly | bool | No | false | Include watch-only addresses in balance/details. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| amount | numeric | Net transaction amount in VRSCTEST |
| fee | numeric | Fee paid (negative, send only) |
| confirmations | numeric | Number of confirmations |
| blockhash | string | Block hash containing the tx |
| blockindex | numeric | Index within the block |
| blocktime | numeric | Block time (epoch seconds) |
| txid | string | Transaction id |
| time | numeric | Transaction time (epoch) |
| timereceived | numeric | Time received (epoch) |
| details | array | Array of send/receive detail objects |
| vjoinsplit | array | Shielded join-split details |
| hex | string | Raw transaction hex |

**Examples**

**Basic Usage**

```bash
verus -testnet gettransaction "adce8581971e889d253a2980542c1600daf0b9b43c614d94d6df6c25c4bcacc9"
```

**Output (trimmed):**
```json
{
  "amount": 0.00000000,
  "fee": -0.00100000,
  "confirmations": 326,
  "blockhash": "2ec6dde4389eaff88c2fdfd697131b1378f417e778deba2cb25a4fd825a4e719",
  "blockindex": 1,
  "blocktime": 1770429214,
  "txid": "adce8581971e889d253a2980542c1600daf0b9b43c614d94d6df6c25c4bcacc9",
  "details": [
    {
      "account": "",
      "address": "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",
      "category": "send",
      "amount": -0.92700000,
      "vout": 1,
      "fee": -0.00100000
    }
  ]
}
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"gettransaction","params":["adce8581971e889d253a2980542c1600daf0b9b43c614d94d6df6c25c4bcacc9"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Payment verification** — confirm a tx has enough confirmations
- **Transaction debugging** — inspect details, fee, block placement
- **Accounting** — extract send/receive details for records

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid or non-wallet transaction id` | The txid is not in this wallet |

**Related Commands**

- [`listtransactions`](#listtransactions) — List recent transactions
- [`sendtoaddress`](#sendtoaddress) — Create a transaction

**Notes**

- Only works for transactions that involve this wallet's addresses.
- The `amount` field shows the **net** effect (send + receive can cancel out to 0 for self-sends).

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getunconfirmedbalance

> **Category:** Wallet | **Version:** v1.2.x+

Returns the server's total unconfirmed balance.

**Syntax**

```
getunconfirmedbalance
```

**Parameters**

None.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| amount | numeric | Total unconfirmed balance in VRSCTEST. |

**Examples**

**Basic Usage**

```bash
verus -testnet getunconfirmedbalance
```

**Output:**
```
0.00000000
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getunconfirmedbalance","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Monitor incoming payments** — check if funds are pending
- **Transaction confirmation tracking** — poll until unconfirmed drops to 0

**Common Errors**

None typical — this command takes no arguments.

**Related Commands**

- [`getbalance`](#getbalance) — Confirmed balance
- [`getwalletinfo`](#getwalletinfo) — Includes both confirmed and unconfirmed

**Notes**

- Returns only the unconfirmed portion. Use `getbalance` for confirmed funds.
- A non-zero value means transactions are waiting for block inclusion.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## getwalletinfo

> **Category:** Wallet | **Version:** v1.2.x+

Returns an object containing various wallet state info.

**Syntax**

```
getwalletinfo
```

**Parameters**

None.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| walletversion | numeric | Wallet version |
| balance | numeric | Total confirmed balance |
| unconfirmed_balance | numeric | Total unconfirmed balance |
| immature_balance | numeric | Total immature (coinbase) balance |
| reserve_balance | object | PBaaS reserve token balances |
| unconfirmed_reserve_balance | object | Unconfirmed reserve token balances |
| immature_reserve_balance | object | Immature reserve token balances |
| eligible_staking_outputs | numeric | Number of outputs eligible for staking |
| eligible_staking_balance | numeric | Total balance eligible for staking |
| txcount | numeric | Total transaction count |
| keypoololdest | numeric | Timestamp of oldest pre-generated key |
| keypoolsize | numeric | Number of pre-generated keys |
| unlocked_until | numeric | Unlock expiry (0 if locked) |
| paytxfee | numeric | Transaction fee config (VRSC/kB) |
| seedfp | string | BLAKE2b-256 hash of HD seed |

**Examples**

**Basic Usage**

```bash
verus -testnet getwalletinfo
```

**Output:**
```json
{
  "walletversion": 60000,
  "balance": 122.88450000,
  "unconfirmed_balance": 0.00000000,
  "immature_balance": 0.00000000,
  "eligible_staking_outputs": 8,
  "eligible_staking_balance": 122.88450000,
  "reserve_balance": {
    "agentplatform": 210.00000000
  },
  "txcount": 57,
  "keypoololdest": 1770080498,
  "keypoolsize": 101,
  "paytxfee": 0.00010000,
  "seedfp": "2187fa609bc5b8507d961fa009ee7acd8658964e1dc4a4ef1e04a63a805811de"
}
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"getwalletinfo","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Wallet health check** — verify balance, tx count, key pool status
- **Staking info** — check eligible staking balance and output count
- **Reserve balances** — see PBaaS token holdings
- **Security audit** — check if wallet is locked (`unlocked_until`)

**Common Errors**

None typical — this command takes no arguments.

**Related Commands**

- [`getbalance`](#getbalance) — Simple balance query
- [`getunconfirmedbalance`](#getunconfirmedbalance) — Unconfirmed only
- [`listtransactions`](#listtransactions) — Transaction history

**Notes**

- `reserve_balance` only appears on PBaaS-enabled chains with non-native tokens.
- `seedfp` is a fingerprint of the HD seed — useful for verifying wallet identity without exposing the seed.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## importaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Adds an address or script (in hex) that can be watched as if it were in your wallet but cannot be used to spend. Creates a watch-only entry.

**Syntax**

```
importaddress "address" ( "label" rescan )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | The address or hex script to watch |
| 2 | label | string | No | Optional label (default: `""`) |
| 3 | rescan | boolean | No | Rescan wallet for transactions (default: `true`) |

**Result**

No return value on success.

**Examples**

```bash
## Import with rescan
verus importaddress "RAddr..."

## Import without rescan (faster)
verus importaddress "RAddr..." "my-watch" false
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Rescan timeout | Large blockchain + rescan=true can take very long |

**Related Commands**

- [`importprivkey`](#importprivkey) — Import spendable private key
- [`z_importviewingkey`](#z_importviewingkey) — Import shielded viewing key (watch-only)

**Notes**

- Watch-only addresses show in balance with `includeWatchonly` flag.
- Rescan can take minutes to hours on large chains — use `rescan=false` and rescan later if needed.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## importprivkey

> **Category:** Wallet | **Version:** v1.2.x+

Adds a private key (as returned by `dumpprivkey`) to your wallet.

**Syntax**

```
importprivkey "verusprivkey" ( "label" rescan )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | verusprivkey | string | Yes | — | The WIF-encoded private key. |
| 2 | label | string | No | `""` | An optional label for the address. |
| 3 | rescan | boolean | No | true | Rescan the blockchain for transactions. |

**Result**

None (returns null on success).

**Examples**

**Basic Usage**

```bash
verus -testnet importprivkey "myWIFkey"
```

**Import Without Rescan**

```bash
verus -testnet importprivkey "myWIFkey" "testing" false
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"importprivkey","params":["myWIFkey","testing",false]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Wallet migration** — import keys exported from another wallet
- **Key recovery** — restore access from a backed-up private key
- **Fast import** — use `rescan=false` when importing multiple keys, then rescan once at the end

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid private key encoding` | Key is not valid WIF format |
| `Wallet is locked` | Unlock with `walletpassphrase` first |

**Related Commands**

- [`dumpprivkey`](#dumpprivkey) — Export a private key
- [`importaddress`](wallet.md#importaddress) — Import watch-only address

**Notes**

> ⚠️ **WARNING:** With `rescan=true` (default), this call can take **minutes** as it scans the entire blockchain for transactions involving the imported key.

- If importing multiple keys, set `rescan=false` for all but the last import, or trigger a manual rescan afterward.
- The imported key becomes part of the wallet's keystore permanently.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## importwallet

> **Category:** Wallet | **Version:** v1.2.14-2+

Imports transparent address (taddr) keys from a wallet dump file created by `dumpwallet`.

**Syntax**

```
importwallet "filename"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | filename | string | Yes | Path to the wallet dump file |

**Result**

No return value on success.

**Examples**

```bash
## Dump then import
verus dumpwallet "mybackup"
verus importwallet "/path/to/exportdir/mybackup"
```

**Related Commands**

- [`dumpwallet`](#dumpwallet) — Export taddr keys to file
- [`z_importwallet`](#z_importwallet) — Import both taddr and zaddr keys

**Notes**

- Only imports transparent keys. Use `z_importwallet` for full import (taddr + zaddr).
- Triggers a rescan after import.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## keypoolrefill

> **Category:** Wallet | **Version:** v1.2.14-2+

Fills the keypool with pre-generated keys for faster address generation.

**Syntax**

```
keypoolrefill ( newsize )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | newsize | numeric | No | New keypool size (default: 100) |

**Result**

No return value on success.

**Examples**

```bash
verus keypoolrefill
verus keypoolrefill 200
```

**Live test (testnet):** Completed successfully with no output.

**Related Commands**

- [`getwalletinfo`](#getwalletinfo) — Shows current keypool size

**Notes**

- Pre-generating keys improves address generation speed.
- Useful before operations that need many new addresses.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listaccounts

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Returns an object with account names as keys and account balances as values.

**Syntax**

```
listaccounts ( minconf includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 2 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

JSON object mapping account names to balances.

**Examples**

```bash
verus listaccounts
```

**Live output (testnet):**
```json
{
  "": -404.33180000,
  "agent-bootstrap-test": 0.00000000,
  "agentplatform-registration": 527.21640000
}
```

**Related Commands**

- [`getaccount`](#getaccount) — Get account for address (deprecated)
- [`listreceivedbyaccount`](#listreceivedbyaccount) — Detailed received by account (deprecated)

**Notes**

- The account system is **deprecated**. Negative balances can occur due to the accounting model.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listaddressgroupings

> **Category:** Wallet | **Version:** v1.2.14-2+

Lists groups of addresses whose common ownership has been made public by being used together as inputs or change in past transactions.

**Syntax**

```
listaddressgroupings
```

**Parameters**

None.

**Result**

Nested JSON array: groups of `[address, amount, account]` tuples.

**Examples**

```bash
verus listaddressgroupings
```

**Live output (testnet, partial):**
```json
[
  [
    ["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2", 52.88540000, "agentplatform-registration"],
    ["RFgbPkbeFADR2tMk6sAW9teTKtzTbWnTMT", 0.00000000, ""],
    ["RPgqkB6eLa6wqxq4PBBo3wk7dzNYmJvLt5", 0.00000000, ""]
  ]
]
```

**Related Commands**

- [`listunspent`](#listunspent) — List unspent outputs
- [`listreceivedbyaddress`](#listreceivedbyaddress) — List received by address

**Notes**

- Reveals privacy information — addresses grouped together were likely controlled by the same user.
- The `account` field in each tuple is deprecated.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listlockunspent

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns a list of temporarily unspendable (locked) outputs. See `lockunspent` to lock/unlock.

**Syntax**

```
listlockunspent
```

**Parameters**

None.

**Result**

JSON array of locked outputs, each with `txid` and `vout`.

**Examples**

```bash
verus listlockunspent
```

**Live output (testnet):**
```json
[]
```

**Related Commands**

- [`lockunspent`](#lockunspent) — Lock/unlock specific outputs
- [`listunspent`](#listunspent) — List spendable outputs

**Notes**

- Locks are stored in memory only — cleared on node restart.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listreceivedbyaccount

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** List balances by account.

**Syntax**

```
listreceivedbyaccount ( minconf includeempty includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 2 | includeempty | boolean | No | Include accounts with no payments (default: false) |
| 3 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

JSON array of objects with `account`, `amount`, `confirmations`, and optionally `involvesWatchonly`.

**Examples**

```bash
verus listreceivedbyaccount
```

**Live output (testnet):**
```json
[
  {
    "account": "",
    "amount": 766.98690000,
    "confirmations": 1448
  },
  {
    "account": "agentplatform-registration",
    "amount": 527.21640000,
    "confirmations": 333
  }
]
```

**Related Commands**

- [`listreceivedbyaddress`](#listreceivedbyaddress) — List received by address
- [`listaccounts`](#listaccounts) — List account balances (deprecated)

**Notes**

- The account system is **deprecated**.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listreceivedbyaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

List balances by receiving address.

**Syntax**

```
listreceivedbyaddress ( minconf includeempty includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 2 | includeempty | boolean | No | Include addresses with no payments (default: false) |
| 3 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

JSON array of objects:

| Field | Type | Description |
|-------|------|-------------|
| address | string | The receiving address |
| account | string | DEPRECATED. The account name |
| amount | numeric | Total amount received |
| confirmations | numeric | Number of confirmations of the most recent included tx |
| txids | array | Array of transaction IDs contributing to the balance |

**Examples**

```bash
verus listreceivedbyaddress
verus listreceivedbyaddress 6 true
```

**Live output (testnet, partial):**
```json
[
  {
    "address": "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",
    "account": "agentplatform-registration",
    "amount": 527.21640000,
    "confirmations": 333,
    "txids": ["0099668458e75500...", "6a93c0fd655c9c6c..."]
  }
]
```

**Related Commands**

- [`listreceivedbyaccount`](#listreceivedbyaccount) — List by account (deprecated)
- [`getreceivedbyaddress`](#getreceivedbyaddress) — Get total for single address

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## listsinceblock

> **Category:** Wallet | **Version:** v1.2.14-2+

Get all transactions in blocks since a specified block hash, or all transactions if omitted.

**Syntax**

```
listsinceblock ( "blockhash" target-confirmations includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | blockhash | string | No | List transactions since this block |
| 2 | target-confirmations | numeric | No | Minimum confirmations required (≥1) |
| 3 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| transactions | array | Array of transaction objects |
| lastblock | string | Hash of the last block |

Each transaction contains: `account`, `address`, `category` (send/receive), `amount`, `vout`, `fee`, `confirmations`, `blockhash`, `blockindex`, `blocktime`, `txid`, `time`, `timereceived`.

**Examples**

```bash
## All transactions
verus listsinceblock

## Since a specific block with 6 confirmations
verus listsinceblock "000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad" 6
```

**Related Commands**

- [`listtransactions`](#listtransactions) — List recent transactions
- [`gettransaction`](#gettransaction) — Get single transaction details

**Notes**

- Useful for tracking new transactions since a known block.
- Can return very large result sets if no blockhash is specified.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## listtransactions

> **Category:** Wallet | **Version:** v1.2.x+

Returns up to `count` most recent transactions, optionally skipping the first `from`.

**Syntax**

```
listtransactions ( "account" count from includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | account | string | No | `"*"` | DEPRECATED. Use `"*"` for all accounts. Also accepts `'{queryobject}'` JSON filter syntax. |
| 2 | count | numeric | No | 10 | Number of transactions to return. |
| 3 | from | numeric | No | 0 | Number of transactions to skip. |
| 4 | includeWatchonly | bool | No | false | Include watch-only addresses. |

**Result**

Array of transaction objects with fields: `account`, `address`, `category` (send/receive/move), `amount`, `vout`, `fee`, `confirmations`, `blockhash`, `blockindex`, `txid`, `time`, `timereceived`, `comment`, `otheraccount` (for category "move"), `size`.

**Examples**

**Basic Usage**

```bash
verus -testnet listtransactions "*" 3
```

**Output (trimmed):**
```json
[
  {
    "account": "",
    "address": "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",
    "category": "send",
    "amount": -0.92700000,
    "vout": 1,
    "fee": -0.00100000,
    "confirmations": 326,
    "txid": "adce8581971e889d253a2980542c1600daf0b9b43c614d94d6df6c25c4bcacc9",
    "time": 1770429209,
    "size": 1155
  }
]
```

**Pagination**

```bash
verus -testnet listtransactions "*" 20 100
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"listtransactions","params":["*",20,100]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Transaction history** — display recent wallet activity
- **Pagination** — use `from` to page through history
- **Payment monitoring** — poll for new incoming transactions

**Common Errors**

| Error | Cause |
|-------|-------|
| `Negative from` | The `from` parameter must be ≥ 0 |

**Related Commands**

- [`gettransaction`](#gettransaction) — Detailed info for a specific tx
- [`listunspent`](#listunspent) — List spendable UTXOs

**Notes**

- Both `send` and `receive` entries appear for self-sends.
- The `account` parameter is deprecated — use `"*"`.
- Results are ordered newest-first.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## listunspent

> **Category:** Wallet | **Version:** v1.2.x+

Returns array of unspent transaction outputs (UTXOs) with between minconf and maxconf confirmations.

**Syntax**

```
listunspent ( minconf maxconf ["address",...] includeshared )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | minconf | numeric | No | 1 | Minimum confirmations. |
| 2 | maxconf | numeric | No | 9999999 | Maximum confirmations. |
| 3 | addresses | array | No | — | Filter by specific addresses. |
| 4 | includeshared | bool | No | false | Include outputs spendable by others. |

**Result**

Array of UTXO objects:

| Field | Type | Description |
|-------|------|-------------|
| txid | string | Transaction ID |
| vout | numeric | Output index |
| generated | boolean | True if coinbase/staking output |
| address | string | Address of the output |
| account | string | DEPRECATED. Associated account |
| scriptPubKey | string | Hex-encoded script |
| amount | numeric | Amount in native currency |
| currencyvalues | object | Non-native token amounts (if present) |
| confirmations | numeric | Number of confirmations |
| redeemScript | string | Redeem script (if P2SH) |
| spendable | boolean | Whether the wallet can spend this output |

**Examples**

**Basic Usage**

```bash
verus -testnet listunspent
```

**Output (first entry):**
```json
[
  {
    "txid": "a838aaf681d037a0f3e27eaa1d6e398664ec82ac87e008c26e2588bb60b4bd45",
    "vout": 2,
    "generated": false,
    "address": "RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2",
    "account": "agentplatform-registration",
    "amount": 1.00000000,
    "confirmations": 649,
    "spendable": true
  }
]
```

**Filter by Address**

```bash
verus -testnet listunspent 6 9999999 '["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"]'
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"listunspent","params":[6,9999999,["RAWwNeTLRg9urgnDPQtPyZ6NRycsmSY2J2"]]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **UTXO management** — inspect available inputs before raw transactions
- **Coin selection** — find UTXOs of specific sizes
- **Multi-currency** — `currencyvalues` shows non-native token amounts
- **Address audit** — filter UTXOs by address

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid address` | Address in filter array is malformed |

**Related Commands**

- [`getbalance`](#getbalance) — Summarized balance
- [`getcurrencybalance`](#getcurrencybalance) — Per-address currency balances
- [`gettransaction`](#gettransaction) — Details for a specific tx

**Notes**

- UTXOs with `currencyvalues` may show `amount: 0.00000000` for the native coin while holding non-native tokens.
- The `generated` field indicates coinbase (mining/staking) outputs.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## lockunspent

> **Category:** Wallet | **Version:** v1.2.14-2+

Temporarily lock or unlock specified transaction outputs. Locked outputs are excluded from automatic coin selection when spending.

**Syntax**

```
lockunspent unlock [{"txid":"txid","vout":n},...]
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | unlock | boolean | Yes | `true` to unlock, `false` to lock |
| 2 | transactions | JSON array | Yes | Array of `{txid, vout}` objects |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | boolean | `true` if successful |

**Examples**

```bash
## Lock an output
verus lockunspent false '[{"txid":"a08e6907...","vout":1}]'

## Unlock it
verus lockunspent true '[{"txid":"a08e6907...","vout":1}]'
```

**Related Commands**

- [`listlockunspent`](#listlockunspent) — List currently locked outputs
- [`listunspent`](#listunspent) — List spendable outputs

**Notes**

- Locks are **in-memory only** — cleared on node restart.
- Useful for reserving specific UTXOs for manual transaction construction.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## move

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Move a specified amount from one account to another within the wallet. This is purely an accounting operation — no on-chain transaction is created.

**Syntax**

```
move "fromaccount" "toaccount" amount ( minconf "comment" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | fromaccount | string | Yes | Must be `""` for default account |
| 2 | toaccount | string | Yes | Must be `""` for default account |
| 3 | amount | numeric | Yes | Amount to move |
| 4 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 5 | comment | string | No | Optional comment |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | boolean | `true` if successful |

**Related Commands**

- [`listaccounts`](#listaccounts) — List account balances (deprecated)
- [`setaccount`](#setaccount) — Set account for address (deprecated)

**Notes**

- The account system is **deprecated**. This command only adjusts internal accounting labels.
- No blockchain transaction is created — this is purely a wallet-internal operation.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## prunespentwallettransactions

> **Category:** Wallet | **Version:** v1.2.14-2+

Remove all spent transactions from the wallet database. Optionally keep a specific transaction. **Back up your wallet.dat before running.**

**Syntax**

```
prunespentwallettransactions ( "txid" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | txid | string | No | Transaction ID to keep (preserve this one) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| total_transactions | numeric | Total transactions before pruning |
| remaining_transactions | numeric | Transactions remaining after pruning |
| removed_transactions | numeric | Number of transactions removed |

**Examples**

```bash
## Prune all spent transactions
verus prunespentwallettransactions

## Prune but keep a specific tx
verus prunespentwallettransactions "1075db55d416d3ca..."
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Wallet corruption | Always backup wallet.dat first |

**Related Commands**

- [`backupwallet`](#backupwallet) — Backup wallet before pruning
- [`listtransactions`](#listtransactions) — List wallet transactions

**Notes**

- ⚠️ **Destructive operation** — always `backupwallet` first.
- Reduces wallet.dat size for wallets with many historical transactions.
- Improves wallet performance by removing unnecessary transaction data.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## rescanfromheight

> **Category:** Wallet | **Version:** v1.2.14-2+

Rescans the blockchain from a specified height to find wallet transactions. Useful after importing keys.

**Syntax**

```
rescanfromheight ( height )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | height | numeric | No | Block height to start from (default: 0) |

**Result**

No return value documented.

**Examples**

```bash
## Rescan entire chain
verus rescanfromheight

## Rescan from block 1000000
verus rescanfromheight 1000000
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Long execution time | Rescanning large portions of the chain |

**Related Commands**

- [`importprivkey`](#importprivkey) — Import key (triggers optional rescan)
- [`importaddress`](#importaddress) — Import watch-only address
- [`z_importkey`](#z_importkey) — Import shielded key

**Notes**

- ⚠️ Can take **minutes to hours** on large wallets or full chain rescans.
- Use a specific height to limit scan time (e.g., the block when the key was first used).

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## resendwallettransactions

> **Category:** Wallet | **Version:** v1.2.14-2+

Immediately re-broadcasts unconfirmed wallet transactions to all peers. Intended for testing — the wallet periodically re-broadcasts automatically.

**Syntax**

```
resendwallettransactions
```

**Parameters**

None.

**Result**

JSON array of transaction IDs that were re-broadcast.

**Examples**

```bash
verus resendwallettransactions
```

**Live output (testnet):**
```json
[]
```

**Related Commands**

- [`listtransactions`](#listtransactions) — List wallet transactions
- [`gettransaction`](#gettransaction) — Get transaction details

**Notes**

- The wallet automatically re-broadcasts unconfirmed transactions periodically.
- This command forces an immediate re-broadcast — mainly useful for testing/debugging.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## sendfrom

> **Category:** Wallet | **Version:** v1.2.x+ | ⚠️ **DEPRECATED**

Send an amount from an account to a VRSCTEST address. Use `sendtoaddress` instead.

**Syntax**

```
sendfrom "fromaccount" "toVRSCTESTaddress" amount ( minconf "comment" "comment-to" )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | fromaccount | string | Yes | — | MUST be `""` for default account. |
| 2 | toVRSCTESTaddress | string | Yes | — | The destination address. |
| 3 | amount | numeric | Yes | — | Amount in VRSCTEST (fee added on top). |
| 4 | minconf | numeric | No | 1 | Minimum confirmations on inputs. |
| 5 | comment | string | No | — | Wallet-only comment. |
| 6 | comment-to | string | No | — | Wallet-only recipient note. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| transactionid | string | The transaction id. |

**Examples**

**Basic Usage**

```bash
verus -testnet sendfrom "" "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.01
```

**With Confirmations and Comments**

```bash
verus -testnet sendfrom "" "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.01 6 "donation" "seans outpost"
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"sendfrom","params":["","RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",0.01,6,"donation","seans outpost"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid account name` | Using an account name other than `""` |
| `Insufficient funds` | Not enough confirmed balance |

**Related Commands**

- [`sendtoaddress`](#sendtoaddress) — Preferred replacement
- [`sendmany`](#sendmany) — Send to multiple addresses

**Notes**

- **DEPRECATED** — use `sendtoaddress` for all new code.
- The `fromaccount` parameter must be `""`. Named accounts are no longer supported.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## sendmany

> **Category:** Wallet | **Version:** v1.2.x+

Send to multiple addresses in a single transaction.

**Syntax**

```
sendmany "fromaccount" {"address":amount,...} ( minconf "comment" ["address",...] )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | fromaccount | string | Yes | — | MUST be `""` for default account. |
| 2 | amounts | object | Yes | — | JSON object: `{"address": amount, ...}` |
| 3 | minconf | numeric | No | 1 | Minimum confirmations on inputs. |
| 4 | comment | string | No | — | Wallet-only comment. |
| 5 | subtractfeefromamount | array | No | — | Array of addresses to subtract fee from. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| transactionid | string | The transaction id (single tx for all recipients). |

**Examples**

**Basic Usage**

```bash
verus -testnet sendmany "" '{"RAddr1":0.01,"RAddr2":0.02}'
```

**With Comment**

```bash
verus -testnet sendmany "" '{"RAddr1":0.01,"RAddr2":0.02}' 6 "testing"
```

**Subtract Fee from Recipients**

```bash
verus -testnet sendmany "" '{"RAddr1":0.01,"RAddr2":0.02}' 1 "" '["RAddr1","RAddr2"]'
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"sendmany","params":["",{"RAddr1":0.01,"RAddr2":0.02},6,"testing"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Batch payments** — pay multiple recipients in one transaction (saves fees)
- **Payroll / distributions** — send to many addresses at once
- **Fee splitting** — deduct fee proportionally from selected recipients

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid account name` | Using anything other than `""` |
| `Insufficient funds` | Total amounts + fee exceeds balance |
| `Invalid address` | One or more addresses are malformed |
| `Transaction too large` | Too many inputs/outputs |

**Related Commands**

- [`sendtoaddress`](#sendtoaddress) — Send to a single address
- [`listunspent`](#listunspent) — Check available UTXOs

**Notes**

- Creates a single transaction regardless of recipient count — more efficient than multiple `sendtoaddress` calls.
- The `fromaccount` parameter must be `""`.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## sendtoaddress

> **Category:** Wallet | **Version:** v1.2.x+

Send an amount to a given address. The amount is rounded to the nearest 0.00000001.

**Syntax**

```
sendtoaddress "VRSCTEST_address" amount ( "comment" "comment-to" subtractfeefromamount )
```

**Parameters**

| # | Name | Type | Required | Default | Description |
|---|------|------|----------|---------|-------------|
| 1 | address | string | Yes | — | The VRSCTEST address to send to. |
| 2 | amount | numeric | Yes | — | The amount in VRSCTEST to send (e.g. `0.1`). |
| 3 | comment | string | No | — | A wallet-only comment describing the transaction. |
| 4 | comment-to | string | No | — | A wallet-only note about the recipient. |
| 5 | subtractfeefromamount | boolean | No | false | If true, the fee is deducted from the amount sent. |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| transactionid | string | The transaction id (txid). |

**Examples**

**Basic Usage**

```bash
verus -testnet sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1
```

**With Comment**

```bash
verus -testnet sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1 "donation" "seans outpost"
```

**Subtract Fee from Amount**

```bash
verus -testnet sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1 "" "" true
```

**RPC (curl)**

```bash
curl --user user:pass --data-binary \
  '{"jsonrpc":"1.0","id":"curltest","method":"sendtoaddress","params":["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",0.1,"donation","seans outpost"]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**

- **Simple payments** — send VRSCTEST to another address
- **Fee management** — use `subtractfeefromamount` to send exact wallet balance
- **Annotated transactions** — add comments for record-keeping

**Common Errors**

| Error | Cause |
|-------|-------|
| `Insufficient funds` | Wallet balance too low for amount + fee |
| `Invalid Verus address` | Address format is wrong or not valid |
| `Amount out of range` | Negative or excessively large amount |
| `Transaction too large` | Too many inputs required — consolidate UTXOs first |

**Related Commands**

- [`sendfrom`](#sendfrom) — Send from a specific account (deprecated)
- [`sendmany`](#sendmany) — Send to multiple addresses in one transaction
- [`gettransaction`](#gettransaction) — Look up the resulting transaction
- [`getbalance`](#getbalance) — Check available balance first

**Notes**

- Comments are stored locally in the wallet only — they are **not** on the blockchain.
- The wallet must be unlocked if encrypted.
- Transaction fee is set by `paytxfee` or estimated automatically.

**Tested On**

- **Network:** VRSCTEST (testnet)
- **Version:** 1.2.14-2
- **Block Height:** 926990

---

## setaccount

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Sets the account associated with the given address.

**Syntax**

```
setaccount "address" "account"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | The Verus address |
| 2 | account | string | Yes | Must be `""` for default account |

**Result**

No return value on success.

**Related Commands**

- [`getaccount`](#getaccount) — Get account for address (deprecated)
- [`listaccounts`](#listaccounts) — List all accounts (deprecated)

**Notes**

- The account system is **deprecated**.
- Only `""` (empty string) is accepted as the account parameter.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## settxfee

> **Category:** Wallet | **Version:** v1.2.14-2+

Set the transaction fee per kilobyte for wallet transactions.

**Syntax**

```
settxfee amount
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | amount | numeric | Yes | Fee in VRSC/kB (rounded to nearest 0.00000001) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | boolean | `true` if successful |

**Examples**

```bash
verus settxfee 0.0001
```

**Live output (testnet):**
```
true
```

**Related Commands**

- [`getwalletinfo`](#getwalletinfo) — Shows current fee settings
- [`sendtoaddress`](#sendtoaddress) — Send transaction (uses this fee)

**Notes**

- Affects all subsequent wallet transactions until changed or node restart.
- Default fee is typically 0.0001 VRSC/kB.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_exportkey

> **Category:** Wallet | **Version:** v1.2.14-2+

Reveals the spending key for a shielded (z) address. The key can be imported with `z_importkey`.

**Syntax**

```
z_exportkey "zaddr" ( outputashex )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | zaddr | string | Yes | The shielded address |
| 2 | outputashex | boolean | No | Output key as hex bytes (default: false) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | The private spending key |

**Examples**

```bash
verus z_exportkey "zs1..."
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid zaddr | Address not in wallet or malformed |

**Related Commands**

- [`z_importkey`](#z_importkey) — Import a shielded spending key
- [`z_exportviewingkey`](#z_exportviewingkey) — Export viewing key (read-only)
- [`dumpprivkey`](#dumpprivkey) — Export transparent address key

**Notes**

- **Security-sensitive** — the exported key grants full spending access.
- Keep exported keys secure and never share publicly.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_exportviewingkey

> **Category:** Wallet | **Version:** v1.2.14-2+

Reveals the viewing key for a shielded (z) address. Viewing keys allow monitoring incoming transactions without spending ability.

**Syntax**

```
z_exportviewingkey "zaddr"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | zaddr | string | Yes | The shielded address |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | The viewing key |

**Examples**

```bash
verus z_exportviewingkey "zs1jqpysk8t5tzfe2rs25qkf0t6pzt3xdc7cjemn2x67zs0txfv4fq6d5qklq9pet6nwr556u0mywj"
```

**Related Commands**

- [`z_importviewingkey`](#z_importviewingkey) — Import a viewing key
- [`z_exportkey`](#z_exportkey) — Export full spending key

**Notes**

- Viewing keys can see incoming funds but **cannot detect spends** — reported balance may be higher than actual.
- Safer to share than spending keys for monitoring purposes.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_exportwallet

> **Category:** Wallet | **Version:** v1.2.14-2+

Exports all wallet keys (both taddr and zaddr) in a human-readable format to a file. More complete than `dumpwallet`.

**Syntax**

```
z_exportwallet "filename" ( omitemptytaddresses )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | filename | string | Yes | Output filename (saved in `-exportdir` folder) |
| 2 | omitemptytaddresses | boolean | No | Only export addresses with UTXOs or IDs (default: false) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| path | string | Full path of the destination file |

**Examples**

```bash
verus z_exportwallet "full-backup"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Cannot overwrite existing file` | File already exists |
| `exportdir` not configured | Start verusd with `-exportdir` |

**Related Commands**

- [`z_importwallet`](#z_importwallet) — Import from export file
- [`dumpwallet`](#dumpwallet) — Export taddr keys only
- [`backupwallet`](#backupwallet) — Copy wallet.dat

**Notes**

- Includes both transparent and shielded keys — **most complete export option**.
- Requires `-exportdir` to be set.
- Cannot overwrite existing files.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_getbalance

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns the balance of a transparent or shielded address belonging to the wallet. Supports wildcards.

**Syntax**

```
z_getbalance "address" ( minconf )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | Address (t-addr, z-addr, or wildcards: `z*`, `R*`, `i*`) |
| 2 | minconf | numeric | No | Minimum confirmations (default: 1) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | numeric | Total balance in VRSC |

**Examples**

```bash
verus z_getbalance "zs1..."
verus z_getbalance "zs1..." 5
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid address | Address not in wallet |

**Related Commands**

- [`z_gettotalbalance`](#z_gettotalbalance) — Get combined transparent + private balance
- [`getbalance`](#getbalance) — Get transparent balance
- [`z_listunspent`](#z_listunspent) — List shielded unspent notes

**Notes**

- ⚠️ If wallet only has a viewing key (not spending key), spends cannot be detected — balance may appear higher than actual.
- Supports wildcard patterns: `z*` (all z-addresses), `R*` (all R-addresses), `i*` (all i-addresses).

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_getencryptionaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Derives an encryption z-address from a wallet address, seed, or extended key, optionally scoped between two VerusIDs. Returns viewing key and optionally the spending key.

**Syntax**

```
z_getencryptionaddress '{
  "address": "zaddress",
  "seed": "wallet seed",
  "hdindex": n,
  "rootkey": "extended private key",
  "fromid": "id@",
  "toid": "id@",
  "encryptionindex": n,
  "returnsecret": true|false
}'
```

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| address | string | Optional* | z-address present in wallet |
| seed | string | Optional* | Raw wallet seed |
| hdindex | numeric | No | Address index to derive from seed (default: 0) |
| rootkey | string | Optional* | Extended private key |
| fromid | string | No | Source VerusID for scoped key derivation |
| toid | string | No | Target VerusID for scoped key derivation |
| encryptionindex | numeric | No | Index for deriving final encryption address (default: 0) |
| returnsecret | boolean | No | Return extended spending key (default: false) |

*One of `address`, `seed`, or `rootkey` is required.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| extendedviewingkey | string | Sapling extended viewing key |
| incomingviewingkey | string | Sapling hex incoming viewing key |
| address | string | The derived encryption address |
| extendedspendingkey | string | Spending key (only if `returnsecret: true`) |

**Examples**

```bash
verus z_getencryptionaddress '{"address":"zs1...","fromid":"bob@","toid":"alice@"}'
```

**Related Commands**

- [`decryptdata`](#decryptdata) — Decrypt data encrypted to a z-address
- [`signdata`](identity.md#signdata) — Sign/encrypt data
- [`z_getnewaddress`](#z_getnewaddress) — Generate new z-address

**Notes**

- Part of Verus's identity-linked encryption system.
- The `fromid`/`toid` scoping creates deterministic encryption addresses for communication between two identities.
- Useful for VDXF encrypted data exchange.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_getmigrationstatus

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns information about the status of Sprout to Sapling migration.

**Syntax**

```
z_getmigrationstatus
```

**Parameters**

None.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| enabled | boolean | Whether migration is enabled |
| destination_address | string | Sapling address receiving Sprout funds |
| unmigrated_amount | numeric | Total unmigrated VRSC |
| unfinalized_migrated_amount | numeric | Migrated but < 10 confirmations |
| finalized_migrated_amount | numeric | Migrated with ≥ 10 confirmations |
| finalized_migration_transactions | numeric | Number of finalized migration txs |
| time_started | numeric | Unix timestamp of first migration tx (optional) |
| migration_txids | array | All migration transaction IDs |

**Examples**

```bash
verus z_getmigrationstatus
```

**Live output (testnet):**
```json
{
  "enabled": false,
  "destination_address": "zs1jqpysk8t5tzfe2rs25qkf0t6pzt3xdc7cjemn2x67zs0txfv4fq6d5qklq9pet6nwr556u0mywj",
  "unmigrated_amount": "0.00",
  "unfinalized_migrated_amount": "0.00",
  "finalized_migrated_amount": "0.00",
  "finalized_migration_transactions": 0,
  "migration_txids": []
}
```

**Related Commands**

- [`z_setmigration`](#z_setmigration) — Enable/disable migration

**Notes**

- A transaction is "finalized" when it has ≥ 10 confirmations.
- Migration sends up to 5 transactions per interval (every 500 blocks at height ≡ 499 mod 500).
- Ends when Sprout balance falls below 0.01 VRSC.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_getnewaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns a new shielded address for receiving payments. Defaults to Sapling type.

**Syntax**

```
z_getnewaddress ( "type" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | type | string | No | Address type: `"sapling"` (default) or `"sprout"` |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | New shielded address |

**Examples**

```bash
verus z_getnewaddress
verus z_getnewaddress sapling
```

**Related Commands**

- [`z_listaddresses`](#z_listaddresses) — List all shielded addresses
- [`getnewaddress`](#getnewaddress) — Get new transparent address
- [`z_exportkey`](#z_exportkey) — Export private key for z-address

**Notes**

- Sapling addresses start with `zs1`.
- Sprout addresses are legacy — use Sapling for new addresses.
- Key generation may take a moment due to cryptographic operations.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_getoperationresult

> **Category:** Wallet | **Version:** v1.2.14-2+

Retrieves the result and status of finished operations, then **removes them from memory**. Use `z_getoperationstatus` to check without removing.

**Syntax**

```
z_getoperationresult ( ["operationid", ...] )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | operationid | array | No | List of operation IDs to check. If omitted, returns all. |

**Result**

JSON array of operation result objects with `id`, `status`, `creation_time`, and operation-specific result data.

**Examples**

```bash
## Get all finished operation results
verus z_getoperationresult

## Get specific operation
verus z_getoperationresult '["opid-42f729bf-106a-441e-868e-866a2a2c12ac"]'
```

**Related Commands**

- [`z_getoperationstatus`](#z_getoperationstatus) — Check status without removing
- [`z_listoperationids`](#z_listoperationids) — List all operation IDs
- [`z_sendmany`](#z_sendmany) — Returns an operation ID

**Notes**

- **Removes operations from memory** after returning — use `z_getoperationstatus` if you want to check without clearing.
- Operations include `z_sendmany`, `z_shieldcoinbase`, `z_mergetoaddress` results.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_getoperationstatus

> **Category:** Wallet | **Version:** v1.2.14-2+

Get operation status and any associated result or error data. The operation **remains in memory** (unlike `z_getoperationresult`).

**Syntax**

```
z_getoperationstatus ( ["operationid", ...] )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | operationid | array | No | Operation IDs to check. If omitted, returns all. |

**Result**

JSON array of operation status objects.

**Examples**

```bash
verus z_getoperationstatus
verus z_getoperationstatus '["opid-42f729bf-..."]'
```

**Live output (testnet, partial):**
```json
[
  {
    "id": "opid-42f729bf-106a-441e-868e-866a2a2c12ac",
    "status": "success",
    "creation_time": 1770423015
  }
]
```

**Related Commands**

- [`z_getoperationresult`](#z_getoperationresult) — Get result and remove from memory
- [`z_listoperationids`](#z_listoperationids) — List all operation IDs

**Notes**

- Does NOT remove the operation from memory — safe to call repeatedly.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_gettotalbalance

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns the total value of funds in the wallet, broken down by transparent, private (shielded), and total.

**Syntax**

```
z_gettotalbalance ( minconf includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 2 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| transparent | string | Total transparent balance |
| private | string | Total shielded balance (Sprout + Sapling) |
| total | string | Combined total |

**Examples**

```bash
verus z_gettotalbalance
verus z_gettotalbalance 5
```

**Live output (testnet):**
```json
{
  "transparent": "122.8845",
  "private": "1.00",
  "total": "123.8845"
}
```

**Related Commands**

- [`getbalance`](#getbalance) — Transparent balance only
- [`z_getbalance`](#z_getbalance) — Balance for specific address

**Notes**

- ⚠️ If wallet has viewing-key-only addresses, private balance may be overstated (spends undetectable).
- Values returned as strings, not numbers.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_importkey

> **Category:** Wallet | **Version:** v1.2.14-2+

Imports a shielded spending key (from `z_exportkey`) into the wallet.

**Syntax**

```
z_importkey "zkey" ( rescan startHeight )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | zkey | string | Yes | The spending key |
| 2 | rescan | string | No | `"yes"`, `"no"`, or `"whenkeyisnew"` (default) |
| 3 | startHeight | numeric | No | Block height to start rescan from (default: 0) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| type | string | `"sprout"` or `"sapling"` |
| address | string | Corresponding address |

**Examples**

```bash
## Import with automatic rescan
verus z_importkey "secret-extended-key..."

## Import without rescan
verus z_importkey "secret-extended-key..." no

## Import with partial rescan from height
verus z_importkey "secret-extended-key..." whenkeyisnew 30000
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Invalid spending key | Malformed key string |
| Rescan timeout | Large chain + low startHeight |

**Related Commands**

- [`z_exportkey`](#z_exportkey) — Export spending key
- [`z_importviewingkey`](#z_importviewingkey) — Import viewing key (read-only)
- [`importprivkey`](#importprivkey) — Import transparent key

**Notes**

- Rescan can take minutes to hours depending on startHeight and chain size.
- Use `startHeight` to limit rescan time if you know when the key was first used.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_importviewingkey

> **Category:** Wallet | **Version:** v1.2.14-2+

Imports a shielded viewing key (from `z_exportviewingkey`). Allows monitoring incoming transactions without spending ability.

**Syntax**

```
z_importviewingkey "vkey" ( rescan startHeight )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | vkey | string | Yes | The viewing key |
| 2 | rescan | string | No | `"yes"`, `"no"`, or `"whenkeyisnew"` (default) |
| 3 | startHeight | numeric | No | Block height to start rescan from (default: 0) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| type | string | `"sprout"` or `"sapling"` |
| address | string | Corresponding address |

**Examples**

```bash
verus z_importviewingkey "zxviews1..."
verus z_importviewingkey "zxviews1..." no
verus z_importviewingkey "zxviews1..." whenkeyisnew 30000
```

**Related Commands**

- [`z_exportviewingkey`](#z_exportviewingkey) — Export viewing key
- [`z_importkey`](#z_importkey) — Import full spending key
- [`importaddress`](#importaddress) — Import transparent watch-only

**Notes**

- ⚠️ Viewing keys **cannot detect spends** — balance may appear higher than actual.
- Creates a watch-only shielded address.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_importwallet

> **Category:** Wallet | **Version:** v1.2.14-2+

Imports both transparent and shielded keys from a wallet export file (created by `z_exportwallet`).

**Syntax**

```
z_importwallet "filename"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | filename | string | Yes | Path to the wallet export file |

**Result**

No return value on success.

**Examples**

```bash
verus z_exportwallet "backup"
verus z_importwallet "/path/to/exportdir/backup"
```

**Related Commands**

- [`z_exportwallet`](#z_exportwallet) — Export all keys
- [`importwallet`](#importwallet) — Import taddr keys only

**Notes**

- Imports both taddr and zaddr keys — most complete import option.
- Triggers a wallet rescan.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_listaddresses

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns the list of Sprout and Sapling shielded addresses belonging to the wallet.

**Syntax**

```
z_listaddresses ( includeWatchonly )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | includeWatchonly | boolean | No | Include watch-only addresses (default: false) |

**Result**

JSON array of shielded address strings.

**Examples**

```bash
verus z_listaddresses
```

**Live output (testnet):**
```json
[
  "zs1jqpysk8t5tzfe2rs25qkf0t6pzt3xdc7cjemn2x67zs0txfv4fq6d5qklq9pet6nwr556u0mywj"
]
```

**Related Commands**

- [`z_getnewaddress`](#z_getnewaddress) — Create new shielded address
- [`z_getbalance`](#z_getbalance) — Get balance for an address

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_listoperationids

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns the list of operation IDs currently known to the wallet, optionally filtered by status.

**Syntax**

```
z_listoperationids ( "status" )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | status | string | No | Filter by status (e.g., `"success"`, `"failed"`, `"executing"`) |

**Result**

JSON array of operation ID strings.

**Examples**

```bash
verus z_listoperationids
verus z_listoperationids "success"
```

**Live output (testnet):**
```json
[
  "opid-0b1d7fe5-a2e7-47ed-bf27-01cfb49fd094",
  "opid-92d661e2-588a-4b5a-9187-a041a92b9bf7",
  "opid-ea97f749-23d2-46d4-bb6a-5b91d148e079",
  "opid-9b96eb69-962e-4e26-a2e5-c194ba2e8d5e",
  "opid-a1e6b781-5020-4c8e-97b2-4c7749a94f1e",
  "opid-4e63f6fa-7ee2-42c7-8fad-dde7393d9952",
  "opid-42f729bf-106a-441e-868e-866a2a2c12ac"
]
```

**Related Commands**

- [`z_getoperationstatus`](#z_getoperationstatus) — Get operation details
- [`z_getoperationresult`](#z_getoperationresult) — Get result and clear

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_listreceivedbyaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns a list of amounts received by a shielded address belonging to the wallet.

**Syntax**

```
z_listreceivedbyaddress "address" ( minconf )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | address | string | Yes | The shielded address |
| 2 | minconf | numeric | No | Minimum confirmations (default: 1) |

**Result**

JSON array of note objects:

| Field | Type | Description |
|-------|------|-------------|
| txid | string | Transaction ID |
| amount | numeric | Value in the note |
| memo | string | Hex-encoded memo field |
| outindex (sapling) | numeric | Output index |
| jsindex (sprout) | numeric | JoinSplit index |
| jsoutindex (sprout) | numeric | JoinSplit output index |
| confirmations | numeric | Block confirmations |
| change | boolean | True if address is also a sender |

**Examples**

```bash
verus z_listreceivedbyaddress "zs1..."
```

**Related Commands**

- [`z_listunspent`](#z_listunspent) — List unspent shielded notes
- [`z_getbalance`](#z_getbalance) — Get balance for address

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_listunspent

> **Category:** Wallet | **Version:** v1.2.14-2+

Returns array of unspent shielded notes with between minconf and maxconf confirmations. Optionally filter by address.

**Syntax**

```
z_listunspent ( minconf maxconf includeWatchonly ["zaddr",...] )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | minconf | numeric | No | Minimum confirmations (default: 1) |
| 2 | maxconf | numeric | No | Maximum confirmations (default: 9999999) |
| 3 | includeWatchonly | boolean | No | Include watch-only (default: false) |
| 4 | addresses | JSON array | No | Filter to specific z-addresses |

**Result**

JSON array of unspent note objects with `txid`, `outindex`, `confirmations`, `spendable`, `address`, `amount`, `memo`, `change`.

**Examples**

```bash
verus z_listunspent
```

**Live output (testnet):**
```json
[
  {
    "txid": "7db301e131fe1edb78e2761f98a82b9440e073230f9f572f10f7f28b3eff7036",
    "outindex": 0,
    "confirmations": 4817,
    "spendable": true,
    "address": "zs1jqpysk8t5tzfe2rs25qkf0t6pzt3xdc7cjemn2x67zs0txfv4fq6d5qklq9pet6nwr556u0mywj",
    "amount": 1.00000000,
    "memo": "f600000000...",
    "change": false
  }
]
```

**Related Commands**

- [`z_listreceivedbyaddress`](#z_listreceivedbyaddress) — List all received notes
- [`listunspent`](#listunspent) — List transparent UTXOs
- [`z_getbalance`](#z_getbalance) — Get address balance

**Notes**

- Notes with 0 confirmations are returned when minconf=0 but are not immediately spendable.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 ✅ live tested

---

## z_mergetoaddress

> **Category:** Wallet | **Version:** v1.2.14-2+

Merges multiple UTXOs and/or shielded notes into a single UTXO or note. Asynchronous operation.

⚠️ **DISABLED by default.** Requires experimental features to be enabled.

**Syntax**

```
z_mergetoaddress ["fromaddress",...] "toaddress" ( fee transparent_limit shielded_limit "memo" )
```

**Enabling**

```
experimentalfeatures=1
zmergetoaddress=1
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | fromaddresses | JSON array | Yes | Source addresses or special strings: `"ANY_TADDR"`, `"ANY_SPROUT"`, `"ANY_SAPLING"` |
| 2 | toaddress | string | Yes | Destination t-addr or z-addr |
| 3 | fee | numeric | No | Fee amount (default: 0.0001) |
| 4 | transparent_limit | numeric | No | Max UTXOs to merge (default: 50) |
| 5 | shielded_limit | numeric | No | Max notes to merge (default: 20 Sprout / 200 Sapling) |
| 6 | memo | string | No | Hex-encoded memo (for z-addr destinations) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| remainingUTXOs | numeric | UTXOs still available |
| remainingTransparentValue | numeric | Value of remaining UTXOs |
| remainingNotes | numeric | Notes still available |
| remainingShieldedValue | numeric | Value of remaining notes |
| mergingUTXOs | numeric | UTXOs being merged |
| mergingTransparentValue | numeric | Value being merged (transparent) |
| mergingNotes | numeric | Notes being merged |
| mergingShieldedValue | numeric | Value being merged (shielded) |
| opid | string | Operation ID for tracking |

**Examples**

```bash
verus z_mergetoaddress '["ANY_SAPLING","RAddr..."]' "zs1..."
```

**Related Commands**

- [`z_sendmany`](#z_sendmany) — Send to multiple addresses
- [`z_shieldcoinbase`](#z_shieldcoinbase) — Shield coinbase UTXOs
- [`z_getoperationstatus`](#z_getoperationstatus) — Track operation

**Notes**

- Cannot merge from both Sprout and Sapling simultaneously.
- Selected UTXOs are locked during the operation.
- Protected coinbase UTXOs are ignored — use `z_shieldcoinbase` for those.
- Max transaction size: 100KB (pre-Sapling) or 2MB (post-Sapling).

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## z_sendmany

> **Category:** Wallet | **Version:** v1.2.14-2+

Send funds from one address to multiple recipients. Supports both transparent and shielded addresses. Returns an async operation ID.

**Syntax**

```
z_sendmany "fromaddress" [{"address":"...","amount":...},...] ( minconf fee )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | fromaddress | string | Yes | Source t-addr or z-addr |
| 2 | amounts | JSON array | Yes | Array of `{address, amount, memo}` objects |
| 3 | minconf | numeric | No | Minimum confirmations for inputs (default: 1) |
| 4 | fee | numeric | No | Fee amount (default: 0.0001) |

**amounts array objects**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| address | string | Yes | Recipient t-addr or z-addr |
| amount | numeric | Yes | Amount in VRSC (note: daemon help text incorrectly says "KMD" — this is an upstream bug) |
| memo | string | No | Hex-encoded memo (z-addr recipients only) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| (value) | string | Operation ID (use with `z_getoperationstatus`) |

**Examples**

```bash
## Send from t-addr to z-addr
verus z_sendmany "RAddr..." '[{"address":"zs1...","amount":5.0}]'

## Send with memo
verus z_sendmany "zs1..." '[{"address":"zs1...","amount":1.0,"memo":"f600..."}]'
```

**Common Errors**

| Error | Cause |
|-------|-------|
| Insufficient funds | Not enough balance at source address |
| Invalid address | Malformed recipient address |
| Too many outputs | Pre-Sapling limit: 54 z-addr outputs |

**Related Commands**

- [`z_getoperationstatus`](#z_getoperationstatus) — Track send progress
- [`z_getoperationresult`](#z_getoperationresult) — Get final result
- [`sendmany`](#sendmany) — Transparent-only multi-send
- [`z_mergetoaddress`](#z_mergetoaddress) — Consolidate UTXOs/notes

**Notes**

- Asynchronous — returns immediately with an operation ID.
- Change from t-addr goes to a new t-addr; change from z-addr returns to itself.
- When sending coinbase UTXOs to z-addr, the entire UTXO value must be consumed (no change allowed).

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## z_setmigration

> **Category:** Wallet | **Version:** v1.2.14-2+

Enables or disables the automatic Sprout to Sapling migration. When enabled, funds are gradually moved from Sprout to Sapling addresses.

**Syntax**

```
z_setmigration enabled
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | enabled | boolean | Yes | `true` to enable, `false` to disable |

**Result**

No return value on success.

**Examples**

```bash
verus z_setmigration true
verus z_setmigration false
```

**Related Commands**

- [`z_getmigrationstatus`](#z_getmigrationstatus) — Check migration progress

**Notes**

- Migration sends up to 5 transactions every 500 blocks (at height ≡ 499 mod 500).
- Transaction amounts follow the distribution specified in ZIP 308 to minimize information leakage.
- Migration completes when Sprout balance falls below 0.01 VRSC.
- Destination is the Sapling account 0 address or the `-migrationdestaddress` parameter.
- May take several weeks for large Sprout balances.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## z_shieldcoinbase

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED — THIS API IS DEPRECATED AND NOT NECESSARY TO USE ON VERUS OR STANDARD PBAAS NETWORKS.** Shields transparent coinbase UTXOs by sending to a shielded z-address. Asynchronous operation. On Verus, coinbase outputs can be spent directly without shielding.

**Syntax**

```
z_shieldcoinbase "fromaddress" "tozaddress" ( fee limit )
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | fromaddress | string | Yes | Source t-addr or `"*"` for all |
| 2 | toaddress | string | Yes | Destination z-addr |
| 3 | fee | numeric | No | Fee (default: 0.0001) |
| 4 | limit | numeric | No | Max UTXOs to shield (default: 50) |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| remainingUTXOs | numeric | Coinbase UTXOs still available |
| remainingValue | numeric | Value still available |
| shieldingUTXOs | numeric | UTXOs being shielded |
| shieldingValue | numeric | Value being shielded |
| opid | string | Operation ID |

**Examples**

```bash
verus z_shieldcoinbase "RAddr..." "zs1..."
verus z_shieldcoinbase "*" "zs1..."
```

**Related Commands**

- [`z_mergetoaddress`](#z_mergetoaddress) — Merge UTXOs and notes
- [`z_getoperationstatus`](#z_getoperationstatus) — Track operation

**Notes**

- **Deprecated** on Verus — coinbase shielding is not required on Verus/PBaaS networks.
- Selected UTXOs are locked during the operation.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## z_viewtransaction

> **Category:** Wallet | **Version:** v1.2.14-2+

Get detailed shielded information about an in-wallet transaction, including shielded spends and outputs.

**Syntax**

```
z_viewtransaction "txid"
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | txid | string | Yes | The transaction ID |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| txid | string | Transaction ID |
| spends | array | Shielded spend details |
| outputs | array | Shielded output details |

**spends array objects**

| Field | Type | Description |
|-------|------|-------------|
| type | string | `"sprout"` or `"sapling"` |
| spend (sapling) | numeric | Spend index |
| txidPrev | string | Source transaction ID |
| address | string | z-address |
| value | numeric | Amount in VRSC |
| valueZat | numeric | Amount in zatoshis |

**outputs array objects**

| Field | Type | Description |
|-------|------|-------------|
| type | string | `"sprout"` or `"sapling"` |
| output (sapling) | numeric | Output index |
| address | string | z-address |
| recovered | boolean | True if output not for wallet address |
| value | numeric | Amount in VRSC |
| memo | string | Hex-encoded memo |
| memoStr | string | UTF-8 memo (if valid text) |

**Examples**

```bash
verus z_viewtransaction "7db301e131fe1edb78e2761f98a82b9440e073230f9f572f10f7f28b3eff7036"
```

**Related Commands**

- [`gettransaction`](#gettransaction) — Get transparent transaction details
- [`z_listreceivedbyaddress`](#z_listreceivedbyaddress) — List received notes

**Notes**

- Only works for transactions involving this wallet's shielded addresses.
- Provides the shielded spend/output details not visible in `gettransaction`.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## zcbenchmark

> **Category:** Wallet | **Version:** v1.2.14-2+

Runs a benchmark of the selected type for a specified number of samples, returning running times.

**Syntax**

```
zcbenchmark benchmarktype samplecount
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | benchmarktype | string | Yes | Type of benchmark to run |
| 2 | samplecount | numeric | Yes | Number of times to run |

**Result**

JSON array of objects, each with a `runningtime` field.

```json
[
  {"runningtime": 0.123},
  {"runningtime": 0.125}
]
```

**Examples**

```bash
verus zcbenchmark createjoinsplit 5
```

**Related Commands**

- [`getinfo`](control.md#getinfo) — General node information

**Notes**

- Primarily a developer/testing tool for measuring cryptographic operation performance.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified)

---

## zcrawjoinsplit

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Low-level command to splice a JoinSplit into a raw transaction. Inputs are unilaterally confidential; outputs are confidential between sender/receiver.

**Syntax**

```
zcrawjoinsplit rawtx inputs outputs vpub_old vpub_new
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | rawtx | string | Yes | Raw transaction hex |
| 2 | inputs | JSON object | Yes | Map of `{note: zcsecretkey}` |
| 3 | outputs | JSON object | Yes | Map of `{zcaddr: value}` |
| 4 | vpub_old | numeric | Yes | Transparent value moving into confidential store |
| 5 | vpub_new | numeric | Yes | Transparent value moving out of confidential store |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| encryptednote1 | string | First encrypted note |
| encryptednote2 | string | Second encrypted note |
| rawtxn | string | Modified raw transaction |

**Notes**

- ⚠️ **DEPRECATED** — Do not use for new development.
- Low-level Sprout JoinSplit operation.
- The caller must deliver encrypted notes to recipients and sign/mine the transaction.
- Use `z_sendmany` for normal shielded transactions.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## zcrawkeygen

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Generates a raw zcash address with secret key and viewing key.

**Syntax**

```
zcrawkeygen
```

**Parameters**

None.

**Result**

| Field | Type | Description |
|-------|------|-------------|
| zcaddress | string | The generated z-address |
| zcsecretkey | string | The secret key |
| zcviewingkey | string | The viewing key |

**Notes**

- ⚠️ **DEPRECATED** — Use `z_getnewaddress` instead.
- Low-level Sprout key generation.
- Generated keys are NOT added to the wallet.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)

---

## zcrawreceive

> **Category:** Wallet | **Version:** v1.2.14-2+

⚠️ **DEPRECATED.** Decrypts an encrypted note and checks if the coin commitment exists in the blockchain.

**Syntax**

```
zcrawreceive zcsecretkey encryptednote
```

**Parameters**

| # | Name | Type | Required | Description |
|---|------|------|----------|-------------|
| 1 | zcsecretkey | string | Yes | The secret key for decryption |
| 2 | encryptednote | string | Yes | The encrypted note to decrypt |

**Result**

| Field | Type | Description |
|-------|------|-------------|
| amount | numeric | Value of the note |
| note | string | Decrypted note plaintext |
| exists | boolean | Whether the commitment is in the blockchain |

**Notes**

- ⚠️ **DEPRECATED** — Use `z_listreceivedbyaddress` or `z_viewtransaction` instead.
- Low-level Sprout note decryption.

**Tested On**

- **VRSCTEST v1.2.14-2** — Block 926996 (help output verified — **not executed**)