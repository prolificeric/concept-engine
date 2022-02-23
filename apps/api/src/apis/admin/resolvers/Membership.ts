import { Membership, Stub } from '../../../types';

export default {
  Query: {},

  Mutation: {},

  Membership: {
    space: ({ spaceId }: Membership): Stub => {
      return {
        __stub: true,
        id: spaceId,
      };
    },

    account: ({ accountId }: Membership): Stub => {
      return {
        __stub: true,
        id: accountId,
      };
    },
  },
};
