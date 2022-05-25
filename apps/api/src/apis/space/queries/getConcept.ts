import { Concept, parseConcept } from '@coeng/concept-ml-parser';
import { createConceptStorageKey } from '../../../lib/keys';

export default async function getConcept(
  storage: DurableObjectStorage,
  source: string | Concept,
): Promise<Concept | null> {
  const concept = parseConcept(
    typeof source === 'string' ? source : source.key,
  );
  const exists = await storage.get<true>(createConceptStorageKey({ concept }));
  return exists !== undefined ? concept : null;
}
