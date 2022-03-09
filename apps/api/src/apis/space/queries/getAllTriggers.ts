import { Concept, parseConcepts } from '@creatureco/concept-ml-parser';

import {
  triggerFragRules,
  indexTriggerFrag,
  TriggerIndex,
  Trigger,
} from '../../../lib/triggers';

import matchRules from './matchRules';

export default async function getAllTriggers(
  storage: DurableObjectStorage,
): Promise<Trigger[]> {
  const index: TriggerIndex = {};

  const { match, add, notify, remove } = triggerFragRules;

  const [matchFrags, addFrags, removeFrags, notifyFrags] = await Promise.all(
    [match, add, remove, notify].map((c) => matchRules(storage, c)),
  );

  matchFrags.forEach(({ $trigger, $rule }) => {
    indexTriggerFrag(index, $trigger, 'matches', $rule);
  });

  addFrags.forEach(({ $trigger, $template }) => {
    indexTriggerFrag(index, $trigger, 'adds', $template);
  });

  removeFrags.forEach(({ $trigger, $template }) => {
    indexTriggerFrag(index, $trigger, 'removes', $template);
  });

  notifyFrags.forEach(({ $trigger, $url }) => {
    indexTriggerFrag(index, $trigger, 'notifies', $url);
  });

  return Object.values(index);
}
