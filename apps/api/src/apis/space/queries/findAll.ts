import {
  Concept,
  ConceptSetSource,
  toConcepts,
} from '@creatureco/concept-ml-parser';

import getConcept from './getConcept';

export default async function findAll(
  storage: DurableObjectStorage,
  source: ConceptSetSource,
) {
  const fetched = await Promise.all(
    toConcepts(source).map(getConcept.bind(null, storage)),
  );

  return fetched.filter(Boolean) as Concept[];
}
