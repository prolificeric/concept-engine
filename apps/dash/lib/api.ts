import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useSpaceId } from './routing';
import { useAccessToken } from '../providers/AuthProvider';
import config from '../site.config';

const clients: {
  [key: string]: ApolloClient<InMemoryCache>;
} = {};

export const useAdminClient = () => {
  const accessToken = useAccessToken();
  const hash = ['admin', config.coeng.baseUrl, accessToken].join('|');

  const client =
    clients[hash] ||
    new ApolloClient({
      uri: config.coeng.baseUrl + '/admin/graphql',
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: new InMemoryCache(),
    });

  clients[hash] = client;

  return client;
};

export const useSpaceClient = () => {
  const accessToken = useAccessToken();
  const spaceId = useSpaceId() || '';
  const hash = ['space', config.coeng.baseUrl, accessToken, spaceId].join('|');

  const client =
    clients[hash] ||
    new ApolloClient({
      uri: config.coeng.baseUrl + `/spaces/${spaceId}/graphql`,
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: new InMemoryCache(),
    });

  clients[hash] = client;

  return client;
};
