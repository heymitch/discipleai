// Pure scoring engine for the AI Church Leadership Quiz.
// No DOM, no fetch, no globals. Unit-testable in isolation.
//
// Inputs: { q1..q10: archetype-key, q11: imago-or-drift-key }
// Output: { archetype, coherence, dimensionBreadth, monocultureFlag, driftFlag,
//           grade, dimensionGrades }

export const ARCHETYPES = ['watchman', 'steward', 'builder', 'pioneer', 'preservationist'];

export const DIMENSIONS = [
  'theological_clarity',
  'pastoral_integrity',
  'operational_alignment',
  'cultural_discernment',
  'discipleship_formation',
];

const QUESTION_TO_DIMENSION = {
  q1: 'theological_clarity',     q2: 'theological_clarity',
  q3: 'pastoral_integrity',      q4: 'pastoral_integrity',
  q5: 'operational_alignment',   q6: 'operational_alignment',
  q7: 'cultural_discernment',    q8: 'cultural_discernment',
  q9: 'discipleship_formation', q10: 'discipleship_formation',
};

const DIMENSION_QUESTION_IDS = Object.keys(QUESTION_TO_DIMENSION);

export function scoreQuiz(answers) {
  const dimensionAnswers = pluck(answers, DIMENSION_QUESTION_IDS);
  const archetype = primaryArchetype(dimensionAnswers, answers);
  const coherence = computeCoherence(dimensionAnswers, archetype);
  const dimensionBreadth = computeBreadth(dimensionAnswers, archetype);
  const monocultureFlag = coherence >= 0.9;
  const driftFlag = answers.q11 === 'drift';
  const grade = computeGrade({ coherence, dimensionBreadth, monocultureFlag, driftFlag, archetype });
  const dimensionGrades = computeDimensionGrades(dimensionAnswers, archetype);

  return {
    archetype,
    coherence: Number(coherence.toFixed(2)),
    dimensionBreadth: Number(dimensionBreadth.toFixed(2)),
    monocultureFlag,
    driftFlag,
    grade,
    dimensionGrades,
  };
}

function pluck(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function primaryArchetype(dimensionAnswers, allAnswers) {
  const counts = Object.fromEntries(ARCHETYPES.map(a => [a, 0]));
  for (const v of Object.values(dimensionAnswers)) {
    if (counts[v] !== undefined) counts[v] += 1;
  }
  const max = Math.max(...Object.values(counts));
  const winners = ARCHETYPES.filter(a => counts[a] === max);
  if (winners.length === 1) return winners[0];

  // Tie-break 1: Q1
  if (winners.includes(allAnswers.q1)) return allAnswers.q1;

  // Tie-break 2: highest dimension breadth among tied
  const breadthByArchetype = Object.fromEntries(
    winners.map(a => [a, computeBreadth(dimensionAnswers, a)])
  );
  const topBreadth = Math.max(...Object.values(breadthByArchetype));
  const breadthWinners = winners.filter(a => breadthByArchetype[a] === topBreadth);
  if (breadthWinners.length === 1) return breadthWinners[0];

  // Tie-break 3: Q11 archetype tilt
  const q11Tilt = { imago_pioneer: 'pioneer', imago_e: 'preservationist' };
  const tilted = q11Tilt[allAnswers.q11];
  if (tilted && breadthWinners.includes(tilted)) return tilted;

  // Deterministic fallback: alphabetical
  return [...breadthWinners].sort()[0];
}

function computeCoherence(dimensionAnswers, primary) {
  const matches = Object.values(dimensionAnswers).filter(v => v === primary).length;
  return matches / DIMENSION_QUESTION_IDS.length;
}

function computeBreadth(dimensionAnswers, primary) {
  const hitDimensions = new Set();
  for (const [qid, answer] of Object.entries(dimensionAnswers)) {
    if (answer === primary) hitDimensions.add(QUESTION_TO_DIMENSION[qid]);
  }
  return hitDimensions.size / DIMENSIONS.length;
}

function computeGrade({ coherence, dimensionBreadth, monocultureFlag, driftFlag, archetype }) {
  // Floor cases first
  if (coherence < 0.3) return 'F';
  if (coherence < 0.5) return 'D';

  // Caps
  if (monocultureFlag) return 'B';
  if (driftFlag && archetype === 'pioneer') return 'B';

  // Main grade tiers
  if (coherence >= 0.7 && dimensionBreadth >= 0.8) return driftFlag ? 'B' : 'A';
  if (coherence >= 0.5 && dimensionBreadth >= 0.6) return driftFlag ? 'C' : 'B';
  return driftFlag ? 'C' : 'C';
}

function computeDimensionGrades(dimensionAnswers, primary) {
  const out = {};
  for (const dim of DIMENSIONS) {
    const inDim = Object.entries(dimensionAnswers).filter(([qid]) => QUESTION_TO_DIMENSION[qid] === dim);
    const matches = inDim.filter(([, v]) => v === primary).length;
    if (matches === 2) {
      out[dim] = 'A';
    } else if (matches === 1) {
      out[dim] = 'B';
    } else {
      const [a, b] = inDim.map(([, v]) => v);
      out[dim] = a === b ? 'C' : 'D';
    }
  }
  return out;
}
