#!/usr/bin/env node
/**
 * tests/headless.js
 * Extracts the simulation core directly from index.html (zero duplicated code)
 * and runs/exports it in Node.js.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadStellaCoreFromHtml() {
  const candidates = [
    path.resolve(__dirname, '../index.html'),
    path.resolve(__dirname, '../artifacts/file_generation/ttl=63d/output/index.html')
  ];
  let htmlPath = candidates.find(p => fs.existsSync(p));
  if (!htmlPath) {
    throw new Error('Could not find index.html in workspace root or output directory.');
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const startMarker = '/* === STELLA_CORE_START === */';
  const endMarker = '/* === STELLA_CORE_END === */';
  const sIdx = html.indexOf(startMarker);
  const eIdx = html.indexOf(endMarker);

  if (sIdx === -1 || eIdx === -1 || eIdx <= sIdx) {
    throw new Error('Could not locate STELLA_CORE_START / STELLA_CORE_END markers inside index.html');
  }

  const coreSource = html.slice(sIdx, eIdx + endMarker.length);
  const sandbox = {
    module: { exports: {} },
    exports: {},
    Buffer,
    console,
    Math,
    Number,
    String,
    Array,
    Object,
    JSON
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(coreSource, sandbox, { filename: 'index.html#stella-simulation-core' });

  return sandbox.module.exports || sandbox.StellaCore;
}

const StellaCore = loadStellaCoreFromHtml();
module.exports = StellaCore;

if (require.main === module) {
  console.log('=== STELLA MAXIMA: HEADLESS EXTRACTION SMOKE TEST ===');
  const sim = new StellaCore.UniverseSimulation({ seed: 'HEADLESS-TEST-1' });
  sim.step(3.5);
  const snap = sim.getSummarySnapshot();
  console.log('Extracted StellaCore from index.html successfully.');
  console.log('Snapshot @ 3.5 Gyr:', JSON.stringify(snap, null, 2));
  if (snap.activeStars <= 0 || snap.livingWorlds <= 0 || snap.civilizations <= 0) {
    console.error('FAIL: Default universe did not produce stars, life, and civilizations by 3.5 Gyr.');
    process.exit(1);
  }
  console.log('PASS: Headless simulation core verified.');
}
