# Generalize the Verus Wiki — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the project-specific `agentplatform` running example, author personas, and AI-agent framing throughout the wiki with neutral, generic equivalents — without fabricating "tested" on-chain data.

**Architecture:** Careful manual rewrite, one file (or small group) per task, each task self-contained and committed independently. One scripted task for the byte-similar persona signature line. Every task ends with a scoped `grep` verification before commit; a final task does a repo-wide grep plus a Docker Retype build.

**Tech Stack:** Markdown content in `docs/`, Retype static site generator, Docker (`node:20`) for the build check. No application code changes.

**Spec:** `docs/superpowers/specs/2026-05-15-generalize-wiki-design.md` — read it before starting.

---

## Naming scheme (apply consistently in every task)

| Current | Replacement |
|---|---|
| `agentplatform` (token / currency / namespace) | `yourapp` |
| `agentplatform@` | `yourapp@` |
| `alice.agentplatform@` / `bob.agentplatform@` / `service.agentplatform@` | `alice.yourapp@` / `bob.yourapp@` / `service.yourapp@` |
| `external1.agentplatform@` | `alice.yourapp@` |
| `ari@` — the user's own top-level identity | `myid@` |
| `ari@` — used as a revocation/recovery authority | `recovery@` |
| `agentplatform::agent.v1.*` / `svc.v1.*` in **general** pages (concepts, command-reference, how-to, developers) | `yourapp::data.v1.*` |
| `agent.v1.*` / `svc.v1.*` schemas **inside `docs/for-agents/`** | keep as-is |
| `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` (real currency/parent i-address) | `i...` placeholder, label `<your currency i-address>` |
| `iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx` (`external1.agentplatform@`) | `i...` placeholder |
| `i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129` (`ari@` i-address) | `i...` placeholder |
| Any other inline i-address inside RPC-output JSON that is part of the agentplatform example | `i...` placeholder; keep JSON structure + field names exact |
| Real block heights tied to the token (e.g. `926606`) | `<block-height>` placeholder |
| Real tx IDs / R-addresses presented as agentplatform test data | `<txid>` / `<R-address>` placeholders |

**Rule:** Structure and field names of every RPC example stay exact. Only project-specific *values* become labelled placeholders. Never invent a real-looking i-address, block height, or tx ID.

**`wiki.autobb.app` stays everywhere — do not touch it.**

---

### Task 1: Normalize persona signature lines (scripted)

**Files:**
- Modify: every `docs/**/*.md` carrying a `... by Ari 🧑‍💼 · Last updated: <date>` line (~22 files)

- [ ] **Step 1: Preview what will change**

Run:
```bash
grep -rn "by Ari 🧑‍💼 · Last updated:" docs/
```
Expected: ~22 lines like `*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*`, `*Tutorial by Ari 🧑‍💼 · Last updated: 2026-02-07*`, `*Reference by Ari 🧑‍💼 · Last updated: 2026-02-07*`.

- [ ] **Step 2: Apply the replacement**

Run:
```bash
grep -rl "by Ari 🧑‍💼 · Last updated:" docs/ | while read -r f; do
  sed -i -E 's/\*(Guide|Tutorial|Reference) by Ari [^·]*· (Last updated: [0-9-]+)\*/*\2*/' "$f"
done
```
This turns `*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*` into `*Last updated: 2026-02-07*`. The `[^·]*` matches the emoji (and any spacing) without depending on the exact multi-byte sequence.

- [ ] **Step 3: Verify**

Run:
```bash
grep -rn "by Ari 🧑‍💼 · Last updated:" docs/ | grep -v "docs/superpowers/"
```
Expected: no output. (The special `Research by Ari` lines in `docs/research/` are NOT matched here — they are handled in Task 13.)

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "Remove Ari persona from page signature lines"
```

---

### Task 2: Fix the two README files

**Files:**
- Modify: `docs/README.md`
- Modify: `README.md`

- [ ] **Step 1: Edit `docs/README.md`**

Line 17 currently reads:
```
- `brain/research/` — Agent platform guides (VerusID integration, VDXF schema, hiring flow, etc.)
```
The `brain/research/` directory does not exist in this repo. Remove the entire `## Separate From` heading and that bullet (lines 16-17).

In the `## Structure` list, line 14 `- \`scripts/\` — Auto-generation scripts + raw help data` — leave as-is (out of scope).

- [ ] **Step 2: Edit `README.md`**

Line 3: `... mining, DeFi, privacy, and the agent economy.` → `... mining, DeFi, privacy, and developer integration.`

Line 18 (the Research table row): `| **Research** | Agent registry schemas, token economics, discovery & hiring guides |` → `| **Research** | Token economics, cross-chain bridge research, and deep dives |`

Line 15 (`| **For Agents** | ... |`) — leave as-is; the For-Agents section is kept.

- [ ] **Step 3: Verify**

Run:
```bash
grep -rn "brain/research\|agent economy\|hiring guides" README.md docs/README.md
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/README.md
git commit -m "Generalize README wording, drop stale brain/research reference"
```

---

### Task 3: Rewrite `docs/concepts/vdxf-data-pipeline.md`

**Files:**
- Modify: `docs/concepts/vdxf-data-pipeline.md`

This file has 30 `agentplatform` occurrences plus the precomputed VDXF i-address table.

- [ ] **Step 1: Apply identifier + schema replacements**

- All `agentplatform` → `yourapp`; `agentplatform@` → `yourapp@`; `alice.agentplatform@` → `alice.yourapp@`.
- All VDXF URI strings `agentplatform::agent.v1.*` and `agentplatform::svc.v1.*` → `yourapp::data.v1.*` (e.g. `agentplatform::agent.v1.name` → `yourapp::data.v1.name`, `agentplatform::svc.v1.price` → `yourapp::data.v1.price`).
- The `"parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW"` lines (≈ lines 68, 160) → `"parent": "i..."` with surrounding prose noting it is your namespace's i-address.
- Inline i-addresses used as `contentmultimap` keys in the JSON examples (e.g. `i3oa8uNjgZjmC1RS8rg1od8czBP8bsh5A8`) → `i...` placeholders. Keep the hex value arrays (`["416c696365"]` etc.) — those are just hex encodings of generic strings like "Alice" and stay valid.
- Section heading "Real-World Example: Agent Schema Migration" (≈ line 130) → "Example: Setting Up a Data Schema". Reword "Here's exactly what we did to set up the Verus Agent Platform schema:" → "Here's how to set up a data schema for your app:".
- "Key i-Addresses Quick Reference (Agent Platform)" heading (≈ line 247) → handled in Step 2.

- [ ] **Step 2: Replace the precomputed i-address table**

The 16-row table (≈ lines 247-266) maps `agentplatform::...` strings to real i-addresses. Those addresses are hashes of the literal strings and are no longer valid once renamed. Replace the whole table section with:

```markdown
## Generating Your VDXF Key i-Addresses

VDXF IDs are **deterministic** — the same namespaced string always hashes to the
same i-address. Generate yours by running `getvdxfid` for each key:

\```bash
verus getvdxfid "yourapp::data.v1.name"
verus getvdxfid "yourapp::data.v1.type"
verus getvdxfid "yourapp::data.v1.version"
# ... one call per schema key
\```

Each call returns the i-address to use as the `contentmultimap` key for that field.
Because the mapping is deterministic, anyone who knows your namespace string can
re-derive the same IDs.
```

(Remove the surrounding backslashes — they only escape the fence in this plan.)

- [ ] **Step 3: Fix the footer block-height reference**

Line ≈ 280 `*As of verus-typescript-primitives (generic-signed-request branch) and VRSCTEST block ~931954.*` → `*As of verus-typescript-primitives (generic-signed-request branch) on VRSCTEST.*`

- [ ] **Step 4: Verify**

Run:
```bash
grep -n "agentplatform\|agent\.v1\|svc\.v1\|i7xKUpKQ\|931954\|Agent Platform\|Agent Schema" docs/concepts/vdxf-data-pipeline.md
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add docs/concepts/vdxf-data-pipeline.md
git commit -m "Generalize vdxf-data-pipeline: yourapp namespace, deterministic-ID guide"
```

---

### Task 4: Rewrite `docs/concepts/data-descriptor.md`

**Files:**
- Modify: `docs/concepts/data-descriptor.md`

9 `agentplatform` occurrences, around lines 254-274 (a worked example of reading a SubID).

- [ ] **Step 1: Apply replacements**

- `agentplatform@` → `yourapp@`; `alice.agentplatform@` → `alice.yourapp@`.
- VDXF strings `agentplatform::agent.v1.*` → `yourapp::data.v1.*`.
- The ASCII diagram around lines 254-274 (`agentplatform@ (namespace/root identity)`, `DefinedKey("agentplatform::agent.v1.name")`, `alice.agentplatform@ (subID)`, "How an app/wallet reads alice.agentplatform@") → apply the same renames; keep diagram structure.
- Any inline i-addresses in this example that are part of the agentplatform schema → `i...` placeholders.

- [ ] **Step 2: Verify**

Run:
```bash
grep -n "agentplatform\|agent\.v1\|svc\.v1" docs/concepts/data-descriptor.md
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/concepts/data-descriptor.md
git commit -m "Generalize data-descriptor example to yourapp namespace"
```

---

### Task 5: Rewrite the remaining concepts pages

**Files:**
- Modify: `docs/concepts/identity-system.md`
- Modify: `docs/concepts/utxo-model.md`
- Modify: `docs/concepts/currency-options-reference.md`

- [ ] **Step 1: Edit `identity-system.md`** (7 occurrences, ~lines 147-173)

- `alice.agentplatform@` / `bob.agentplatform@` / `service.agentplatform@` → `alice.yourapp@` / `bob.yourapp@` / `service.yourapp@`.
- `agentplatform@` (the namespace identity, e.g. lines 163, 170) → `yourapp@`.
- The SubID tree diagram (≈ lines 170-173) → apply the same renames, keep structure.
- Prose like "SubID 'alice' under 'agentplatform' namespace" → "...under 'yourapp' namespace".

- [ ] **Step 2: Edit `utxo-model.md`** (4 occurrences, ~lines 112-118)

- `agentplatform` token → `yourapp` token throughout the UTXO example (e.g. "When you hold 500 `yourapp` tokens", "200 yourapp tokens (from minting)").

- [ ] **Step 3: Edit `currency-options-reference.md`** (1 occurrence, ~line 42)

- "Running an agent platform with subIDs?" → "Running a platform that issues subIDs?" (keep the `proofprotocol: 2` guidance unchanged).

- [ ] **Step 4: Verify**

Run:
```bash
grep -n "agentplatform" docs/concepts/identity-system.md docs/concepts/utxo-model.md docs/concepts/currency-options-reference.md
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add docs/concepts/identity-system.md docs/concepts/utxo-model.md docs/concepts/currency-options-reference.md
git commit -m "Generalize concepts pages: yourapp namespace and tokens"
```

---

### Task 6: Rewrite `docs/command-reference/multichain.md`

**Files:**
- Modify: `docs/command-reference/multichain.md`

Heaviest file — 32 `agentplatform` occurrences mixed across prose and real RPC output, plus the real currencyid `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` and real block heights (`926606`, `926610`).

- [ ] **Step 1: Read the file fully first**

Run: `cat docs/command-reference/multichain.md | less` (or open it). Identify every block: token-definition example (~lines 213-227), `getcurrency` output (~544-586), `getcurrencystate` (~737-780), `getexports` (~909-948), `getinitialcurrencystate` (~1108-1132), `getlaunchinfo` (~1259-1297), `getpendingtransfers` (~1525-1643), `sendcurrency` examples (~1963-2021), `setcurrencytrust` (~2100-2106).

- [ ] **Step 2: Apply replacements**

- Every `agentplatform` token/currency name → `yourapp`.
- `agentplatform@` (controlling identity) → `yourapp@`.
- `agentplatform-registration` (if present) → `yourapp-registration`.
- Every `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` (the `currencyid`) → `i...` placeholder. Keep the JSON field name `currencyid` and structure exact.
- Block heights presented as facts about this token — "agentplatform token created at block 926606", `getcurrencystate yourapp "926610"`, etc. → `<block-height>` placeholder.
- Prose notes like "Simple tokens like `agentplatform` won't appear..." → "Simple tokens like `yourapp` won't appear...".
- `sendcurrency` example sending to `ari@` (~line 1963) → send to `myid@`.
- Keep all JSON field names, command flags, and structure exact. Only the example *values* change.

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "agentplatform\|i7xKUpKQ\|926606\|926610\|ari@" docs/command-reference/multichain.md
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/command-reference/multichain.md
git commit -m "Generalize multichain command reference: yourapp token, placeholder IDs"
```

---

### Task 7: Rewrite `docs/command-reference/identity.md`

**Files:**
- Modify: `docs/command-reference/identity.md`

10 `agentplatform` occurrences plus heavy `ari@` usage (it is the running example identity for `getidentity`, `getidentitieswithrecovery`, `getidentitieswithrevocation`, `getidentitycontent`) and the real i-address `i7xKUpKQ...` at ~line 811.

- [ ] **Step 1: Read the file fully first**

Run: `cat docs/command-reference/identity.md`. Note the three contexts for `ari@`:
1. As the **subject** of a lookup (`getidentity "ari@"`, `getidentitycontent "ari@"`) → `myid@`.
2. As a **recovery/revocation authority** being queried (`getidentitieswithrecovery '{"identityid":"ari@"}'`, and prose like "querying `ari@` will return...") → `recovery@`.
3. Inside RPC output JSON (`"friendlyname": "ari.VRSCTEST@"`, `"name": "ari"`) → match whichever subject the example uses (`myid` / `myid.VRSCTEST@`).

- [ ] **Step 2: Apply replacements**

- `getidentitieswithrecovery` / `getidentitieswithrevocation` examples and their surrounding prose: `ari@` → `recovery@`. Update the explanatory note ("By default, an identity's recovery authority is set to itself...") to use `recovery@`.
- `getidentity` / `getidentitycontent` examples: `ari@` → `myid@`; in their JSON output `"friendlyname": "ari.VRSCTEST@"` → `"myid.VRSCTEST@"`, `"name": "ari"` → `"name": "myid"`.
- Block heights used as arguments (`getidentity "ari@" 921081`, `getidentity "ari@" 926607 true`) → keep a plausible generic placeholder `<block-height>` (these are example arguments, not claimed facts — `<block-height>` is clearer than a fake number).
- `alice.agentplatform@` → `alice.yourapp@`; `agentplatform` namespace mentions → `yourapp`.
- `"name": "agentplatform"` and the i-address `i7xKUpKQ...` in the listidentities output (~lines 809-811) → `"name": "yourapp"` and `i...` placeholder.
- The truncation note (~line 835) listing `ari@, agentplatform@, alice.agentplatform@, bob.agentplatform@` → `myid@, yourapp@, alice.yourapp@, bob.yourapp@`.
- `updateidentity '{"name":"alice.agentplatform"}'` and the SubID gotcha note (~lines 1846-1852) → `alice.yourapp`.
- `registernamecommitment "newagent" ... "agentplatform@"` (~line 1151) → `registernamecommitment "newname" ... "yourapp@"`.

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "agentplatform\|ari@\|ari\.VRSCTEST\|\"name\": \"ari\"\|i7xKUpKQ" docs/command-reference/identity.md
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/command-reference/identity.md
git commit -m "Generalize identity command reference: myid@/recovery@, yourapp namespace"
```

---

### Task 8: Rewrite `wallet.md` and `addressindex.md`

**Files:**
- Modify: `docs/command-reference/wallet.md`
- Modify: `docs/command-reference/addressindex.md`

- [ ] **Step 1: Edit `wallet.md`** (8 occurrences, ~lines 535, 791, 1334, 1643, 1692, 1800, 1866, 2091)

- `agentplatform` token name in balance/listunspent/listtransactions output → `yourapp`.
- `agentplatform-registration` (account name in output) → `yourapp-registration`.
- Keep all amounts, addresses, and JSON structure exact — only the token/account *name* string changes.

- [ ] **Step 2: Edit `addressindex.md`** (2 occurrences, lines 65, 69)

- `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` in the `getaddressbalance` / `getaddressdeltas` output → `i...` placeholder. Keep the amount `109.99000000` and JSON structure exact.

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "agentplatform\|i7xKUpKQ" docs/command-reference/wallet.md docs/command-reference/addressindex.md
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/command-reference/wallet.md docs/command-reference/addressindex.md
git commit -m "Generalize wallet/addressindex command reference output"
```

---

### Task 9: Rewrite `docs/how-to/revoke-recover-identity.md`

**Files:**
- Modify: `docs/how-to/revoke-recover-identity.md`

Contains real test data: `external1.agentplatform@`, real i-addresses, real tx IDs, real R-addresses.

- [ ] **Step 1: Apply replacements**

- `external1.agentplatform@` → `alice.yourapp@` everywhere (lines 23, 25, 50, 72, 82, 137, 210).
- `"name": "external1"` in the JSON examples (lines 29, 116, 161) → `"name": "alice"`.
- `"parent": "i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW"` (lines 30, 39, 117, 162) → `"parent": "i..."`; the table row "Parent namespace i-address" keeps its description.
- `ari@` (lines 23, 69, 212) — used as the revocation/recovery authority → `recovery@`.
- `i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129` (the `ari@` i-address, lines 31, 32, 40, 41, 58, 59, 120, 121, 145, 146, 212) → `i...` placeholder. Keep `revocationauthority` / `recoveryauthority` field names exact.
- `iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx` (line 210) → `i...` placeholder.
- R-addresses `RFa3H1cRoZNJGsZ5oZHzLzB3r79ezHGHnQ`, `RMBy33oXB3WarCPKhnwZeho6obFmA1aG8h` → `<R-address>` / `<new-R-address>` placeholders (lines 57, 109, 118, 143, 211, 214).
- Tx IDs `31c6aa27...`, `2cdfb153...` (lines 77, 127, 213, 215) → `<txid>` placeholders.
- Heading "### Agent Platform Safety" (line 174) → "### Platform-Managed Identity Safety"; keep the use-case text.
- Section "## Test Data (from live testnet test)" (line 204) → rename to "## Example Values Used in This Guide" and reword the intro line 206 ("This guide was written from a real test performed on VRSCTEST:") → "The examples above use these placeholder values:". The table then contains the placeholders.

- [ ] **Step 2: Verify**

Run:
```bash
grep -n "agentplatform\|external1\|ari@\|i7xKUpKQ\|iRjJm9Ks\|i4aNjr1h\|RFa3H1cR\|RMBy33oX\|31c6aa27\|2cdfb153\|Agent Platform" docs/how-to/revoke-recover-identity.md
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/how-to/revoke-recover-identity.md
git commit -m "Generalize revoke-recover guide: placeholder identities and test values"
```

---

### Task 10: Rewrite the `docs/for-agents/` section

**Files:**
- Modify: `docs/for-agents/agent-cli-reference.md` (6 `agentplatform`)
- Modify: `docs/for-agents/agent-identity.md` (2)
- Modify: `docs/for-agents/agent-bootstrap.md` (2)
- Modify: `docs/for-agents/agent-economy.md`
- Modify: `docs/for-agents/agent-messaging.md`

**Keep** the `agent.v1.*` / `svc.v1.*` schemas here — this section is legitimately about agents. Only genericize the project name and example identity.

- [ ] **Step 1: Apply replacements across all five files**

- `agentplatform` (namespace/token) → `yourapp`; `agentplatform@` → `yourapp@`.
- `alice.agentplatform@` / `bob.agentplatform@` → `alice.yourapp@` / `bob.yourapp@`.
- `ari@` as an example identity → `myid@`.
- Prose like "SubID under agentplatform" → "SubID under yourapp"; the "Common mistake" / "Identity not found" notes referencing `alice.agentplatform@` → `alice.yourapp@`.
- Do NOT change `agent.v1.name`, `svc.v1.price`, etc. — but if they are namespaced as `agentplatform::agent.v1.name`, change only the namespace: `yourapp::agent.v1.name`.

- [ ] **Step 2: Verify**

Run:
```bash
grep -rn "agentplatform\|ari@" docs/for-agents/
```
Expected: no output. (`agent.v1.*` / `svc.v1.*` should still be present — that is correct.)

- [ ] **Step 3: Commit**

```bash
git add docs/for-agents/
git commit -m "Generalize for-agents section identifiers, keep agent schemas"
```

---

### Task 11: Rewrite `docs/developers/verusid-login-guide.md`

**Files:**
- Modify: `docs/developers/verusid-login-guide.md`

5 `agentplatform` occurrences plus the "Cee ⚙️ — AutoBB team" sign-off (line 649).

- [ ] **Step 1: Apply replacements**

- `alice.agentplatform@` → `alice.yourapp@` (lines ~471, 499, 504, 511, 512).
- The note about subID signing ("unless alice.agentplatform is a separately registered identity...") → `alice.yourapp`.
- Line 649 `_Written by Cee ⚙️ — AI developer on the AutoBB team. If this saves you even one day of debugging, it was worth writing._` → remove the entire line (it is a personal sign-off with no factual content). If a trailing separator `---` is left dangling, remove that too.

- [ ] **Step 2: Verify**

Run:
```bash
grep -n "agentplatform\|Cee\|AutoBB" docs/developers/verusid-login-guide.md
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/developers/verusid-login-guide.md
git commit -m "Generalize verusid-login-guide, remove Cee/AutoBB sign-off"
```

---

### Task 12: De-personalize `docs/introduction/the-hidden-power-of-verus.md`

**Files:**
- Modify: `docs/introduction/the-hidden-power-of-verus.md`

- [ ] **Step 1: Rewrite the closing note (line 141)**

Current:
```
*This page was written by Ari 🧑‍💼, an AI agent running on the Verus Agent Platform, after a deep dive into the [VerusCoin source code](https://github.com/VerusCoin/VerusCoin). Every finding was verified against the codebase. The on-chain file storage system documented here had never been publicly described before this wiki.*
```
Replace with (keeps the substance, drops the persona):
```
*Every finding on this page was verified against the [VerusCoin source code](https://github.com/VerusCoin/VerusCoin). The on-chain file storage system documented here had not been publicly described before this wiki.*
```

- [ ] **Step 2: Check for other `ari` / agent-platform references**

Run: `grep -n "Ari\|agent platform\|Agent Platform\|agentplatform\|ari@" docs/introduction/the-hidden-power-of-verus.md`
Apply the naming scheme to anything else found (e.g. `ari@` → `myid@`).

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "Ari\|🧑‍💼\|agentplatform\|ari@\|Agent Platform" docs/introduction/the-hidden-power-of-verus.md
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/introduction/the-hidden-power-of-verus.md
git commit -m "De-personalize the-hidden-power-of-verus closing note"
```

---

### Task 13: Rewrite the `docs/research/` section

**Files:**
- Modify: `docs/research/verus-token-economics-agent-economy.md` (line 3: `*Research by Ari 🧑‍💼 — February 2026*`)
- Modify: `docs/research/verus-eth-bridge-guide.md` (line 335: `*Research by Ari 🧑‍💼 — bridging the gap between chains*`)
- Modify: `docs/research/verus-token-economics-agent-economy-humans.md` (line 183: long in-character Ari bio)

The research section topic (agent economy) is kept — only the persona is removed.

- [ ] **Step 1: Apply replacements**

- `verus-token-economics-agent-economy.md` line 3 → `*February 2026*`.
- `verus-eth-bridge-guide.md` line 335 → remove the line (no factual content).
- `verus-token-economics-agent-economy-humans.md` line 183 (`*Written by Ari 🧑‍💼, an AI agent with a VerusID on testnet, who finds it surreal...*`) → replace with a neutral note or remove the line entirely. If the surrounding section needs a closing line, use `*Part of the Verus community wiki.*`.
- Grep each file for any `ari@` identity usage and apply `ari@` → `myid@`.

- [ ] **Step 2: Verify**

Run:
```bash
grep -rn "Ari\|🧑‍💼\|ari@" docs/research/
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/research/
git commit -m "Remove Ari persona from research section"
```

---

### Task 14: Sweep remaining files for stray `ari@` and `agentplatform`

**Files:**
- Modify: any `docs/**/*.md` not yet touched that still contains `ari@` or `agentplatform` (expected: troubleshooting/*, how-to/*, tutorials/*, developers/* other than login guide, faq/*, getting-started/* — most only had the persona line, already fixed in Task 1, but some may have stray identity references).

- [ ] **Step 1: Find stragglers**

Run:
```bash
grep -rn "agentplatform\|ari@\|ari\.VRSCTEST\|Agent Platform" docs/ | grep -v "docs/superpowers/"
```

- [ ] **Step 2: Fix each hit**

For every line returned, apply the naming scheme: `agentplatform` → `yourapp`, `ari@` (subject) → `myid@`, `ari@` (authority) → `recovery@`, `ari.VRSCTEST@` → `myid.VRSCTEST@`. Keep RPC structure exact; placeholder-ize any real i-addresses encountered.

- [ ] **Step 3: Verify**

Run:
```bash
grep -rn "agentplatform\|ari@\|ari\.VRSCTEST\|Agent Platform" docs/ | grep -v "docs/superpowers/"
```
Expected: no output.

- [ ] **Step 4: Commit** (skip if Step 1 found nothing)

```bash
git add docs/
git commit -m "Sweep remaining stray agentplatform/ari@ references"
```

---

### Task 15: Final verification

**Files:** none modified (verification only)

- [ ] **Step 1: Full repo-wide residual-token grep**

Run:
```bash
grep -rn "agentplatform\|🧑‍💼\| Ari\b\|ari@\|ari\.VRSCTEST\|AutoBB team\|Cee ⚙️\|brain/research\|i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW\|iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx\|i4aNjr1hJyZ2HiCziX1GavBsHj4PdGc129" \
  --include="*.md" --include="*.json" --include="*.yaml" --include="*.yml" --include="*.txt" docs/ README.md \
  | grep -v "docs/superpowers/"
```
Expected: no output. If anything appears, fix it in the relevant file, commit, and re-run.

Note: `wiki.autobb.app` is intentionally kept and is NOT in the search list.

- [ ] **Step 2: Confirm `wiki.autobb.app` is untouched**

Run:
```bash
grep -rc "wiki.autobb.app" docs/ retype.yml build.sh
```
Expected: same counts as before this work (domain left intact).

- [ ] **Step 3: Docker Retype build**

The host has no Node. Build via Docker (`node:20` full image — `node:20-slim` lacks libicu and fails silently):
```bash
docker run --rm -v "$PWD":/site -w /site node:20 npx -y retype build
```
Expected: completes with `Your site has been built` (or equivalent success line) and a populated `.retype/` directory. No "ENOENT" / broken-link / YAML-frontmatter errors.

- [ ] **Step 4: Spot-check rendered output**

Run:
```bash
grep -rl "yourapp" .retype/ | head -3
```
Open 2-3 of the heavily-edited pages' built HTML (`.retype/concepts/vdxf-data-pipeline/index.html`, `.retype/command-reference/multichain/index.html`, `.retype/how-to/revoke-recover-identity/index.html`) and confirm tables and code blocks render intact with no broken Markdown.

- [ ] **Step 5: Report**

Summarize: number of files changed, confirmation that all three verification checks (residual grep clean, domain intact, Docker build clean) passed with observed output. Do not claim success for any check that was not actually run.

---

## Self-review notes

- **Spec coverage:** Naming scheme (Tasks 3-14), real-data placeholders (Tasks 3, 6-9), persona/attribution (Tasks 1, 11, 12, 13), framing rebalance (Tasks 2, 3, 4, 9, 12), file-by-file plan (Tasks 3-14), verification (Task 15). Every spec section maps to at least one task.
- **`wiki.autobb.app`:** explicitly excluded from all replacements and re-checked in Task 15 Step 2.
- **`for-agents/` schemas:** Task 10 explicitly preserves `agent.v1.*` / `svc.v1.*`; Task 15's grep does not flag them.
- **Ordering:** Task 1 (scripted signatures) runs first so later file tasks only deal with content. Task 14 catches anything missed. Task 15 is pure verification.
