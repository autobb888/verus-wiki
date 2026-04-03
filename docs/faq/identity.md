---
label: Identity
icon: person
order: 90
description: "Frequently asked questions about VerusID — cost, features, recovery, multisig, and use cases."
---

# Identity FAQ

Common questions about VerusID, the self-sovereign identity system built into the Verus protocol.

---

## What is a VerusID?

**A VerusID is a human-readable, on-chain identity (like `alice@`) that can hold funds, prove ownership, store data, and be recovered if keys are lost — all without any centralized authority.**

A VerusID combines:
- **A human-readable name**: People send to `alice@` instead of a random address
- **A crypto wallet**: Holds VRSC and other currencies
- **A digital passport**: Cryptographically signs messages and transactions
- **A data vault**: Stores arbitrary data on-chain (public or encrypted)
- **A recoverable identity**: Keys can be rotated without losing the identity

Unlike accounts on platforms like Google or Twitter, no company controls your VerusID. It exists on the blockchain permanently.

Learn more: [VerusID In Depth](/concepts/identity-system/) | [Register a VerusID](/how-to/create-verusid/)

---

## How much does a VerusID cost?

**A root VerusID costs ~100 VRSC (~80 VRSC with a referral). SubIDs can cost as little as 0.01 VRSC.**

| ID Type | Cost | Example |
|---------|------|---------|
| Root VerusID | ~100 VRSC (80 with referral) | `alice@` |
| SubID | Set by namespace owner (as low as 0.01 VRSC) | `bob.MyCurrency@` |
| PBaaS chain ID | Varies by chain | `alice.MyChain@` |

The cost of a root VerusID is a protocol-level fee that goes partially to the referrer (if any) and partially to miners/stakers. SubID pricing is controlled by the namespace (currency) owner.

Learn more: [Register a VerusID](/how-to/create-verusid/) | [Manage SubIDs](/how-to/manage-subids/)

---

## Can I recover a lost VerusID?

**Yes. VerusID has a built-in revocation and recovery system — you can freeze a compromised identity and reassign new keys without losing the identity itself.**

How it works:
1. Each VerusID has a **revocation authority** and a **recovery authority** (these can be other VerusIDs or the same ID)
2. If your keys are compromised, the revocation authority **revokes** (freezes) the identity
3. The recovery authority **recovers** the identity with entirely new keys
4. The identity keeps its name, history, and address — only the controlling keys change

This is one of Verus's most important features. On most blockchains, lost keys mean lost funds forever. On Verus, identity recovery is a protocol-level operation.

Learn more: [How to Revoke and Recover](/how-to/revoke-recover-identity/)

---

## What is a SubID?

**A SubID is a child identity created under a parent namespace. If you own a currency called `MyCurrency`, you can create identities like `user.MyCurrency@` at prices you set.**

SubIDs are useful for:
- **Organizations**: `employee.CompanyName@`
- **Applications**: `user123.MyApp@`
- **Agent registries**: `agent.AgentHub@`
- **Communities**: `member.CommunityName@`

The namespace owner controls:
- SubID pricing (can be as low as 0.01 VRSC)
- Whether anyone can register or only the owner can issue them
- Referral discounts

SubIDs have all the same capabilities as root IDs: they can hold funds, store data, be revoked and recovered, and use multisig.

Learn more: [Manage SubIDs](/how-to/manage-subids/)

---

## Does VerusID support multisig?

**Yes. VerusID has native M-of-N multisig — you set multiple primary addresses and a minimum signature threshold directly on the identity.**

Example: A 2-of-3 multisig identity has three keyholders, and any two must agree to sign a transaction:

```
primaryaddresses: ["R_addr_1", "R_addr_2", "R_addr_3"]
minimumsignatures: 2
```

No special scripts or smart contracts are needed. Multisig is a built-in property of every VerusID.

Learn more: [Setup Multisig](/how-to/setup-multisig/)

---

## Can I store data on a VerusID?

**Yes. Every VerusID has a `contentmultimap` field that stores arbitrary key-value data on-chain using the VDXF (Verus Data Exchange Format) standard.**

You can store:
- Public text, JSON, or binary data
- Encrypted data (encrypted to a Sapling z-address)
- Files (automatically split across transactions if large)
- Structured data with schema definitions

Data is stored permanently on-chain. There's no external storage dependency like IPFS.

Learn more: [VDXF Data Standard](/concepts/vdxf-data-standard/) | [On-Chain File Storage](/concepts/on-chain-file-storage/)

---

## Can VerusID be used for login/authentication?

**Yes. VerusID supports cryptographic signature-based authentication — a user proves they control an identity by signing a challenge, with no password needed.**

The flow:
1. Application presents a challenge string
2. User signs it with their VerusID (`signmessage`)
3. Application verifies the signature (`verifymessage`)

This enables passwordless login for any application that integrates with the Verus RPC API.

Learn more: [VerusID Login Guide](/developers/verusid-login-guide/)
