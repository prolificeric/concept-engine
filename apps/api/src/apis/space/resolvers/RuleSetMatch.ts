import {
  interpolateToConcept,
  interpolateToConcepts,
  VariableDict,
} from '@creatureco/concept-ml-parser';

import { getConceptText } from '../../../lib/concepts';
import { toVariableDict } from '../util';
import matchRules from '../queries/matchRules';
import {
  Interpolation,
  ResolverContext,
  SpaceResolverContext,
} from '../../../types';
import getConceptData from '../queries/getConceptData';

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
        return matches.map((match) => {
          return {
            ...interpolationDict,
            ...match,
          };
        });
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

      return (
        match && {
          ...interpolationDict,
          ...match,
        }
      );
    },
  },

  RuleSetMatch: {
    variables: (match: VariableDict) => {
      return (
        Object.entries(match)
          // Filter out interpolations
          .filter(([, match]) => {
            return !Array.isArray(match);
          })
          .map(([name, match]) => ({
            name,
            match,
          }))
      );
    },

    valueOf: (match: VariableDict, args: { name: string }) => {
      const value = match[args.name];
      return Array.isArray(value) ? null : value;
    },

    keyOf: (match: VariableDict, args: { name: string }) => {
      const value = match[args.name];
      return Array.isArray(value) ? null : value?.key;
    },

    textOf: (match: VariableDict, args: { name: string }) => {
      const value = match[args.name];
      return value && !Array.isArray(value) ? getConceptText(value) : null;
    },

    dataOf: (
      match: VariableDict,
      args: { name: string },
      ctx: SpaceResolverContext,
    ) => {
      const value = match[args.name];

      return value && !Array.isArray(value)
        ? getConceptData({
            concept: value,
            spaceId: ctx.spaceId,
            globalData: ctx.globalData,
          })
        : null;
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
