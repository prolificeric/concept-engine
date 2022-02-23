import request, { RequestDocument } from 'graphql-request';
import { ensureToken } from './auth/token';

const baseUrl = 'http://localhost:8787';

export const requestAdmin = async <TData = any, TVariables = any>(
  query: RequestDocument,
  variables?: TVariables,
) => {
  const token = await ensureToken();
  const headers = { Authorization: `Bearer ${token}` };

  return request<TData, TVariables>(
    `${baseUrl}/admin/graphql`,
    query,
    variables,
    headers,
  );
};

export const requestSpace = async <TData = any, TVariables = any>(
  spaceId: string,
  query: RequestDocument,
  variables?: TVariables,
) => {
  const token = await ensureToken();
  const headers = { Authorization: `Bearer ${token}` };

  return request<TData, TVariables>(
    `${baseUrl}/${spaceId}/graphql`,
    query,
    variables,
    headers,
  );
};
