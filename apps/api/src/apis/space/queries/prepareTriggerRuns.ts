import { Concept } from '@creatureco/concept-ml-parser';
import findTriggerMatches from './findTriggerMatches';
import getAllTriggers from './getAllTriggers';

export default async function prepareTriggerRuns(
  storage: DurableObjectStorage,
  concepts: Concept[],
) {
  const triggers = await getAllTriggers(storage);
  const triggerMatches = await findTriggerMatches(storage, concepts, triggers);
}
