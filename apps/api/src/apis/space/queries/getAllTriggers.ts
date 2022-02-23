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

  const { match, generate, notify, remove } = triggerFragRules;

  const [matchFrags, generateFrags, removeFrags, notifyFrags] =
    await Promise.all(
      [match, generate, notify, remove].map(matchRules.bind(null, storage)),
    );

  matchFrags.forEach(({ $trigger, $rule }) => {
    indexTriggerFrag(index, $trigger, 'matches', $rule);
  });

  generateFrags.forEach(({ $trigger, $template }) => {
    indexTriggerFrag(index, $trigger, 'generates', $template);
  });

  removeFrags.forEach(({ $trigger, $template }) => {
    indexTriggerFrag(index, $trigger, 'removes', $template);
  });

  notifyFrags.forEach(({ $trigger, $url }) => {
    indexTriggerFrag(index, $trigger, 'notifies', $url);
  });

  return Object.values(index);
}
