import { Concept } from '@coeng/concept-ml-parser';
import { createConceptDataKey } from '../../../lib/keys';
import getConcept from './getConcept';

export default async function updateConceptData(params: {
  storage: DurableObjectStorage;
  globalData: KVNamespace;
  spaceId: string;
  concept: Concept | string;
  data: string;
}): Promise<Concept | null> {
  const { storage, globalData, spaceId, concept, data } = params;
  const existing = await getConcept(storage, concept);

  if (!existing) {
    return null;
  }

  await globalData.put(
    createConceptDataKey({ spaceId, concept: existing }),
    data,
  );

  return existing;
}
