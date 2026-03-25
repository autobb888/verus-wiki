# [Suggestion #5] VerusID LoginConsent Authentication Without Deep Links (API-Based Flow)

**Section:** Developers
**Submitted by:** Anonymous
**Date:** 2026-03-25

---

## VerusID LoginConsent Authentication — API-Based Flow

The VerusID LoginConsent protocol provides mutual authentication between services and users. Both sides verify each other — no passwords, no centralized auth providers.

Verus Mobile handles LoginConsent via deep links and QR codes. But Desktop GUI and CLI users don't need deep links at all. This guide shows how to implement the full LoginConsent protocol using a synchronous API-based flow that works with any wallet that has `signmessage` and `verifysignature`.

### Overview

```
Service (has daemon)              User (Desktop GUI / CLI / SDK)
       |                                    |
  1. Create LoginConsentRequest             |
     Sign with signdata RPC       -------->  |
     Serve via REST API                     |
       |                                    |
       |                          2. Verify service signature
       |                             verifysignature (proves
       |                             challenge is from service)
       |                                    |
       |                          3. Sign the challengeHash
       |                             signmessage (proves user
       |                  <--------  owns the identity)
       |                                    |
  4. Verify user signature                  |
     verifymessage RPC                      |
     Create session               -------->  |
```

No deep links. No URL scheme handlers. No push notifications. The user pulls the challenge, verifies it, signs it, and sends it back. Works with Verus Desktop, Verus CLI, or any SDK that can sign messages offline.

### Step 1: Service Creates LoginConsentRequest

The service builds a LoginConsentRequest using verus-typescript-primitives and signs it with the daemon's `signdata` RPC.

```javascript
import primitives from 'verus-typescript-primitives/dist/vdxf/classes/index.js';
import * as keys from 'verus-typescript-primitives/dist/vdxf/keys.js';
import * as scopes from 'verus-typescript-primitives/dist/vdxf/scopes.js';
import * as vdxf from 'verus-typescript-primitives/dist/vdxf/index.js';
import { toBase58Check } from 'verus-typescript-primitives/dist/utils/address.js';
import { I_ADDR_VERSION } from 'verus-typescript-primitives/dist/constants/vdxf.js';
import { randomBytes } from 'crypto';

const SERVICE_ID = 'yourservice@';
const SYSTEM_ID = 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq'; // VRSCTEST

// Generate unique challenge ID (base58check i-address format)
const challengeId = toBase58Check(randomBytes(20), I_ADDR_VERSION);

// Build the challenge
// redirect_uris can include a webhook for mobile QR compatibility,
// or be left empty for pure API-based flows.
const challenge = new primitives.LoginConsentChallenge({
  challenge_id: challengeId,
  created_at: Math.floor(Date.now() / 1000),
  requested_access: [
    new primitives.RequestedPermission(scopes.IDENTITY_VIEW.vdxfid),
  ],
  redirect_uris: [
    // Optional: include webhook for Verus Mobile QR compatibility
    new primitives.RedirectUri(
      'https://yourservice.example/auth/callback',
      keys.LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid,
    ),
  ],
});

const loginRequest = new primitives.LoginConsentRequest({
  system_id: SYSTEM_ID,
  signing_id: serviceIAddress, // resolved via getidentity
  challenge,
});

// Sign with daemon's signdata RPC
// IMPORTANT: Pass challenge.toSha256(), NOT getChallengeHash().
// The daemon internally adds system_id + block height + signing_id
// to the hash before ECDSA signing.
const challengeSha256 = challenge.toSha256();
const signResult = await rpc('signdata', [{
  address: SERVICE_ID,
  datahash: challengeSha256.toString('hex'),
}]);
// signResult = { signature: string, signatureheight: number }

loginRequest.signature = new vdxf.VerusIDSignature(
  { signature: signResult.signature },
  keys.IDENTITY_AUTH_SIG_VDXF_KEY,
);

const challengeHash = challengeSha256.toString('hex');
```

Serve via your API:
```json
{
  "challengeId": "iBase58CheckNonce",
  "challengeHash": "abc123...64hex",
  "requestSignature": "AgVm...(base64 signdata output)",
  "blockHeight": 990566,
  "signingId": "iXYZ...(service i-address)",
  "expiresAt": "2026-03-24T12:05:00Z"
}
```

### Step 2: User Verifies the Service's Identity

Before signing anything, the user confirms the challenge came from the claimed service. This is the mutual authentication step.

**Desktop GUI (debug console):**
```
run verifysignature '{"address":"yourservice@","datahash":"<challengeHash>","signature":"<requestSignature>"}'
```

**CLI:**
```
./verus -testnet verifysignature '{"address":"yourservice@","datahash":"<challengeHash>","signature":"<requestSignature>"}'
```

If valid, the challenge is genuine. If not — do not sign.

### Step 3: User Signs the ChallengeHash

**Desktop GUI:**
```
run signmessage "myidentity@" "<challengeHash>"
```

**CLI:**
```
./verus -testnet signmessage "myidentity@" "<challengeHash>"
```

Produces a base64 signature proving the user controls the identity.

### Step 4: Service Verifies the User's Signature

```javascript
const isValid = await rpc('verifymessage', [
  'myidentity@', challengeHash, signature, true
]);

const identity = await rpc('getidentity', ['myidentity@']);
const iAddress = identity.identity.identityaddress;
const friendlyName = identity.fullyqualifiedname;
// Create session, issue token, etc.
```

### SDK / Offline Signing (No Daemon on Client Side)

For programmatic use, the client needs no daemon. bitcoinjs-message with the Verus prefix handles offline signing:

```javascript
import bitcoinMessage from 'bitcoinjs-message';
const messagePrefix = '\x15Verus signed data:\n';
const signature = bitcoinMessage.sign(
  challengeHash, privateKeyBuffer, compressed, messagePrefix
);
```

The service's daemon verifies with `verifymessage` as normal. The user's private key never leaves their machine.

### Security Properties

| Property | How |
|----------|-----|
| Service authenticity | LoginConsentRequest signed via signdata — user verifies with verifysignature |
| User authenticity | signmessage verified by daemon against on-chain keys |
| Replay prevention | Random challenge_id, short expiry, single-use |
| Block height binding | signdata includes block height — daemon checks keys were valid at that height |
| Offline capable | Client needs only a WIF key + bitcoinjs-message |

### Compared to Raw signmessage

Raw `signmessage` (sign a random text challenge) provides no mutual authentication — the user cannot verify who created the challenge. An attacker could serve a fake challenge and collect signatures.

The LoginConsent flow fixes this: the service signs the challenge with its on-chain identity, and the user verifies that signature before responding.

### Dependencies

- `verus-typescript-primitives` — LoginConsentRequest/Response classes, serialization, VDXF keys
- `bitcoinjs-message` — Offline message signing (Verus-compatible)
- A Verus daemon on the SERVICE side (for signdata + verifymessage)
- Any wallet with signmessage + verifysignature on the USER side

### Reference

- verus-typescript-primitives: github.com/VerusCoin/verus-typescript-primitives
- verusid-ts-client: github.com/VerusCoin/verusid-ts-client
- Verus Mobile LoginConsent: github.com/VerusCoin/Verus-Mobile (src/containers/DeepLink/)