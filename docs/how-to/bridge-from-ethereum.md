# How To: Bridge from Ethereum

> Transfer ETH and ERC-20 tokens to Verus, and send VRSC back to Ethereum

---

## Prerequisites

- **Ethereum wallet** (MetaMask or similar) with ETH for gas + the amount to bridge
- **Verus wallet** — either Verus Desktop or Verus CLI (`verusd`) running and synced
- A **Verus destination address** (R-address) or **VerusID** to receive funds
- For CLI operations: Verus daemon running and synced with Bridge.vETH active

---

## Part 1: Ethereum → Verus (Web UI)

The simplest method. No coding required.

### Step 1: Open the Bridge Interface

Go to [eth.verusbridge.io](https://eth.verusbridge.io/)

### Step 2: Connect Your Ethereum Wallet

1. Click **Connect Wallet**
2. Select MetaMask (or your wallet)
3. Approve the connection

### Step 3: Select the Token to Bridge

Choose from:
- **ETH** — arrives as **vETH** on Verus
- **DAI** — arrives as **DAI.vETH** on Verus
- **MKR** — arrives as **MKR.vETH** on Verus

### Step 4: Enter Your Verus Destination

Enter your Verus R-address or VerusID (e.g., `myidentity@`).

> ⚠️ **Double-check the address.** Cross-chain transfers cannot be reversed.

### Step 5: Enter the Amount

Specify how much to bridge. The UI shows estimated fees and output.

### Step 6: Confirm the Transaction

1. Review the details
2. Click **Send**
3. Confirm the transaction in MetaMask
4. Pay the gas fee

### Step 7: Wait for Completion

| Stage | Time |
|---|---|
| Ethereum confirmation | ~15 minutes |
| Bridge notarization | ~10-20 minutes |
| Verus import | ~1-2 minutes |
| **Total** | **~30-60 minutes** |

### Step 8: Verify on Verus

```bash
# Check your balance
verus getbalance

# Check specific currency balance (vETH, DAI.vETH, etc.)
verus getcurrencybalance '*'
```

---

## Part 2: Verus → Ethereum (CLI)

Send VRSC or other Verus-side currencies back to Ethereum.

### Step 1: Verify Bridge Status

```bash
verus getcurrency "Bridge.vETH"
```

Confirm the bridge is active and has reserves.

### Step 2: Send to Ethereum

Use [sendcurrency](../command-reference/multichain/sendcurrency.md) with `exportto`:

```bash
# Send VRSC to your Ethereum address
verus sendcurrency '*' '[{
  "address": "0xYourEthereumAddress",
  "amount": 10,
  "currency": "VRSC",
  "exportto": "vETH",
  "feecurrency": "veth"
}]'
```

```bash
# Send vETH back to Ethereum as ETH
verus sendcurrency '*' '[{
  "address": "0xYourEthereumAddress",
  "amount": 0.5,
  "currency": "vETH",
  "exportto": "vETH",
  "feecurrency": "veth"
}]'
```

### Step 3: Wait for Completion

Same timing as ETH → Verus: approximately 30-60 minutes (~1 hour typical) for notarization and import on the Ethereum side.

### Step 4: Verify on Ethereum

Check your Ethereum wallet or use a block explorer (Etherscan) to confirm receipt.

---

## Part 3: Bridge + Convert in One Step

You can bridge **and** convert simultaneously. For example, convert vETH to VRSC through the Bridge.vETH basket:

```bash
# Convert vETH → VRSC through Bridge.vETH
verus sendcurrency '*' '[{
  "address": "myidentity@",
  "amount": 0.5,
  "currency": "vETH",
  "convertto": "VRSC",
  "via": "Bridge.vETH"
}]'
```

Or estimate first:

```bash
verus estimateconversion '{"currency":"vETH","convertto":"VRSC","via":"Bridge.vETH","amount":0.5}'
```

---

## Contract Addresses

### Ethereum Mainnet

| Contract | Address |
|---|---|
| VRSC Token | `0x1Af5b8015C64d39Ab44C60EAd8317f9F5a9B6C4C` |
| vETH | `0x454CB83913D688795E237837d30258d11ea7c752` |
| Bridge.vETH | `0x0200EbbD26467B866120D84A0d37c82CdE0acAEB` |
| DAI.vETH | `0x8b72F1c2D326d376aDd46698E385Cf624f0CA1dA` |
| MKR.vETH | `0x65b5AaC6A4aa0Eb656AB6B8812184e7545b6A221` |

### Sepolia Testnet

| Contract | Address |
|---|---|
| VRSCTEST | `0xA6ef9ea235635E328124Ff3429dB9F9E91b64e2d` |
| vETH | `0x67460C2f56774eD27EeB8685f29f6CEC0B090B00` |
| Bridge.vETH | `0xffEce948b8A38bBcC813411D2597f7f8485a0689` |

---

## Fees

| Fee Type | Amount | Notes |
|---|---|---|
| Ethereum gas | Variable (~$5-50) | Depends on network congestion |
| Bridge export fee | ~0.003 ETH | Fixed bridge fee |
| Verus transaction fee | 0.0001 VRSC | Standard Verus fee |
| AMM conversion fee | ~0.025% | Only if converting via basket |

**Budget approximately 0.01 ETH for fees** on top of the amount you want to bridge.

---

## Testnet Notes

- Use **Sepolia** testnet on the Ethereum side
- Use **VRSCTEST** on the Verus side
- Testnet bridge may not always be active — check with `verus -testnet getcurrency "Bridge.vETH"`
- Get Sepolia ETH from faucets (e.g., sepoliafaucet.com)
- The testnet bridge UI is also at [eth.verusbridge.io](https://eth.verusbridge.io/) (select testnet)

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Transaction stuck on Ethereum | Wait for finality (~15 min). If gas was too low, speed up in MetaMask. |
| Funds not appearing on Verus | Wait up to 45 minutes. Check `verus getimports "Bridge.vETH"` for pending imports. |
| "Bridge not launched" error | Bridge.vETH may not be active. Check with `verus getcurrency "Bridge.vETH"`. |
| Invalid destination address | Ensure the Verus R-address or i-address is valid. Verify with `verus validateaddress "address"`. |
| Ethereum gas too high | Wait for lower gas or increase your gas limit. Bridge transactions use ~200-500k gas. |
| Wrong token received | ETH arrives as vETH, not VRSC. Use a conversion to swap vETH → VRSC if needed. |

### Checking Transfer Status

```bash
# Check pending imports from Ethereum
verus getimports "Bridge.vETH"

# Check pending exports to Ethereum
verus getexports "Bridge.vETH"

# Check bridge reserves and status
verus getcurrency "Bridge.vETH"
```

---

## Related

- [Bridge and Cross-Chain](../concepts/bridge-and-crosschain.md) — How the bridge works
- [How To: Convert Currencies](convert-currencies.md) — Convert bridged assets
- [sendcurrency](../command-reference/multichain/sendcurrency.md) — Command reference
- [Basket Currencies and DeFi](../concepts/basket-currencies-defi.md) — Bridge.vETH as a basket

---

*As of Verus v1.2.x.*
