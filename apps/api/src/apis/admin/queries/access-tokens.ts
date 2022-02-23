import { createRandomId } from '../../../lib/random';
import { AccessToken, Role } from '../../../types';
import { getSpace } from './spaces';

export async function addAccessToken(params: {
  label: string;
  storage: DurableObjectStorage;
  creatorId: string;
  spaceId: string;
  role: Role;
}): Promise<AccessToken> {
  const { storage, ...rest } = params;

  return saveAccessToken(storage, {
    id: createRandomId(32),
    ...rest,
  });
}

async function saveAccessToken(
  storage: DurableObjectStorage,
  accessToken: AccessToken,
): Promise<AccessToken> {
  const { id, label, spaceId, creatorId } = accessToken;

  if (!(await getSpace(storage, spaceId))) {
    throw new Error(`Space ${spaceId} does not exist`);
  }

  if (!(await isUniqueLabel(storage, spaceId, label))) {
    throw new Error('This space already has an access token with this label');
  }

  await storage.put({
    [`accessToken:${id}`]: accessToken,
    [`space/accessToken:${spaceId}/${id}`]: true,
    [`account/accessToken:${creatorId}:${id}`]: true,
  });

  return accessToken;
}

export async function removeAccessToken(
  storage: DurableObjectStorage,
  id: string,
): Promise<AccessToken | null> {
  const existing = await getAccessToken(storage, id);

  if (!existing) {
    return null;
  }

  const { spaceId, creatorId } = existing;

  await storage.delete([
    `accessToken:${id}`,
    `space/accessToken:${spaceId}/${id}`,
    `account/accessToken:${creatorId}:${id}`,
  ]);

  return existing;
}

export async function getAccessToken(
  storage: DurableObjectStorage,
  id: string,
): Promise<AccessToken | null> {
  const accessToken = await storage.get<AccessToken>(`accessToken:${id}`);
  return accessToken || null;
}

export async function updateAccessToken(params: {
  storage: DurableObjectStorage;
  id: string;
  role?: Role;
  label?: string;
}): Promise<AccessToken | null> {
  const accessToken = await getAccessToken(params.storage, params.id);

  if (!accessToken) {
    return null;
  }

  return saveAccessToken(params.storage, {
    ...accessToken,
    label: params.label || accessToken.label,
    role: params.role || accessToken.role,
  });
}

export async function isUniqueLabel(
  storage: DurableObjectStorage,
  spaceId: string,
  label: string,
): Promise<boolean> {
  const spaceAccessTokens = await getSpaceAccessTokens(storage, spaceId);
  return spaceAccessTokens.every((at) => at.label !== label);
}

export async function getSpaceAccessTokens(
  storage: DurableObjectStorage,
  spaceId: string,
) {
  const keyMap = await storage.list({
    prefix: `space/accessToken:${spaceId}/`,
  });

  const accessTokenIds = Array.from(keyMap.keys()).map((key) => {
    return key.split(':')[1].split('/')[1];
  });

  return storage
    .get<AccessToken>(accessTokenIds.map((id) => `accessToken:${id}`))
    .then((tokens) => Array.from(tokens.values()));
}
