import { ExecutionResult, graphql, GraphQLSchema } from 'graphql';
import { Env, ResolverContext } from '../types';
import { json } from './responses';
import { createAuth0AuthProvider } from '../providers/auth/auth0';
import { Config, parseConfig } from '../config';
import { AuthProvider } from '../providers/types';
import { parseRequester } from './requester';
import createStripePaymentProvider from '@/providers/payment/stripe';

export default abstract class GraphQLStore {
  state: DurableObjectState;
  env: Env;
  config: Config;
  auth: AuthProvider;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.config = parseConfig(env);
    this.auth = createAuth0AuthProvider({ jwks: this.config.jwks });
  }

  abstract getSchema(): GraphQLSchema;

  async fetch(request: Request): Promise<Response> {
    // Handle GraphQL request
    try {
      const { query, variables = {} } = await request.json();
      const context = await this.getResolverContext(request);
      const payload = await this.querySchema(query, variables, context);

      if (payload.errors) {
        payload.errors.forEach((err: any) => {
          console.error(err.stack);
        });
      }

      return json(200, payload);
    } catch (err: any) {
      console.error(err.stack);
      return json(200, {
        errors: [{ message: err.message }],
      });
    }
  }

  async getResolverContext(request: Request): Promise<ResolverContext> {
    const config = parseConfig(this.env);

    return {
      config,
      env: this.env,
      storage: this.state.storage,
      globalData: this.env.GLOBAL_DATA,
      paymentProvider: createStripePaymentProvider(config.stripe),
      requester: await parseRequester(this.auth, request).catch((err) => {
        console.error(err.stack);
        throw err;
      }),
    };
  }

  async querySchema<TData extends object = {}>(
    query: string,
    variables: any,
    context: ResolverContext,
  ) {
    const result = await graphql({
      schema: this.getSchema(),
      source: query,
      variableValues: variables,
      contextValue: context,
    });

    return result as ExecutionResult<TData>;
  }
}
