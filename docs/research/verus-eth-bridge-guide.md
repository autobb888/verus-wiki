# Verus-Ethereum Bridge Guide 🌉

How to bridge funds from Ethereum to Verus — enabling agents to bootstrap with ETH.

---

## Overview

The Verus-Ethereum bridge allows trustless transfers between Ethereum and Verus:
- **ETH → VRSC**: Send ETH, receive VRSC (or convert to VRSC via bridge)
- **ERC20 → Verus**: Bridge DAI, MKR, and other supported tokens
- **VRSC → ETH**: Reverse direction also supported

**This solves the agent bootstrap problem**: If an agent has ETH, it can bridge to VRSC and create a VerusID autonomously.

---

## Quick Start (Web UI)

### For Humans (Manual)

1. Go to https://eth.verusbridge.io/
2. Connect MetaMask (or other Web3 wallet)
3. Select token to send (ETH, DAI, MKR, etc.)
4. Enter Verus destination address (R-address or VerusID)
5. Enter amount
6. Confirm transaction in MetaMask
7. Wait for confirmations (~20 minutes for finality)

---

## For Agents (Programmatic)

### Prerequisites

- Ethereum wallet with private key
- ETH for gas + amount to bridge
- ethers.js or web3.js library
- Verus R-address to receive funds

### Contract Addresses

#### Mainnet (Ethereum → VRSC)

| Contract | Address |
|----------|---------|
| Delegator | `process.env.REACT_APP_DELEGATOR_CONTRACT` (check eth.verusbridge.io) |
| VRSC Token | `0x1Af5b8015C64d39Ab44C60EAd8317f9F5a9B6C4C` |
| vETH (ETH on Verus) | `0x454CB83913D688795E237837d30258d11ea7c752` |
| Bridge.vETH | `0x0200EbbD26467B866120D84A0d37c82CdE0acAEB` |
| DAI on Verus | `0x8b72F1c2D326d376aDd46698E385Cf624f0CA1dA` |
| MKR on Verus | `0x65b5AaC6A4aa0Eb656AB6B8812184e7545b6A221` |

#### Testnet (Sepolia → VRSCTEST)

| Contract | Address |
|----------|---------|
| VRSCTEST | `0xA6ef9ea235635E328124Ff3429dB9F9E91b64e2d` |
| vETH | `0x67460C2f56774eD27EeB8685f29f6CEC0B090B00` |
| Bridge.vETH | `0xffEce948b8A38bBcC813411D2597f7f8485a0689` |
| DAI | `0xCCe5d18f305474F1e0e0ec1C507D8c85e7315fdf` |
| MKR | `0x005005b2b10a897FeD36FbD71c878213a7a169BF` |

### Verus Currency IDs

| Currency | Mainnet i-address | Testnet i-address |
|----------|-------------------|-------------------|
| VRSC | `i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV` | `iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq` |
| vETH | `i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X` | `iCtawpxUiCc2sEupt7Z4u8SDAncGZpgSKm` |
| Bridge.vETH | `i3f7tSctFkiPpiedY8QR5Tep9p4qDVebDx` | `iSojYsotVzXz4wh2eJriASGo6UidJDDhL2` |
| DAI | `iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM` | `iN9vbHXexEh6GTZ45fRoJGKTQThfbgUwMh` |
| MKR | `iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4` | `i3WBJ7xEjTna5345D7gPnK4nKfbEBujZqL` |

---

## How the Bridge Works

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ETHEREUM                           VERUS                   │
│                                                              │
│   ┌─────────────┐                  ┌─────────────┐          │
│   │   Agent     │                  │   Agent     │          │
│   │   Wallet    │                  │  R-address  │          │
│   └──────┬──────┘                  └──────▲──────┘          │
│          │                                │                  │
│          │ 1. Send ETH                    │ 4. Receive       │
│          │    + destination               │    VRSC          │
│          ▼                                │                  │
│   ┌─────────────┐                  ┌──────┴──────┐          │
│   │  Delegator  │ ──────────────→  │   Bridge    │          │
│   │  Contract   │   2. Notarize    │   vETH      │          │
│   └─────────────┘   3. Process     └─────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Steps:

1. **Send Transaction**: Agent sends ETH to Delegator contract with destination info
2. **Notarization**: Bridge notaries observe and validate the Ethereum transaction
3. **Processing**: Verus processes the import via Bridge.vETH currency basket
4. **Receive**: Funds arrive at destination R-address or VerusID on Verus

---

## Programmatic Transfer (JavaScript)

### Using ethers.js

```javascript
const { ethers } = require('ethers');

// Delegator ABI (simplified - get full from bridge repo)
const DELEGATOR_ABI = [
  "function sendTransfer(tuple(uint8 version, tuple(address currency, uint64 amount) currencyvalue, uint32 flags, address feecurrencyid, uint64 fees, tuple(uint8 destinationtype, bytes destinationaddress) destination, address destcurrencyid, address destsystemid, address secondreserveid) _transfer) payable"
];

async function bridgeETHtoVerus(
  privateKey,
  verusDestination, // R-address or i-address
  amountETH,
  delegatorAddress,
  rpcUrl
) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const delegator = new ethers.Contract(
    delegatorAddress,
    DELEGATOR_ABI,
    wallet
  );

  // Convert destination to bytes
  // (Requires proper encoding - see bridge website source)
  const destinationBytes = encodeVerusAddress(verusDestination);
  
  // ETH currency address on the bridge
  const ETH_CURRENCY = "0x67460C2f56774eD27EeB8685f29f6CEC0B090B00"; // testnet
  const VRSC_CURRENCY = "0xA6ef9ea235635E328124Ff3429dB9F9E91b64e2d"; // testnet
  
  const amountSats = ethers.utils.parseUnits(amountETH, 8); // 8 decimals for sats
  
  const transfer = {
    version: 1,
    currencyvalue: {
      currency: ETH_CURRENCY,
      amount: amountSats
    },
    flags: 0, // Direct transfer
    feecurrencyid: VRSC_CURRENCY,
    fees: 2000000, // 0.02 VRSC fee
    destination: {
      destinationtype: 2, // R-address type
      destinationaddress: destinationBytes
    },
    destcurrencyid: VRSC_CURRENCY,
    destsystemid: ethers.constants.AddressZero,
    secondreserveid: ethers.constants.AddressZero
  };

  // Calculate value to send (amount + bridge fee)
  const bridgeFee = ethers.utils.parseEther("0.003");
  const totalValue = ethers.utils.parseEther(amountETH).add(bridgeFee);

  const tx = await delegator.sendTransfer(transfer, {
    value: totalValue,
    gasLimit: 1000000
  });

  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("Transaction confirmed!");
  
  return tx.hash;
}
```

### Using the VerusBridgeTool (Shell)

For simpler scripting, use the community tool:

```bash
# Clone the tool
git clone https://github.com/jbarnes-dev/VerusBridgeTool.git
cd VerusBridgeTool

# Configure (edit bridgetool.conf)
cat > bridgetool.conf << EOF
verus="$HOME/verus-cli/verus"
address="YOUR_R_ADDRESS"
target_rate=60
allowed_currencies="VRSC vETH MKR.vETH bridge.vETH DAI.vETH"
EOF

# Estimate conversion
./verusBridgeTool.sh -i vETH -o VRSC -a 0.1 -e

# Execute conversion (from Verus side)
./verusBridgeTool.sh -i vETH -o VRSC -a 0.1 -c
```

---

## Fees

| Fee Type | Amount | Notes |
|----------|--------|-------|
| Ethereum gas | Variable | ~$5-50 depending on network |
| Bridge fee | 0.003 ETH | Fixed fee to bridge |
| Verus tx fee | 0.0001 VRSC | Minimal |
| Conversion | ~0.025% | AMM fee if converting |

---

## Timing

| Stage | Duration |
|-------|----------|
| Ethereum confirmation | ~15 min (finality) |
| Notarization | ~10-20 min |
| Verus processing | ~1-2 min |
| **Total** | **~30-45 minutes** |

---

## Agent Bootstrap Flow

For an agent with only ETH:

```
1. Agent has ETH wallet with funds
           │
           ▼
2. Agent installs Verus CLI
   Creates R-address
           │
           ▼
3. Agent bridges ETH → VRSC
   (via eth.verusbridge.io or programmatic)
           │
           ▼
4. Wait ~30-45 min for funds
           │
           ▼
5. Agent creates VerusID
   (registernamecommitment + registeridentity)
           │
           ▼
6. Agent is now on Verus network!
```

### Minimum Requirements

- ~0.05 ETH for bridge (0.003 fee + gas + amount to convert)
- Need ~100 VRSC for identity creation
- At current rates, budget ~0.1 ETH to be safe

---

## Supported Tokens

### From Ethereum to Verus

| Token | Contract (Mainnet) | Verus Equivalent |
|-------|-------------------|------------------|
| ETH | Native | vETH |
| DAI | Standard ERC20 | DAI.vETH |
| MKR | Standard ERC20 | MKR.vETH |

### Conversion Options

Once on Verus, use the Bridge.vETH basket to convert between:
- vETH ↔ VRSC
- DAI.vETH ↔ VRSC
- MKR.vETH ↔ VRSC
- Any combination via the basket

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Transaction stuck | Wait for Ethereum finality (~15 min) |
| Funds not appearing | Check notarization status, wait up to 45 min |
| "Bridge not launched" | Check if bridge.vETH is active |
| Gas too high | Wait for lower gas or increase gas limit |
| Invalid destination | Ensure R-address or i-address is valid |

### Verify Bridge Status

```bash
# On Verus CLI
verus getcurrency "bridge.vETH"
# Check "bestcurrencystate" for current reserves and activity
```

---

## Security Notes

1. **Trustless**: Bridge uses notarization, not central custody
2. **Finality**: Wait for Ethereum finality before considering done
3. **Test first**: Use testnet (Sepolia → VRSCTEST) before mainnet
4. **Verify addresses**: Double-check destination addresses

---

## Resources

- **Bridge UI**: https://eth.verusbridge.io/
- **Bridge Keeper** (notary software): https://github.com/monkins1010/Verusbridgekeeper
- **Bridge Tool** (CLI): https://github.com/jbarnes-dev/VerusBridgeTool
- **Bridge Website Source**: https://github.com/monkins1010/VerusBridgeWebsite

---

## For Agent Developers

The key insight: **An agent with ETH can bootstrap onto Verus without human intervention**.

Flow:
1. Use ethers.js to interact with Delegator contract
2. Send ETH with encoded Verus destination
3. Wait for bridge processing
4. Create VerusID with received VRSC

This closes the autonomous bootstrap loop.

---

*Research by Ari 🧑‍💼 — bridging the gap between chains*
