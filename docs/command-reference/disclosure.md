---
label: Disclosure
icon: terminal
---


# Disclosure Commands


---

## z_getpaymentdisclosure

> **Category:** Disclosure | **Version:** v1.2.14+

> ⚠️ **EXPERIMENTAL** — Disabled by default. Requires `-experimentalfeatures` and `-paymentdisclosure` flags.

Generate a payment disclosure for a given joinsplit output.

**Syntax**

```
z_getpaymentdisclosure "txid" "js_index" "output_index" ("message")
```

**Parameters**

| Parameter    | Type   | Required | Description |
|--------------|--------|----------|-------------|
| txid         | string | Yes      | The transaction id |
| js_index     | string | Yes      | The joinsplit index |
| output_index | string | Yes      | The output index within the joinsplit |
| message      | string | No       | Optional message (e.g., "refund") |

**Result**

| Type   | Description |
|--------|-------------|
| string | Payment disclosure hex data with "zpd:" prefix |

**Examples**

```bash
verus -testnet z_getpaymentdisclosure "96f12882450429324d5f3b48630e3168220e49ab7b0f066e5c2935a6b88bb0f2" 0 0 "refund"
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `z_getpaymentdisclosure is disabled` | Feature not enabled at startup |

**Related Commands**

- [`z_validatepaymentdisclosure`](z_validatepaymentdisclosure.md) — Validate a payment disclosure

**Notes**

- **Disabled by default**. To enable, add to `VRSC.conf` or use startup flags:
  ```
  experimentalfeatures=1
  paymentdisclosure=1
  ```
- Only works with joinsplit (sprout) transactions, not sapling.
- Payment disclosures allow proving that a shielded payment was made without revealing other transaction details.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only; feature disabled)

---

## z_validatepaymentdisclosure

> **Category:** Disclosure | **Version:** v1.2.14+

> ⚠️ **EXPERIMENTAL** — Disabled by default. Requires `-experimentalfeatures` and `-paymentdisclosure` flags.

Validates a payment disclosure.

**Syntax**

```
z_validatepaymentdisclosure "paymentdisclosure"
```

**Parameters**

| Parameter         | Type   | Required | Description |
|-------------------|--------|----------|-------------|
| paymentdisclosure | string | Yes      | Hex data string with "zpd:" prefix |

**Result**

Validation result object.

**Examples**

```bash
verus -testnet z_validatepaymentdisclosure "zpd:706462ff004c561a0447ba2ec51184e6c204..."
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `z_validatepaymentdisclosure is disabled` | Feature not enabled at startup |

**Related Commands**

- [`z_getpaymentdisclosure`](z_getpaymentdisclosure.md) — Generate a payment disclosure

**Notes**

- **Disabled by default**. To enable, add to `VRSC.conf` or use startup flags:
  ```
  experimentalfeatures=1
  paymentdisclosure=1
  ```
- Verifies that a payment disclosure is valid and the claimed payment was actually made.
- The disclosure string must have the `zpd:` prefix.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2 (documented from help only; feature disabled)