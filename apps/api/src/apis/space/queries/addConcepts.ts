import { buildTriggerIndex, separateTriggerFrags } from '@/lib/triggers';
import { Concept, getConceptsDeep } from '@creatureco/concept-ml-parser';
import { batchProcess } from '../util';
import filterNew from './filterNew';
import getAllTriggers from './getAllTriggers';
import saveMasks from './saveMasks';

import {
  createConceptStorageKey,
  createContainmentKeys,
} from '../../../lib/keys';
import findTriggerMatches from './findTriggerMatches';

export default async function addConcepts(
  storage: DurableObjectStorage,
  concepts: Concept[],
) {
  let newConcepts = await filterNew(storage, concepts);

  if (!newConcepts) {
    return [];
  }

  newConcepts.push(
    ...(await filterNew(
      storage,
      getConceptsDeepWithoutContainers(newConcepts),
    )),
  );

  await batchProcess(128, newConcepts, (batch) => {
    const dict = Object.fromEntries(
      batch.map((concept) => [createConceptStorageKey({ concept }), true]),
    );

    return storage.put<boolean>(dict);
  });

  await saveMasks(storage, newConcepts);

  await saveContainments(storage, newConcepts);

  // const triggerRuns = await prepareTriggerRuns(storage, newConcepts);

  // const triggers = await getAllTriggers(storage);

  // const { triggerFrags: newTriggerFrags, concepts: nonTriggerConcepts } =
  //   separateTriggerFrags(newConcepts);

  // const newTriggerIndex = buildTriggerIndex(newTriggerFrags);

  // const triggerMatchesFromNewConcepts = await findTriggerMatches(
  //   storage,
  //   nonTriggerConcepts,
  //   triggers,
  // );

  // console.log({
  //   triggers,
  //   newTriggerFrags,
  //   newTriggerIndex,
  //   nonTriggerConcepts,
  //   triggerMatchesFromNewConcepts,
  // });

  return newConcepts;
}

export const saveContainments = async (
  storage: DurableObjectStorage,
  concepts: Concept | Concept[],
) => {
  const containmentEntries = [concepts].flat().flatMap((concept) => {
    return createContainmentKeys({ concept }).map((key) => {
      return [key, true] as [string, true];
    });
  });

  await batchProcess(128, containmentEntries, (batch, i, totalBatches) => {
    const dict = Object.fromEntries(batch);
    return storage.put(dict);
  });
};

export const getConceptsDeepWithoutContainers = (
  topConcepts: Concept[],
): Concept[] => {
  const map = new Map<string, Concept>();

  topConcepts.forEach((c) => {
    getConceptsDeep(c.parts).forEach((sub) => {
      map.set(sub.key, sub);
    });
  });

  return Array.from(map.values());
};
