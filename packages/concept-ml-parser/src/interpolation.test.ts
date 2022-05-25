import { parseConcepts } from './expansion';

import {
  interpolateToConcepts,
  VariableInterpolationDict,
} from './interpolation';

describe('interpolateToConcepts', () => {
  test('interpolates string source', () => {
    const source = 'john [knows $lang]';

    const variables: VariableInterpolationDict = {
      $lang: 'javascript',
    };

    const result = interpolateToConcepts(source, variables);

    expect(result).toEqual(parseConcepts('john [knows javascript]'));
  });
});
