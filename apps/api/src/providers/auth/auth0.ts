import { parseJwt, JwtPayload, JwtParseResult } from '@cfworker/jwt';
import { AuthProvider } from '../types';

export interface Auth0AuthProviderOptions {
  jwks: {
    issuer: string;
    audience: string;
  };
}

export const createAuth0AuthProvider = ({
  jwks,
}: Auth0AuthProviderOptions): AuthProvider => {
  return {
    parseToken: async (token: string): Promise<JwtPayload | null> => {
      const parsedResult: JwtParseResult = await parseJwt(
        token,
        jwks.issuer,
        jwks.audience,
      );

      if (parsedResult.valid === false) {
        console.error(`Failed to parse token: ${parsedResult.reason}`);
        return null;
      }

      return parsedResult.payload;
    },
  };
};
