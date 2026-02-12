---
label: Control
icon: terminal
---


# Control Commands


---

## getinfo

> **Category:** Control | **Version:** v1.2.14+

Returns an object containing various state info about the node and wallet.

**Syntax**

```
getinfo
```

**Parameters**

None.

**Result**

| Field           | Type    | Description |
|-----------------|---------|-------------|
| VRSCversion     | string  | The Verus-specific version string |
| version         | numeric | The server version number |
| protocolversion | numeric | The protocol version |
| chainid         | string  | Blockchain currency i-address |
| notarychainid   | string  | Notary chain i-address |
| name            | string  | Chain name (e.g., VRSCTEST) |
| walletversion   | numeric | The wallet version |
| blocks          | numeric | Current number of blocks processed |
| longestchain    | numeric | Longest known chain height |
| timeoffset      | numeric | Time offset |
| proxy           | string  | Proxy used (empty if none) |
| connections     | numeric | Number of connections |
| tls_established | numeric | Number of TLS connections established |
| tls_verified    | numeric | Number of TLS connections with validated certificates |
| difficulty      | numeric | Current mining difficulty |
| testnet         | boolean | Whether the server is on testnet |
| keypoololdest   | numeric | Timestamp of oldest pre-generated key |
| keypoolsize     | numeric | Number of pre-generated keys |
| paytxfee        | numeric | Transaction fee in VRSC/kB |
| relayfee        | numeric | Minimum relay fee in VRSC/kB |
| unlocked_until  | numeric | Wallet unlock expiry timestamp (0 = locked, absent if unencrypted) |
| errors          | string  | Any error messages |

**Examples**

```bash
verus -testnet getinfo
```

**Testnet output:**
```json
{
  "VRSCversion": "1.2.14-2",
  "version": 2000753,
  "protocolversion": 170010,
  "chainid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "notarychainid": "iCtawpxUiCc2sEupt7Z4u8SDAncGZpgSKm",
  "name": "VRSCTEST",
  "walletversion": 60000,
  "blocks": 926996,
  "longestchain": 926996,
  "timeoffset": 0,
  "connections": 5,
  "tls_established": 5,
  "tls_verified": 0,
  "difficulty": 49081785917.1893,
  "testnet": true,
  "keypoololdest": 1770405903,
  "keypoolsize": 101,
  "paytxfee": 0.00000000,
  "relayfee": 0.00000100,
  "errors": ""
}
```

**Common Errors**

None typical.

**Related Commands**

- [`getnetworkinfo`](network.md#getnetworkinfo) — Detailed network info
- [`getdeprecationinfo`](network.md#getdeprecationinfo) — Version/deprecation info
- [`help`](#help) — List available commands

**Notes**

- This is one of the most useful commands for a quick status check.
- `blocks` vs `longestchain` — if they differ, the node is still syncing.
- `chainid` and `name` identify the chain (VRSCTEST for testnet).
- Includes PBaaS-specific fields like `notarizedroot` with cross-chain state info.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## help

> **Category:** Control | **Version:** v1.2.14+

List all commands, or get help for a specified command.

**Syntax**

```
help ("command")
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| command   | string | No       | The command to get help on |

**Result**

| Type   | Description |
|--------|-------------|
| string | The help text |

**Examples**

```bash
## List all available commands
verus -testnet help

## Get help for a specific command
verus -testnet help getinfo
```

**Common Errors**

None typical. Unknown commands return an error message.

**Related Commands**

- [`getinfo`](#getinfo) — General node info
- [`stop`](#stop) — Stop the server

**Notes**

- Without arguments, lists all available RPC commands grouped by category.
- With a command name, returns detailed usage information including syntax, parameters, and examples.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## stop

> **Category:** Control | **Version:** v1.2.14+

Stop the Verus daemon server.

**Syntax**

```
stop
```

**Parameters**

None.

**Result**

The server begins shutting down. Returns a confirmation message.

**Examples**

```bash
verus -testnet stop
```

**Common Errors**

None typical.

**Related Commands**

- [`getinfo`](#getinfo) — Check server status before stopping
- [`help`](#help) — List available commands

**Notes**

- ⚠️ **This will shut down the daemon**. The node will stop processing blocks and all RPC calls will fail.
- Ensure all pending operations are complete before stopping.
- The daemon performs a graceful shutdown, saving state to disk.
- Restart with `verusd` or the appropriate startup command.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only; **not executed**)