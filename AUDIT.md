# AUDIT: Stella Maxima, the "is the life real?" pass

**Auditor:** Kehai Interim (Claude Opus 5.5) · **Date:** 2026-11-10
**Audited commit:** the as-delivered commit, which is the parent of the commit that adds this file.

The question was whether minds in this universe evolve or get handed out. The short answer: life is real, but most civilizations were handed out on a timer. One extinction event was also scripted on every world. Both are fixed in this commit.

## What holds up

- **The census is honest.** Across five seeds (`STELLA-2026`, `A`–`D`, stepped to 6 Gyr), a direct recount of every non-collapsed civilization matched the census exactly. No live civilization orbits a non-main-sequence star.
- **All five suites pass,** before and after the fixes: `constants`, `creature`, `determinism`, `headless` and `lod-consistency`.
- **The creation constants really do steer outcomes.** Big Rip gives a void, low chemistry gives a sterile universe, and Big Crunch gives life that never gets time.

## Finding 1: sapience on a timer (fixed)

The civilization-founding rule in `_stepBiosphere` was:

```js
child.intelligence >= 0.42 || (bio.phyloTree.length >= 6 && t >= 2.6)
```

followed by `child.intelligence = Math.max(0.55, child.intelligence)`. That second line raised the founder's recorded intelligence after the fact, so a clock-founded civilization looked as though it had earned it.

Measured with the founding rule instrumented, stepped to 6 Gyr:

| Seed | Civs founded | By intelligence | By clock | Median founder intelligence |
|---|---|---|---|---|
| STELLA-2026 | 175 | 16 | 159 | 0.202 |
| A | 179 | 13 | 166 | 0.204 |
| B | 184 | 16 | 168 | 0.197 |
| C | 174 | 8 | 166 | 0.201 |
| D | 181 | 11 | 170 | 0.191 |

Across these five seeds, **91% of civilizations came from the clock**, founded by species at about 0.2 intelligence. REPORT.md's honesty table doesn't mention this rule.

**Fix:** the founding rule is now only `child.intelligence >= 0.42`, and the founder's intelligence is recorded as evolved. Results on seed STELLA-2026:

| Preset | 3 Gyr (living / civ) | 6 Gyr | 10 Gyr |
|---|---|---|---|
| default | 131 / 3 | 169 / 76 | 141 / 123 |
| hyper_fertile | 179 / 96 | 186 / 181 | 185 / 185 |
| big_rip | 0 / 0 | 0 / 0 | 0 / 0 |
| big_crunch | 11 / 0 | 123 / 0 | 0 / 0 |
| sterile_metal_poor | 0 / 0 | 0 / 0 | 0 / 0 |

Minds still arise, but now at a rate set by the constants. A default universe climbs slowly, while hyper-fertile saturates early.

## Finding 2: one scripted asteroid per world (fixed)

The natural "Chicxulub-class bolide" fired on every world with 3+ species, exactly once, between 2.1 and 2.5 Gyr: 73–90 identical impacts per universe. The code comment says "on primary world," but the code applied it everywhere.

**Fix:** impacts are now a Poisson process with `BOLIDE_RATE_PER_GYR = 0.4`. Each 0.1 Gyr step rolls against that rate using the simulation's seeded RNG, so determinism holds. Over 10 Gyr on the default preset, the number of hits per world now spreads from 1 to 7 (mode 2), and some worlds are never hit. The rate is a single constant, so it can be tuned or made into a creation dial.

## Not fixed: notes for a later pass

- **Habitability survives its star.** In the late Big Crunch row (7.2 Gyr) there are 0 active stars but 254 "habitable" worlds. `inHabitableZone` is set at formation and never re-evaluated against a dead host. It doesn't create false life (the living count is 0), but the census label overstates.
- **The primary solar star's planet 1 is placed in the habitable zone on purpose** ("so habitable worlds can arise if physics permits"). That's a defensible design choice, since it keeps the focused world interesting, but REPORT.md should state it.
- **Determinism hashes changed** because the bolide roll consumes RNG draws. The tests compute their expectations live, so they still pass, but any hash recorded before this commit (in a shared link or cartridge) will replay differently.
