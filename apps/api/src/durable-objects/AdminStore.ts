import GraphQLStore from '../lib/graphql-store';
import { schema } from '../apis/admin';
import { Account, AdminResolverContext, ResolverContext } from '@/types';
import { getAccount, saveAccount } from '@/apis/admin/queries/accounts';
import createStripePaymentProvider from '@/providers/payment/stripe';

export default class AdminStore extends GraphQLStore {
  getSchema() {
    return schema;
  }

  getNamespace() {
    return this.env.ADMIN_STORE;
  }

  async getResolverContext(request: Request): Promise<AdminResolverContext> {
    const ctx = await super.getResolverContext(request);
    const { requester, config } = ctx;
    const paymentProvider = createStripePaymentProvider(config.stripe);
    let account: Account | undefined = undefined;

    if (requester.type === 'user') {
      account = await getAccount(ctx.storage, requester.id);

      if (!account) {
        account = await saveAccount(ctx.storage, {
          id: requester.id,
          created: new Date(),
        });
      }
    }

    return {
      ...ctx,
      account,
      paymentProvider,
    };
  }
}
