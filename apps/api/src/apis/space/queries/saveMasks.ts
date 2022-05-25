import { Concept } from '@coeng/concept-ml-parser';
import { createMaskMatchKey } from '../../../lib/keys';
import { getConceptMasks } from '../../../lib/mask';
import { batchProcess } from '../util';

export default async function saveMasks(
  storage: DurableObjectStorage,
  concepts: Concept | Concept[],
): Promise<Concept[]> {
  concepts = [concepts].flat();

  const maskEntries = concepts.flatMap((concept) => {
    return getConceptMasks(concept).map((mask) => {
      return [createMaskMatchKey({ concept, mask }), true] as [string, true];
    });
  });

  await batchProcess(128, maskEntries, (batch) => {
    return storage.put<boolean>(Object.fromEntries(batch));
  });

  return concepts;
}
