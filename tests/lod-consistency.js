#!/usr/bin/env node
/**
 * tests/lod-consistency.js
 * Verifies Level-of-Detail (LOD) consistency:
 * 1. Zooming in -> out -> in yields the exact same galaxy, star, planet, species, and state hash.
 * 2. Detailed child sums match the statistical aggregates stored on every parent scale.
 */

'use strict';

const assert = require('assert');
const { UniverseSimulation, SCALES } = require('./headless.js');

console.log('=== STELLA MAXIMA: LOD CONSISTENCY & HIERARCHICAL RECONCILIATION TEST ===');

const sim = new UniverseSimulation({ seed: 'LOD-INVARIANT-777' });
sim.step(3.8);

// 1. Zoom to Planet scale (Scale 5) and record detailed planet & biosphere state
sim.setZoomMeters(SCALES[5].meters, { filamentId: 0, galaxyId: 0, starId: 0, planetId: 1 });
const obsBefore = sim.getObservedLayerState();
const planetSnapBefore = JSON.stringify(obsBefore.planet);
const hashBefore = sim.getStateHash();

// 2. Zoom all the way out to Cosmic Web (Scale 1), then Singularity (Scale 0), then in to Creature (Scale 8), then back to Planet (Scale 5)
sim.setZoomMeters(SCALES[1].meters);
sim.setZoomMeters(SCALES[0].meters);
sim.setZoomMeters(SCALES[8].meters);
sim.setZoomMeters(SCALES[5].meters, { filamentId: 0, galaxyId: 0, starId: 0, planetId: 1 });

const obsAfter = sim.getObservedLayerState();
const planetSnapAfter = JSON.stringify(obsAfter.planet);
const hashAfter = sim.getStateHash();

assert.strictEqual(hashBefore, hashAfter, 'Universe hash changed after zooming out and back in');
assert.strictEqual(planetSnapBefore, planetSnapAfter, 'Detailed planet state changed after zooming out and back in');
console.log(`Zoom In -> Out -> In Invariance verified (Hash: ${hashAfter}, Planet: ${obsAfter.planet.name}, Species: ${obsAfter.planet.biosphere.phyloTree.length})`);

// 3. Verify that statistical aggregates at Universe, Filament, Galaxy, and Star levels equal the exact sum of their detailed children
let sumGalaxies = 0;
let sumActiveStars = 0;
let sumHabitable = 0;
let sumLiving = 0;
let sumCivs = 0;
let sumBiomass = 0;

for (const f of sim.filaments) {
  let fStars = 0, fHab = 0, fLiv = 0, fCiv = 0, fBio = 0;
  for (const g of f.galaxies) {
    let gStars = 0, gHab = 0, gLiv = 0, gCiv = 0, gBio = 0;
    for (const s of g.stars) {
      let sHab = 0, sLiv = 0, sCiv = 0, sBio = 0;
      for (const p of s.planets) {
        if (p.inHabitableZone) sHab++;
        if (p.biosphere.active) {
          sLiv++;
          sBio += p.biosphere.biomass;
        }
        if (p.civilization && !p.civilization.collapsed) sCiv++;
      }
      assert.strictEqual(s.stats.habitablePlanets, sHab, `Star ${s.name} habitable count mismatch`);
      assert.strictEqual(s.stats.livingPlanets, sLiv, `Star ${s.name} living count mismatch`);
      assert.strictEqual(s.stats.activeCivilizations, sCiv, `Star ${s.name} civ count mismatch`);
      assert.ok(Math.abs(s.stats.totalBiomass - sBio) < 1e-3, `Star ${s.name} biomass mismatch`);

      if (s.phase !== 'Protostar' && s.phase !== 'BlackHole') gStars++;
      gHab += sHab;
      gLiv += sLiv;
      gCiv += sCiv;
      gBio += sBio;
    }
    assert.strictEqual(g.stats.activeStarsCount, gStars, `Galaxy ${g.name} active stars mismatch`);
    assert.strictEqual(g.stats.habitableWorldsCount, gHab, `Galaxy ${g.name} habitable worlds mismatch`);
    assert.strictEqual(g.stats.livingWorldsCount, gLiv, `Galaxy ${g.name} living worlds mismatch`);
    assert.strictEqual(g.stats.civilizationsCount, gCiv, `Galaxy ${g.name} civ count mismatch`);

    sumGalaxies++;
    fStars += gStars;
    fHab += gHab;
    fLiv += gLiv;
    fCiv += gCiv;
    fBio += gBio;
  }
  assert.strictEqual(f.stats.activeStarsCount, fStars, `Filament ${f.name} active stars mismatch`);
  assert.strictEqual(f.stats.livingWorldsCount, fLiv, `Filament ${f.name} living worlds mismatch`);
  sumActiveStars += fStars;
  sumHabitable += fHab;
  sumLiving += fLiv;
  sumCivs += fCiv;
  sumBiomass += fBio;
}

assert.strictEqual(sim.stats.galaxyCount, sumGalaxies);
assert.strictEqual(sim.stats.activeStarsCount, sumActiveStars);
assert.strictEqual(sim.stats.habitableWorldsCount, sumHabitable);
assert.strictEqual(sim.stats.livingWorldsCount, sumLiving);
assert.strictEqual(sim.stats.civilizationsCount, sumCivs);
assert.ok(Math.abs(sim.stats.totalBiomass - sumBiomass) < 1e-2);

console.log(`Aggregate Reconciliation verified across ${sumGalaxies} galaxies, ${sumActiveStars} active stars, ${sumHabitable} habitable worlds, ${sumLiving} living worlds, and ${sumCivs} civilizations.`);
console.log('PASS: LOD consistency and aggregate reconciliation checks succeeded.');
