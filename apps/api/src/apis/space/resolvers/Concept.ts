import {
  Concept,
  extractVariables,
  interpolateToConcepts,
  parseConcept,
  parseConcepts,
} from '@creatureco/concept-ml-parser';

import getAllConcepts from '../queries/getAllConcepts';
import getConcept from '../queries/getConcept';
import getConceptData from '../queries/getConceptData';
import getContexts from '../queries/getContexts';
import removeConcepts from '../queries/removeConcepts';
import updateConceptData from '../queries/updateConceptData';
import { toVariableDict } from '../util';
import { getConceptText } from '../../../lib/concepts';

import {
  ResolverContext,
  Interpolation,
  SpaceResolverContext,
} from '../../../types';

import addConceptsWithTriggers from '../queries/addConceptsWithTriggers';

const DATA_META_PATTERN = parseConcept('$concept @data $data');

export default {
  Query: {
    concept: (
      _root: null,
      args: { key: string },
      { storage }: ResolverContext,
    ) => {
      return getConcept(storage, args.key);
    },

    concepts: (
      _root: null,
      args: {
        query: {
          pagination: {
            limit: number;
            startKey?: string;
            endKey?: string;
          };
        };
      },
      { storage }: ResolverContext,
    ) => {
      return getAllConcepts(storage, args.query.pagination);
    },
  },

  Mutation: {
    addConcepts: async (
      _root: null,
      args: { input: { source: string[]; interpolate: Interpolation[] } },
      { storage, globalData, spaceId }: SpaceResolverContext,
    ) => {
      const parsed = interpolateToConcepts(
        args.input.source,
        toVariableDict(args.input.interpolate),
      );

      const concepts: Concept[] = [];
      const conceptDataUpdates: { concept: Concept; data: string }[] = [];

      parsed.forEach((concept) => {
        const { $concept, $data } =
          extractVariables(concept, DATA_META_PATTERN) || {};

        if (!$concept) {
          concepts.push(concept);
        } else {
          concepts.push($concept);

          conceptDataUpdates.push({
            concept: $concept,
            data: getConceptText($data),
          });
        }
      });

      const addedConcepts: Concept[] = [];

      await addConceptsWithTriggers({
        storage,
        globalData,
        spaceId,
        concepts,
        onConceptAdded: (concept) => {
          addedConcepts.push(concept);
        },
      });

      for (const { concept, data } of conceptDataUpdates) {
        await updateConceptData({
          storage,
          globalData,
          data,
          spaceId,
          concept: concept.key,
        });
      }

      return addedConcepts;
    },

    updateConceptData: async (
      _root: null,
      args: { input: { key: string; data: string } },
      { storage, spaceId, globalData }: SpaceResolverContext,
    ) => {
      const concept = await updateConceptData({
        storage,
        spaceId,
        globalData,
        concept: args.input.key,
        data: args.input.data,
      });

      if (!concept) {
        throw new Error('Concept not found');
      }

      return concept;
    },

    removeConcepts: async (
      _root: null,
      args: {
        keys: string[];
      },
      ctx: SpaceResolverContext,
    ): Promise<number> => {
      return removeConcepts({
        ...ctx,
        concepts: parseConcepts(args.keys),
      });
    },
  },

  Concept: {
    text: (concept: Concept) => {
      return getConceptText(concept);
    },

    data: (concept: Concept, _args: {}, ctx: SpaceResolverContext) => {
      return getConceptData({
        ...ctx,
        concept,
      });
    },

    contexts: (
      concept: Concept,
      _args: {},
      { storage }: SpaceResolverContext,
    ) => {
      return getContexts(storage, concept);
    },
  },
};
