import { Concept, getConceptsDeep } from './concepts';

export type VariableMatchMap = Map<string, Concept>;

export type VariableDict = Record<string, Concept>;

export const matchPattern = (
  concept: Concept,
  pattern: Concept,
): VariableMatchMap | null => {
  const matches: VariableMatchMap = new Map();

  if (pattern.isVariable()) {
    matches.set(pattern.key, concept);
    return matches;
  }

  if (!pattern.isPattern()) {
    if (pattern.key !== concept.key) {
      return null;
    }

    return matches;
  } else if (pattern.parts.length !== concept.parts.length) {
    return null;
  }

  for (let i = 0; i < pattern.parts.length; i += 1) {
    const patternPart = pattern.parts[i];
    const conceptPart = concept.parts[i];
    const submatches = matchPattern(conceptPart, patternPart);

    if (!submatches) {
      return null;
    }

    submatches.forEach((value, key) => {
      matches.set(key, value);
    });
  }

  return matches;
};

export const extractVariables = (
  concept: Concept,
  pattern: Concept,
): VariableDict | null => {
  const matches = matchPattern(concept, pattern);
  return matches && Object.fromEntries(matches);
};

export const getPatternVariables = (
  pattern: Concept | Concept[],
): Concept[] => {
  return getConceptsDeep([pattern].flat()).filter((c) => c.isVariable());
};
