import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assembleResultCopy } from '../ai-quiz/js/content-loader.js';

const archetypes = JSON.parse(readFileSync(new URL('../ai-quiz/content/archetypes.json', import.meta.url)));
const drift = JSON.parse(readFileSync(new URL('../ai-quiz/content/drift-caveats.json', import.meta.url)));

test('assembleResultCopy returns shell, grade-delta, no caveat for clean Pioneer A', () => {
  const result = { archetype: 'pioneer', grade: 'A', driftFlag: false };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.shell, /Pioneer/);
  assert.match(copy.gradeDelta, /both-and/);
  assert.equal(copy.driftCaveat, null);
  assert.equal(copy.label, 'Pioneer');
});

test('Pioneer with drift gets pioneer_drift caveat', () => {
  const result = { archetype: 'pioneer', grade: 'B', driftFlag: true };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.driftCaveat, /worthy-successor/);
});

test('Non-Pioneer with drift gets general_drift caveat', () => {
  const result = { archetype: 'watchman', grade: 'A', driftFlag: true };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.driftCaveat, /moral status seriously/);
});

test('all 5 archetypes × 5 grades resolve without throwing', () => {
  for (const arche of ['watchman', 'steward', 'builder', 'pioneer', 'preservationist']) {
    for (const grade of ['A', 'B', 'C', 'D', 'F']) {
      const copy = assembleResultCopy({ archetype: arche, grade, driftFlag: false }, archetypes, drift);
      assert.ok(copy.shell, `${arche}/${grade} missing shell`);
      assert.ok(copy.gradeDelta, `${arche}/${grade} missing grade delta`);
      assert.ok(copy.whatsNext.practice, `${arche}/${grade} missing whatsNext.practice`);
    }
  }
});

test('unknown archetype throws', () => {
  assert.throws(() => assembleResultCopy({ archetype: 'nope', grade: 'A', driftFlag: false }, archetypes, drift));
});

test('unknown grade throws', () => {
  assert.throws(() => assembleResultCopy({ archetype: 'pioneer', grade: 'Z', driftFlag: false }, archetypes, drift));
});
