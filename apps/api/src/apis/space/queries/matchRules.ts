import {
  Concept,
  interpolateToConcepts,
  isAtom,
  isPattern,
  isVariable,
  parseConcept,
  VariableDict,
} from '@creatureco/concept-ml-parser';

import { anti } from '../../../lib/filter';
import { encodeConceptKey, parseMatchKey } from '../../../lib/keys';
import { createMask } from '../../../lib/mask';
import findAll from './findAll';
import getMaskMatchCount from './getMaskMatchCount';

export default async function matchConcepts(
  storage: DurableObjectStorage,
  rules: Concept[],
  options: {
    includeVariables?: boolean;
  } = {},
): Promise<VariableDict[]> {
  const { includeVariables = false } = options;

  // Uniquify the rules
  rules = Array.from(new Set(rules.map((r) => r.key))).map(parseConcept);

  // First, check to see if any rules have no patterns.
  // For these, we can just do a lookup on the concept to see
  // if it exists. If any of the concepts don't exist, then
  // the whole pattern chain is not a match.
  const rulesWithoutVariables = rules.filter(anti(isPattern));

  if (rulesWithoutVariables.length > 0) {
    const existing = await findAll(storage, rulesWithoutVariables);

    if (existing.length < rulesWithoutVariables.length) {
      return [];
    }

    const existingKeys = new Set(existing.map((c) => c.key));

    rules = rules.filter((c) => !existingKeys.has(c.key));
  }

  // If no remaining rules exist, we return a match with no variables.
  if (rules.length === 0) {
    return [{}];
  }

  // With the remaining rules, we attempt to fill all the variables.
  const maskRuleDict = new Map<string, Concept[]>();

  rules.forEach((rule) => {
    const mask = createMask(rule);
    const entries = maskRuleDict.get(mask.key) || [];
    entries.push(rule);
    maskRuleDict.set(mask.key, entries);
  });

  const masks = Array.from(maskRuleDict.keys()).map(parseConcept);

  const matchCounts = await Promise.all(
    masks.map(getMaskMatchCount.bind(null, storage)),
  );

  const maskCountDict = Object.fromEntries(
    masks.map((mask, i) => [mask.key, matchCounts[i]]),
  );

  const sortedMasks = masks.sort((a, b) => {
    return maskCountDict[b.key] - maskCountDict[a.key];
  });

  const sortedRules = sortedMasks.flatMap(
    (mask) => maskRuleDict.get(mask.key) || [],
  );

  const [headMask] = sortedMasks;
  const [headRule, ...restRules] = sortedRules;
  const headMaskVarDict = matchVariables(headRule, headMask);

  if (!headMaskVarDict) {
    throw new Error('Could not extract variables from head rule');
  }

  const matchKeys = await storage
    .list<string>({ prefix: `mask/match:${encodeConceptKey(headMask.key)}/` })
    .then((map) => Array.from(map.keys()));

  const results: VariableDict[] = [];

  for (const matchKey of matchKeys) {
    const maskPartial = parseMatchKey(matchKey);

    const rulePartial = Object.fromEntries(
      Object.entries(maskPartial).map(([key, value]) => [
        headMaskVarDict[key].key,
        value,
      ]),
    );

    if (restRules.length > 0) {
      const recursedPartials = await matchConcepts(
        storage,
        interpolateToConcepts(restRules, rulePartial),
      );

      for (const recursedPartial of recursedPartials) {
        results.push({ ...rulePartial, ...recursedPartial });
      }
    } else {
      results.push(rulePartial);
    }
  }

  if (!includeVariables) {
    return results.filter((variables) => {
      return Object.values(variables).every(anti(isVariable));
    });
  }

  return results;
}

export const matchVariables = (
  concept: Concept,
  pattern: Concept,
): null | VariableDict => {
  if (concept.parts.length !== pattern.parts.length) {
    return null;
  }

  const matches: VariableDict = {};

  const recurse = (concept: Concept, pattern: Concept): null | VariableDict => {
    if (isAtom(pattern)) {
      if (isVariable(pattern)) {
        matches[pattern.key] = concept;
        return matches;
      }

      if (isAtom(concept) && concept.key !== pattern.key) {
        return null;
      }
    }

    if (concept.parts.length !== pattern.parts.length) {
      return null;
    }

    for (const i of concept.parts.keys()) {
      const conceptPart = concept.parts[i];
      const patternPart = pattern.parts[i];

      if (patternPart.key in matches) {
        if (conceptPart.key !== matches[patternPart.key].key) {
          return null;
        }
      } else {
        const recursed = recurse(conceptPart, patternPart);

        if (recursed) {
          Object.assign(matches, recurse(conceptPart, patternPart));
        } else {
          return null;
        }
      }
    }

    return matches;
  };

  return recurse(concept, pattern);
};
