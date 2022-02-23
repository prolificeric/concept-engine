import '@cloudflare/workers-types';

export interface Bindings {
  CONCEPT_STORE: DurableObjectNamespace;
  ADMIN_STORE: DurableObjectNamespace;
  GLOBAL_DATA: KVNamespace;
  JWKS_ISSUER?: string;
  JWKS_AUDIENCE?: string;
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
}
