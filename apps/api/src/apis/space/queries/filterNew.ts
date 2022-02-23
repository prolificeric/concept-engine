import { ConceptSetSource, toConcepts } from '@creatureco/concept-ml-parser';
import findAll from './findAll';

export default async function filterNew(
  storage: DurableObjectStorage,
  source: ConceptSetSource,
) {
  const concepts = toConcepts(source);
  const existing = await findAll(storage, concepts);
  const existingKeys = new Set(existing.map((c) => c.key));
  return concepts.filter((c) => !existingKeys.has(c.key));
}
