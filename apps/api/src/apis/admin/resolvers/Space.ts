import { ResolverContext, Space, Stub } from '../../../types';
import { getSpaceAccessTokens } from '../queries/access-tokens';

import {
  getAccountMemberships,
  getMembershipByAccountAndSpace,
  getSpaceMemberships,
} from '../queries/memberships';

import {
  addSpace,
  getSpace,
  getSpaces,
  removeSpace,
  updateSpace,
} from '../queries/spaces';

export default {
  Query: {
    space: (
      _root: null,
      args: { id: string },
      { storage }: ResolverContext,
    ): Promise<Space | null> => {
      return getSpace(storage, args.id);
    },
  },

  Mutation: {
    addSpace: async (
      _root: null,
      args: { input: { name: string } },
      { storage, requester }: ResolverContext,
    ): Promise<Space> => {
      if (requester.type !== 'user') {
        throw new Error('Only user accounts can create spaces');
      }

      const accountMemberships = await getAccountMemberships(
        storage,
        requester.id,
      );

      const accountSpaces = await getSpaces(
        storage,
        accountMemberships.map((m) => m.spaceId),
      );

      if (doesSpaceNameExist(args.input.name, accountSpaces)) {
        throw new Error('Space with this name already exists');
      }

      return addSpace(storage, {
        name: args.input.name,
        accountId: requester.id,
      });
    },

    updateSpace: async (
      _root: null,
      args: { input: { id: string; name: string } },
      { storage, requester }: ResolverContext,
    ): Promise<Space> => {
      const { id, name } = args.input;

      if (requester.type !== 'user') {
        throw new Error('Only user accounts can update spaces');
      }

      const accountMemberships = await getAccountMemberships(
        storage,
        requester.id,
      );

      if (!accountMemberships.some((m) => m.spaceId === id)) {
        throw new Error('You do not have access to this space');
      }

      if (!accountMemberships.some((m) => m.role !== 'owner')) {
        throw new Error('Only an owner can change a space name');
      }

      const accountSpaces = await getSpaces(
        storage,
        accountMemberships.map((m) => m.spaceId),
      );

      if (doesSpaceNameExist(name, accountSpaces)) {
        throw new Error('Space with this name already exists');
      }

      const space = await updateSpace(storage, args.input);

      if (!space) {
        throw new Error('Space not found');
      }

      return space;
    },

    removeSpace: async (
      _root: null,
      args: { id: string },
      { storage, requester, env }: ResolverContext,
    ): Promise<boolean> => {
      if (requester.type !== 'user') {
        throw new Error('Only user accounts can remove spaces');
      }

      const membership = await getMembershipByAccountAndSpace(
        storage,
        requester.id,
        args.id,
      );

      if (!membership) {
        throw new Error('You are not a member of this space');
      }

      if (membership.role !== 'owner') {
        throw new Error('Only owners can remove spaces');
      }

      const spaceStorageId = env.CONCEPT_STORE.idFromName(args.id);
      const spaceStore = env.CONCEPT_STORE.get(spaceStorageId);

      return removeSpace(storage, spaceStore, args.id);
    },
  },

  Space: {
    name: async (
      space: Space | Stub,
      _args: {},
      { storage }: ResolverContext,
    ) => {
      return (
        (space as Space).name ||
        Object.assign(space, await getSpace(storage, space.id)).name
      );
    },

    memberships: async (
      space: { id: string },
      _args: {},
      { storage }: ResolverContext,
    ) => {
      return getSpaceMemberships(storage, space.id);
    },

    accessTokens: async (
      space: { id: string },
      _args: {},
      { storage }: ResolverContext,
    ) => {
      return getSpaceAccessTokens(storage, space.id).then((tokens) => {
        return tokens;
      });
    },
  },
};

export const doesSpaceNameExist = (name: string, spaces: Space[]) => {
  return spaces.some((s) => s.name.toLowerCase() === name.toLowerCase());
};
