import { AdminResolverContext } from '@/types';
import { saveAccount } from '../queries/accounts';

export default {
  Mutation: {
    createSubscriptionManagementSession: async (
      _root: null,
      args: { input: { returnUrl: string } },
      ctx: AdminResolverContext,
    ) => {
      const { account, paymentProvider } = ctx;

      if (!account) {
        throw new Error(
          'Only users can create subscription management sessions',
        );
      }

      if (!account.billingId) {
        throw new Error('Account does not have a billing ID');
      }

      return paymentProvider.createSubscriptionManagementSession({
        customerId: account.billingId,
        ...args.input,
      });
    },
  },
};
