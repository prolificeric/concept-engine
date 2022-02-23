import { AdminResolverContext } from '@/types';
import { saveAccount } from '../queries/accounts';

export default {
  Mutation: {
    createBillingSession: async (
      _root: null,
      args: { input: { successUrl: string; cancelUrl: string } },
      ctx: AdminResolverContext,
    ) => {
      const { requester, account, paymentProvider } = ctx;

      if (!account) {
        throw new Error('Only users can create billing sessions');
      }

      const email = requester.email as string;

      const billingId: string =
        account.billingId ||
        (await paymentProvider
          .upsertCustomer({ email })
          .then(async (customer) => {
            await saveAccount(ctx.storage, {
              ...account,
              billingId: customer.id,
            });

            return customer.id;
          }));

      return paymentProvider.createBillionSession({
        customerId: billingId,
        ...args.input,
      });
    },
  },
};
