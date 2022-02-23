/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    COENG_BASE_URL: process.env.COENG_BASE_URL,
  },
};
