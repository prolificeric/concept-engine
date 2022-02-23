import { Concept, parseConcept } from '@creatureco/concept-ml-parser';
import { createConceptDataKey } from '../../../lib/keys';

export default async function getConceptData(params: {
  globalData: KVNamespace;
  spaceId: string;
  concept: Concept | string;
}): Promise<string | null> {
  let { globalData, spaceId, concept } = params;

  if (typeof concept === 'string') {
    concept = parseConcept(concept);
  }

  return globalData.get(createConceptDataKey({ spaceId, concept }));
}
