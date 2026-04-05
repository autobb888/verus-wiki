# [Suggestion #6] Offline VerusID Signing — No Daemon Required (SDK / Agent Auth)

**Section:** Developers
**Submitted by:** Anonymous
**Date:** 2026-03-26

---

## Offline VerusID Signing — No Daemon Required

VerusID signatures normally go through the daemon via `signmessage` or `signdata` RPC. But for automated agents, headless servers, CI pipelines, or any environment without a running daemon, you can sign messages and authenticate entirely offline using just a WIF private key and two npm packages already in the Verus ecosystem.

### What You Need

- The identity's **WIF private key** (starts with `U` for testnet, `5` for mainnet — obtained once via `dumpprivkey` or key generation)
- `bitcoinjs-message` — message signing/verification
- `@bitgo/utxo-lib` (VerusCoin fork: `github:VerusCoin/BitGoJS`) — CIdentitySignature, key utilities

No daemon process. No RPC connection. No network access during signing.

### 1. Offline signmessage (Compatible with daemon verifymessage)

The daemon's `signmessage` uses a specific message prefix. Replicate it offline:

```javascript
import * as bitcoinMessage from 'bitcoinjs-message';
import { ECPair, networks } from '@bitgo/utxo-lib';

// Verus message prefix (0x15 = 21 decimal, then "Verus signed data:\n")
const MESSAGE_PREFIX = '\x15Verus signed data:\n';

function signMessage(wif, message, testnet = true) {
  const network = testnet ? networks.verustest : networks.verus;
  const keyPair = ECPair.fromWIF(wif, network);
  const privateKey = keyPair.privateKey;

  const signature = bitcoinMessage.sign(
    message,
    privateKey,
    keyPair.compressed,
    MESSAGE_PREFIX
  );

  // Zero private key material after signing
  privateKey.fill(0);

  return signature.toString('base64');
}
```

The resulting signature is identical to what `verus signmessage` produces. Any daemon can verify it with:
```
verus verifymessage "identity@" "<signature>" "the message"
```

### 2. Offline CIdentitySignature (Version 2, SHA256)

For protocols that use Verus identity signatures (not plain message signatures), use the IdentitySignature class from @bitgo/utxo-lib:

```javascript
import { IdentitySignature, ECPair, networks } from '@bitgo/utxo-lib';

function signChallenge(wif, challenge, identityAddress, testnet = true) {
  const network = testnet ? networks.verustest : networks.verus;
  const keyPair = ECPair.fromWIF(wif, network);

  const idSig = new IdentitySignature();
  idSig.version = 2;
  idSig.hashType = 5; // SHA256
  idSig.blockHeight = 0; // 0 for offline
  idSig.identityID = identityAddress;

  idSig.signMessageOffline(challenge, keyPair);

  // Zero key material
  keyPair.privateKey.fill(0);

  return idSig.toBuffer().toString('base64');
}
```

### 3. Offline LoginConsent Authentication

Combining offline signing with the LoginConsent protocol (see companion article: "VerusID LoginConsent Authentication Without Deep Links"):

```javascript
import { signMessage } from './signer.js';

// 1. Fetch challenge from service API
const res = await fetch('https://service.example/auth/consent/challenge');
const { data: challenge } = await res.json();

// 2. Verify service signature (optional but recommended)
// The challengeHash + requestSignature can be verified against
// the service's known identity if you have access to a Verus node.
// For offline-only: trust the TLS connection.

// 3. Sign the challengeHash offline
const signature = signMessage(agentWIF, challenge.challengeHash);

// 4. Submit back to service
await fetch('https://service.example/auth/consent/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    challengeId: challenge.challengeId,
    verusId: 'myagent@',
    signature,
  }),
});
// Service verifies with its daemon, returns session token
```

The agent's private key never leaves the machine. The service's daemon does all verification. The agent needs zero Verus infrastructure.

### 4. Offline Identity Updates (updateidentity)

You can also build and sign `updateidentity` transactions offline using verus-typescript-primitives and @bitgo/utxo-lib:

1. Fetch current identity + UTXOs from any Verus node or API
2. Build the identity update transaction locally
3. Sign with WIF using @bitgo/utxo-lib TransactionBuilder
4. Broadcast the raw signed transaction via any node's `sendrawtransaction` RPC

The transaction is built and signed entirely on the client. The node only broadcasts it — it never sees the private key.

Note: verus-typescript-primitives has a hardcoded VDXF key registry in VdxfUniValue that throws on unknown keys. If your identity uses custom VDXF keys, you may need to patch three throw points in VdxfUniValue.js (getByteLength, toBuffer, fromJson) to fall back to DataDescriptor serialization instead of throwing.

### 5. Key Generation (No Daemon)

Generate a fresh keypair without a daemon:

```javascript
import crypto from 'crypto';
import { ECPair, networks } from '@bitgo/utxo-lib';

function generateKeypair(testnet = true) {
  const network = testnet ? networks.verustest : networks.verus;
  // Use crypto.randomBytes for entropy (more explicit than ECPair.makeRandom)
  const privateKey = crypto.randomBytes(32);
  const keyPair = ECPair.fromPrivateKey(privateKey, { network });
  const wif = keyPair.toWIF();
  const publicKey = keyPair.publicKey.toString('hex');

  // Zero raw private key
  privateKey.fill(0);

  return { wif, publicKey };
}
```

Register the public key as a primary address on a VerusID (requires one on-chain transaction via a daemon), then all future signing is offline forever — unless you rotate keys.

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| WIF key storage | Encrypt at rest. Use environment variables, not source code. |
| Memory exposure | Zero private key buffers after signing (key.fill(0)) |
| Replay attacks | Services must use single-use challenges with short expiry |
| Key rotation | If identity primary addresses change on-chain, old WIF stops working — by design |
| No daemon verification | Signing side cannot verify service's LoginConsentRequest without a node. Trust TLS, or use a public Verus node for one-time verification. |

### Dependencies

| Package | Purpose |
|---------|---------|
| `bitcoinjs-message@2.2.0` | signmessage-compatible offline signing |
| `@bitgo/utxo-lib` (github:VerusCoin/BitGoJS) | CIdentitySignature, ECPair, networks, transaction building |
| `verus-typescript-primitives` | LoginConsentRequest/Response, VDXF classes, identity transaction building |

All three are pure JavaScript/TypeScript — no native modules, no daemon dependency. Works in Node.js, Bun, or any JS runtime.

### Reference

- @bitgo/utxo-lib (VerusCoin fork): IdentitySignature class, signMessageOffline()
- verus-typescript-primitives: LoginConsentRequest/Response, VdxfUniValue, identity transaction classes
- bitcoinjs-message: sign() / verify() with custom message prefix support