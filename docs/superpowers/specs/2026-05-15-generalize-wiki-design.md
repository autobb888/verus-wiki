# Design: Generalize the Verus Wiki away from the `agentplatform` example

**Date:** 2026-05-15
**Status:** Approved (pending spec review)

## Problem

The wiki was authored using one specific project — "agentplatform" — as the running
example throughout. As a result it reads as though it is *about* that project rather
than being neutral, community-maintained documentation for **anyone building on Verus**.
The project-specific framing shows up as:

- The literal identifier `agentplatform` (token, currency, namespace, SubIDs) — 122
  occurrences across 12 files.
- Real, cryptographically-derived on-chain data tied to that name: VDXF i-addresses
  (hashes of `agentplatform::…` strings), the real currency i-address
  `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW`, `external1.agentplatform@` =
  `iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx`, and real block heights (e.g. token created at
  block 926606).
- Author personas: "Ari 🧑‍💼" signature on ~24 pages, "Cee ⚙️ — AutoBB team" on one
  page, and longer in-character bios on two pages.
- `ari@` used as the running example identity (a real testnet identity with real
  i-addresses and block heights).
- An "AI agent platform" slant woven into *general* concept pages — the VDXF data
  examples assume the reader is building an agent platform.
- A stale `brain/research/` reference in `docs/README.md` to a directory that does not
  exist in this repo.

## Goal

A full audit that generalizes the wiki so it serves any Verus developer, while
**preserving the wiki's core credibility promise** ("we test every command on testnet
and document what actually works"). That means project-specific *values* become clearly
labelled placeholders — never fabricated "tested" output.

## Non-goals / decisions already made

- **Deployment domain stays.** `wiki.autobb.app` is the real live URL and is left
  untouched everywhere (retype.yml, build.sh, llms.txt, robots.txt, openapi.yaml,
  ai-plugin.json, agent-index.json, verus-facts.md). Its branding lives only in the
  host domain, not the content.
- **`for-agents/` and `research/` sections are kept** intact structurally. The AI-agent
  angle is one legitimate topic among many — it is not deleted, only contained.
  Identifiers *inside* those sections are still genericized.
- **Machine-readable files** (`agent-index.json`, `ai-plugin.json`, `llms.txt`,
  `openapi.yaml`) are structurally kept; updated only where a renamed page/section
  title is referenced.
- No build-system / infra changes. The uncommitted local changes to `build.sh`,
  `form-api/server.js`, `inject-sidebar-fallback.py`, `retype.manifest`, `retype.yml`
  are out of scope for this work.

## Approach

**Careful manual rewrite** (chosen over scripted bulk-replace and parallel subagents).
`agentplatform` appears in both safe cosmetic prose and unsafe real-RPC-output contexts
*within the same files* (`multichain.md` has 32 mixed occurrences). The only reliable
guard against silently fabricating "tested" output is reading each occurrence in
context and applying the right treatment. The one exception is the persona signature
line, which is byte-identical across ~24 files and gets a single safe global replace.

## Naming scheme

| Current | Replacement |
|---|---|
| `agentplatform` (token / currency / namespace) | `yourapp` |
| `agentplatform@` | `yourapp@` |
| `alice.agentplatform@` / `bob.agentplatform@` / `service.agentplatform@` | `alice.yourapp@` / `bob.yourapp@` / `service.yourapp@` |
| `external1.agentplatform@` | `alice.yourapp@` (folded into the same alice/bob cast) |
| `ari@` — the user's own top-level identity | `myid@` |
| `ari@` — specifically as a revocation/recovery authority | `recovery@` |
| `agentplatform::agent.v1.*` / `svc.v1.*` in **general** concept pages | `yourapp::data.v1.*` — generic schema |
| `agent.v1.*` / `svc.v1.*` schemas **inside `for-agents/`** | kept as-is — that section is legitimately about agents |

## Real-data placeholder handling

Principle: **the structure and field names of every RPC example stay exact** (that is
the real teaching value); only project-specific *values* become labelled placeholders.

| Current | Replacement |
|---|---|
| 16-row precomputed VDXF i-address table in `vdxf-data-pipeline.md` | Replace with the `verus getvdxfid "yourapp::data.v1.name"` commands plus a note: "VDXF IDs are deterministic — run these against your namespace to get your actual addresses." More honest than a table of fake-looking addresses. |
| `i7xKUpKQDSriYFfgHYfRpFc2uzRKWLDkjW` (real currency / parent i-address) | `i…` placeholder, labelled `<your currency i-address>` |
| `iRjJm9KsNE9HfHYaWVebSijqrszpeggaMx` (`external1.agentplatform@`) | `i…` placeholder |
| Inline i-addresses inside RPC-output JSON blocks | `i…`-style placeholders; JSON structure and field names kept intact |
| "block 926606" and other block heights tied to the token | `<block-height>` placeholder |

## Persona & attribution

| Current | Replacement |
|---|---|
| `*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*` (~24 pages) | `*Last updated: 2026-02-07*` — drop persona, keep date (single safe global replace) |
| `_Written by Cee ⚙️ — AI developer on the AutoBB team…_` (`verusid-login-guide.md`) | Remove the line (personal sign-off, no factual content) |
| Long Ari bio in `the-hidden-power-of-verus.md` | Rewrite to keep the substance — findings verified against the VerusCoin source, on-chain file storage not previously publicly documented — as a neutral wiki note, not a persona |
| Ari bio in `verus-token-economics-agent-economy-humans.md` | Replace with a neutral one-line note or remove |

## Framing rebalance

- **General concept pages** — `vdxf-data-pipeline.md`'s "Real-World Example: Agent
  Schema Migration" → "Example: Setting Up a Data Schema"; agent/service schemas →
  generic `data.v1.*`. Same de-agenting in `data-descriptor.md`, `identity-system.md`,
  `utxo-model.md`.
- **`introduction/the-hidden-power-of-verus.md`** — de-personalize the "Agent Platform"
  framing (see Persona section).
- **`docs/README.md`** — fix the stale `brain/research/` reference; soften "agent
  economy" wording.
- **`for-agents/` and `research/` sections** — kept intact; internal identifiers still
  genericized per the naming scheme.
- **`index.md` and machine-readable files** — structurally kept; updated only where a
  renamed page/section title is referenced.

## File-by-file plan (~30 files)

**Heavy rewrite** (real data + prose):
`command-reference/multichain.md`, `concepts/vdxf-data-pipeline.md`,
`command-reference/identity.md`, `command-reference/wallet.md`,
`how-to/revoke-recover-identity.md`, `command-reference/addressindex.md`

**Moderate** (identifiers + some framing):
`concepts/data-descriptor.md`, `concepts/identity-system.md`, `concepts/utxo-model.md`,
`concepts/currency-options-reference.md`, `developers/verusid-login-guide.md`,
`for-agents/agent-cli-reference.md`, `for-agents/agent-identity.md`,
`for-agents/agent-bootstrap.md`, `for-agents/agent-economy.md`,
`for-agents/agent-messaging.md`, `introduction/the-hidden-power-of-verus.md`,
`docs/README.md`, `README.md`

**Light** (persona line and/or stray `ari@` only):
the remaining ~14 pages that carry the signature line (troubleshooting/*, how-to/*,
tutorials/*, developers/*, faq/* as applicable)

**Scripted** (one safe global replace):
the byte-identical `*Guide by Ari 🧑‍💼 · Last updated: 2026-02-07*` line

## Verification

1. **Re-grep for residual tokens** — `agentplatform`, `ari@`, the `Ari`/`Cee` persona
   strings, `AutoBB team`, `brain/research`, and the orphaned real i-addresses
   `i7xKUpKQ…` and `iRjJm9Ks…`. Expect zero hits (excluding this spec file and the
   `wiki.autobb.app` domain, which is intentionally kept).
2. **Docker build** — build via the project's node:20-full + python:3-slim flow, then
   run `inject-sidebar-fallback.py`. Confirm it builds clean with no errors.
3. **Spot-check** 2–3 rendered pages for tables/links broken by the edits.

No success claims until all three pass with observed output.

## Risks

- **Fabricating "tested" data** — the central risk. Mitigated by the manual-rewrite
  approach and the placeholder principle (values become labelled placeholders, never
  invented real-looking data).
- **Inconsistent naming** — mitigated by the fixed naming-scheme table above.
- **Broken internal links / sidebar** — mitigated by the Docker build + spot-check
  step.
