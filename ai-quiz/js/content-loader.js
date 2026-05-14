// Pure copy assembler — given a scoring result + content data, returns the
// strings the result page should render.

export function assembleResultCopy(result, archetypesData, driftData) {
  const archetype = archetypesData.archetypes[result.archetype];
  if (!archetype) throw new Error(`unknown archetype: ${result.archetype}`);
  const gradeDelta = archetype.gradeDeltas[result.grade];
  if (!gradeDelta) throw new Error(`unknown grade: ${result.grade}`);

  let driftCaveat = null;
  if (result.driftFlag) {
    driftCaveat = result.archetype === 'pioneer'
      ? driftData.caveats.pioneer_drift
      : driftData.caveats.general_drift;
  }

  return {
    label: archetype.label,
    tagline: archetype.tagline,
    shell: archetype.shell,
    gradeDelta,
    driftCaveat,
    whatsNext: archetype.whatsNext,
  };
}

export async function loadResultContent() {
  const [archetypesRes, driftRes] = await Promise.all([
    fetch('./content/archetypes.json'),
    fetch('./content/drift-caveats.json'),
  ]);
  return {
    archetypes: await archetypesRes.json(),
    drift: await driftRes.json(),
  };
}
