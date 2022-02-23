import { makeExecutableSchema } from '@graphql-tools/schema';
import merge from '../../lib/merge';
import typeDefs from './type-defs.graphql';
import accountResolvers from './resolvers/Account';
import spaceResolvers from './resolvers/Space';
import membershipResolvers from './resolvers/Membership';
import accessTokenResolvers from './resolvers/AccessToken';
import billingSessionResolvers from './resolvers/BillingSession';
import subscriptionManagementSessionResolvers from './resolvers/SubscriptionManagementSession';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: merge(
    accountResolvers,
    spaceResolvers,
    membershipResolvers,
    accessTokenResolvers,
    billingSessionResolvers,
    subscriptionManagementSessionResolvers,
  ),
});
