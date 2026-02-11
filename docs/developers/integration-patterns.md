# Developer Guide: Integration Patterns

> Practical patterns for building applications on Verus.

---

## Pattern 1: Payment Processor

Accept VRSC payments and verify them programmatically.

### Flow

```
Customer  ──sends VRSC──▶  Your Address
                                │
Your App  ──polls RPC──▶  verusd (checks confirmations)
                                │
                          ✅ Confirmed → Fulfill order
```

### Implementation

```python
import time

REQUIRED_CONFIRMATIONS = 6
POLL_INTERVAL = 30  # seconds

def generate_payment_address():
    """Create a unique address per order."""
    return rpc("getnewaddress", ["payments"])

def check_payment(address, expected_amount):
    """Check if payment received at address."""
    received = rpc("getreceivedbyaddress", [address, REQUIRED_CONFIRMATIONS])
    return received >= expected_amount

def wait_for_payment(address, expected_amount, timeout=3600):
    """Block until payment confirmed or timeout."""
    start = time.time()
    while time.time() - start < timeout:
        # Check unconfirmed first (show "pending" to user)
        unconfirmed = rpc("getreceivedbyaddress", [address, 0])
        if unconfirmed >= expected_amount:
            print(f"Payment detected (unconfirmed): {unconfirmed} VRSC")

            # Now wait for confirmations
            confirmed = rpc("getreceivedbyaddress", [address, REQUIRED_CONFIRMATIONS])
            if confirmed >= expected_amount:
                return True

        time.sleep(POLL_INTERVAL)
    return False

# Usage
order_address = generate_payment_address()
print(f"Send {amount} VRSC to: {order_address}")

if wait_for_payment(order_address, amount):
    fulfill_order()
```

### Using VerusID for Payments

Accept payments to a VerusID instead of raw addresses:

```python
# Customers send to "yourstore@" instead of an R-address
# Verify with:
balance = rpc("getaddressbalance", [{"addresses": ["yourstore@"]}])
```

---

## Pattern 2: Identity Lookup Service

Build a service that resolves and caches VerusID data.

### Implementation

```python
import json

def lookup_identity(name):
    """Look up a VerusID and return structured data."""
    try:
        result = rpc("getidentity", [name])
        identity = result["identity"]
        return {
            "name": identity["name"],
            "address": identity["identityaddress"],
            "primary_addresses": identity["primaryaddresses"],
            "revocation": identity["revocationauthority"],
            "recovery": identity["recoveryauthority"],
            "data": decode_contentmultimap(identity.get("contentmultimap", {}))
        }
    except Exception as e:
        if "Identity not found" in str(e):
            return None
        raise

def decode_contentmultimap(cmm):
    """Decode hex values in contentmultimap to strings."""
    decoded = {}
    for key, values in cmm.items():
        decoded[key] = []
        for hex_val in values:
            try:
                decoded[key].append(json.loads(bytes.fromhex(hex_val).decode()))
            except (ValueError, json.JSONDecodeError):
                decoded[key].append(bytes.fromhex(hex_val).decode(errors="replace"))
    return decoded

def is_identity_valid(name):
    """Check if identity exists and is not revoked."""
    result = rpc("getidentity", [name])
    flags = result["identity"].get("flags", 0)
    # Check revocation bit
    return (flags & 2) == 0  # bit 1 = revoked
```

### Caching Layer

```python
from functools import lru_cache
import time

identity_cache = {}
CACHE_TTL = 300  # 5 minutes

def cached_lookup(name):
    now = time.time()
    if name in identity_cache:
        data, timestamp = identity_cache[name]
        if now - timestamp < CACHE_TTL:
            return data

    data = lookup_identity(name)
    identity_cache[name] = (data, now)
    return data
```

---

## Pattern 3: DEX / Currency Converter Frontend

Build a frontend for Verus's built-in DEX.

### Get Available Currencies

```python
def list_currencies():
    """List all currencies on the network."""
    # Use listcurrencies to get available currencies
    return rpc("listcurrencies")

def get_currency_info(currency_name):
    """Get details about a currency."""
    return rpc("getcurrency", [currency_name])

def get_conversion_estimate(from_currency, to_currency, amount):
    """Estimate a currency conversion."""
    result = rpc("estimateconversion", [{
        "currency": from_currency,
        "convertto": to_currency,
        "amount": amount
    }])
    return result
```

### Execute a Conversion

```python
def convert_currency(from_id, from_currency, to_currency, amount):
    """Convert between currencies using sendcurrency."""
    result = rpc("sendcurrency", [
        from_id,
        [{
            "address": from_id,
            "currency": from_currency,
            "convertto": to_currency,
            "amount": amount
        }]
    ])
    return result  # Returns txid
```

### Monitor Conversion Status

```python
def check_conversion(txid):
    """Check if conversion completed."""
    tx = rpc("gettransaction", [txid])
    return {
        "confirmations": tx["confirmations"],
        "complete": tx["confirmations"] >= 1
    }
```

---

## Pattern 4: Event Monitoring

Watch for blockchain events relevant to your application.

### Polling Pattern (Simple)

```python
import time

def poll_new_blocks(callback, poll_interval=10):
    """Call callback for each new block."""
    last_height = rpc("getinfo")["blocks"]

    while True:
        current_height = rpc("getinfo")["blocks"]
        if current_height > last_height:
            for height in range(last_height + 1, current_height + 1):
                block_hash = rpc("getblockhash", [height])
                block = rpc("getblock", [block_hash])
                callback(block)
            last_height = current_height
        time.sleep(poll_interval)

# Usage
def on_new_block(block):
    print(f"Block {block['height']}: {len(block['tx'])} transactions")
    for txid in block["tx"]:
        process_transaction(txid)

poll_new_blocks(on_new_block)
```

### Watch Specific Address

```python
def watch_address(address, callback, poll_interval=15):
    """Watch for new transactions to an address."""
    seen_txids = set()

    while True:
        txs = rpc("listtransactions", ["*", 50])
        for tx in txs:
            if tx["txid"] not in seen_txids and tx.get("address") == address:
                seen_txids.add(tx["txid"])
                callback(tx)
        time.sleep(poll_interval)
```

### Watch Identity Updates

```python
def watch_identity(name, callback, poll_interval=30):
    """Detect changes to a VerusID."""
    last_data = rpc("getidentity", [name])

    while True:
        current_data = rpc("getidentity", [name])
        if current_data != last_data:
            callback(name, last_data, current_data)
            last_data = current_data
        time.sleep(poll_interval)
```

---

## Best Practices for Production

### 1. Connection Resilience

```python
import time
import requests

MAX_RETRIES = 3
RETRY_DELAY = 5

def rpc_resilient(method, params=None, retries=MAX_RETRIES):
    for attempt in range(retries):
        try:
            return rpc(method, params)
        except requests.ConnectionError:
            if attempt < retries - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                raise
```

### 2. Check Daemon Health

```python
def is_daemon_ready():
    """Check if daemon is synced and ready."""
    try:
        info = rpc("getinfo")
        chain = rpc("getblockchaininfo")
        return (
            chain.get("verificationprogress", 0) > 0.999
            and info.get("connections", 0) > 0
        )
    except Exception:
        return False
```

### 3. Transaction Confirmation Thresholds

| Use Case | Recommended Confirmations |
|----------|--------------------------|
| Display as "pending" | 0 |
| Low-value items | 1 |
| Standard payments | 6 |
| High-value transfers | 20+ |
| Identity verification | 1 |

### 4. Rate Limiting

Don't hammer the daemon — batch calls where possible:

```python
# Instead of N separate calls:
for name in names:
    rpc("getidentity", [name])  # N round trips

# Use batch RPC (single HTTP request):
batch = [
    {"jsonrpc": "1.0", "id": str(i), "method": "getidentity", "params": [name]}
    for i, name in enumerate(names)
]
response = requests.post(RPC_URL, json=batch, auth=(USER, PASS))
results = response.json()
```

### 5. Secure Your Credentials

```python
# Don't hardcode — read from config or environment
import os

RPC_USER = os.environ.get("VERUS_RPC_USER")
RPC_PASS = os.environ.get("VERUS_RPC_PASS")
```

---

## See Also

- [RPC API Overview](./rpc-api-overview.md) — Connection basics
- [Testnet Guide](./testnet-guide.md) — Develop safely on testnet
- [Building on Verus](./building-on-verus.md) — Project ideas and architecture

---

*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*
