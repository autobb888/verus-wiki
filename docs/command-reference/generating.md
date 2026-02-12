---
label: Generating
icon: terminal
---


# Generating Commands


---

## generate

> **Category:** Generating | **Version:** v1.2.14+

Mine blocks immediately (before the RPC call returns). **Only available on regtest network.**

**Syntax**
```bash
verus generate numblocks
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| numblocks | numeric | Yes | How many blocks to generate immediately |

**Result**
```json
["blockhash1", "blockhash2", ...]    // (array of strings) Hashes of generated blocks
```

**Examples**

**Basic Usage**
```bash
./verus -testnet generate 1

## Actual Output (tested on VRSCTEST)
error code: -32601
error message:
This method can only be used on regtest
```

**Regtest Usage**
```bash
## On regtest network only
./verus -regtest generate 11
```

**RPC (curl)**
```bash
curl --user user:pass \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"generate","params":[11]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Development and testing on regtest
- Generating blocks on demand for automated tests
- Confirming transactions in test environments

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| `This method can only be used on regtest` | Called on testnet or mainnet | Use regtest network, or use `setgenerate` for testnet/mainnet mining |

**Related Commands**
- [`setgenerate`](#setgenerate) — enable continuous mining/staking (works on all networks)
- [`getgenerate`](#getgenerate) — check generation status

**Notes**
- This is a synchronous call — it blocks until all requested blocks are mined
- For testnet/mainnet mining, use `setgenerate` instead
- Useful for automated testing where you need deterministic block production

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## getgenerate

> **Category:** Generating | **Version:** v1.2.14+

Returns whether the server is set to mine and/or stake coins. Can be configured via command line (`-gen`, `-mint`), config file, or `setgenerate`.

**Syntax**
```bash
verus getgenerate
```

**Parameters**
None.

**Result**
```json
{
  "staking": true|false,     // (boolean) If staking is on or off
  "generate": true|false,    // (boolean) If mining is on or off
  "numthreads": n            // (numeric) Processor limit for mining
}
```

**Examples**

**Basic Usage**
```bash
./verus -testnet getgenerate

## Actual Output (tested on VRSCTEST) — default state
{
  "staking": false,
  "generate": false,
  "numthreads": 0
}
```

**After Enabling Staking**
```bash
## First enable staking
./verus -testnet setgenerate true 0

## Then check
./verus -testnet getgenerate

## Actual Output (tested on VRSCTEST)
{
  "staking": true,
  "generate": true,
  "numthreads": 0
}
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"getgenerate","params":[]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Verify mining/staking is active after configuration
- Monitor node generation state in scripts
- Confirm `setgenerate` took effect

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| None typical | — | — |

**Related Commands**
- [`setgenerate`](#setgenerate) — enable/disable mining and staking
- [`getmininginfo`](mining.md#getmininginfo) — comprehensive mining status

**Notes**
- `generate: true` with `numthreads: 0` means staking only (no CPU mining)
- `generate: true` with `numthreads: N` (N > 0) means CPU mining with N threads
- The default state is false/false/0 unless configured via CLI args or config file

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2

---

## setgenerate

> **Category:** Generating | **Version:** v1.2.14+

Enable or disable mining (generation) and staking. Mining is limited to a specified number of processor threads.

**Syntax**
```bash
verus setgenerate generate [genproclimit]
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| generate | boolean | Yes | `true` to turn on generation, `false` to turn off both mining and staking |
| genproclimit | numeric | No | Processor limit. `-1` = unlimited, `0` = staking only, `N` = N threads for mining |

**Result**
No return value on success.

**Examples**

**Enable Staking Only**
```bash
./verus -testnet setgenerate true 0

## Verify
./verus -testnet getgenerate

## Actual Output (tested on VRSCTEST)
{
  "staking": true,
  "generate": true,
  "numthreads": 0
}
```

**Enable Mining with 1 Thread**
```bash
./verus -testnet setgenerate true 1
```

**Disable All Generation**
```bash
./verus -testnet setgenerate false

## Verify
./verus -testnet getgenerate

## Actual Output (tested on VRSCTEST)
{
  "staking": false,
  "generate": false,
  "numthreads": 0
}
```

**RPC (curl)**
```bash
curl --user user1445741888:pass2f0dc70dded67b9f392c0f3950a547bc6ef4d1edfa78da3a7da5b78113def067b6 \
  --data-binary '{"jsonrpc":"1.0","id":"curltest","method":"setgenerate","params":[true,1]}' \
  -H 'content-type:text/plain;' http://127.0.0.1:18843/
```

**Common Use Cases**
- Start staking with `setgenerate true 0`
- Start CPU mining with `setgenerate true 1` (or more threads)
- Stop all mining/staking with `setgenerate false`
- Adjust thread count without restarting the node

**Common Errors**
| Error | Cause | Solution |
|-------|-------|---------|
| None typical | — | — |

**Related Commands**
- [`getgenerate`](#getgenerate) — check current generation status
- [`getmininginfo`](mining.md#getmininginfo) — comprehensive mining status
- [`getlocalsolps`](mining.md#getlocalsolps) — monitor local hashrate after enabling

**Notes**
- `setgenerate true` without `genproclimit` defaults to staking mode (0 threads)
- Staking requires a wallet with mature coins (100+ confirmations)
- `setgenerate false` stops **both** mining and staking
- Changes take effect immediately — no restart required
- On Verus, staking uses the VerusHash algorithm and doesn't consume significant CPU

**Tested On**
- VRSCTEST block height: 926961
- Verus version: v1.2.14-2