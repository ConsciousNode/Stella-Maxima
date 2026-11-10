#!/usr/bin/env node
/**
 * tests/creature.js
 * Verifies that the Avatar Creature's in-browser RL (Q-table + 2-layer MLP policy)
 * and miracle imitation learning measurably change its autonomous behavior.
 */

'use strict';

const assert = require('assert');
const { AvatarCreature, PRNG, ACTION_VALENCE } = require('./headless.js');

console.log('=== STELLA MAXIMA: AVATAR CREATURE LEARNING & IMITATION TEST ===');

const untrained = new AvatarCreature(9001);
const benevolentTrained = new AvatarCreature(9001);
const cruelTrained = new AvatarCreature(9001);

// 1. Train benevolentTrained via stroke (+1.0) on pro-social actions and benevolent miracle observation
for (let i = 0; i < 18; i++) {
  benevolentTrained.reinforce(+1.0, 'village_near', 'help_villagers');
  benevolentTrained.reinforce(+1.0, 'hungry', 'share_food');
  benevolentTrained.observeMiracle('heal');
}

// 2. Train cruelTrained via stroke (+1.0) on destructive actions and punishing pro-social actions + cruel miracle observation
for (let i = 0; i < 18; i++) {
  cruelTrained.reinforce(+1.0, 'village_near', 'throw_boulder');
  cruelTrained.reinforce(+1.0, 'hungry', 'devour_villager');
  cruelTrained.reinforce(-1.0, 'village_near', 'help_villagers');
  cruelTrained.observeMiracle('smite');
}

const pUntrained = untrained.getBenevolentProbability('village_near');
const pBenevolent = benevolentTrained.getBenevolentProbability('village_near');
const pCruel = cruelTrained.getBenevolentProbability('village_near');

console.log(`Benevolent Action Probability (context="village_near"):`);
console.log(`  Untrained Baseline : ${(pUntrained * 100).toFixed(2)}% (Alignment: ${untrained.alignment.toFixed(2)})`);
console.log(`  Benevolent-Trained : ${(pBenevolent * 100).toFixed(2)}% (Alignment: ${benevolentTrained.alignment.toFixed(2)})`);
console.log(`  Cruel-Trained      : ${(pCruel * 100).toFixed(2)}% (Alignment: ${cruelTrained.alignment.toFixed(2)})`);

// Run 200 autonomous rollouts on each creature and count actual kind vs cruel acts
function rolloutCount(creature, steps = 200) {
  const rng = new PRNG(12345);
  let kindActs = 0;
  let cruelActs = 0;
  for (let i = 0; i < steps; i++) {
    const act = creature.chooseAction('village_near', rng);
    if (ACTION_VALENCE[act] > 0) kindActs++;
    else cruelActs++;
  }
  return { kindActs, cruelActs, kindRatio: kindActs / steps };
}

const rUntrained = rolloutCount(untrained.clone());
const rBenevolent = rolloutCount(benevolentTrained.clone());
const rCruel = rolloutCount(cruelTrained.clone());

console.log(`\n200-Step Autonomous Behavior Rollout:`);
console.log(`  Untrained          : ${rUntrained.kindActs} kind / ${rUntrained.cruelActs} cruel (${(rUntrained.kindRatio * 100).toFixed(1)}% kind)`);
console.log(`  Benevolent-Trained : ${rBenevolent.kindActs} kind / ${rBenevolent.cruelActs} cruel (${(rBenevolent.kindRatio * 100).toFixed(1)}% kind)`);
console.log(`  Cruel-Trained      : ${rCruel.kindActs} kind / ${rCruel.cruelActs} cruel (${(rCruel.kindRatio * 100).toFixed(1)}% kind)`);

assert.ok(pBenevolent > pUntrained + 0.25, 'Benevolent training must substantially increase benevolent action probability');
assert.ok(pCruel < pUntrained - 0.25, 'Cruel training must substantially decrease benevolent action probability');
assert.ok(rBenevolent.kindRatio > 0.85, 'Benevolent-trained creature should act benevolently >85% of the time');
assert.ok(rCruel.kindRatio < 0.20, 'Cruel-trained creature should act benevolently <20% of the time');

console.log('\nPASS: Creature RL + Neural Policy + Imitation learning verified.');
