# Currency Options & Protocol Reference

Quick reference for the numeric values used in `definecurrency`. See also: [definecurrency command reference](../command-reference/multichain/definecurrency.md)

## `options` (Bitfield)

Options is a bitfield — you can combine values by adding them together.

| Value | Hex | Name | Meaning |
|-------|-----|------|---------|
| 0 | 0x0 | BASIC | Basic currency, no special features |
| 1 | 0x1 | FRACTIONAL | Basket/reserve currency with automatic AMM |
| 2 | 0x2 | IDRESTRICTED | Only approved IDs can hold this currency |
| 4 | 0x4 | IDSTAKING | ID staking enabled |
| 8 | 0x8 | IDREFERRALS | Referral rewards for ID registration |
| 16 | 0x10 | IDREFERRALSREQUIRED | Referrals required for ID registration |
| 32 | 0x20 | TOKEN | Mintable token — required for subID creation |
| 256 | 0x100 | IS_PBAAS_CHAIN | This is a PBaaS blockchain (not just a token) |

**Common combinations:**
- `32` (TOKEN) — Simple mintable token, enables subID creation
- `33` (FRACTIONAL + TOKEN) — Basket currency with reserves and AMM
- `96` (TOKEN + FRACTIONAL + ...) — Advanced basket configurations
- `288` (TOKEN + IS_PBAAS_CHAIN) — PBaaS chain with its own token

## `proofprotocol`

| Value | Name | Meaning |
|-------|------|---------|
| 1 | PROOF_PBAASMMR | Decentralized — mined/staked like a blockchain. Used for PBaaS chains. |
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

How many levels of referral rewards to pay out when a new subID is registered.

- `0` = no referrals
- `1` = direct referrer gets a cut
- `2`+ = multi-level referral rewards

## See Also

- [Currencies and Tokens on Verus](currencies-and-tokens.md) — overview of currency types
- [Basket Currencies and DeFi](basket-currencies-defi.md) — how fractional currencies work
- [definecurrency](../command-reference/multichain/definecurrency.md) — full command reference
- [How to Launch a Token](../how-to/launch-token.md) — step-by-step guide
- [How to Manage SubIDs](../how-to/manage-subids.md) — creating subIDs under your namespace
