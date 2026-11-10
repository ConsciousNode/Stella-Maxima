# Stella Maxima — System Architecture (`ARCHITECTURE.md`)

**Studio:** ConsciousNode SoftWorks  
**Engine:** Pure deterministic JavaScript (`StellaCore`) + WebGL2 Multi-Scale Shader & GPU Particle-Mesh Pipeline (`StellaRenderer`) + WebAudio Procedural Synthesizer (`CosmicAudioEngine`)

---

## 1. Core Architectural Principle: A Pure Function of History

The entire universe state at cosmic epoch $t$ is a strict deterministic function:

$$\mathcal{U}(t) = \mathcal{F}\big(\text{Seed}_0,\; \mathbf{\Theta}_{\text{constants}},\; \mathcal{A}_{\le t},\; t\big)$$

where:
- $\text{Seed}_0$ is the 32-bit FNV-1a hash of the user's creation seed string,
- $\mathbf{\Theta}_{\text{constants}} = (G, H_0, \sigma_8, \Omega_{\text{dm}}, \alpha_{\text{chem}}, \varepsilon_{\text{sfr}})$ are the six creation dials set before the Big Bang,
- $\mathcal{A}_{\le t}$ is the timestamped log of divine interventions (hand actions and gesture miracles) with $t_{\text{action}} \le t$,
- $t$ is quantized in fixed $0.1\text{ Gyr}$ internal integration steps (`_stepFixed(0.1)`) so that stepping by any outer frame delta produces the exact same floating-point trajectory and FNV-1a state hash across platforms.

---

## 2. Hierarchical Seeding & Level-of-Detail (LOD) Reconciliation

Every entity on the 9-step scale ladder derives its deterministic seed from its parent's seed and its local index via a Murmur3/SplitMix32-style avalanche mixer (`mixSeed(parentSeed, idStr)`):

```
Universe (seed)
 └── Filament [0..5]       seed_f = mixSeed(seed_u, "filament_" + fId)
      └── Galaxy [0..3]    seed_g = mixSeed(seed_f, "galaxy_" + gId)
           └── Star [0..7] seed_s = mixSeed(seed_g, "star_" + sId)
                └── Planet [0..4]  seed_p = mixSeed(seed_s, "planet_" + pId)
                     ├── Chemistry & Biosphere (Phylogenetic Tree clades)
                     ├── Civilization & Religion
                     └── Avatar Creature (seed_c = mixSeed(seed_u, "avatar_creature"))
```

### Statistical vs. Detailed Consistency (`_reconcileUniverseAggregates`)
Each parent container (`Universe`, `Filament`, `Galaxy`, `Star`) maintains a `.stats` aggregate summary (`activeStarsCount`, `habitableWorldsCount`, `livingWorldsCount`, `civilizationsCount`, `totalBiomass`, `totalLuminositySolar`, `meanMetallicityZ`). Whenever the simulation steps or changes zoom (`setZoomMeters`), `_reconcileUniverseAggregates()` computes each parent's `.stats` bottom-up from the exact state of its children. As verified in `tests/lod-consistency.js`:
1. Zooming from Planet ($10^7\text{ m}$) out to Cosmic Web ($10^{24}\text{ m}$), to Singularity ($10^{27}\text{ m}$), down to Creature ($2\text{ m}$), and back to Planet ($10^7\text{ m}$) yields bit-identical planet, biosphere, and universe hashes.
2. Every parent's statistical aggregate equals the exact sum of its detailed child entities.

---

## 3. Scale-by-Scale Simulation Models

| Scale | Spatial Span | Simulation & Rendering Model |
| :--- | :--- | :--- |
| **0. Creation / Singularity** | $10^{27}\text{ m}$ (`100 Gpc`) | Computes cosmic structure ratio $\Gamma = \frac{G(0.4 + 0.6\Omega_{\text{dm}})\sigma_8}{\max(0.1, H_0)}$ and classifies cosmos into `fertile`, `big_rip_dispersed`, `big_crunch`, or `sterile`. |
| **1. Cosmic Web** | $10^{24}\text{ m}$ (`32 Mpc`) | WebGL2 `RGBA32F` ping-pong Framebuffer Object (`FS_PM_STEP`) integrates dark-matter macro-particles on the GPU alongside 6 virialized filament halos and Voronoi filament walls. |
| **2. Galactic Halo** | $10^{21}\text{ m}$ (`32 kpc`) | Analytical star-formation rate $\text{SFR}(t) \propto \varepsilon_{\text{sfr}} (t/\tau)\exp(-t/\tau_d)$, halo mergers converting `Spiral` galaxies into `Elliptical` galaxies, and global metallicity enrichment $Z$. |
| **3. Stellar Nursery & H-R** | $10^{18}\text{ m}$ (`32 pc`) | Salpeter-inspired Initial Mass Function; main-sequence lifetime $\tau_{\text{MS}} = 10 M^{-2.1}\text{ Gyr}$, $L \propto M^{3.5}$, $T_{\text{eff}} = 5778 M^{0.505}\text{ K}$. Stars with $M \ge 8 M_\odot$ undergo core-collapse supernovae, enriching galactic $Z$ and unlocking rocky planet formation. |
| **4. Planetary System** | $10^{13}\text{ m}$ (`67 AU`) | Titius–Bode orbital spacing, circumstellar habitable zone $[0.72\sqrt{L}, 1.48\sqrt{L}]\text{ AU}$, planet classification (`Molten Rocky`, `Rocky Terrestrial`, `Gas Giant`, `Ice World`), and Dyson Swarm megastructure rings. |
| **5. Planetary Globe** | $10^{7}\text{ m}$ (`10,000 km`) | 3D raymarched sphere in WebGL2 with Voronoi tectonic plates, ocean specular reflection, polar caps, drifting FBM cloud deck, Rayleigh atmosphere rim, and night-side civilization city lights. |
| **6. Biosphere & Chemistry** | $10^{4}\text{ m}$ (`10 km`) | 3-stage prebiotic reaction network (`monomers → polymers → autocatalytic ribozymes`) modulated by $Z$, $\alpha_{\text{chem}}$, and per-planet hydrothermal catalysis. Crosses into open-ended bitstring genome evolution, multicellularity, food webs, and bolide mass extinctions with Lazarus clade recovery. |
| **7. Minds & Civilizations** | $10^{2}\text{ m}$ (`100 m`) | Emerges when a multicellular lineage crosses `intelligence >= 0.42`. Tracks `techLevel` (1–9.9), settlements, culture, religion (`Agnostic Wonder`, `Devout Love`, `Dependent Adoration`, `Dread & Appeasement`, `Forgotten Myth`), Dyson swarms (`Tech >= 7`), colonizing probes (`Tech >= 8`), and direct messages to the God (`Tech >= 8`). |
| **8. The Avatar Creature** | $2\text{ m}$ (`2 m`) | Embodied companion combining a tabular Q-learning matrix (`4 contexts × 9 actions`) with a 2-layer `tanh` neural policy updated online from player strokes (`+1`), slaps (`-1`), and miracle imitation. |

---

## 4. Timeline Scrubbing, Branching & Cartridge Serialization

- **Deterministic Replay (`scrubTo`):** Rewinding to $t_{\text{target}}$ resets the universe to $t = 0$ with the same `(seed, constants)` and replays fixed $0.1\text{ Gyr}$ steps up to $t_{\text{target}}$, re-applying recorded actions at their exact timestamps.
- **Timeline Branching (`forkBranch`, `compareWithBranch`):** Snapshots the current `(seed, constants, actionLog)` into `sim.branches[]` so subsequent interventions diverge cleanly and can be compared side-by-side at any future epoch.
- **Cartridge Format (`serializeCartridge`):** Encodes `{ v: 1, seed, constants, timeGyr, actionLog }` into a compact Base64 string (~150–400 bytes) that can be shared via URL hash (`#cartridge=...`) or embedded into a self-contained `.html` file via `window.__INITIAL_CARTRIDGE__`.
