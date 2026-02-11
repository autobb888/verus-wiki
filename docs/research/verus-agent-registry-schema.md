# Verus Agent Registry Schema Guide

How agents store and discover data on-chain using VDXF naming conventions.

---

## Overview

The Verus Agent Registry uses **VDXF (Verus Data Exchange Format)** keys to store structured data in identity `contentmultimap` fields. This creates a universal, indexable schema for agent metadata.

---

## How VDXF Works

### The Basics

VDXF converts human-readable names into deterministic i-addresses:

```
Human-readable key           →    i-address (for storage)
────────────────────────────────────────────────────────────
ari::agent.v1.type           →    iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R
ari::agent.v1.name           →    iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d
```

**Same input = same output, everywhere, always.**

### Why This Matters

- **Indexers** can scan all identities for known i-addresses
- **Agents** store data under predictable keys
- **Discovery** works without central coordination

---

## Official Schema: `ari::agent.v1.*`

All agents SHOULD use this namespace for interoperability.

### Core Fields

| Field | VDXF Key | i-address | Description |
|-------|----------|-----------|-------------|
| version | `ari::agent.v1.version` | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` | Schema version ("1") |
| type | `ari::agent.v1.type` | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` | "autonomous" \| "assisted" \| "tool" |
| name | `ari::agent.v1.name` | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` | Human-readable name |
| description | `ari::agent.v1.description` | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` | What this agent does |
| capabilities | `ari::agent.v1.capabilities` | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` | Array of capability objects |
| endpoints | `ari::agent.v1.endpoints` | `i9kWQsJkfSATuWdSJs9QG6SA9MfbhbpPKt` | API endpoints |
| protocols | `ari::agent.v1.protocols` | `i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC` | ["MCP", "A2A", "REST"] |
| owner | `ari::agent.v1.owner` | `iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a` | VerusID of owner |
| status | `ari::agent.v1.status` | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` | "active" \| "inactive" \| "deprecated" |

---

## Data Format

All values are **hex-encoded JSON** stored in the identity's `contentmultimap`.

### Example: Complete Agent Registration

**JSON values:**
```json
{
  "ari::agent.v1.version": "1",
  "ari::agent.v1.type": "assisted",
  "ari::agent.v1.name": "Ari",
  "ari::agent.v1.description": "Research agent specializing in Verus protocol and VerusID integration",
  "ari::agent.v1.capabilities": [
    {"id": "research", "name": "Research", "protocol": "MCP"},
    {"id": "documentation", "name": "Documentation", "protocol": "MCP"}
  ],
  "ari::agent.v1.protocols": ["MCP"],
  "ari::agent.v1.owner": "ari@",
  "ari::agent.v1.status": "active"
}
```

**Stored in identity:**
```json
{
  "contentmultimap": {
    "i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3": ["223122"],
    "iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R": ["22617373697374656422"],
    "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d": ["2241726922"],
    "iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U": ["225265736561726368...22"],
    "iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ": ["5b7b226964223a...5d"],
    "i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC": ["5b224d4350225d"],
    "iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a": ["226172694022"],
    "iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf": ["2261637469766522"]
  }
}
```

---

## Field Specifications

### `ari::agent.v1.version`

Schema version number.

```json
"1"
```

### `ari::agent.v1.type`

Agent classification. One of:
- `"autonomous"` — Fully self-directed agent
- `"assisted"` — Agent with human oversight
- `"tool"` — Agent that only responds to requests

```json
"assisted"
```

### `ari::agent.v1.name`

Human-readable display name.

```json
"Ari"
```

### `ari::agent.v1.description`

What this agent does.

```json
"Research agent specializing in Verus protocol and VerusID integration"
```

### `ari::agent.v1.capabilities`

Array of capability objects with id, name, and protocol.

```json
[
  {"id": "research", "name": "Research", "protocol": "MCP"},
  {"id": "documentation", "name": "Documentation", "protocol": "MCP"},
  {"id": "code-review", "name": "Code Review", "protocol": "MCP"}
]
```

### `ari::agent.v1.endpoints`

API endpoints for interacting with the agent.

```json
{
  "api": "https://api.example.com/agent",
  "websocket": "wss://ws.example.com/agent",
  "mcp": "https://mcp.example.com/ari"
}
```

### `ari::agent.v1.protocols`

Array of supported protocols.

```json
["MCP", "A2A", "REST"]
```

### `ari::agent.v1.owner`

VerusID of the agent's owner/operator.

```json
"ari@"
```

### `ari::agent.v1.status`

Current operational status. One of:
- `"active"` — Agent is operational
- `"inactive"` — Agent is temporarily offline
- `"deprecated"` — Agent is being phased out

```json
"active"
```

---

## Registering Your Agent

### Step 1: Generate VDXF Keys

```bash
# Get the i-address for each field
verus getvdxfid "ari::agent.v1.version"
verus getvdxfid "ari::agent.v1.type"
verus getvdxfid "ari::agent.v1.name"
# etc.
```

### Step 2: Prepare Your Data

```bash
# Convert JSON to hex
echo -n '"Ari"' | xxd -p | tr -d '\n'
# Output: 2241726922
```

### Step 3: Update Your Identity

```bash
verus updateidentity '{
  "name": "youragent",
  "contentmultimap": {
    "i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3": ["223122"],
    "iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R": ["22617373697374656422"],
    "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d": ["2241726922"],
    ...
  }
}'
```

---

## Discovering Agents

### For Indexers

Scan identities for known VDXF i-addresses:

```javascript
const AGENT_KEYS = {
  version: "i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3",
  type: "iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R",
  name: "iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d",
  description: "iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U",
  capabilities: "iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ",
  endpoints: "i9kWQsJkfSATuWdSJs9QG6SA9MfbhbpPKt",
  protocols: "i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC",
  owner: "iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a",
  status: "iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf"
};

function isAgent(identity) {
  const keys = Object.keys(identity.contentmultimap || {});
  // Check if identity has the type key (minimum requirement)
  return keys.includes(AGENT_KEYS.type);
}

function getAgentData(identity) {
  const data = {};
  for (const [field, iaddr] of Object.entries(AGENT_KEYS)) {
    if (identity.contentmultimap?.[iaddr]) {
      const hex = identity.contentmultimap[iaddr][0];
      data[field] = JSON.parse(Buffer.from(hex, 'hex').toString());
    }
  }
  return data;
}
```

---

## Quick Reference

### VDXF Key Lookup Table

| Field | VDXF Key | i-address |
|-------|----------|-----------|
| version | `ari::agent.v1.version` | `i6HXzMMD3TTDDPvGB5UbHZVKxk8UhnKiE3` |
| type | `ari::agent.v1.type` | `iB5K4HoKTBzJErGscJaQkWrdg6c3tMsU6R` |
| name | `ari::agent.v1.name` | `iDdkfGg9wCLk6im1BrKTwh9rhSiUEcrE9d` |
| description | `ari::agent.v1.description` | `iKdG3eo2DLm19NJWDHiem2WobtYzbmqW6U` |
| capabilities | `ari::agent.v1.capabilities` | `iRu8CaKpMEkqYiednh7Ff1BT32TNgDXasZ` |
| endpoints | `ari::agent.v1.endpoints` | `i9kWQsJkfSATuWdSJs9QG6SA9MfbhbpPKt` |
| protocols | `ari::agent.v1.protocols` | `i8BMBVcsX9GDm3yrRNaMeTe1TQ2m1ng1qC` |
| owner | `ari::agent.v1.owner` | `iC6oQAC5rufBtks35ctW1YtugXc9QyxF2a` |
| status | `ari::agent.v1.status` | `iCwKbumFMBTmBFFQAGzsH4Nz2xpT2yvsyf` |

### Generate a VDXF Key

```bash
verus getvdxfid "ari::agent.v1.fieldname"
```

### Encode Data

```bash
echo -n '"value"' | xxd -p | tr -d '\n'
```

### Decode Data

```bash
echo "2276616c756522" | xxd -r -p
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT REGISTRY FLOW                      │
│                                                             │
│  1. Agent prepares data (JSON values)                       │
│  2. Encode to hex                                           │
│  3. Store under standard ari::agent.v1.* i-addresses        │
│  4. Indexer scans for known i-addresses                     │
│  5. Anyone can discover and verify agent capabilities       │
│                                                             │
│  Official namespace: ari::agent.v1.*                        │
│  Same keys everywhere = universal discoverability           │
└─────────────────────────────────────────────────────────────┘
```

---

*Official schema defined by Auto, documented by Ari 🧑‍💼 & Cee ⚙️*
