# Verus Wiki

Community-maintained documentation for the [Verus](https://verus.io) ecosystem — covering identities, currencies, mining, DeFi, privacy, and the agent economy.

**Live site:** [wiki.autobb.app](https://wiki.autobb.app)

## What's Inside

| Section | Description |
|---------|-------------|
| **Getting Started** | Key concepts, installation, wallet setup, first steps |
| **Concepts** | Deep dives — VerusID, UTXO model, currencies, DeFi, VDXF, privacy |
| **How-To Guides** | Step-by-step: create IDs, launch tokens, mine, stake, bridge from ETH |
| **Tutorials** | Beginner walkthroughs: send/receive, first VerusID, first token |
| **For Agents** | AI agent identity, bootstrapping, CLI reference, agent economy |
| **Developers** | RPC API overview, integration patterns, testnet guide, VerusID Login |
| **Command Reference** | Full Verus CLI command reference organized by category |
| **Research** | Agent registry schemas, token economics, discovery & hiring guides |
| **Troubleshooting** | Common errors, sync issues, identity issues, transaction problems |

## Built With

This wiki is powered by [Retype](https://retype.com) — a static site generator that turns Markdown into a searchable, dark-mode documentation site.

## Project Structure

```
docs/               # All wiki content (Markdown + YAML frontmatter)
├── getting-started/
├── concepts/
├── how-to/
├── tutorials/
├── for-agents/
├── developers/
├── command-reference/
├── research/
└── troubleshooting/
retype.yml          # Retype configuration
.retype/            # Built output (auto-generated)
```

## Suggesting Edits

We welcome contributions! Here's how:

### Quick Edits

1. Find the page you want to edit in the `docs/` folder
2. Click the ✏️ edit button on GitHub
3. Make your changes to the Markdown
4. Submit a Pull Request with a brief description of what you changed

### Larger Contributions

1. **Fork** this repo
2. **Clone** your fork locally
3. Edit or add Markdown files in `docs/`
4. **Preview locally** (optional):
   ```bash
   # Install Retype
   npm install retypeapp --global
   
   # Watch & serve
   retype start
   ```
5. **Commit** your changes and open a **Pull Request**

### Content Guidelines

- Write in clear, accessible language
- Use code blocks for CLI commands and RPC calls
- Include practical examples where possible
- Each page needs YAML frontmatter (`title`, `description`, `order`)
- Link to related pages using relative paths

### Adding a New Page

1. Create a `.md` file in the appropriate `docs/` subfolder
2. Add frontmatter at the top:
   ```yaml
   ---
   title: Your Page Title
   description: Brief description for search
   order: 10
   ---
   ```
3. Write your content in Markdown
4. To add it to the sidebar, include it in the folder's `index.yml` if needed

## License

Content is provided for the Verus community. See [Verus.io](https://verus.io) for project details.
