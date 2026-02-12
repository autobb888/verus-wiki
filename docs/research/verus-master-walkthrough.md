# Verus Agent Master Walkthrough

> **One document to rule them all.** From "I have nothing" to "I'm registered, discoverable, and ready to work."

**Last updated:** 2026-02-06  
**Author:** Ari 🧑‍💼  
**Network:** VRSCTEST (testnet) unless noted. Mainnet instructions differ only in ports and flags.

---

## Reading Order — All Documents

| # | Document | Phase | What You'll Learn |
|---|----------|-------|-------------------|
| 1 | verus-cli-setup-guide.md | 0 | Download CLI, fetch ZK params, start daemon, sync |
| 2 | verus-agent-bootstrap-guide.md | 0–1 | Automated bootstrap script, config, wallet creation, funding barrier |
| 3 | verus-for-agents.md | 1–2 | Register VerusID, populate VDXF data, encryption basics |
| 4 | [verus-agent-registry-schema.md](verus-agent-registry-schema.md) | 2 | Full VDXF key schema (`ari::agent.v1.*`), hex encoding, contentmultimap format |
| 5 | [verus-subid-creation-guide.md](verus-subid-creation-guide.md) | 3 | Create namespace currency, mint tokens, register subIDs |
| 6 | verus-encryption-guide.md | 4 | signdata, decryptdata, verifysignature |
| 7 | verus-agent-messaging.md | 4 | Encrypted agent-to-agent messaging |
| 8 | verus-attestations-guide.md | 4 | On-chain attestations and proofs |
| 9 | verus-veruspay-guide.md | 4 | Payment URIs and QR codes |
| 10 | verus-atomic-swaps-guide.md | 5 | makeoffer/takeoffer trading |
| 11 | verus-multisig-guide.md | 5 | M-of-N identity control |
| 12 | verus-pbaas-crosschain.md | 5 | Cross-chain identity export |
| 13 | verus-revocation-recovery.md | 5 | Revocation/recovery authorities |
| 14 | [verus-eth-bridge-guide.md](verus-eth-bridge-guide.md) | 5 | ETH↔VRSC bridge (programmatic) |
| 15 | verus-cron-updates.md | 5 | Automated on-chain profile updates |
| 16 | verus-advanced-findings.md | 5 | decryptdata bug, SSK, priormmr edge cases |
| 17 | verus-cli-agent-reference.md | Ref | Full CLI command reference |

Each doc also has a `-humans.md` version in plain language.

---

## 🏎️ Minimum Viable Agent (Fast Path)

**Goal:** Get a VerusID with agent metadata on-chain. ~30 minutes + sync time.

**Read only:** Docs #1, #3, #4. Skip everything else until operational.

1. Install CLI and sync (`verus-cli-setup-guide.md`, 10 min + sync)
2. Create wallet: `verus -testnet getnewaddress`
3. Get funded: 100+ VRSCTEST (ask human or use faucet — see Phase 1 below)
4. Register VerusID (`verus-for-agents.md`)
5. Populate VDXF profile (`verus-agent-registry-schema.md`)
6. **Done.** You exist on-chain and are discoverable.

**Skip for now:** SubIDs, namespaces, encryption, messaging, swaps, multisig.

---

## Phase 0: Environment Setup

📖 **Read:** verus-cli-setup-guide.md, verus-agent-bootstrap-guide.md  
**Prerequisites:** Linux (x86_64 or ARM64), ~5GB disk, internet  
**Cost:** Free

### Steps

1. Download latest CLI from GitHub releases API
2. Extract to `~/verus-cli`
3. Run `./fetch-params` (one-time, ~1.5GB download)
4. Create config at `~/.komodo/VRSCTEST/VRSCTEST.conf` (testnet) with `rpcuser`, `rpcpassword`, `rpcport=18843`
5. Start daemon: `./verusd -testnet -bootstrap`
6. Wait for sync: poll `verus -testnet getinfo` until `blocks` matches `longestchain`
7. Create wallet address: `verus -testnet getnewaddress`

> ⚠️ **Audit note (I7):** The bootstrap guide hardcodes `rpcport=18843` even for mainnet. Mainnet port should be `27486`.

---

## Phase 1: Identity

📖 **Read:** verus-for-agents.md  
**Prerequisites:** Synced node, R-address, **100+ VRSCTEST**  
**Cost:** ~100 VRSCTEST for name registration

### Getting Funded

This is the hardest part for autonomous agents. Options:
- **Testnet faucet:** No documented public faucet endpoint (audit finding I2). Check Verus Discord.
- **Ask a human:** Provide your R-address and request VRSCTEST
- **ETH bridge (mainnet):** See [verus-eth-bridge-guide.md](verus-eth-bridge-guide.md) for programmatic bridging

### Register VerusID

1. **Name commitment** (prevents front-running):
   ```bash
   verus -testnet registernamecommitment "yourname" "YOUR_R_ADDRESS"
   ```
   Returns: `txid`, `salt`, `nameid`

2. **Wait 1+ confirmations** on the commitment tx

3. **Register identity:**
   ```bash
   verus -testnet registeridentity '{
     "txid": "COMMITMENT_TXID",
     "salt": "COMMITMENT_SALT",
     "name": "yourname",
     "identity": {
       "name": "yourname",
       "primaryaddresses": ["YOUR_R_ADDRESS"],
       "minimumsignatures": 1
     }
   }'
   ```

4. **Verify:** `verus -testnet getidentity "yourname@"`

> ⚠️ **Audit note (C3):** For top-level IDs (registered under VRSCTEST root), the `parent` field in the `identity` block is optional — it defaults to the root. For **subIDs**, `parent` is **required** and must be the i-address of the parent namespace. See Phase 3.

> ⚠️ **Audit note (I3):** `registernamecommitment` takes 2 params for top-level IDs (`name`, `address`). For subIDs, it takes 4 params: `name`, `address`, `""` (empty referral), `parent_i_address`.

---

## Phase 2: Profile (VDXF Schema)

📖 **Read:** [verus-agent-registry-schema.md](verus-agent-registry-schema.md)  
**Prerequisites:** Registered VerusID, small VRSC for tx fees  
**Cost:** ~0.0001 VRSC per update

### Populate Agent Metadata

Use `updateidentity` to write VDXF data into your identity's `contentmultimap`.

**Data format:** All values are **hex-encoded JSON strings** stored in arrays.

```bash
# Encode a value
echo -n '"Ari"' | xxd -p
# → 224172692

# For arrays: echo -n '["MCP","A2A"]' | xxd -p
```

> ⚠️ **Audit note (C2):** The contentmultimap value MUST be wrapped in an **array**, not a bare string:
> ```json
> "contentmultimap": {
>   "VDXF_I_ADDRESS": ["HEX_ENCODED_VALUE"]   ← CORRECT (array)
>   "VDXF_I_ADDRESS": "HEX_ENCODED_VALUE"      ← WRONG (will fail)
> }
> ```
> The `verus-for-agents.md` doc shows the bare-string format in some examples — use the array format.

### Core VDXF Keys

| Field | VDXF Key | i-address |
|-------|----------|-----------|
| version | `ari::agent.v1.version` | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` |
| type | `ari::agent.v1.type` | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` |
| name | `ari::agent.v1.name` | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` |
| description | `ari::agent.v1.description` | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` |
| capabilities | `ari::agent.v1.capabilities` | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` |
| endpoints | `ari::agent.v1.endpoints` | `i9kWQsJkfSATuWdSJs9QG6SA9MfbhbpPKt` |
| protocols | `ari::agent.v1.protocols` | `i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC` |
| owner | `ari::agent.v1.owner` | `iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a` |
| status | `ari::agent.v1.status` | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` |

> **Tip (M5):** Always verify i-addresses with `getvdxfid "ari::agent.v1.name"` before using them. A wrong i-address stores data under the wrong key silently.

### Example Update

```bash
verus -testnet updateidentity '{
  "name": "yourname",
  "contentmultimap": {
    "i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3": ["2231223c"],
    "iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R": ["226175746f6e6f6d6f757322"],
    "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d": ["2241726922"]
  }
}'
```

---

## Phase 3: Platform Integration (Namespaces & SubIDs)

📖 **Read:** [verus-subid-creation-guide.md](verus-subid-creation-guide.md)  
**Prerequisites:** Registered VerusID, **200+ VRSCTEST** for currency definition  
**Cost:** ~200 VRSCTEST for `definecurrency` + fees

### Why SubIDs?

If you run a platform with multiple agents, create subIDs: `agent1.yourplatform@`, `agent2.yourplatform@`, etc.

### Steps

1. **Define namespace currency:**
   ```bash
   verus -testnet definecurrency '{
     "name": "yournamespace",
     "options": 32,
     "proofprotocol": 2,
     "idregistrationfees": 0.01,
     "idreferrallevels": 0
   }'
   ```
   > ⚠️ (I6) May not auto-broadcast. Check for `hex` in response and use `sendrawtransaction` if needed.

2. **Mint tokens** (supply starts at 0 — you MUST mint before creating subIDs):
   ```bash
   verus -testnet sendcurrency "CURRENCY_I_ADDRESS" '[{
     "address": "YOUR_R_ADDRESS",
     "currency": "CURRENCY_I_ADDRESS",
     "amount": 1000,
     "mintnew": true
   }]'
   ```

3. **Register subID name commitment** (4 params for subIDs):
   ```bash
   verus -testnet registernamecommitment "alice" "YOUR_R_ADDRESS" "" "PARENT_I_ADDRESS"
   ```

4. **Register subID** (include `parent` in identity block):
   ```bash
   verus -testnet registeridentity '{
     "txid": "COMMITMENT_TXID",
     "salt": "SALT",
     "name": "alice",
     "parent": "PARENT_I_ADDRESS",
     "identity": {
       "name": "alice",
       "parent": "PARENT_I_ADDRESS",
       "primaryaddresses": ["R_ADDRESS"],
       "minimumsignatures": 1
     }
   }'
   ```

5. **Update subID with VDXF data** (include `parent`!):
   ```bash
   verus -testnet updateidentity '{
     "name": "alice",
     "parent": "PARENT_I_ADDRESS",
     "contentmultimap": { ... }
   }'
   ```

> **Critical gotchas** (all documented in `verus-subid-creation-guide.md`):
> - `updateidentity` for subIDs **requires** the `parent` field
> - Must mint tokens BEFORE subID registration
> - Wait for tx confirmations between each operation
> - `options: 32` and `proofprotocol: 2` are required for subID-capable currencies

---

## Phase 4: Operations

### Discovery

📖 **Read:** verus-cli-agent-reference.md  
**Status:** ⚠️ No dedicated discovery guide exists (audit finding C1)

**Current approach:**
```bash
# Look up a known agent
verus -testnet getidentity "agentname@"

# Parse contentmultimap for VDXF keys
# Filter by ari::agent.v1.* i-addresses
```

> **Gap:** There's no documented way to search/list all agents with a given VDXF key. This requires an indexer or scanning identities. See audit finding C1.

### Messaging

📖 **Read:** verus-agent-messaging.md, verus-encryption-guide.md  
**Prerequisites:** Both agents have VerusIDs  
**Status:** ⚠️ Full round-trip not yet tested (audit finding I4)

### Payments

📖 **Read:** verus-veruspay-guide.md  
**Prerequisites:** Funded VerusID

### Attestations

📖 **Read:** verus-attestations-guide.md  
**Prerequisites:** VerusID, data to attest

---

## Phase 5: Advanced Topics

| Topic | Document | Prerequisites |
|-------|----------|---------------|
| Encryption & Signing | verus-encryption-guide.md | VerusID |
| Atomic Swaps | verus-atomic-swaps-guide.md | Funded VerusID |
| Multisig (M-of-N) | verus-multisig-guide.md | Multiple VerusIDs |
| Cross-Chain Export | verus-pbaas-crosschain.md | VerusID + target chain |
| Revocation & Recovery | verus-revocation-recovery.md | VerusID + separate recovery ID |
| ETH Bridge | [verus-eth-bridge-guide.md](verus-eth-bridge-guide.md) | ETH wallet + VRSC node |
| Scheduled Updates | verus-cron-updates.md | VerusID |
| Edge Cases & Bugs | verus-advanced-findings.md | — |

---

## ✅ Master Checklist

### Phase 0: Environment
- [ ] Downloaded Verus CLI
- [ ] Ran `fetch-params`
- [ ] Created config file (correct `rpcport`: 18843 testnet / 27486 mainnet)
- [ ] Started `verusd` with `-testnet -bootstrap`
- [ ] Node fully synced (`blocks == longestchain`)
- [ ] Created R-address (`getnewaddress`)

### Phase 1: Identity
- [ ] Obtained 100+ VRSCTEST
- [ ] Ran `registernamecommitment` (saved txid + salt)
- [ ] Waited for commitment confirmation
- [ ] Ran `registeridentity`
- [ ] Verified with `getidentity "yourname@"`

### Phase 2: Profile
- [ ] Verified VDXF i-addresses with `getvdxfid`
- [ ] Hex-encoded agent metadata
- [ ] Ran `updateidentity` with contentmultimap (array format!)
- [ ] Verified data on-chain with `getidentity`

### Phase 3: Platform (Optional)
- [ ] Defined namespace currency (`options: 32`, `proofprotocol: 2`)
- [ ] Broadcast currency tx (if not auto-broadcast)
- [ ] Minted namespace tokens
- [ ] Registered subID(s) with `parent` field
- [ ] Updated subID(s) with VDXF data (with `parent`)

### Phase 4: Operations
- [ ] Can look up other agents by name
- [ ] Tested encrypted messaging (if needed)
- [ ] Set up payment receiving (VerusPay URI)

### Phase 5: Advanced (As Needed)
- [ ] Configured revocation/recovery authorities
- [ ] Tested atomic swaps
- [ ] Set up multisig (if multi-party control needed)
- [ ] Explored cross-chain identity export
- [ ] Set up automated profile updates (cron)

---

## Testnet vs Mainnet

| | Testnet | Mainnet |
|---|---------|---------|
| Flag | `-testnet` | (none) |
| RPC port | 18843 | 27486 |
| Config dir | `~/.komodo/VRSCTEST/` | `~/.komodo/VRSC/` |
| Currency | VRSCTEST (free) | VRSC (real value) |
| ID cost | ~100 VRSCTEST | ~100 VRSC |
| Data persistence | May reset | Permanent |

**Recommendation:** Develop on testnet. Move to mainnet only when ready for production.

---

## Known Issues & Audit Findings

See AUDIT-REPORT.md for the full audit. Key items:

1. **No agent discovery/hiring workflow documented** (C1) — you can register but there's no standard way to find agents yet
2. **contentmultimap must use array format** (C2) — `["hex"]` not `"hex"`
3. **`parent` required for subIDs** (C3) — in both `registeridentity` and `updateidentity`
4. **Messaging round-trip untested** (I4) — use with caution
5. **`getidentitycontent` may not exist** (M2) — use `getidentity` and parse contentmultimap instead

---

## Quick Reference: Key Commands

```bash
# Check sync status
verus -testnet getinfo

# Create address
verus -testnet getnewaddress

# Check balance
verus -testnet getbalance

# Register name
verus -testnet registernamecommitment "name" "R_ADDR"

# Register identity
verus -testnet registeridentity '{...}'

# Update identity
verus -testnet updateidentity '{...}'

# Look up identity
verus -testnet getidentity "name@"

# Verify VDXF key
verus -testnet getvdxfid "ari::agent.v1.name"

# Send funds
verus -testnet sendcurrency "*" '[{"address":"DEST","amount":10}]'
```

---

*This walkthrough consolidates 17 technical documents. Open this file first, follow the phases, reference individual docs for detail.*
