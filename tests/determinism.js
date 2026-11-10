#!/usr/bin/env node
/**
 * tests/determinism.js
 * Verifies strict bit-identical determinism across two independent runs,
 * across all scales, after timeline rewind (scrubTo), and after timeline branching.
 */

'use strict';

const assert = require('assert');
const { UniverseSimulation } = require('./headless.js');

console.log('=== STELLA MAXIMA: DETERMINISM, REWIND & BRANCH VERIFICATION ===');

const sharedConfig = {
  seed: 'DETERMINISM-OMEGA-99',
  constants: {
    gravity: 1.05,
    expansion: 0.98,
    lumpiness: 1.1,
    darkMatter: 0.85,
    chemistryRichness: 1.15,
    starEfficiency: 1.05
  },
  actionLog: [
    { type: 'miracle', miracleId: 'rain', timeGyr: 0.8, filamentId: 0, galaxyId: 0, starId: 0, planetId: 1 },
    { type: 'miracle', miracleId: 'inspire', timeGyr: 2.2, filamentId: 0, galaxyId: 0, starId: 0, planetId: 1 },
    { type: 'hand', handAction: 'stroke_creature', timeGyr: 2.6, filamentId: 0, galaxyId: 0, starId: 0, planetId: 1, context: 'village_near', creatureAction: 'help_villagers' }
  ]
};

const simA = new UniverseSimulation(sharedConfig);
const simB = new UniverseSimulation(sharedConfig);

const checkpoints = [0.5, 1.0, 1.5, 2.5, 3.5, 5.0];
const recordedHashes = {};

for (const t of checkpoints) {
  const dt = t - simA.timeGyr;
  simA.step(dt);
  simB.step(dt);

  const hashA = simA.getStateHash();
  const hashB = simB.getStateHash();
  recordedHashes[t] = hashA;

  console.log(`Checkpoint t = ${t.toFixed(1)} Gyr | Run A Hash: ${hashA} | Run B Hash: ${hashB}`);
  assert.strictEqual(hashA, hashB, `Determinism mismatch at t=${t}`);
}

// Verify exact rewind via scrubTo
console.log('\nTesting exact Timeline Rewind (scrubTo)...');
for (const rewindTarget of [1.5, 3.5, 0.5, 5.0]) {
  const rewoundHash = simA.scrubTo(rewindTarget);
  console.log(`Rewound to t = ${rewindTarget.toFixed(1)} Gyr | Hash: ${rewoundHash} | Expected: ${recordedHashes[rewindTarget]}`);
  assert.strictEqual(rewoundHash, recordedHashes[rewindTarget], `Rewind hash mismatch at t=${rewindTarget}`);
}

// Verify timeline branching & side-by-side comparison
console.log('\nTesting Timeline Branching & Divergence...');
simA.scrubTo(2.0);
const branch = simA.forkBranch('Pre-Smite Branch');
simA.castMiracle('smite');
simA.step(1.5); // Now at t = 3.5 Gyr with a smite at 2.0 Gyr

const comparison = simA.compareWithBranch(0, 3.5);
console.log(`Branch Comparison @ 3.5 Gyr: Current Hash=${comparison.current.hash} (Align=${comparison.current.alignment}) vs Branch Hash=${comparison.branch.hash} (Align=${comparison.branch.alignment})`);
assert.notStrictEqual(comparison.current.hash, comparison.branch.hash, 'Meddled branch must diverge from un-meddled branch');
assert.ok(comparison.current.alignment < comparison.branch.alignment, 'Smite must lower current timeline alignment relative to branch');

console.log('PASS: All determinism, rewind, and branching checks succeeded.');
