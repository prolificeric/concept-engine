import { Concept, parseConcept } from '@coeng/concept-ml-parser';
import { createConceptDataKey } from '../../../lib/keys';

export default async function removeConceptData(params: {
  spaceId: string;
  globalData: KVNamespace;
  concepts: (string | Concept)[];
}) {
  const { spaceId, globalData, concepts } = params;

  await Promise.all(
    concepts.map((concept) => {
      concept = typeof concept === 'string' ? parseConcept(concept) : concept;

      return globalData.delete(
        createConceptDataKey({
          spaceId,
          concept,
        }),
      );
    }),
  );
}
