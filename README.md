# Stella Maxima

**Studio:** ConsciousNode SoftWorks  
**License:** MIT  
**Format:** Single-file zero-dependency HTML5/WebGL2/WebAudio universe simulation & god game (`index.html`)

---

## Overview

**Stella Maxima** is a continuous multi-scale universe simulation and god game contained entirely inside one offline `index.html` file with zero external dependencies, fonts, CDNs, or network calls.

- **Contemplative Mode (Observer):** Tune the fundamental constants of physics prior to the Big Bang (`Gravity G`, `Expansion H₀/Λ`, `Primordial Lumpiness σ₈`, `Dark Matter Fraction Ω_dm`, `Chemistry Richness α_chem`, `Star-Formation Efficiency ε_sfr`) and watch cosmic history unfold from the primordial singularity ($10^{27}\text{ m}$) down to a single creature walking on a beach ($2\text{ m}$).
- **Meddling Mode (Active God):** Intervene across all 9 spatial scales with the **God's Hand** and **10 Gesture-Drawn Miracles** recognized from scratch (`Ignite Star`, `Steer Comet`, `Monsoon Blessing`, `Solar Tempest`, `Harmonic Restoration`, `Seed Protocell`, `Epiphany`, `Wrathful Bolt`, `Stellar Forge`, and `Poincaré Recurrence / Negentropy`).
- **Classic 2001 God-Game Soul:** Raise an autonomous **Avatar Creature** that learns from your strokes (reward), slaps (punishment), and miracles (imitation) via an inspectable in-browser Reinforcement Learning Q-Table + 2-layer Neural Policy; harvest **Belief Power** from civilizations whose religions dynamically interpret your benevolent or cruel deeds; and watch the visual palette, hand appearance, creature morphology, and procedural WebAudio soundtrack morph with your **Moral Alignment**.
- **The Thermodynamic Cost:** As an outside actor violating closed-system conservation, every miracle injects entropy ($\Delta S$) into the cosmos, pulling the universe's **Heat Death** closer. A contemplative god who never meddles witnesses the longest universe; an interventionist god spends cosmic future to shape the present—unless they sacrifice vast accumulated Belief to cast `Poincaré Recurrence (Negentropy)`.

---

## Quick Start

### 1. Run in Browser (Zero Setup)
Open `index.html` directly in any modern Chromium or Firefox browser. Everything runs offline inside that single file.

### 2. Controls & Navigation
- **Zoom Ladder (`10²⁷ m` → `2 m`):** Scroll the mouse wheel over the viewport, drag the continuous zoom slider on the bottom bar, click any of the 9 scale buttons (`0. Singularity` through `8. Creature`), or click directly on filament halos, galaxies, stars, planets, or the creature on the canvas.
- **Mode Switch:** Click `👁️ Contemplative Mode` / `🖐️ Meddling Mode` in the top bar.
- **Gesture Miracles:** In Meddling Mode with `✍️ Draw Gesture` active, drag on the canvas to draw a shape (e.g., `○` Circle for Heal, `🌀` Spiral for Ignite Star, `~` Wave for Rain, `^` Caret for Inspire, `⚡` Zigzag for Smite, `∞` Figure-8 for Seed Life, `□` Square for Dyson Ring, `⏳` Hourglass for Negentropy), or click the quick-cast buttons in the right dock.
- **Hand Interactions:** Select `✨ Stroke Creature`, `⚡ Slap Creature`, `🤲 Cradle World`, or `☄️ Throw Asteroid` to interact directly with worlds and the Avatar Creature.
- **Timeline Scrubber & Branching:** Drag the bottom timeline slider to rewind or fast-forward deterministically to any cosmic epoch (`0.0 Gyr` to Heat Death). Click `🌿 Fork Timeline` to snapshot a branch ("what if I hadn't done that?") and compare both universes side by side in the **Branches** tab.
- **Save / Share / Export Cartridge:** Click `🔗 Share` to copy a compact Base64 universe state string (`seed + constants + actionLog`) and update the URL hash, or click `💾 Cartridge` to download a standalone `.html` file pre-configured with your exact universe history.

---

## Verification Test Suite (Headless Node.js)

All simulation physics, chemistry, evolution, civilizations, creature RL/neural learning, and gesture recognition live inside `<script id="stella-simulation-core">` in `index.html`. The test suite extracts that exact code directly from `index.html` without copying it:

```bash
node tests/headless.js          # Extracts StellaCore from index.html & verifies default evolution
node tests/determinism.js       # Verifies bit-identical state hashes across runs, rewinds & branches
node tests/lod-consistency.js   # Verifies zoom in->out->in invariance & statistical-to-detailed sums
node tests/constants.js         # Sweeps creation constants & outputs "What Physics Allows" table
node tests/creature.js          # Verifies RL + neural policy + imitation learning behavioral shift
```

---

## License

MIT License — Copyright (c) 2026 ConsciousNode SoftWorks.
