import getConfig from 'next/config';

export type Config = ReturnType<typeof parseConfig>;

export const parseConfig = ({
  AUTH0_DOMAIN = '',
  AUTH0_CLIENT_ID = '',
  AUTH0_AUDIENCE = 'concept-engine-api',
  COENG_BASE_URL = '',
  STRIPE_API_KEY = '',
}) => ({
  auth0: {
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    audience: AUTH0_AUDIENCE.split(/, ?/),
  },
  coeng: {
    baseUrl: COENG_BASE_URL,
  },
  stripe: {
    apiKey: STRIPE_API_KEY,
  },
});

export default parseConfig(getConfig().publicRuntimeConfig);
