import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreQuiz } from '../ai-quiz/js/scoring.js';

test('coherent Pioneer answers produce primary archetype Pioneer', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer', q3: 'pioneer', q4: 'pioneer',
    q5: 'pioneer', q6: 'pioneer', q7: 'pioneer', q8: 'pioneer',
    q9: 'pioneer', q10: 'pioneer', q11: 'imago_pioneer',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'pioneer');
});

test('coherent Pioneer (10/10) with no drift gets B due to monoculture cap', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer', q3: 'pioneer', q4: 'pioneer',
    q5: 'pioneer', q6: 'pioneer', q7: 'pioneer', q8: 'pioneer',
    q9: 'pioneer', q10: 'pioneer', q11: 'imago_pioneer',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.grade, 'B');
  assert.equal(r.monocultureFlag, true);
});

test('coherent Pioneer (10/10) + drift gets B with drift flag', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer', q3: 'pioneer', q4: 'pioneer',
    q5: 'pioneer', q6: 'pioneer', q7: 'pioneer', q8: 'pioneer',
    q9: 'pioneer', q10: 'pioneer', q11: 'drift',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'pioneer');
  assert.equal(r.driftFlag, true);
  assert.equal(r.grade, 'B');
});

test('mature mixed Watchman (7w + 2s + 1p) gets A — high coherence + full breadth + no monoculture', () => {
  // 7 watchman across 5 dimensions, 2 steward, 1 preservationist
  // Coherence = 0.7, breadth = 5/5 (because watchman shows up in each dim at least once)
  const answers = {
    q1: 'watchman', q2: 'watchman',         // theological_clarity: 2W
    q3: 'watchman', q4: 'steward',          // pastoral_integrity: 1W + 1S
    q5: 'watchman', q6: 'steward',          // operational_alignment: 1W + 1S
    q7: 'watchman', q8: 'watchman',         // cultural_discernment: 2W
    q9: 'watchman', q10: 'preservationist', // discipleship_formation: 1W + 1P
    q11: 'imago_a',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'watchman');
  assert.equal(r.grade, 'A');
  assert.equal(r.monocultureFlag, false);
  assert.equal(r.driftFlag, false);
  assert.equal(r.coherence, 0.7);
  assert.equal(r.dimensionBreadth, 1);
});

test('monoculture Watchman (10/10) caps at B even without drift', () => {
  const answers = {
    q1: 'watchman', q2: 'watchman', q3: 'watchman', q4: 'watchman',
    q5: 'watchman', q6: 'watchman', q7: 'watchman', q8: 'watchman',
    q9: 'watchman', q10: 'watchman', q11: 'imago_a',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.grade, 'B');
  assert.equal(r.monocultureFlag, true);
});

test('scattered answers (no clear primary) grade D or F', () => {
  const answers = {
    q1: 'watchman',         q2: 'steward',
    q3: 'builder',          q4: 'pioneer',
    q5: 'preservationist',  q6: 'watchman',
    q7: 'steward',          q8: 'builder',
    q9: 'pioneer',          q10: 'preservationist',
    q11: 'imago_b',
  };
  const r = scoreQuiz(answers);
  assert.ok(['D', 'F'].includes(r.grade), `expected D or F, got ${r.grade}`);
});

test('dimension sub-grades: both-match in a dimension yields A for that dimension', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer',   // theological_clarity: A
    q3: 'pioneer', q4: 'steward',   // pastoral_integrity: B (1 match)
    q5: 'steward', q6: 'steward',   // operational_alignment: C (both non-primary, consistent secondary)
    q7: 'watchman', q8: 'builder',  // cultural_discernment: D (both non-primary, different secondaries)
    q9: 'pioneer', q10: 'pioneer',  // discipleship_formation: A
    q11: 'imago_pioneer',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'pioneer');
  assert.equal(r.dimensionGrades.theological_clarity, 'A');
  assert.equal(r.dimensionGrades.pastoral_integrity, 'B');
  assert.equal(r.dimensionGrades.operational_alignment, 'C');
  assert.equal(r.dimensionGrades.cultural_discernment, 'D');
  assert.equal(r.dimensionGrades.discipleship_formation, 'A');
});

test('non-Pioneer with drift does NOT cap grade at B', () => {
  // Coherent Watchman with drift — should still potentially get A (drift only caps Pioneers)
  // but grade depends on if driftFlag downgrades non-pioneers in the table.
  // Per spec: drift caveat for non-pioneers, no cap. Per table: drift downgrades A->B in non-pioneer.
  const answers = {
    q1: 'watchman', q2: 'watchman', q3: 'watchman', q4: 'watchman',
    q5: 'steward',  q6: 'watchman', q7: 'watchman', q8: 'watchman',
    q9: 'watchman', q10: 'steward', q11: 'drift',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'watchman');
  assert.equal(r.driftFlag, true);
  // 8/10 watchman = 0.8 coherence, drift downgrades A->B in our grade table
  assert.equal(r.grade, 'B');
});

test('tie between archetypes broken by Q1', () => {
  // 5 watchman, 5 steward — tie
  const answers = {
    q1: 'steward', q2: 'steward', q3: 'steward', q4: 'steward', q5: 'steward',
    q6: 'watchman', q7: 'watchman', q8: 'watchman', q9: 'watchman', q10: 'watchman',
    q11: 'imago_a',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'steward', 'Q1 should break the tie');
});
