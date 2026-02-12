# Verus Agent Walkthrough — Human-Readable Version

> **Plain-language guide** for getting an AI agent set up on the Verus blockchain. No jargon soup, just steps.

---

## What Is This?

Verus lets AI agents have their own on-chain identities — like a digital passport that anyone can look up. This guide walks through the entire setup from scratch.

**Time estimate:** ~1 hour of active work + waiting for the blockchain to sync (could be hours).

**Cost:** ~100 VRSCTEST (free test currency) for testnet, or ~100 VRSC (~$X) for mainnet.

---

## The Big Picture

```
Install Software → Sync Blockchain → Get Funds → Register Name → Add Profile → Done!
     (10 min)       (1-4 hours)     (ask someone)  (5 min)       (5 min)
```

Optional extras: create sub-identities, encrypt messages, trade tokens, bridge to Ethereum.

---

## Phase 0: Install the Software

**What you need:** A Linux machine with 5GB+ free space.

1. **Download** the Verus CLI tools from [GitHub](https://github.com/VerusCoin/VerusCoin/releases)
2. **Extract** the archive to a folder (e.g., `~/verus-cli`)
3. **Run `fetch-params`** — downloads cryptographic parameters (~1.5GB, one-time)
4. **Start the daemon** with `./verusd -testnet -bootstrap`
5. **Wait for sync** — the node downloads the full blockchain. Check progress with `./verus -testnet getinfo`

📖 *Detailed steps:* verus-cli-setup-guide-humans.md, verus-agent-bootstrap-guide-humans.md

---

## Phase 1: Get an Identity

**What you need:** A synced node + about 100 VRSCTEST.

### Getting Test Currency

This is the tricky part. Test currency is free but there's no automated faucet documented. Your options:
- Ask in the Verus Discord community
- Have someone send VRSCTEST to your wallet address
- For mainnet: use the Ethereum bridge to convert ETH → VRSC

### Register Your Name

It's a two-step process (to prevent name-stealing):

1. **Reserve the name** — tells the network "I want this name" without revealing it publicly
2. **Register the identity** — creates the actual identity with your name and wallet address

After registration, you have a VerusID like `myagent@` — your on-chain identity.

📖 *Detailed steps:* verus-for-agents-humans.md

---

## Phase 2: Build Your Profile

**What you need:** A registered VerusID + tiny amount of VRSC for transaction fees.

Now you fill in your agent's profile — what it does, what protocols it speaks, how to reach it. This data is stored on-chain using a standardized format called VDXF.

Think of it like filling in a LinkedIn profile, but on a blockchain:
- **Name:** "Ari"
- **Type:** "autonomous" / "assisted" / "tool"
- **Description:** "Special projects agent for VerusID integration"
- **Capabilities:** What you can do
- **Endpoints:** Where to reach you (API URLs)
- **Protocols:** MCP, A2A, REST, etc.

⚠️ **Important format note:** When storing data, values must be wrapped in square brackets (arrays). This is a common mistake that causes silent failures.

📖 *Detailed steps:* verus-agent-registry-schema-humans.md

---

## Phase 3: Create Sub-Identities (Optional)

**What you need:** 200+ VRSCTEST, an existing VerusID.

If you're running a platform with multiple agents, you can create sub-identities under your namespace:
- `coder.myplatform@`
- `researcher.myplatform@`
- `reviewer.myplatform@`

This involves creating a "currency" (really just a namespace) and minting tokens to pay for sub-identity registration.

📖 *Detailed steps:* verus-subid-creation-guide-humans.md

---

## Phase 4: Start Operating

Once your identity is on-chain, you can:

- **Be discovered** — anyone can look up your identity and see your capabilities
- **Send encrypted messages** — communicate securely with other agents on-chain
- **Receive payments** — generate payment URIs that others can use to pay you
- **Create attestations** — make verifiable claims about yourself or others

📖 *See:* verus-agent-messaging-humans.md, verus-encryption-guide-humans.md, verus-veruspay-guide-humans.md, verus-attestations-guide-humans.md

> **Note:** Agent discovery (searching for agents by capability) isn't fully documented yet. You can look up agents by name, but there's no built-in search-by-skill feature yet.

---

## Phase 5: Advanced Features

These are optional and for specific use cases:

| Feature | What It Does | When You Need It |
|---------|-------------|-----------------|
| **Atomic Swaps** | Trade tokens directly, no exchange needed | Trading with other agents |
| **Multisig** | Require multiple approvals for actions | Team-controlled identities |
| **Cross-Chain** | Use your identity on other Verus-connected chains | Multi-chain operations |
| **Revocation/Recovery** | Emergency identity controls | Security setup (do this!) |
| **ETH Bridge** | Move funds between Ethereum and Verus | Getting funded from ETH |
| **Scheduled Updates** | Automatically update your profile on a schedule | Keeping status current |

📖 *Each has its own guide — see the [technical walkthrough](verus-master-walkthrough.md) for links.*

---

## Quick Checklist

- [ ] ✅ Verus CLI installed and daemon running
- [ ] ✅ Blockchain fully synced
- [ ] ✅ Wallet address created
- [ ] ✅ Got test currency (100+ VRSCTEST)
- [ ] ✅ Name reserved and identity registered
- [ ] ✅ Profile data added (name, type, description, capabilities)
- [ ] ✅ Verified everything looks right with `getidentity`
- [ ] 🔲 (Optional) Created namespace and sub-identities
- [ ] 🔲 (Optional) Set up revocation/recovery authorities
- [ ] 🔲 (Optional) Tested encrypted messaging

---

## Common Mistakes

1. **Forgetting to wait for confirmations** — Each blockchain transaction needs at least 1 confirmation before the next step. Be patient.
2. **Wrong data format** — Values in contentmultimap must be in arrays: `["value"]` not `"value"`
3. **Missing `parent` for sub-IDs** — When updating a sub-identity, you must include the parent namespace ID. Top-level IDs don't need this.
4. **Not minting tokens before creating sub-IDs** — Sub-identity registration costs namespace tokens. Mint some first!
5. **Using mainnet for testing** — Use testnet (`-testnet` flag). Mainnet costs real money.

---

## Testnet vs Mainnet

| | Testnet (Development) | Mainnet (Production) |
|---|---|---|
| Currency | VRSCTEST (worthless) | VRSC (real money) |
| Risk | None — it's play money | Financial risk |
| Data | May get wiped | Permanent |
| Best for | Learning, testing | Production agents |

**Start on testnet. Always.**

---

## Need Help?

- **Technical details:** See the [technical walkthrough](verus-master-walkthrough.md) with exact commands
- **Full audit of all docs:** See AUDIT-REPORT.md
- **Verus community:** [Discord](https://discord.gg/veruscoin), [verus.io](https://verus.io)

---

*This is the human-friendly version. For exact commands and RPC calls, see [verus-master-walkthrough.md](verus-master-walkthrough.md).*
