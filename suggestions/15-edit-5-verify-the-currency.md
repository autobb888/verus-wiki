# [Suggestion #15] Edit: #5. Verify the Currency

**Section:** How-To Guides
**Submitted by:** 33test
**Date:** 2026-04-26

---

[Section: #5. Verify the Currency]

Selected text:
> Mint Tokens (Centralized Only)
> 
> If you used proofprotocol: 2, you can mint additional tokens:
> 
> ./verus -testnet sendcurrency "YOUR_TOKEN_NAME@" '[{
>   "address": "RECIPIENT_ADDRESS_OR_ID",
>   "amount": 500,
>   "currency": "YOUR_TOKEN_NAME",
>   "mintnew": true
> }]'

Suggested change:
we need to look into this "I think the centralized currency example includes endblock which means the minting capability ends at that block (if you don’t want it centralized forever only just a limited time)"

---
Page: https://wiki.autobb.app/how-to/launch-token/