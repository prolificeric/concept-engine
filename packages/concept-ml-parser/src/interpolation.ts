import { Concept, filterUniqueConcepts } from './concepts';
import { parseConcepts } from './expansion';

export type ConceptSetSource = string | string[] | Concept | Concept[];

export interface VariableInterpolationDict {
  [key: string]: ConceptSetSource;
}

export const interpolateToConcept = (
  source: ConceptSetSource,
  variables: VariableInterpolationDict,
): Concept | null => {
  return interpolateToConcepts(source, variables)[0] || null;
};

export const interpolateToConcepts = (
  source: ConceptSetSource,
  variables: VariableInterpolationDict,
): Concept[] => {
  const interpolatedSource = toConcepts(source)
    .map((concept) => {
      if (concept.isVariable()) {
        const value = variables[concept.key];

        if (!value) {
          return concept.key;
        }

        const joinedKeys = toConcepts(value)
          .map((c) => c.key)
          .join(',');

        return `[${joinedKeys}]`;
      }

      if (concept.isAtom()) {
        return concept.key;
      }

      return concept.parts
        .map((part) => {
          const recursed = interpolateToConcepts(part, variables);
          return `[${recursed.map((c) => c.key).join(',')}]`;
        })
        .join(' ');
    })
    .join(',');

  return parseConcepts(interpolatedSource);
};

export const toConcepts = (source: ConceptSetSource): Concept[] => {
  if (Array.isArray(source)) {
    return filterUniqueConcepts(source.flatMap(toConcepts));
  }

  if (source instanceof Concept) {
    return [source];
  }

  if (typeof source === 'string') {
    return parseConcepts(source);
  }

  return [];
};
