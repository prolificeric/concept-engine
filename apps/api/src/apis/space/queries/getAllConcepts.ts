import { Concept, parseConcept } from '@coeng/concept-ml-parser';
import { decodeConceptKey, encodeConceptKey } from '../../../lib/keys';

export default async function getAllConcepts(
  storage: DurableObjectStorage,
  pagination: {
    startKey?: string;
    endKey?: string;
    limit: number;
  },
): Promise<Concept[]> {
  const { startKey, endKey, limit } = pagination;
  const concepts: Concept[] = [];
  const storageKeys = await storage.list<true>({
    limit,
    prefix: 'concept:',
    start: startKey && `concept:${encodeConceptKey(startKey)}`,
    end: endKey && `concept:${encodeConceptKey(endKey)}`,
  });

  storageKeys.forEach((_, sk) => {
    concepts.push(parseConcept(decodeConceptKey(sk.split(':')[1])));
  });

  return concepts;
}
