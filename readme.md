# Thamara — Context Browser (Project Logic + Feature Map)

**Browse:** [Overview](#overview) · [Problem](#problem) · [Users](#users--stakeholders) · [Design Principles](#design-principles) · [System Overview](#system-overview) · [Features](#features) · [User Journeys](#key-user-journeys) · [Offline & Data](#offline--data-model-conceptual) · [Success Metrics](#success-metrics) · [Risks](#risks--limitations) · [MVP Scope](#what-the-mvp-proves) · [Glossary](#glossary) · [Sources](#sources)

---

## Overview

**Thamara** is an **offline-first farm recovery & coordination platform** designed for **small farmers and displaced families in Gaza** to restart food production under severe constraints: farmland damage, water scarcity, salinity, movement restrictions, unreliable connectivity, and low battery availability. :contentReference[oaicite:0]{index=0}

Thamara’s logic is built around one rule: **the app must remain useful with zero internet**, while becoming better when connectivity appears.

---

## Problem

### Problem statement (SPS#1)

Food production capacity is severely reduced because farmland and assets are damaged; many households cannot determine what production is possible given **soil damage, salinity, water scarcity, and climate stress**, and cannot access guidance or coordination channels reliably. :contentReference[oaicite:1]{index=1}

### Operating constraints (must hold)

- **No reliable extension services**
- **No internet + low battery + limited devices**
- **High salinity + damaged soils + limited clean irrigation**
- **Restricted movement and insecurity**
- **Training/support must be remote + asynchronous** :contentReference[oaicite:2]{index=2}

---

## Users & Stakeholders

### Primary users

- **Farmer / Household grower**
  - Needs: “Can I plant here?”, “What can I plant?”, “How much seed do I need?”, “Where is water?”, “How do I get inputs/labor/transport?”, “How do I sell without refrigeration?”

### Secondary users (ecosystem)

- **Workers** (day labor, harvest help), **transport providers**
- **Suppliers** (seeds/tools/fertilizers), local hubs/co-ops
- **Buyers / aggregators** (same-day pickup, pooling)
- **NGOs / donors / large buyers** (fund bundles, verify fulfillment)

---

## Design Principles

1. **Offline-first by default**

   - All core actions work offline. Connectivity only improves freshness and coordination.
2. **Minimum input, maximum output**

   - Logging a plot should take **~30–60 seconds** and avoid complex forms.
3. **Defensible guidance (not false precision)**

   - Output is **actionable status + confidence**, not “guaranteed fertility”.
   - When evidence conflicts, the app marks **Needs On-site Check**.
4. **Low-literacy friendly**

   - Icon-first flows, short text, optional audio prompts.
5. **Coordination > prediction**

   - Even perfect agronomy advice fails if seeds/water/labor/transport cannot be coordinated.

---

## System Overview

Thamara is organized into **four offline user modules** plus an **optional organization bridge**:

1. **Plant & Water Feasibility** (Where can I plant? What water is realistic?)
2. **Crop & Practice Recommender** (Fast harvest + low water + salinity/heat aware)
3. **Inputs/Labor/Logistics Coordination** (Seeds/tools/fertilizer + day labor + transport)
4. **Harvest-to-Market Without Cold Chain** (Crop-drop scheduling + aggregation)
5. **Org Bridge (Optional)** (NGO/donor funding + audit-friendly fulfillment)

These map directly to SPS#1 needs: guidance + coordination under severe access constraints. :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}

---

## Features

Feature tiers reflect priority: **P0 = core feasibility**, **P1 = high differentiation**, **P2 = scaling & ecosystem**. :contentReference[oaicite:5]{index=5}

### Tier P0 — Core feasibility (must work fully offline)

#### F1. Offline Plot Logging + Plantability Guidance

**Goal:** Give a defensible determination of plot status:

- **Farmable Now** / **Restorable** / **Severely Damaged**
- Displayed as shaded overlays on an offline map, with confidence. :contentReference[oaicite:6]{index=6}

**How it works (logic, not implementation):**

- Start with a **baseline damage signal** prepared from credible external assessments.
- Combine baseline + user constraints (water/salinity/access) into a **lightweight rule-based score**.
- Output status, confidence, and top actions (“what to do next”).

**Key sub-parts:**

- **Baseline evidence layer** (pre-packaged)
- **Offline “Agro Packs”** (regional bundles that include maps + overlays + rules)
- **30–60s plot logging** (auto-locate or quick draw)
- **Transparent scoring** (“why this result”)
- **Offline map rendering** (color overlay + confidence)

#### F2. Crop/Practice Recommender (Salinity/Heat/Low-Irrigation + Fast Harvest)

**Goal:** Suggest crops and practices that are realistic under:

- water class (none/limited/reliable)
- salinity risk
- target harvest window
- plot size / rooftop option

**Output:**

- Top crop options + practices
- Simple “why it fits” explanations
- Fast harvest + resource efficiency framing (food output vs water effort). :contentReference[oaicite:7]{index=7}

#### F3. Seed Quantity Calculator

**Goal:** Convert plot area + crop choice → **seed quantity + spacing guide** using offline tables. :contentReference[oaicite:8]{index=8}

#### F4. Water Point Finder + Reliability Cache

**Goal:** Help users locate nearby water points and decide whether they are worth the trip.

**Output:**

- Water points on map
- Reliability indicator (last confirmed + reports)
- Works offline using cached last-known status. :contentReference[oaicite:9]{index=9}

---

### Tier P1 — High impact + strong differentiation

#### F5. RainReady: Rainwater Capture + Field Flow Design

**Goal:** Reduce dependency on uncertain supply through:

- rooftop catchment planning (collection → safer storage)
- field runoff/infiltration designs (micro-catchments, bunds, swales)
- overflow routing guidance to reduce erosion/ponding

This is positioned as **water autonomy guidance**, not requiring constant connectivity. :contentReference[oaicite:10]{index=10}

#### F6. Input Exchange (Seeds/Tools/Fertilizers)

**Goal:** Local offer/request marketplace with verified hubs and safety guidance cards. :contentReference[oaicite:11]{index=11}

#### F7. Harvest Scheduler + “Crop Drop” (No Fridge Mode)

**Goal:** Enable same-day pickup + pooling by publishing harvest windows and coordinating buyers/aggregators. :contentReference[oaicite:12]{index=12}

#### F8. Day-Labor + Transport Hiring

**Goal:** Match harvest labor needs and transport capacity using low-bandwidth “job cards” that can sync later. :contentReference[oaicite:13]{index=13}

---

### Tier P2 — Scaling + ecosystem integration

#### F9. OrgBridge (Donor/NGO Funding + Fulfillment)

**Goal:** Allow organizations to fund:

- in-kind bundles (via verified suppliers), or
- restricted vouchers/cash equivalents (via partners)

Includes an audit-friendly fulfillment trail. :contentReference[oaicite:14]{index=14}

#### F11. Season Review Coach

**Goal:** After harvest, capture basic outcomes (yield/costs/constraints) and return simple next-step coaching using rule-based logic (avoid heavy AI dependency). :contentReference[oaicite:15]{index=15}

---

## Key User Journeys

### Journey A — “Can I plant here?”

1. User opens map offline → sees plantability overlay (Farmable/Restorable/Severely Damaged)
2. User logs a plot (auto-locate or quick draw)
3. User sets 3 flags: water access, salinity signs, reachability
4. App outputs: status + confidence + “why” + top actions

### Journey B — “What should I plant and how much seed do I need?”

1. From plot result, user requests recommendations
2. App proposes crop/practice options tailored to constraints
3. User selects crop → seed quantity + spacing guide generated

### Journey C — “Where do I get water?”

1. User opens water points map offline
2. App shows last known reliability
3. User can mark “confirmed available/unavailable” to update local cache (sync later)

### Journey D — “I need seeds/tools/labor/transport”

1. User posts a request (category + quantity + time window)
2. Nearby offers/hubs appear when synced (or via local sharing)
3. User confirms receipt; records remain even without internet

### Journey E — “I harvested—how do I sell without refrigeration?”

1. User publishes harvest window and quantity estimate
2. Buyers/aggregators subscribe to nearby drops
3. Same-day pickup reduces spoilage risk

### Journey F — “NGO/donor support reaches me”

1. Org creates funded bundle (inputs)
2. Supplier prepares bundle; receipt chain recorded
3. Farmer confirms pickup; org sees fulfillment status later

---

## Offline & Data Model (Conceptual)

### Offline packaging (“Agro Packs”)

Regional bundles include:

- base map
- plantability overlay + confidence
- cached water points
- guidance rules (remediation + crop/practice)
- optional audio prompts :contentReference[oaicite:16]{index=16}

### Data minimization

Core use does not require personally identifying information. Key stored items are:

- plot logs + constraint flags
- recommendations shown + choices
- water point reliability marks
- listings (offers/requests), harvest drops
- fulfillment receipts (for org flows) :contentReference[oaicite:17]{index=17}

---

## Success Metrics

Aligned to SPS#1 suggested metrics:

- **# of users logging plots/crops/needs**
- **area brought back into productive use** (including micro-plots/rooftops)
- **adoption of climate-resilient practices** (tracked via checklists)
- **changes in self-reported dietary diversity / local availability** :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}

---

## Risks & Limitations

- **Remote sensing ≠ soil truth**

  - Plantability is a decision aid with confidence, not guaranteed fertility.
- **Staleness**

  - Offline packs can become outdated; the UI must show “last updated” and reduce confidence when stale.
- **Access and safety constraints**

  - The app cannot make routes safe; it can only reduce wasted trips via reliability and coordination signals.
- **Marketplace abuse**

  - Requires verification tags for hubs/organizations; basic safety constraints on listings categories.

---

## What the MVP Proves

A static MVP must still demonstrate **core feasibility**:

- Offline plot logging
- Offline plantability result (status + confidence + explainability)
- Offline crop recommendation and seed calculation
- Offline water points browsing
- Stubbed screens for P1/P2 features labeled “Unimplemented yet” (to show full roadmap)

This aligns to the hackathon’s emphasis on proving core functionality feasibility and clear demo flow. :contentReference[oaicite:20]{index=20}

---

## Glossary

- **Plantability:** Practical status classification for “what can I do here now?” (not a lab-grade soil measurement).
- **Agro Pack:** Offline regional bundle containing maps + overlays + guidance needed to operate without internet.
- **No Fridge Mode:** Harvest-to-market coordination designed for minimal cold chain availability.

---

## Sources

- LifeLines Hackathon ’26 Participant Info Booklet (rules, submissions, judging criteria). :contentReference[oaicite:21]{index=21}
- LifeLines Hackathon ’26 Official Problem Statement — SPS#1 (constraints, guiding questions, success metrics). :contentReference[oaicite:22]{index=22}
- Thamara — LifeLines Hackathon 2026 Project Documentation (system overview and feature list). :contentReference[oaicite:23]{index=23}
