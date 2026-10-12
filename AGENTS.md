# AGENTS.md

## Environment & Agent Rules

### NixOS Development Shell
This project runs on NixOS. All development tools (Node.js, npm, Python, compilers, linters, etc.) are encapsulated in the system Nix flake dev shell.
Whenever running commands, tests, or scripts that require the development environment, execute them using:

```bash
nix develop /etc/nixos#all-linux --command bash -c "<command>"
```

For persistent or interactive commands, execute via the `nix develop /etc/nixos#all-linux` environment.
