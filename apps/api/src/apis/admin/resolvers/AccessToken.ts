import { ResolverContext, Role, AccessToken, Stub } from '../../../types';

import {
  addAccessToken,
  updateAccessToken,
  removeAccessToken,
  getAccessToken,
} from '../queries/access-tokens';

export default {
  Query: {
    accessToken: (
      _root: null,
      _args: {},
      { storage, requester }: ResolverContext,
    ) => {
      if (requester.type === 'machine') {
        return getAccessToken(storage, requester.id);
      }
    },
  },

  Mutation: {
    addAccessToken: async (
      _root: null,
      args: {
        input: {
          spaceId: string;
          label: string;
          role: Role;
        };
      },
      { storage, requester: { id: creatorId } }: ResolverContext,
    ) => {
      return await addAccessToken({
        ...args.input,
        storage,
        creatorId,
      });
    },

    updateAccessToken: async (
      _root: null,
      args: {
        input: {
          id: string;
          label?: string;
          role?: Role;
        };
      },
      { storage }: ResolverContext,
    ) => {
      return updateAccessToken({
        storage,
        ...args.input,
      });
    },

    removeAccessToken: async (
      _root: null,
      args: { id: string },
      { storage }: ResolverContext,
    ) => {
      return removeAccessToken(storage, args.id).then(Boolean);
    },
  },

  AccessToken: {
    space: ({ spaceId }: AccessToken): Stub => {
      return {
        __stub: true,
        id: spaceId,
      };
    },

    creator: ({ creatorId }: AccessToken): Stub => {
      return {
        __stub: true,
        id: creatorId,
      };
    },
  },
};
