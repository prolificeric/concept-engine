import { Concept } from '@creatureco/concept-ml-parser';
import { Config } from './config';
import { PaymentProvider } from './providers/types';

export interface Env {
  CONCEPT_STORE: DurableObjectNamespace;
  ADMIN_STORE: DurableObjectNamespace;
  GLOBAL_DATA: KVNamespace;
  JWKS_ISSUER?: string;
  JWKS_AUDIENCE?: string;
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
  HONEYCOMB_API_KEY: string;
  HONEYCOMB_DATASET: string;
}

export interface Dict<T = string> {
  [key: string]: T;
}

export interface HandlerContext<TData = any> {
  request: Request;
  params: Dict;
  query: Dict<string>;
  headers: Dict;
  state: DurableObjectState;
  env: Env;
}

export interface ConceptWithData extends Concept {
  data: string;
}

export interface Requester {
  type: 'user' | 'machine';
  id: string;
  spaceId?: string;
  email?: string;
}

export type Role = 'owner' | 'admin' | 'member';

export interface Membership {
  id: string;
  accountId: string;
  spaceId: string;
  role: Role;
}

export interface Account {
  id: string;
  created: Date;
  billingId?: string;
}

export interface Space {
  id: string;
  name: string;
}

export interface Invite {
  spaceId: string;
  email: string;
  role: Role;
}

export interface AccessToken {
  id: string;
  label: string;
  creatorId: string;
  spaceId: string;
  role: Role;
}

export interface Interpolation {
  key: string;
  value: string[];
}

export interface ResolverContext {
  env: Env;
  config: Config;
  storage: DurableObjectStorage;
  globalData: KVNamespace;
  requester: Requester;
  paymentProvider: PaymentProvider;
  account?: Account;
}

export interface AdminResolverContext extends ResolverContext {
  paymentProvider: PaymentProvider;
}

export interface SpaceResolverContext extends ResolverContext {
  spaceId: string;
}

export interface Stub {
  __stub: true;
  id: string;
}

export interface Pagination {
  limit: number;
  offset: number;
}

export interface Customer extends CustomerInfo {
  id: string;
  email: string;
}

export interface CustomerInfo {
  email: string;
}
