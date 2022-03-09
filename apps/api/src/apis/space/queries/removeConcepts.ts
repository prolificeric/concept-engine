import { Concept } from '@creatureco/concept-ml-parser';
import { getConceptMasks } from '../../../lib/mask';
import getContexts from './getContexts';
import removeConceptData from './removeConceptData';

import {
  createConceptStorageKey,
  createContainmentKeys,
  createMaskMatchCountKey,
  createMaskMatchKey,
} from '../../../lib/keys';

export default async function removeConcepts(params: {
  storage: DurableObjectStorage;
  globalData: KVNamespace;
  spaceId: string;
  concepts: Concept[];
}): Promise<number> {
  const { storage, spaceId, concepts, globalData } = params;
  const keysToUpdate = await getKeysToUpdate(storage, concepts);
  let count = 0;

  await storage.transaction(async (tx) => {
    await tx.delete(keysToUpdate.mask);
    await tx.delete(keysToUpdate.containment);
    await decrementMaskMatchCounts(tx, keysToUpdate.maskCount);
    count = await tx.delete(keysToUpdate.concept);
  });

  await removeConceptData({ globalData, spaceId, concepts });

  return count;
}

export const decrementMaskMatchCounts = async (
  storage: DurableObjectStorage | DurableObjectTransaction,
  maskDeltaMap: Map<string, number>,
): Promise<void> => {
  const maskCountKeys = Array.from(maskDeltaMap.keys());
  const maskCountValues = await storage.get<number>(maskCountKeys);

  maskCountValues.forEach((count, key) => {
    const delta = maskDeltaMap.get(key) || 0;
    maskCountValues.set(key, count - delta);
  });

  await storage.put(Object.fromEntries(maskCountValues));
};

export const getKeysToUpdate = async (
  storage: DurableObjectStorage,
  concepts: Concept[],
) => {
  const keys = {
    concept: [] as string[],
    containment: [] as string[],
    mask: [] as string[],
    maskCount: new Map<string, number>(),
  };

  const recurse = async (concept: Concept): Promise<void> => {
    keys.concept.push(createConceptStorageKey({ concept }));

    getConceptMasks(concept).map((mask) => {
      const matchKey = createMaskMatchKey({ concept, mask });
      const matchCountKey = createMaskMatchCountKey({ mask });
      keys.mask.push(matchKey);
      keys.maskCount.set(
        matchCountKey,
        (keys.maskCount.get(matchCountKey) || 0) + 1,
      );
    });

    const contexts = await getContexts(storage, concept);
    const containmentKeys = createContainmentKeys({ concept });

    keys.containment.push(...containmentKeys);

    for (const context of contexts) {
      await recurse(context);
    }
  };

  for (const concept of concepts) {
    await recurse(concept);
  }

  return keys;
};
