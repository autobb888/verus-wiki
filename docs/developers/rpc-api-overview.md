# Developer Guide: RPC API Overview

> Connect to the Verus daemon and make API calls from any language.

---

## How It Works

Verus exposes a **JSON-RPC 1.0** API via HTTP. The daemon (`verusd`) listens on a local port, and you authenticate with username/password from your config file.

```
Your App  ──HTTP POST──▶  verusd (localhost:27486)  ──▶  Blockchain
              │
         JSON-RPC body
         + Basic Auth
```

---

## Configuration

### Find Your Credentials

Credentials are in your Verus config file:

```bash
# Mainnet
cat ~/.komodo/VRSC/VRSC.conf

# Testnet
cat ~/.komodo/vrsctest/vrsctest.conf
```

Relevant fields:
```ini
rpcuser=your_username
rpcpassword=your_password
rpcport=27486           # mainnet default
rpcallowip=127.0.0.1   # localhost only (secure default)
server=1                # required for RPC
```

### Ports

| Network | RPC Port | P2P Port |
|---------|----------|----------|
| Mainnet | 27486 | 27485 |
| Testnet | 18843 | 18842 |

### Allowing Remote Access

⚠️ **Security warning:** Only do this on trusted networks.

```ini
# In VRSC.conf
rpcallowip=192.168.1.0/24    # Allow local network
rpcbind=0.0.0.0               # Bind to all interfaces
```

---

## JSON-RPC Format

Every request is an HTTP POST with a JSON body:

```json
{
  "jsonrpc": "1.0",
  "id": "my-request",
  "method": "getinfo",
  "params": []
}
```

| Field | Description |
|-------|-------------|
| `jsonrpc` | Always `"1.0"` |
| `id` | Arbitrary request identifier (returned in response) |
| `method` | RPC method name |
| `params` | Array of positional parameters |

Response format:
```json
{
  "result": { ... },
  "error": null,
  "id": "my-request"
}
```

On error:
```json
{
  "result": null,
  "error": {
    "code": -5,
    "message": "Invalid address"
  },
  "id": "my-request"
}
```

---

## curl Examples

### Basic: getinfo

```bash
curl -s -u rpcuser:rpcpassword \
  http://127.0.0.1:27486 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"curl","method":"getinfo","params":[]}'
```

### With Parameters: getidentity

```bash
curl -s -u rpcuser:rpcpassword \
  http://127.0.0.1:27486 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"curl","method":"getidentity","params":["alice@"]}'
```

### Complex Parameters: sendcurrency

```bash
curl -s -u rpcuser:rpcpassword \
  http://127.0.0.1:27486 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"1.0",
    "id":"curl",
    "method":"sendcurrency",
    "params":["myid@", [{"address":"recipient@","currency":"VRSC","amount":1.0}]]
  }'
```

### Parse Response with jq

```bash
curl -s -u rpcuser:rpcpassword \
  http://127.0.0.1:27486 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"curl","method":"getinfo","params":[]}' \
  | jq '.result.blocks'
```

---

## Python (requests)

```python
import requests
import json

RPC_URL = "http://127.0.0.1:27486"
RPC_USER = "your_rpcuser"
RPC_PASS = "your_rpcpassword"

def rpc(method, params=None):
    """Make a Verus RPC call."""
    payload = {
        "jsonrpc": "1.0",
        "id": "python",
        "method": method,
        "params": params or []
    }
    resp = requests.post(
        RPC_URL,
        auth=(RPC_USER, RPC_PASS),
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    data = resp.json()
    if data.get("error"):
        raise Exception(f"RPC error: {data['error']}")
    return data["result"]

# Examples
info = rpc("getinfo")
print(f"Block height: {info['blocks']}")

identity = rpc("getidentity", ["alice@"])
print(f"Identity address: {identity['identity']['identityaddress']}")

balance = rpc("getbalance")
print(f"Balance: {balance} VRSC")
```

### Read Credentials from Config

```python
import os

def load_credentials(testnet=False):
    if testnet:
        conf_path = os.path.expanduser("~/.komodo/vrsctest/vrsctest.conf")
        default_port = 18843
    else:
        conf_path = os.path.expanduser("~/.komodo/VRSC/VRSC.conf")
        default_port = 27486

    config = {}
    with open(conf_path) as f:
        for line in f:
            if "=" in line:
                key, val = line.strip().split("=", 1)
                config[key] = val

    return {
        "url": f"http://127.0.0.1:{config.get('rpcport', default_port)}",
        "user": config["rpcuser"],
        "password": config["rpcpassword"]
    }
```

---

## Node.js (axios)

```javascript
const axios = require('axios');

const RPC_URL = 'http://127.0.0.1:27486';
const RPC_USER = 'your_rpcuser';
const RPC_PASS = 'your_rpcpassword';

async function rpc(method, params = []) {
  const { data } = await axios.post(RPC_URL, {
    jsonrpc: '1.0',
    id: 'node',
    method,
    params
  }, {
    auth: { username: RPC_USER, password: RPC_PASS },
    timeout: 30000
  });

  if (data.error) {
    throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

// Examples
(async () => {
  const info = await rpc('getinfo');
  console.log(`Block height: ${info.blocks}`);

  const identity = await rpc('getidentity', ['alice@']);
  console.log(`Address: ${identity.identity.identityaddress}`);
})();
```

---

## Error Handling

### HTTP-Level Errors

| HTTP Status | Meaning |
|-------------|---------|
| 401 | Bad credentials (check rpcuser/rpcpassword) |
| 403 | IP not allowed (check rpcallowip) |
| 500 | RPC method error (check response body) |
| Connection refused | Daemon not running or wrong port |

### RPC Error Codes

| Code | Meaning |
|------|---------|
| -1 | General error |
| -3 | Invalid type for parameter |
| -5 | Invalid address or key |
| -6 | Insufficient funds |
| -8 | Invalid parameter |
| -25 | Transaction already in chain |
| -26 | Transaction rejected |
| -28 | Daemon still loading/syncing |

### Robust Error Handling (Python)

```python
import requests

def rpc_safe(method, params=None):
    try:
        return rpc(method, params)
    except requests.ConnectionError:
        print("ERROR: Daemon not running or wrong port")
        return None
    except requests.Timeout:
        print("ERROR: Request timed out (daemon busy?)")
        return None
    except Exception as e:
        if "Insufficient funds" in str(e):
            print("ERROR: Not enough VRSC")
        elif "-28" in str(e):
            print("ERROR: Daemon still syncing, try later")
        else:
            print(f"ERROR: {e}")
        return None
```

---

## Batch Requests

Verus supports JSON-RPC batch calls (array of requests):

```bash
curl -s -u rpcuser:rpcpassword \
  http://127.0.0.1:27486 \
  -H "Content-Type: application/json" \
  -d '[
    {"jsonrpc":"1.0","id":"1","method":"getinfo","params":[]},
    {"jsonrpc":"1.0","id":"2","method":"getbalance","params":[]},
    {"jsonrpc":"1.0","id":"3","method":"getmininginfo","params":[]}
  ]'
```

Returns an array of responses in the same order.

---

## See Also

- [Integration Patterns](./integration-patterns.md) — Building real applications
- [Testnet Guide](./testnet-guide.md) — Develop against testnet
- [Common Errors](../troubleshooting/common-errors.md) — Error reference

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
