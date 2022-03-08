export const parseConfig = ({
  JWKS_ISSUER = '',
  JWKS_AUDIENCE = '',
  AUTH0_CLIENT_ID = '',
  AUTH0_CLIENT_SECRET = '',
  STRIPE_API_KEY = '',
  STRIPE_PREMIUM_PRICE_ID = '',
  HONEYCOMB_API_KEY = '',
  HONEYCOMB_DATASET = '',
  TEST_WORKER_URL = 'http://localhost:8787',
  TRIAL_LENGTH = '14',
}: any) => ({
  jwks: {
    issuer: JWKS_ISSUER,
    audience: JWKS_AUDIENCE,
  },
  auth0: {
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  },
  stripe: {
    apiKey: STRIPE_API_KEY,
    premiumPriceId: STRIPE_PREMIUM_PRICE_ID,
  },
  honeycomb: {
    apiKey: HONEYCOMB_API_KEY,
    dataset: HONEYCOMB_DATASET,
  },
  trialLength: parseInt(TRIAL_LENGTH, 10),
  test: {
    worker: {
      url: TEST_WORKER_URL,
    },
  },
});

export type Config = ReturnType<typeof parseConfig>;
