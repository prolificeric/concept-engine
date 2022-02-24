import { isAtom, isCompound } from '..';
import { Concept } from './concept';

export const applyAmpersandOperator = (concept: Concept) => {
  if (isAtom(concept)) {
    return concept;
  }

  const [replacement, ...rest] = concept.parts;
  let didApplyAmpersand = false;

  const recurse = (part: Concept): Concept => {
    if (isCompound(part)) {
      return Concept.createCompound(part.parts.map(recurse));
    }

    if (part.key === '&') {
      didApplyAmpersand = true;
      return replacement;
    }

    return part;
  };

  const replacedRest = rest.map(recurse);

  return didApplyAmpersand ? Concept.createCompound(replacedRest) : concept;
};

export const applyColonOperator = (concept: Concept) => {
  if (isAtom(concept)) {
    return concept;
  }

  const [firstPart, ...restParts] = concept.parts.map(applyColonOperator);

  if (firstPart.key !== ':') {
    return concept;
  }

  const sortedRestParts = restParts.sort((a, b) => {
    return a.key.localeCompare(b.key);
  });

  return Concept.createCompound([firstPart, ...sortedRestParts]);
};
