import { Concept } from '@creatureco/concept-ml-parser';
import { createMaskMatchCountKey } from '../../../lib/keys';
import { createMask } from '../../../lib/mask';

export default async function getMaskMatchCount(
  storage: DurableObjectStorage,
  pattern: Concept,
): Promise<number> {
  const count = await storage.get<number>(
    createMaskMatchCountKey({
      mask: createMask(pattern),
    }),
  );

  return count || 0;
}
