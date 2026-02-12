# Currency Options & Protocol Reference

Quick reference for the numeric values used in `definecurrency`. See also: [definecurrency command reference](../command-reference/multichain/definecurrency.md)

## `options` (Bitfield)

Options is a bitfield — you can combine values by adding them together.

| Value | Hex | Name | Meaning |
|-------|-----|------|---------|
| 1 | 0x01 | FRACTIONAL | Basket/reserve currency with automatic AMM |
| 2 | 0x02 | IDRESTRICTED | Only the controlling ID (rootID) can create subIDs |
| 4 | 0x04 | IDSTAKING | All IDs on chain stake equally (ID-based, not value-based) |
| 8 | 0x08 | IDREFERRALS | Referral rewards for ID registration |
| 16 | 0x10 | IDREFERRALSREQUIRED | Referral required to register an ID |
| 32 | 0x20 | TOKEN | Is a token (not a native coin) |
| 64 | 0x40 | SINGLECURRENCY | Restrict PBaaS chain or gateway to single currency |
| 128 | 0x80 | GATEWAY | Is a gateway currency |
| 256 | 0x100 | IS_PBAAS_CHAIN | Is a PBaaS blockchain (not just a token) |
| 512 | 0x200 | GATEWAY_CONVERTER | Is a gateway converter |
| 1024 | 0x400 | GATEWAY_NAMECONTROLLER | Gateway name controller |
| 2048 | 0x800 | NFT_TOKEN | Single-satoshi NFT with tokenized control of root ID |

**Common combinations:**
- `32` (TOKEN) — Simple token
- `33` (FRACTIONAL + TOKEN) — Basket currency with reserves and AMM
- `40` (TOKEN + IDREFERRALS) — Token with ID referral rewards
- `41` (FRACTIONAL + TOKEN + IDREFERRALS) — Basket with referrals
- `264` (IS_PBAAS_CHAIN + IDREFERRALS) — PBaaS chain with referrals

*(Source: [docs.verus.io — Defining Parameters](https://docs.verus.io/currencies/launch-currency.html#defining-parameters))*

## `proofprotocol`

| Value | Name | Meaning |
|-------|------|---------|
| 1 | PROOF_PBAASMMR | Decentralized — default for decentralized currencies and PBaaS chains. SubID fees are burned. |
| 2 | PROOF_CHAINID | Centralized — the identity owner can mint and burn tokens. Used for tokens, namespace currencies, and platform tokens. |
| 3 | PROOF_ETHNOTARIZATION | Ethereum-mapped — token supply follows an Ethereum contract. Used for bridged tokens. |

**When to use what:**
- **Running an agent platform with subIDs?** → `proofprotocol: 2` (you control the token supply)
- **Launching a PBaaS blockchain?** → `proofprotocol: 1` (decentralized mining)
- **Bridging an ERC-20 token?** → `proofprotocol: 3` (tracks Ethereum supply)

## `idregistrationfees`

The cost (in this currency's tokens) to register a subID under this namespace.

- `0.01` = costs 0.01 namespace tokens per subID
- `0` = free subID registration (not recommended — spam risk)
- The namespace owner must **mint tokens first** and distribute them to users who want subIDs

## `idreferrallevels`

How many levels of referral rewards to pay out when a new ID is registered under this currency. Min 0, max 5, default 3.

The registration fee is divided into **(levels + 2) equal parts**: 1 part discount to registrant, 1 part burned/to rootID (miners), and 1 part per referral level. Unfilled levels' portions go to miners.

- `0` = fee split 1/2 discount + 1/2 burned (registrant pays half)
- `1` = fee split into 3 (1/3 discount, 1/3 burned, 1/3 to referrer)
- `2` = fee split into 4
- `3` = fee split into 5 (default — registrant pays 80% with referral)
- `4` = fee split into 6
- `5` = fee split into 7 (max — registrant pays ~85.7% with referral)

Requires `"options": 8` (IDREFERRALS flag) to be set. See [Referral System](identity-system.md#referral-system) for full details and examples.

## See Also

- [Currencies and Tokens on Verus](currencies-and-tokens.md) — overview of currency types
- [Basket Currencies and DeFi](basket-currencies-defi.md) — how fractional currencies work
- [definecurrency](../command-reference/multichain/definecurrency.md) — full command reference
- [How to Launch a Token](../how-to/launch-token.md) — step-by-step guide
- [How to Manage SubIDs](../how-to/manage-subids.md) — creating subIDs under your namespace
