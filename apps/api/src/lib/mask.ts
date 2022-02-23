import md5 from 'md5';

import {
  Concept,
  isPattern,
  isVariable,
  parseConcepts,
} from '@creatureco/concept-ml-parser';

import { anti } from './filter';

export const createMask = (pattern: Concept): Concept => {
  const map = new Map<string, Concept>();

  const recurse = (pattern: Concept): Concept => {
    if (isVariable(pattern)) {
      const normalized =
        map.get(pattern.key) || Concept.createAtom('$' + map.size);

      map.set(pattern.key, normalized);

      return normalized;
    }

    if (isPattern(pattern)) {
      return Concept.createCompound(pattern.parts.map(recurse));
    }

    return pattern;
  };

  return recurse(pattern);
};

export const getMaskPermutations = (concept: Concept): Concept[] => {
  if (concept.parts.length === 0) {
    return [];
  }

  const source = concept.parts
    .flatMap((part) => {
      const subperms: string[] = [
        part.key,
        '$' + md5(part.key),
        ...getMaskPermutations(part).map((c) => c.key),
      ];

      return `[${subperms.join(', ')}]`;
    })
    .join(' ');

  return parseConcepts(source).filter(isPattern);
};

export const getConceptMasks = (concept: Concept): Concept[] => {
  return getMaskPermutations(concept)
    .map(createMask)
    .filter(anti(hasAllVariables));
};

export const hasAllVariables = (concept: Concept): boolean => {
  if (isVariable(concept)) {
    return true;
  }

  if (!isPattern(concept)) {
    return false;
  }

  return concept.parts.every(hasAllVariables);
};
