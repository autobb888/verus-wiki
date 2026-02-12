# Bridge and Cross-Chain Transfers

> Trustless interoperability between Verus and Ethereum via the Verus-Ethereum bridge

---

## What Is the Verus-Ethereum Bridge?

The Verus-Ethereum bridge is a **trustless, decentralized protocol** that enables transfers of value between the Verus and Ethereum blockchains. Unlike centralized bridges that rely on custodians holding funds, the Verus bridge uses **notarization proofs** validated by both chains — the same consensus mechanism that secures Verus itself.

The bridge allows you to:
- Send ETH and ERC-20 tokens (DAI, MKR) from Ethereum to Verus
- Send VRSC and Verus-side tokens from Verus back to Ethereum
- Convert between bridged assets using Verus's protocol-level AMM
- Move VerusIDs and currency definitions cross-chain

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ETHEREUM                          VERUS                   │
│                                                             │
│   ETH ─────────────────────────→  vETH                     │
│   DAI ─────────────────────────→  DAI.vETH                 │
│   MKR ─────────────────────────→  MKR.vETH                 │
│                                                             │
│   ←─── Bridge.vETH (basket currency) ───→                  │
│                                                             │
│   VRSC token ←─────────────────  VRSC                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### Bridge.vETH — The Bridge Currency

**Bridge.vETH** is a [basket currency](basket-currencies-defi.md) that sits at the heart of the bridge. It holds reserves of multiple currencies from both chains:

- **VRSC** — Native Verus currency
- **vETH** — Ethereum (ETH) represented on Verus
- **DAI.vETH** — DAI stablecoin represented on Verus
- **MKR.vETH** — MakerDAO governance token represented on Verus

Because Bridge.vETH is a basket, it functions as an automatic exchange. You can convert between any of its reserve currencies using the same AMM mechanism described in [Basket Currencies and DeFi](basket-currencies-defi.md).

### Mapped Tokens

When an Ethereum asset crosses the bridge, it gets a **mapped representation** on Verus:

| Ethereum Asset | Verus Representation | Type |
|---|---|---|
| ETH (native) | **vETH** | Mapped currency |
| DAI (ERC-20) | **DAI.vETH** | Mapped token |
| MKR (ERC-20) | **MKR.vETH** | Mapped token |
| NATI (ERC-20) | **NATI.vETH** | Mapped token |
| VRSC (ERC-20 on ETH) | **VRSC** (native) | Native currency |

> **Note:** Additional ERC-20 tokens can be mapped to the bridge. The list above includes the currently active mapped tokens. Check the bridge interface at [eth.verusbridge.io](https://eth.verusbridge.io) for the latest available tokens.

The `.vETH` suffix indicates the token originated from the Ethereum side of the bridge. These mapped tokens are fully fungible on Verus — you can hold them, trade them, use them in basket currencies, or bridge them back to Ethereum at any time.

### Currency IDs

Every currency on Verus has a permanent i-address identifier:

| Currency | Mainnet i-address |
|---|---|
| VRSC | `i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV` |
| vETH | `i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X` |
| Bridge.vETH | `i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx` |
| DAI.vETH | `iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM` |
| MKR.vETH | `iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4` |

---

## How Cross-Chain Transfers Work

Every cross-chain transfer follows a three-phase process: **export → notarization → import**.

### Phase 1: Export

When you initiate a cross-chain transfer, the source chain creates an **export transaction**. This locks or burns the source currency and records the transfer details (destination, amount, fees) in a special output.

```bash
# Example: Send 10 VRSC to Ethereum
verus sendcurrency '*' '[{
  "address": "0xYourEthAddress",
  "amount": 10,
  "currency": "VRSC",
  "exportto": "vETH",
  "feecurrency": "veth"
}]'
```

The export is bundled with other exports in the same block into an **export bundle** — a batch of transfers that cross together.

### Phase 2: Notarization

**Notaries** are nodes that run both a Verus node and an Ethereum node. They observe finalized transactions on one chain and create **notarization proofs** for the other chain.

```
Source Chain                    Notaries                    Dest Chain
     │                            │                            │
     │  1. Export tx confirmed    │                            │
     │ ─────────────────────────→ │                            │
     │                            │  2. Create proof           │
     │                            │  3. Submit notarization    │
     │                            │ ─────────────────────────→ │
     │                            │                            │
     │                            │  4. Dest chain validates   │
     │                            │     proof against headers  │
```

Key properties of notarization:
- **Multiple notaries** must agree — no single point of failure
- Notarizations include **Merkle proofs** of the export transactions
- The destination chain **independently validates** the proofs
- Notaries cannot forge transfers — they can only attest to what actually happened

### Phase 3: Import

Once a valid notarization is accepted by the destination chain, the **import** is processed automatically. The destination chain mints or releases the appropriate currency to the recipient address.

For Ethereum-bound transfers, the import is processed by the **Delegator smart contract** on Ethereum. For Verus-bound transfers, the Verus blockchain processes the import natively.

### Complete Flow Diagram

```
ETH → VRSC Transfer:

  Ethereum                                              Verus
  ────────                                              ─────
  1. User sends ETH to              
     Delegator contract          
     with Verus destination      
           │                     
           │ (ETH locked)        
           ▼                     
  2. Export recorded on          
     Ethereum                    
           │                     
           │ (~15 min finality)  
           ▼                     
  3. Notaries observe ──────────────→ 4. Notarization proof
     finalized export                    submitted to Verus
                                              │
                                              ▼
                                  5. Verus validates proof
                                     against ETH headers
                                              │
                                              ▼
                                  6. Import processed:
                                     vETH minted to
                                     destination address
                                              │
                                              ▼
                                  7. User receives vETH
                                     (or auto-converts
                                      to VRSC via basket)
```

---

## Fees and Timing

### Fees

| Fee | Amount | Paid On |
|---|---|---|
| Ethereum gas | Variable (~$5-50) | Ethereum |
| Bridge export fee | ~0.003 ETH | Ethereum |
| Verus transaction fee | 0.0001 VRSC | Verus |
| Conversion fee (if converting) | 0.025% (basket↔reserve) or 0.05% (reserve↔reserve) | Verus (into basket reserves) |

When bridging **from Ethereum to Verus**, fees are paid in ETH. When bridging **from Verus to Ethereum**, if you don't set the `feecurrency` flag, VRSC is automatically converted to vETH via the Bridge.vETH basket to cover Ethereum gas costs. You can explicitly set `"feecurrency": "veth"` to pay fees in vETH directly.

### Timing

| Stage | Duration |
|---|---|
| Ethereum finality | ~15 minutes |
| Notarization propagation | ~10-20 minutes |
| Verus import processing | ~1-2 minutes |
| **Total (ETH → Verus)** | **~30-60 minutes** |

Verus-to-Ethereum transfers take a similar amount of time. Expect roughly **1 hour** for a complete bridge transfer in either direction, depending on network conditions.

---

## Security Model

The bridge's security rests on several layers:

### 1. Proof-Based Verification

Transfers are not trusted — they are **proven**. Each notarization includes cryptographic Merkle proofs that the destination chain verifies independently. A notary cannot claim a transfer happened if it didn't, because the proof wouldn't validate against the source chain's block headers.

### 2. Multi-Notary Consensus

Multiple independent notaries must agree on the state of the source chain. No single notary can authorize an import. This is similar to how multi-signature wallets require multiple keys — except here the "signatures" are notarization proofs from independent observers.

### 3. No Custodial Risk

Unlike wrapped-token bridges (e.g., WBTC), where a custodian holds the underlying asset, the Verus bridge locks assets in smart contracts (Ethereum side) or burns/mints them at the protocol level (Verus side). No entity holds custody of bridged funds.

### 4. Ethereum Smart Contract Security

The Ethereum side of the bridge uses a **Delegator contract** pattern. The contract:
- Validates notarization proofs from Verus
- Processes imports (releasing ETH/tokens to recipients)
- Processes exports (locking ETH/tokens for bridge transfers)
- Is upgradeable through Verus notarization consensus, not a single admin key

### 5. Rollback Protection

The bridge waits for sufficient confirmations (finality) on both chains before processing transfers. This protects against blockchain reorganizations that could invalidate transfers.

### Comparison to Other Bridges

| Feature | Verus Bridge | Typical Centralized Bridge | Typical MPC Bridge |
|---|---|---|---|
| Custody | Non-custodial | Custodial | Multi-party custody |
| Trust model | Proof-based | Trust the operator | Trust the MPC set |
| Single point of failure | No | Yes | Reduced but present |
| Exploit surface | Minimal (protocol-level) | Smart contract + custodian | Smart contract + MPC |
| Upgrade mechanism | Consensus-based | Admin key | Multi-sig |

---

## Using the Bridge

### From Ethereum to Verus (Web UI)

The simplest way to bridge is via the web interface:

1. Go to [eth.verusbridge.io](https://eth.verusbridge.io/)
2. Connect your Ethereum wallet (MetaMask, etc.)
3. Select the token to bridge (ETH, DAI, MKR)
4. Enter your Verus destination (R-address or VerusID)
5. Enter the amount
6. Confirm the transaction
7. Wait ~30-60 minutes for the transfer to complete

### From Verus to Ethereum (CLI)

Use [sendcurrency](../command-reference/multichain/sendcurrency.md) with `exportto`:

```bash
# Send VRSC to Ethereum
verus sendcurrency '*' '[{
  "address": "0xYourEthAddress",
  "amount": 10,
  "currency": "VRSC",
  "exportto": "vETH",
  "feecurrency": "veth",
  "refundto": "YourVerusRAddress"
}]'

# Send vETH back to Ethereum as ETH
verus sendcurrency '*' '[{
  "address": "0xYourEthAddress",
  "amount": 0.5,
  "currency": "vETH",
  "exportto": "vETH",
  "feecurrency": "veth",
  "refundto": "YourVerusRAddress"
}]'
```

### Bridge + Convert in One Step

You can bridge and convert simultaneously. For example, bridge ETH to Verus and receive VRSC (not vETH):

From the Verus side, if you hold vETH:
```bash
# Convert vETH → VRSC through Bridge.vETH basket
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 0.5,
  "currency": "vETH",
  "convertto": "VRSC",
  "via": "Bridge.vETH"
}]'
```

### Checking Bridge Status

```bash
# View Bridge.vETH currency details and reserves
verus getcurrency "Bridge.vETH"

# Check pending exports
verus getexports "Bridge.vETH"

# Check pending imports
verus getimports "Bridge.vETH"
```

---

## Contract Addresses

### Ethereum Mainnet

| Contract | Address |
|---|---|
| Delegator | See [eth.verusbridge.io](https://eth.verusbridge.io/) |
| VRSC Token | `0xBc2738BA63882891094C99E59a02141Ca1A1C36a` |
| vETH | `0x454CB83913D688795E237837d30258d11ea7c752` |
| Bridge.vETH | `0xE6052Dcc60573561ECef2D9A4C0FEA6d3aC5B9A2` |
| DAI.vETH | `0x8b72F1c2D326d376aDd46698E385Cf624f0CA1dA` |
| MKR.vETH | `0x65b5AaC6A4aa0Eb656AB6B8812184e7545b6A221` |

### Sepolia Testnet

| Contract | Address |
|---|---|
| VRSCTEST | `0xA6ef9ea235635E328124Ff3429dB9F9E91b64e2d` |
| vETH | `0x67460C2f56774eD27EeB8685f29f6CEC0B090B00` |
| Bridge.vETH | `0xffEce948b8A38bBcC813411D2597f7f8485a0689` |
| DAI | `0xCCe5d18f305474F1e0e0ec1C507D8c85e7315fdf` |
| MKR | `0x005005b2b10a897FeD36FbD71c878213a7a169BF` |

---

## Key Takeaways

1. **Trustless** — The bridge uses cryptographic proofs, not custodians. Notaries attest to what happened; the destination chain verifies independently.
2. **Bidirectional** — Assets flow both ways: Ethereum → Verus and Verus → Ethereum.
3. **Integrated AMM** — Bridge.vETH is a basket currency, so bridged assets can be converted instantly via the protocol-level AMM.
4. **Multi-asset** — ETH, DAI, MKR, and VRSC are all supported. Additional ERC-20 tokens can be added through governance.
5. **Protocol-level** — The bridge is not a third-party dApp. It's part of the Verus protocol, secured by the same consensus mechanism as the blockchain itself.
6. **~30-60 minutes** — Transfers take time because both chains must reach finality. This is a security feature, not a limitation.

---

## Related

- [Basket Currencies and DeFi](basket-currencies-defi.md) — How the Bridge.vETH basket works
- [How To: Bridge from Ethereum](../how-to/bridge-from-ethereum.md) — Step-by-step bridging guide
- [How To: Convert Currencies](../how-to/convert-currencies.md) — Converting bridged assets
- [sendcurrency](../command-reference/multichain/sendcurrency.md) — The command that does it all
- [getcurrency](../command-reference/multichain/getcurrency.md) — Check bridge reserves and status

---

*As of Verus v1.2.x.*
