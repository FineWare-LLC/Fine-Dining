# Branching Strategy

This document outlines recommended practices for managing feature branches when working on the Fine Dining codebase.

## Overview
Each ticket should be implemented on its own feature branch created off the latest `main`. Rebase your branch frequently to minimise divergence and reduce the risk of merge conflicts.

## Steps
1. Ensure your local `main` branch is up to date:
   ```bash
   git checkout main
   git pull --rebase
   ```
2. Create a feature branch for your ticket:
   ```bash
   git checkout -b feature/TICKET-001-glass-morphism-card
   ```
   Replace the ticket identifier and description as appropriate.
3. Keep your feature branch focused. Avoid unrelated changes.
4. Rebase onto `main` regularly:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
5. Resolve any conflicts during the rebase.
6. Run the test suite before pushing.

## Keeping Branches Conflict-Free
- Communicate with teammates about overlapping files.
- If multiple tickets modify the same component, sequence their merges into `main` rather than merging them concurrently.
- After merging one feature, rebase the next feature branch onto the updated `main` before continuing work.

Following this workflow will help ensure that individual ticket branches merge cleanly without conflicts.
