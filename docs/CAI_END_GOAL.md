# CAI End Goal (Fine Dining)

This document is the source of truth for whether a new CAI story is justified.

## One-line goal
Make linear programming (LP) meal planning feel **stupid-proof**: users get an affordable, nutritionally-correct plan with near-zero friction, without needing to know LP exists.

## Core product outcomes (must map to at least one)
1) **LP → plan generator**
   - Use a backend LP solver to generate meal plans from user constraints.
   - Inputs include nutrition requirements, allergens, religious constraints, diet style (keto/mediterranean/etc.), and a candidate meal set.
   - Output includes an optimized plan and *explanations/flags* about which meals conflict with constraints or drive cost.

2) **Flexibility without chaos**
   - Users can lock a plan, but can also add/remove meals and swap mid-week.
   - Users can confirm consumption per meal so edits mid-week don’t corrupt tracking.
   - Support “cheat” / junk-food logging (pizza/candy) for adherence + honesty.

3) **Variety controls**
   - Prevent degenerate plans (e.g., chicken & rice forever).
   - Support variety constraints (limits per meal/ingredient/category/time window).

4) **Scale**
   - Architecture should scale from 1 meal → 10,000 meals and 1 user → 100,000 users.
   - Explicit limits/guardrails on meal plan generation size and compute budgets.

5) **Data ingestion**
   - Pull from free/open food/nutrition databases.
   - Maintain data quality, provenance, and update strategy.

6) **Security + accounts**
   - Tight security across auth, roles, and payment flows.
   - Multiple account tiers (free/premium), trial accounts, and moderation roles.
   - Payments must use the most secure supported approach.

7) **Creator ecosystem**
   - Creators can add recipes, photos, and rich details easily.
   - Referral / payout flows for creators who bring users.
   - Cookbook features.

8) **Monetization (minimal ads)**
   - Affiliate “buy now” links (Walmart/Amazon/etc.) for grocery/cart revenue.
   - Minimal ads; ads must be unobtrusive.

## What CAI Step A MUST enforce
When CAI creates a new story/issue:
- The title MUST start with `CAI:` (e.g., `CAI: Font change`).
- It MUST include a **Justification** section explicitly mapping to one or more Core Outcomes above.
- It MUST include **Acceptance Criteria**.
- It MUST NOT duplicate an existing open CAI issue.
- If it cannot justify the story toward the end goal, it must not create it.
