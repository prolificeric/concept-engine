import { Concept } from '@creatureco/concept-ml-parser';
import { getMaskPermutations } from '../../../lib/mask';
import getContexts from './getContexts';
import removeConceptData from './removeConceptData';

import {
  createConceptDataKey,
  createConceptStorageKey,
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
  const keysToUpdate = await getKeysToUpdate(storage, spaceId, concepts);
  let count = 0;

  await storage.transaction(async () => {
    await storage.delete(keysToUpdate.mask);
    await decrementMaskMatchCounts(storage, keysToUpdate.maskCount);
    await removeConceptData({ globalData, spaceId, concepts });
    count = await storage.delete(keysToUpdate.concept);
  });

  return count;
}

export const decrementMaskMatchCounts = async (
  storage: DurableObjectStorage,
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
  spaceId: string,
  concepts: Concept[],
) => {
  const keys = {
    concept: [] as string[],
    mask: [] as string[],
    maskCount: new Map<string, number>(),
  };

  const recurse = async (concept: Concept): Promise<void> => {
    keys.concept.push(createConceptStorageKey({ concept }));

    getMaskPermutations(concept).map((mask) => {
      const matchKey = createMaskMatchKey({ concept, mask });
      const matchCountKey = createMaskMatchCountKey({ mask });
      keys.mask.push(matchKey);
      keys.maskCount.set(
        matchCountKey,
        (keys.maskCount.get(matchCountKey) || 0) + 1,
      );
    });

    const contexts = await getContexts(storage, concept);

    return contexts.reduce((prev, context) => {
      return prev.then(recurse.bind(null, context));
    }, Promise.resolve());
  };

  for (const concept of concepts) {
    await recurse(concept);
  }

  return keys;
};
