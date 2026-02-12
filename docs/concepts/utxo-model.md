# Understanding UTXOs on Verus

> How Verus tracks ownership of funds — the "digital cash" model explained

---

## What Is a UTXO?

UTXO stands for **Unspent Transaction Output**. It's how Verus (and Bitcoin) tracks who owns what. Instead of maintaining account balances like a bank, the blockchain tracks individual "chunks" of coins.

Think of it like physical cash:

```
Bank Account Model (Ethereum):
  Alice's balance: 150 VRSC
  → One number that goes up and down

UTXO Model (Verus/Bitcoin):
  Alice has:
  ├─ 50 VRSC   (received from mining reward)
  ├─ 30 VRSC   (received from Bob)
  └─ 70 VRSC   (change from a previous transaction)
  → Three separate "coins" that add up to 150 VRSC
```

Each UTXO is like a bill in your wallet. You don't have "a balance" — you have a collection of individual unspent outputs from previous transactions.

---

## How Transactions Work with UTXOs

When you send VRSC, you don't subtract from a balance. You **spend one or more UTXOs** and create new ones.

### Example: Alice sends 45 VRSC to Bob

Alice has three UTXOs: 50, 30, and 70 VRSC.

```
INPUTS (UTXOs being spent):         OUTPUTS (new UTXOs created):
┌─────────────────────┐             ┌──────────────────────┐
│ Alice's 50 VRSC     │────────────→│ Bob: 45 VRSC         │  (Bob's new UTXO)
└─────────────────────┘             │ Alice: 4.9999 VRSC   │  (change back to Alice)
                                    │ Fee: 0.0001 VRSC     │  (miner fee)
                                    └──────────────────────┘
```

What happened:
1. Alice's 50 VRSC UTXO is **consumed** (spent entirely — you can't partially spend a UTXO)
2. A new 45 VRSC UTXO is created for Bob
3. A new 4.9999 VRSC UTXO is created as **change** back to Alice
4. The 0.0001 VRSC difference is the transaction fee

Alice's remaining UTXOs are now: **4.9999**, 30, and 70 VRSC.

> **Key insight:** UTXOs are always spent in full. If you have a 50 VRSC UTXO and want to send 10, the transaction consumes the entire 50 and sends you 39.9999 back as change. Just like paying with a $50 bill for a $10 item — you get change back.

---

## UTXOs vs Account Model

| Feature | UTXO Model (Verus) | Account Model (Ethereum) |
|---------|-------------------|-------------------------|
| Balance tracking | Collection of unspent outputs | Single balance number |
| Privacy | Better — different UTXOs can use different addresses | Worse — all activity tied to one address |
| Parallel processing | UTXOs can be spent independently | Transactions must be sequential (nonce) |
| Transaction size | Larger (references all inputs) | Smaller (just amount + nonce) |
| Mental model | Physical cash / coins in a jar | Bank account balance |
| Double-spend prevention | Each UTXO can only be spent once | Nonce ordering prevents replays |

---

## Why UTXOs Matter for Verus Users

### 1. Staking

This is where UTXOs matter most on Verus. **Each UTXO stakes independently.** A larger UTXO has a higher probability of being selected to stake a block.

```
Scenario A — One big UTXO:
  └─ 10,000 VRSC (single UTXO)
  → Stakes frequently, but all-or-nothing

Scenario B — Many small UTXOs:
  ├─ 100 VRSC
  ├─ 100 VRSC
  ├─ ... (100 UTXOs)
  └─ 100 VRSC
  → Each has a small chance to stake independently
```

**Which is better?** Over time, the expected staking reward is roughly the same regardless of UTXO size. However:
- **Fewer large UTXOs** = simpler wallet, fewer transactions to track
- **More smaller UTXOs** = more frequent but smaller rewards (smoother income)
- **Very tiny UTXOs** (dust) = may never stake and waste resources

> **Staking eligibility:** A UTXO must have at least **150 confirmations** (~2.5 hours at ~60s/block) before it can stake.

### 2. Privacy

Each UTXO can be associated with a different address. When you receive VRSC, your wallet may generate a new address for each transaction. This makes it harder for observers to link all your funds together.

However, when you **spend** multiple UTXOs in a single transaction, they become linked — an observer can infer they belong to the same person. This is called a **common input ownership heuristic**.

For maximum privacy, use [shielded transactions](privacy-shielded-tx.md) which hide UTXOs entirely using zero-knowledge proofs.

### 3. Transaction Fees

Transactions that consume more UTXOs (more inputs) are physically larger in bytes. Verus uses a flat 0.0001 VRSC fee for standard transactions, but extremely complex transactions with many inputs could cost more.

### 4. Currency Tokens

On Verus, tokens and currencies also use the UTXO model. When you hold 500 `agentplatform` tokens, you might actually have several UTXOs:

```
Token UTXOs:
├─ 200 agentplatform tokens (from minting)
├─ 150 agentplatform tokens (from a trade)
└─ 150 agentplatform tokens (from a payment)
```

These work exactly like VRSC UTXOs — spent in full, with change returned.

---

## Managing Your UTXOs

### View Your UTXOs

```bash
# List all unspent outputs in your wallet
./verus listunspent

# List UTXOs with at least 6 confirmations
./verus listunspent 6

# List UTXOs for a specific address
./verus listunspent 1 9999999 '["RYourAddress"]'
```

Each entry shows:
- `txid` — The transaction that created this UTXO
- `vout` — The output index within that transaction
- `amount` — How much VRSC this UTXO holds
- `confirmations` — How many blocks since it was created
- `spendable` — Whether your wallet can spend it

### Check UTXOs for Any Address (requires `-addressindex=1`)

```bash
# Get UTXOs for any address (not just your wallet)
./verus getaddressutxos '{"addresses":["RAddress..."]}'
```

### Consolidate UTXOs

If you have many small UTXOs (dust), you can consolidate them by sending your full balance to yourself:

```bash
# Send all to yourself — combines many UTXOs into one
./verus sendtoaddress "RYourAddress" $(./verus getbalance) "" "" true
```

The `true` at the end subtracts the fee from the amount, so it sends your entire balance.

### Split UTXOs for Staking

If you have one large UTXO and want to split it for more frequent staking rewards:

```bash
# Split into multiple UTXOs
./verus sendcurrency "*" '[
  {"address":"RYourAddress","amount":2500},
  {"address":"RYourAddress","amount":2500},
  {"address":"RYourAddress","amount":2500},
  {"address":"RYourAddress","amount":2500}
]'
```

This turns one 10,000 VRSC UTXO into four 2,500 VRSC UTXOs.

---

## UTXO Lifecycle

```
   Created                    Mature                    Spent
      │                         │                         │
      ▼                         ▼                         ▼
 ┌─────────┐  150 blocks   ┌─────────┐  Used as     ┌─────────┐
 │  New     │──────────────→│ Eligible│──input in──→ │ Spent   │
 │  UTXO    │  (~2.5 hrs)  │ to stake│  a new tx    │ (gone)  │
 └─────────┘               └─────────┘              └─────────┘
                                │                        │
                                │ Selected for staking   │ Creates new UTXOs
                                ▼                        ▼
                           ┌─────────┐             ┌─────────┐
                           │ Staking │             │ Change  │
                           │ reward  │             │ + Output│
                           └─────────┘             └─────────┘
                           (new UTXO,              (new UTXOs for
                            needs 150              recipient and
                            confirms               sender change)
                            again)
```

> **Important:** When a UTXO stakes successfully, it's consumed and a new UTXO is created with the original amount plus the staking reward. This new UTXO needs another 150 confirmations before it can stake again.

---

## Common Questions

**Q: Do I need to manage my UTXOs manually?**
A: For basic use, no. Your wallet handles UTXO selection automatically when you send transactions. UTXO management mainly matters for optimizing staking.

**Q: What is "dust"?**
A: Very small UTXOs (fractions of a coin) that cost more in transaction fees to spend than they're worth. They clutter your wallet and are unlikely to ever stake.

**Q: Why does my balance show different amounts in different commands?**
A: Some commands show only confirmed UTXOs, others include unconfirmed (mempool) transactions. Use `getbalance` for confirmed balance and `getunconfirmedbalance` for pending.

**Q: Can someone see my UTXOs?**
A: On the transparent chain, yes — anyone can query an address's UTXOs. Use [shielded addresses](privacy-shielded-tx.md) (z-addresses) if you want privacy. Note that z-addresses can only hold the native currency (VRSC), not tokens.

---

## Related Commands

- [`listunspent`](../command-reference/wallet/listunspent.md) — List your wallet's UTXOs
- [`getaddressutxos`](../command-reference/addressindex/getaddressutxos.md) — Query UTXOs for any address
- [`getaddressbalance`](../command-reference/addressindex/getaddressbalance.md) — Quick balance check by address
- [`sendcurrency`](../command-reference/multichain/sendcurrency.md) — Send funds (automatically selects UTXOs)
- [`z_sendmany`](../command-reference/wallet/z_sendmany.md) — Send with explicit source address

---

## Related Concepts

- [Mining and Staking](mining-and-staking.md) — How UTXOs participate in consensus
- [Privacy and Shielded Transactions](privacy-shielded-tx.md) — Hiding UTXOs with zero-knowledge proofs
- [Key Concepts](key-concepts.md) — Foundational Verus concepts

---

*As of Verus v1.2.x.*
