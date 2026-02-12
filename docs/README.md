# Verus Wiki Project

Comprehensive documentation for all 201 Verus CLI commands + guides.

## Structure
- `command-reference/` — Individual command docs (tested on testnet before documenting)
- `concepts/` — How things work (identity system, currencies, DeFi, etc.)
- `how-to/` — Task-oriented guides
- `tutorials/` — End-to-end walkthroughs for beginners
- `troubleshooting/` — Common errors and solutions
- `developers/` — RPC API reference, integration patterns
- `for-agents/` — AI agent-specific documentation
- `getting-started/` — Installation, first steps
- `scripts/` — Auto-generation scripts + raw help data

## Separate From
- `brain/research/` — Agent platform guides (VerusID integration, VDXF schema, hiring flow, etc.)

## Approach
Test every command on testnet first, then document what actually works.

## Concepts Pages
- `identity-system.md` — VerusID fundamentals
- `vdxf-data-standard.md` — VDXF key-value data standard
- `definedkey-vdxf-labels.md` — Human-readable labels for VDXF keys
- `data-descriptor.md` — Structured data containers with metadata/encryption
- `vdxf-uni-value.md` — Universal value serialization (type system)
- `vdxf-data-pipeline.md` — **How DefinedKey + DataDescriptor + VdxfUniValue work together**
- `currencies-and-tokens.md` — Token/currency creation
- `basket-currencies-defi.md` — DeFi with basket currencies
- `bridge-and-crosschain.md` — ETH bridge and cross-chain
- `mining-and-staking.md` — Mining and staking
- `privacy-shielded-tx.md` — Shielded transactions
- `marketplace-and-offers.md` — On-chain marketplace
- `currency-options-reference.md` — Currency option flags
- `utxo-model.md` — UTXO model explained

## Status
- [x] Phase 1: Core (Identity, Currencies, Mining, Staking)
- [x] Phase 2: DeFi, Bridge, Marketplace
- [x] Phase 3: Advanced topics
- [x] Phase 4: Bulk command reference
- [x] Phase 5: Polish
