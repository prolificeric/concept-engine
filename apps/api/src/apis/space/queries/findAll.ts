import {
  Concept,
  ConceptSetSource,
  toConcepts,
} from '@coeng/concept-ml-parser';

import getConcept from './getConcept';

export default async function findAll(
  storage: DurableObjectStorage,
  source: ConceptSetSource,
) {
  const results: Concept[] = [];

  for (const concept of toConcepts(source)) {
    const fetchedConcept = await getConcept(storage, concept);

    if (fetchedConcept) {
      results.push(fetchedConcept);
    }
  }

  return results;
}
