import { Concept } from '@creatureco/concept-ml-parser';

export const getConceptText = (concept: Concept): string => {
  return concept.parts.length > 0
    ? concept.key
    : concept.key.replace(/^<<|>>$/g, '');
};
