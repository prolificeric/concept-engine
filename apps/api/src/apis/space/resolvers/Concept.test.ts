import { parseConcept } from '@creatureco/concept-ml-parser';
import { createTestContext } from '../../../lib/test-util';
import Concept from './Concept';
import RuleSetMatch from './RuleSetMatch';

describe('adding concepts', () => {
  test('concept is added', async () => {
    const ctx = await createTestContext();
    const key = 'john [knows javascript]';

    await Concept.Mutation.addConcepts(
      null,
      {
        input: {
          source: [key],
          interpolate: [],
        },
      },
      ctx,
    );

    const concept = await Concept.Query.concept(null, { key }, ctx);

    expect(concept?.key).toEqual(key);
  });
});

describe('deleted concepts', () => {
  test('no longer retrievable by key', async () => {
    const ctx = await createTestContext();
    const key = 'john [knows javascript]';

    await Concept.Mutation.addConcepts(
      null,
      { input: { source: [key], interpolate: [] } },
      ctx,
    );

    await Concept.Mutation.removeConcepts(null, { keys: [key] }, ctx);

    const concept = await Concept.Query.concept(null, { key }, ctx);

    expect(concept).toEqual(null);
  });

  test('no longer be listed', async () => {
    const ctx = await createTestContext();
    const key = 'john [knows javascript]';

    await Concept.Mutation.addConcepts(
      null,
      { input: { source: [key], interpolate: [] } },
      ctx,
    );

    await Concept.Mutation.removeConcepts(null, { keys: [key] }, ctx);

    const concepts = await Concept.Query.concepts(
      null,
      {
        query: {
          pagination: {
            limit: 100,
          },
        },
      },
      ctx,
    );

    expect(concepts.find((c) => c.key === key)).toEqual(undefined);
  });

  test('no longer indexed against masks', async () => {
    const ctx = await createTestContext();
    const key = 'john [knows javascript]';

    await Concept.Mutation.addConcepts(
      null,
      {
        input: {
          source: [key],
          interpolate: [],
        },
      },
      ctx,
    );

    await Concept.Mutation.removeConcepts(null, { keys: [key] }, ctx);

    const matches = await RuleSetMatch.Query.matches(
      null,
      { query: { rules: ['john $tag'], interpolate: [] } },
      ctx,
    );

    expect(matches).toHaveLength(0);
  });

  test('no longer show up as contexts', async () => {
    const ctx = await createTestContext();
    const key = 'john [knows javascript]';

    await Concept.Mutation.addConcepts(
      null,
      {
        input: {
          source: [key],
          interpolate: [],
        },
      },
      ctx,
    );

    await Concept.Mutation.removeConcepts(null, { keys: [key] }, ctx);

    const contexts = await Concept.Concept.contexts(
      parseConcept('john'),
      {},
      ctx,
    );

    expect(contexts).toHaveLength(0);
  });
});
