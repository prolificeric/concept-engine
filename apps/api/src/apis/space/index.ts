import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './type-defs.graphql';
import ConceptResolvers from './resolvers/Concept';
import RuleSetMatchResolvers from './resolvers/RuleSetMatch';
import merge from '../../lib/merge';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: merge(ConceptResolvers, RuleSetMatchResolvers),
});
