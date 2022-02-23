import { GraphQLError } from 'graphql';
import { AuthProvider } from '../providers/types';
import { Requester } from '../types';

export const parseRequester = async (
  auth: AuthProvider,
  request: Request,
): Promise<Requester> => {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    throw new Error('No authorization header');
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer') {
    throw new Error('Invalid authorization type');
  }

  const isProbablyJwt = token.split('.').length === 3;

  if (!isProbablyJwt) {
    return { type: 'machine', id: token };
  }

  const parsedToken = await auth.parseToken(token);

  if (!parsedToken) {
    throw new Error('Invalid token');
  }

  return {
    type: 'user',
    id: parsedToken.sub,
    email: parseEmailClaim(parsedToken),
  };
};

export const parseEmailClaim = (claims: any) => {
  for (const claim of Object.keys(claims)) {
    if (claim.endsWith('email')) {
      return claims[claim];
    }
  }
};

export const validateRequester = async (params: {
  request: Request;
  spaceId: string;
  adminStore: DurableObjectStub;
}) => {
  const { request, spaceId, adminStore } = params;

  const adminRequest = new Request(
    `${new URL(request.url).origin}/admin/graphql`,
    {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ query: ACCOUNT_MEMBERSHIPS_QUERY }),
    },
  );

  const response: {
    errors?: GraphQLError[];
    data?: AccountMembershipsData;
  } = await adminStore.fetch(adminRequest).then((res) => res.json());

  if (response.errors) {
    throw new Error('Admin API: ' + response.errors[0].message);
  }

  if (!response.data) {
    throw new Error('Admin API: No data returned');
  }

  const { account, accessToken } = response.data;

  const hasMembership = (account?.memberships || [])
    .concat(accessToken || [])
    .some((membership) => membership.space.id === spaceId);

  if (!hasMembership) {
    throw new Error(`Requester cannot access this space`);
  }
};

interface AccountMembershipsData {
  account?: {
    memberships: {
      space: {
        id: string;
      };
    }[];
  };
  accessToken?: {
    space: {
      id: string;
    };
  };
}

const ACCOUNT_MEMBERSHIPS_QUERY = `
  query AccountMemberships {
    account {
      memberships {
        space { id }
      }
    }
    accessToken {
      space { id }
    }
  }
`;
