import {
  interpolateToConcept,
  interpolateToConcepts,
  VariableDict,
} from '@creatureco/concept-ml-parser';

import { getConceptText } from '../../../lib/concepts';
import { toVariableDict } from '../util';
import matchRules from '../queries/matchRules';
import { Interpolation, ResolverContext } from '../../../types';

export default {
  Query: {
    matches: (
      _root: null,
      args: { query: { rules: string[]; interpolate: Interpolation[] } },
      { storage }: ResolverContext,
    ) => {
      const interpolationDict = toVariableDict(args.query.interpolate);
      const rules = interpolateToConcepts(args.query.rules, interpolationDict);

      return matchRules(storage, rules).then((matches) => {
        return matches.map((match) => ({
          ...interpolationDict,
          ...match,
        }));
      });
    },

    match: async (
      _root: null,
      args: { query: { rules: string[]; interpolate: Interpolation[] } },
      { storage }: ResolverContext,
    ) => {
      const interpolationDict = toVariableDict(args.query.interpolate);
      const rules = interpolateToConcepts(args.query.rules, interpolationDict);
      const [match] = await matchRules(storage, rules);

      return {
        ...interpolationDict,
        ...match,
      };
    },
  },

  RuleSetMatch: {
    variables: (match: VariableDict) => {
      return Object.entries(match).map(([name, match]) => ({
        name,
        match,
      }));
    },

    valueOf: (match: VariableDict, args: { name: string }) => {
      return match[args.name];
    },

    keyOf: (match: VariableDict, args: { name: string }) => {
      return match[args.name]?.key;
    },

    textOf: (match: VariableDict, args: { name: string }) => {
      const concept = match[args.name];
      return concept && getConceptText(concept);
    },

    matches: (
      match: VariableDict,
      args: { rules: string[] },
      { storage }: ResolverContext,
    ) => {
      return chain(storage, match, args.rules);
    },

    match: (
      match: VariableDict,
      args: { rules: string[] },
      { storage }: ResolverContext,
    ) => {
      return chain(storage, match, args.rules).then((submatches) => {
        return submatches[0];
      });
    },

    concept: (
      match: VariableDict,
      args: { rule: string },
      { storage }: ResolverContext,
    ) => {
      return chain(storage, match, [args.rule]).then((submatches) => {
        return interpolateToConcepts(args.rule, submatches[0])[0];
      });
    },
  },
};

const chain = async (
  storage: DurableObjectStorage,
  match: VariableDict,
  rulesSource: string[],
) => {
  const rules = interpolateToConcepts(rulesSource, match);

  return matchRules(storage, rules).then((submatches) => {
    return submatches.map((submatch) => {
      return {
        ...submatch,
        ...match,
      };
    });
  });
};
