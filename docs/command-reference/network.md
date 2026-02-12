---
label: Network
icon: terminal
---


# Network Commands


---

## addnode

> **Category:** Network | **Version:** v1.2.14+

Attempts to add or remove a node from the addnode list, or tries a connection to a node once.

**Syntax**

```
addnode "node" "add|remove|onetry"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| node      | string | Yes      | The node address (IP:port). See `getpeerinfo` for connected nodes. |
| command   | string | Yes      | `add` to add to the list, `remove` to remove, `onetry` to try once. |

**Result**

No return value on success.

**Examples**

```bash
## Add a node to the addnode list
verus -testnet addnode "192.168.0.6:18842" "add"

## Try connecting to a node once
verus -testnet addnode "192.168.0.6:18842" "onetry"

## Remove a node from the list
verus -testnet addnode "192.168.0.6:18842" "remove"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Error adding node` | Node already in the addnode list |
| `Node has not been added` | Trying to remove a node that isn't in the list |

**Related Commands**

- [`getaddednodeinfo`](#getaddednodeinfo) — View added nodes
- [`disconnectnode`](#disconnectnode) — Disconnect a specific node
- [`getpeerinfo`](#getpeerinfo) — View connected peers

**Notes**

- Nodes added with `add` will be persistently reconnected to.
- `onetry` attempts a single connection without adding to the persistent list.
- Use `getaddednodeinfo` to verify added nodes.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## clearbanned

> **Category:** Network | **Version:** v1.2.14+

Clear all banned IPs from the ban list.

**Syntax**

```
clearbanned
```

**Parameters**

None.

**Result**

No return value on success.

**Examples**

```bash
verus -testnet clearbanned
```

**Common Errors**

None typical — this command always succeeds.

**Related Commands**

- [`setban`](#setban) — Add or remove an IP from the ban list
- [`listbanned`](#listbanned) — List all banned IPs

**Notes**

- Removes all entries from the ban list at once.
- Use `listbanned` before running to verify what will be cleared.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## disconnectnode

> **Category:** Network | **Version:** v1.2.14+

Immediately disconnects from the specified node.

**Syntax**

```
disconnectnode "node"
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| node      | string | Yes      | The node address (IP:port). See `getpeerinfo` for connected nodes. |

**Result**

No return value on success.

**Examples**

```bash
verus -testnet disconnectnode "192.168.0.6:18842"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Node not found in connected nodes` | The specified node is not currently connected |

**Related Commands**

- [`addnode`](#addnode) — Add/remove nodes from the connection list
- [`getpeerinfo`](#getpeerinfo) — List connected peers to find node addresses

**Notes**

- The disconnection is immediate.
- The node may reconnect if it's in the addnode list or connects inbound.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getaddednodeinfo

> **Category:** Network | **Version:** v1.2.14+

Returns information about added nodes. If `dns` is false, only a list of added nodes is returned; otherwise connected information is also available.

**Syntax**

```
getaddednodeinfo dns ( "node" )
```

**Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| dns       | boolean | Yes      | If false, only list added nodes. If true, include connection info. |
| node      | string  | No       | Return info about this specific node only. |

**Result**

```json
[
  {
    "addednode": "192.168.0.201",
    "connected": true|false,
    "addresses": [
      {
        "address": "192.168.0.201:8233",
        "connected": "outbound"
      }
    ]
  }
]
```

**Examples**

```bash
## Query all added nodes (no nodes added in this example)
verus -testnet getaddednodeinfo true
```

**Testnet output:**
```json
[
]
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Node has not been added` | Querying a specific node that wasn't added via `addnode` |

**Related Commands**

- [`addnode`](#addnode) — Add nodes to the list
- [`getpeerinfo`](#getpeerinfo) — View all connected peers

**Notes**

- Only nodes added via `addnode "add"` appear here. `onetry` nodes are not listed.
- Empty result means no nodes have been manually added.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getconnectioncount

> **Category:** Network | **Version:** v1.2.14+

Returns the number of connections to other nodes.

**Syntax**

```
getconnectioncount
```

**Parameters**

None.

**Result**

| Type    | Description |
|---------|-------------|
| numeric | The connection count |

**Examples**

```bash
verus -testnet getconnectioncount
```

**Testnet output:**
```
5
```

**Common Errors**

None typical.

**Related Commands**

- [`getpeerinfo`](#getpeerinfo) — Detailed info about each connection
- [`getnetworkinfo`](#getnetworkinfo) — General network state info

**Notes**

- Includes both inbound and outbound connections.
- A count of 0 may indicate network issues or that the node is still starting up.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getdeprecationinfo

> **Category:** Network | **Version:** v1.2.14+

Returns an object containing the current version and deprecation block height. Applicable only on mainnet.

**Syntax**

```
getdeprecationinfo
```

**Parameters**

None.

**Result**

```json
{
  "version": 2000753,
  "subversion": "/MagicBean:2.0.7-3/",
  "deprecationheight": 4453160
}
```

| Field             | Type    | Description |
|-------------------|---------|-------------|
| version           | numeric | The server version number |
| subversion        | string  | The server subversion string |
| deprecationheight | numeric | The block height at which this version will deprecate and shut down |

**Examples**

```bash
verus -testnet getdeprecationinfo
```

**Testnet output:**
```json
{
  "version": 2000753,
  "subversion": "/MagicBean:2.0.7-3/",
  "deprecationheight": 4453160
}
```

**Common Errors**

None typical.

**Related Commands**

- [`getinfo`](control.md#getinfo) — General server information
- [`getnetworkinfo`](#getnetworkinfo) — Network-specific info

**Notes**

- The deprecation height is the block at which this daemon version will automatically shut down, forcing operators to upgrade.
- On testnet, the deprecation height still applies but may differ from mainnet.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getnettotals

> **Category:** Network | **Version:** v1.2.14+

Returns information about network traffic, including bytes in, bytes out, and current time.

**Syntax**

```
getnettotals
```

**Parameters**

None.

**Result**

```json
{
  "totalbytesrecv": 19372173,
  "totalbytessent": 8385281,
  "timemillis": 1770450604273
}
```

| Field          | Type    | Description |
|----------------|---------|-------------|
| totalbytesrecv | numeric | Total bytes received |
| totalbytessent | numeric | Total bytes sent |
| timemillis     | numeric | Current time in milliseconds (Unix epoch) |

**Examples**

```bash
verus -testnet getnettotals
```

**Testnet output:**
```json
{
  "totalbytesrecv": 19372173,
  "totalbytessent": 8385281,
  "timemillis": 1770450604273
}
```

**Common Errors**

None typical.

**Related Commands**

- [`getnetworkinfo`](#getnetworkinfo) — General network state info
- [`getpeerinfo`](#getpeerinfo) — Per-peer traffic stats

**Notes**

- Values are cumulative since daemon start.
- Useful for monitoring bandwidth usage.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getnetworkinfo

> **Category:** Network | **Version:** v1.2.14+

Returns an object containing various state info regarding P2P networking.

**Syntax**

```
getnetworkinfo
```

**Parameters**

None.

**Result**

| Field          | Type    | Description |
|----------------|---------|-------------|
| version        | numeric | The server version |
| subversion     | string  | The server subversion string |
| protocolversion| numeric | The protocol version |
| localservices  | string  | The services offered to the network |
| timeoffset     | numeric | The time offset |
| connections    | numeric | The number of connections |
| networks       | array   | Information per network (ipv4, ipv6, onion) |
| relayfee       | numeric | Minimum relay fee for non-free transactions in VRSC/kB |
| localaddresses | array   | List of local addresses |
| warnings       | string  | Any network warnings |

**Examples**

```bash
verus -testnet getnetworkinfo
```

**Testnet output:**
```json
{
  "version": 2000753,
  "subversion": "/MagicBean:2.0.7-3/",
  "protocolversion": 170010,
  "localservices": "0000000000000005",
  "timeoffset": 0,
  "connections": 5,
  "networks": [
    {
      "name": "ipv4",
      "limited": false,
      "reachable": true,
      "proxy": "",
      "proxy_randomize_credentials": false
    },
    {
      "name": "ipv6",
      "limited": false,
      "reachable": true,
      "proxy": "",
      "proxy_randomize_credentials": false
    },
    {
      "name": "onion",
      "limited": true,
      "reachable": false,
      "proxy": "",
      "proxy_randomize_credentials": false
    }
  ],
  "relayfee": 0.00000100,
  "localaddresses": [],
  "warnings": ""
}
```

**Common Errors**

None typical.

**Related Commands**

- [`getpeerinfo`](#getpeerinfo) — Detailed per-peer info
- [`getconnectioncount`](#getconnectioncount) — Just the connection count
- [`getnettotals`](#getnettotals) — Traffic stats

**Notes**

- The `networks` array shows reachability for ipv4, ipv6, and onion (Tor).
- `localservices` is a bitmask of services this node offers.
- Empty `localaddresses` means the node is not advertising a public address.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## getpeerinfo

> **Category:** Network | **Version:** v1.2.14+

Returns data about each connected network node as a JSON array of objects.

**Syntax**

```
getpeerinfo
```

**Parameters**

None.

**Result**

Array of peer objects with the following fields:

| Field           | Type    | Description |
|-----------------|---------|-------------|
| id              | numeric | Peer index |
| addr            | string  | IP address and port of the peer |
| addrlocal       | string  | Local address |
| services        | string  | Services offered |
| tls_established | boolean | TLS connection status |
| tls_verified    | boolean | Peer certificate verification status |
| lastsend        | numeric | Last send time (epoch seconds) |
| lastrecv        | numeric | Last receive time (epoch seconds) |
| bytessent       | numeric | Total bytes sent |
| bytesrecv       | numeric | Total bytes received |
| conntime        | numeric | Connection time (epoch seconds) |
| timeoffset      | numeric | Time offset in seconds |
| pingtime        | numeric | Ping time in seconds |
| pingwait        | numeric | Time waiting for ping response (seconds) |
| version         | numeric | Peer protocol version |
| subver          | string  | Peer version string |
| inbound         | boolean | True if inbound connection |
| startingheight  | numeric | Starting block height of the peer |
| banscore        | numeric | Current ban score |
| synced_headers  | numeric | Last common header |
| synced_blocks   | numeric | Last common block |
| inflight        | array   | Block heights currently being requested |
| addr_processed  | numeric | Number of addr messages processed |
| addr_rate_limited | numeric | Number of addr messages rate-limited |
| whitelisted     | boolean | Whether the peer is whitelisted |

**Examples**

```bash
verus -testnet getpeerinfo
```

**Testnet output (first peer):**
```json
{
  "id": 7,
  "addr": "135.181.184.117:18842",
  "addrlocal": "75.159.130.74:9527",
  "services": "0000000000000005",
  "tls_established": true,
  "tls_verified": false,
  "lastsend": 1770450600,
  "lastrecv": 1770450599,
  "bytessent": 706304,
  "bytesrecv": 2011655,
  "conntime": 1770408356,
  "timeoffset": 0,
  "pingtime": 0.168548,
  "version": 170010,
  "subver": "/MagicBean:2.0.73/",
  "inbound": false,
  "startingheight": 926330,
  "banscore": 0,
  "synced_headers": 926998,
  "synced_blocks": 926998,
  "inflight": [],
  "addr_processed": 178,
  "addr_rate_limited": 0,
  "whitelisted": false
}
```

**Common Errors**

None typical.

**Related Commands**

- [`getconnectioncount`](#getconnectioncount) — Quick connection count
- [`addnode`](#addnode) — Add/remove nodes
- [`disconnectnode`](#disconnectnode) — Disconnect a peer

**Notes**

- `tls_established` and `tls_verified` show TLS connection security status.
- `banscore` accumulates as a peer misbehaves; at threshold (default 100), the peer is banned.
- `pingtime` is measured in decimal seconds.
- Use peer `addr` values with `disconnectnode` or `addnode`.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## listbanned

> **Category:** Network | **Version:** v1.2.14+

List all banned IPs/Subnets.

**Syntax**

```
listbanned
```

**Parameters**

None.

**Result**

Array of banned entries. Empty array if no bans exist.

**Examples**

```bash
verus -testnet listbanned
```

**Testnet output:**
```json
[]
```

**Common Errors**

None typical.

**Related Commands**

- [`setban`](#setban) — Add or remove bans
- [`clearbanned`](#clearbanned) — Clear all bans

**Notes**

- Each entry includes the banned IP/subnet, ban creation time, and expiry time.
- Empty result means no IPs are currently banned.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## ping

> **Category:** Network | **Version:** v1.2.14+

Requests that a ping be sent to all other nodes, to measure ping time. Results are available in `getpeerinfo` via `pingtime` and `pingwait` fields.

**Syntax**

```
ping
```

**Parameters**

None.

**Result**

No return value (void). This is an **asynchronous** command.

**Examples**

```bash
## Send ping to all peers
verus -testnet ping

## Then check results
verus -testnet getpeerinfo
## Look for "pingtime" field in each peer's output
```

**Common Errors**

None typical.

**Related Commands**

- [`getpeerinfo`](#getpeerinfo) — View ping results in `pingtime` and `pingwait` fields

**Notes**

- **Asynchronous**: `ping` returns immediately with no output. The actual ping measurement happens in the background.
- Results are available via `getpeerinfo` — check `pingtime` (last completed ping) and `pingwait` (pending ping).
- The ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.
- Values are in decimal seconds.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2

---

## setban

> **Category:** Network | **Version:** v1.2.14+

Attempts to add or remove an IP/Subnet from the banned list.

**Syntax**

```
setban "ip(/netmask)" "add|remove" (bantime) (absolute)
```

**Parameters**

| Parameter      | Type    | Required | Description |
|----------------|---------|----------|-------------|
| ip(/netmask)   | string  | Yes      | IP or subnet to ban (default /32 = single IP) |
| command        | string  | Yes      | `add` or `remove` |
| bantime        | numeric | No       | Seconds to ban (0 = default 24h). Can be overridden by `-bantime` startup arg. |
| absolute       | boolean | No       | If true, `bantime` is an absolute Unix timestamp |

**Result**

No return value on success.

**Examples**

```bash
## Ban a single IP for 24 hours (default)
verus -testnet setban "192.168.0.6" "add"

## Ban an IP for 1 day explicitly
verus -testnet setban "192.168.0.6" "add" 86400

## Ban a subnet
verus -testnet setban "192.168.0.0/24" "add"

## Remove a ban
verus -testnet setban "192.168.0.6" "remove"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `IP/Subnet already banned` | Trying to ban an already-banned address |
| `IP/Subnet not found` | Trying to remove a ban that doesn't exist |

**Related Commands**

- [`listbanned`](#listbanned) — List all banned IPs
- [`clearbanned`](#clearbanned) — Clear all bans

**Notes**

- Default ban duration is 24 hours unless overridden.
- The `-bantime` startup argument sets the default ban duration globally.
- Supports CIDR notation for subnet bans (e.g., `/24`).

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2