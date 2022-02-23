import { Concept, interpolateToConcepts } from '@creatureco/concept-ml-parser';
import matchRules from './matchRules';

import {
  extractTriggerMatches,
  Trigger,
  TriggerMatch,
} from '../../../lib/triggers';

export default async function findTriggerMatches(
  storage: DurableObjectStorage,
  concepts: Concept[],
  triggers: Trigger[],
): Promise<TriggerMatch[]> {
  if (concepts.length === 0) {
    return [];
  }

  const { partials, matches } = extractTriggerMatches(triggers, concepts);
  const matchesFromPartials: TriggerMatch[] = [];

  for (const partial of partials) {
    const ruleMatches = await matchRules(
      storage,
      interpolateToConcepts(partial.rules, partial.variables),
    );

    for (const variables of ruleMatches) {
      matchesFromPartials.push({
        variables,
        trigger: partial.trigger,
      });
    }
  }

  return matches.concat(matchesFromPartials);
}
