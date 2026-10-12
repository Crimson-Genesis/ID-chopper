# AGENTS.md

## Environment & Agent Rules

### NixOS Development Shell
This project runs on NixOS. All development tools (Node.js, npm, Python, compilers, linters, etc.) are encapsulated in the system Nix flake dev shell.
Whenever running commands, tests, or scripts that require the development environment, execute them using:

```bash
nix develop /etc/nixos#all-linux --command bash -c "<command>"
```

For persistent or interactive commands, execute via the `nix develop /etc/nixos#all-linux` environment.

### Codebase Style Guidelines
- **Strictly No Emojis**: Do not use emojis anywhere in the codebase (source code, UI labels, buttons, comments, logs, or documentation).
- Use professional SVG vector icons (such as Lucide React or standard SVG icons) for all visual iconography.
