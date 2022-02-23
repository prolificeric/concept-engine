import {
  Account,
  AdminResolverContext,
  Membership,
  Requester,
  ResolverContext,
} from '../../../types';

import { getAccountMemberships } from '../queries/memberships';

const DAY_MS = 24 * 60 * 60 * 1000;

export default {
  Query: {
    account: (
      _root: null,
      _args: {},
      { requester, account }: ResolverContext,
    ) => {
      if (requester.type === 'user') {
        return account;
      }
    },
  },

  Mutation: {},

  Account: {
    created: (account: Account) => {
      return account.created.toISOString();
    },

    level: async (
      account: Account,
      _args: null,
      { paymentProvider, config }: AdminResolverContext,
    ) => {
      const subscriptions = account.billingId
        ? await paymentProvider.getSubscriptions(account.billingId)
        : [];

      const isPremium = subscriptions.some((sub) => {
        return (
          sub.status === 'active' &&
          sub.items.some(
            (item) => item.price.id === config.stripe.premiumPriceId,
          )
        );
      });

      return isPremium ? 'PREMIUM' : 'TRIAL';
    },

    trialDaysLeft: (
      account: Account,
      _args: null,
      { config }: ResolverContext,
    ) => {
      const endTime = account.created.getTime() + config.trialLength * DAY_MS;
      const daysLeft = (endTime - Date.now()) / DAY_MS;
      return daysLeft;
    },

    memberships: (
      account: Requester,
      _args: {},
      { storage }: ResolverContext,
    ): Promise<Membership[]> => {
      return getAccountMemberships(storage, account.id);
    },
  },
};
