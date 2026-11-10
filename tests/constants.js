#!/usr/bin/env node
/**
 * tests/constants.js
 * Sweeps the creation constants across presets and parameter combinations,
 * recording a table of "What Physics Allows" (stars, rocky habitable planets, life, minds).
 */

'use strict';

const assert = require('assert');
const { UniverseSimulation, CREATION_PRESETS } = require('./headless.js');

console.log('=== STELLA MAXIMA: CREATION CONSTANTS SWEEP ("WHAT PHYSICS ALLOWS") ===\n');

const sweepCases = [
  { key: 'default', label: 'Standard ΛCDM (Default)', constants: CREATION_PRESETS.default, testTimeGyr: 4.5 },
  { key: 'hyper_fertile', label: 'Edenic Super-Web', constants: CREATION_PRESETS.hyper_fertile, testTimeGyr: 4.5 },
  { key: 'big_rip', label: 'Runaway Dark Energy (Big Rip)', constants: CREATION_PRESETS.big_rip, testTimeGyr: 4.5 },
  { key: 'sterile_metal_poor', label: 'Carbon-Starved (Low Chemistry)', constants: CREATION_PRESETS.sterile_metal_poor, testTimeGyr: 4.5 },
  { key: 'big_crunch_early', label: 'Hyper-Gravity (Mid-Epoch 3.0 Gyr)', constants: CREATION_PRESETS.big_crunch, testTimeGyr: 3.0 },
  { key: 'big_crunch_late', label: 'Hyper-Gravity (Late Crunch 7.2 Gyr)', constants: CREATION_PRESETS.big_crunch, testTimeGyr: 7.2 }
];

const results = [];

console.log(
  '| Preset / Physics Regime          | Regime             | Stars | Habitable | Living | Minds (Civs) | Outcome                          |'
);
console.log(
  '|----------------------------------|--------------------|-------|-----------|--------|--------------|----------------------------------|'
);

for (const c of sweepCases) {
  const sim = new UniverseSimulation({ seed: 'CONST-SWEEP-2026', constants: c.constants });
  sim.step(c.testTimeGyr);
  const snap = sim.getSummarySnapshot();

  let outcome = 'Fertile (Minds Arise)';
  if (snap.activeStars === 0 && snap.regime === 'big_rip_dispersed') outcome = 'Honest Failure: Starless Void';
  else if (snap.activeStars === 0 && snap.regime === 'big_crunch') outcome = 'Honest Failure: Big Crunch Collapse';
  else if (snap.livingWorlds === 0) outcome = 'Honest Failure: Abiotic / Sterile';
  else if (snap.civilizations === 0) outcome = 'Biospheres Only';

  results.push({ key: c.key, snap, outcome });

  console.log(
    `| ${c.label.padEnd(32)} | ${snap.regime.padEnd(18)} | ${String(snap.activeStars).padStart(5)} | ${String(snap.habitableWorlds).padStart(9)} | ${String(snap.livingWorlds).padStart(6)} | ${String(snap.civilizations).padStart(12)} | ${outcome.padEnd(32)} |`
  );
}

// Verify required acceptance criteria on physics regimes
const defRes = results.find(r => r.key === 'default').snap;
const ripRes = results.find(r => r.key === 'big_rip').snap;
const sterileRes = results.find(r => r.key === 'sterile_metal_poor').snap;
const crunchLate = results.find(r => r.key === 'big_crunch_late').snap;

assert.ok(defRes.activeStars > 0 && defRes.habitableWorlds > 0 && defRes.livingWorlds > 0 && defRes.civilizations > 0, 'Default constants must produce stars, planets, life, and civilizations');
assert.strictEqual(ripRes.activeStars, 0, 'Big Rip bad-constants preset must produce zero stars');
assert.ok(sterileRes.activeStars > 0 && sterileRes.livingWorlds === 0, 'Sterile preset must form stars without life');
assert.strictEqual(crunchLate.activeStars, 0, 'Big Crunch preset must collapse all stars into black holes at crunch epoch');

console.log('\nPASS: Creation constants sweep verified fertile and honest-failure universes.');
