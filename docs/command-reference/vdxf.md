---
label: VDXF
icon: terminal
---


# VDXF Commands


---

## getvdxfid

> **Category:** VDXF | **Version:** v1.2.14+

Returns the VDXF key (i-address) of a URI string. VDXF (Verus Data Exchange Format) provides a universal namespace for data keys.

**Syntax**

```
getvdxfid "vdxfuri" ({"vdxfkey":"i-address", "uint256":"hexstr", "indexnum":0})
```

**Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| vdxfuri   | string | Yes      | The URI string to convert to a VDXF key |
| vdxfkey   | string | No       | VDXF key or i-address to combine via hash |
| uint256   | string | No       | 256-bit hash to combine with hash |
| indexnum  | number | No       | int32_t number to combine with hash |

**Result**

```json
{
  "vdxfid": "iAddress",
  "indexid": "xAddress",
  "hash160result": "hex",
  "qualifiedname": {
    "namespace": "i-address",
    "name": "string"
  }
}
```

| Field         | Type   | Description |
|---------------|--------|-------------|
| vdxfid        | string | i-address of the VDXF key |
| indexid       | string | x-address (index form) |
| hash160result | string | 20-byte hash in hex |
| qualifiedname | object | Separated name and namespace (field may appear as `"namespace"` or `"parentid"` depending on context) |
| bounddata     | object | Returned if additional data was bound |

**Examples**

```bash
verus -testnet getvdxfid "vrsc::system.agent.profile"
```

**Testnet output:**
```json
{
  "vdxfid": "iKLo9XnNwzec2dj92kX9QQpng5EfU8XHxo",
  "indexid": "xQAucLDToJsGeocAtSBJNoMKhjFgN49Nm1",
  "hash160result": "30b5577487b05178ce95aac28940d78187cd0bae",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "vrsc::system.agent.profile"
  }
}
```

```bash
verus -testnet getvdxfid "vrsc::system.currency.export"
```

**Testnet output:**
```json
{
  "vdxfid": "iLY9mLpjMHy94rcJk4roxoNgRLSqhJeHFz",
  "indexid": "xRNGE9FpCcBoh2VLbkWxwBuDSzTrZUN94D",
  "hash160result": "dcb11f97bce0c8734d92da7b0f5551acfbb629bb",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "vrsc::system.currency.export"
  }
}
```

**Common Errors**

| Error | Cause |
|-------|-------|
| `Invalid parameters` | Missing or malformed URI string |

**Related Commands**

- [`getidentity`](../identity/getidentity.md) — Get identity with VDXF content

**Notes**

- VDXF provides a decentralized, collision-resistant namespace for data keys.
- The `namespace` in the result (e.g., `i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV`) represents the VRSC root namespace.
- URIs follow the format `namespace::category.subcategory.name`.
- The `vdxfid` (i-address) is the canonical identifier used in VerusID content maps and other VDXF data structures.
- Optional binding parameters (`vdxfkey`, `uint256`, `indexnum`) create compound keys by hashing additional data with the base key.

**Tested On**

- **VRSCTEST** — Block height: 926996 | Version: v1.2.14-2