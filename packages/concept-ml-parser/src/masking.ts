import { Concept } from './concepts';

export const getConceptMasks = (concept: Concept): string[] => {
  if (concept.isAtom()) {
    return [concept.key, '$*'];
  }

  let permutations: string[] = [];

  concept.parts.forEach((part) => {
    const subpermutations = getConceptMasks(part);

    if (permutations.length === 0) {
      permutations = subpermutations;
      return;
    }

    permutations = permutations.flatMap((left) => {
      return subpermutations.map((right) => {
        return [left, part.isCompound() ? `[${right}]` : right].join(' ');
      });
    });
  });

  return permutations;
};
