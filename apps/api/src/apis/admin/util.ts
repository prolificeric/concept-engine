import { toConcepts } from '@creatureco/concept-ml-parser';
import { Interpolation } from './types';

export const toVariableDict = (interpolations: Interpolation[]) => {
  return Object.fromEntries(
    interpolations.map(({ key, value }) => [key, toConcepts(value)]),
  );
};
