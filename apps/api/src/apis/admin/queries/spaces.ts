import { createRandomId } from '../../../lib/random';
import { Env, Membership, Role, Space } from '../../../types';
import { getMemberships } from './memberships';

export async function getSpace(
  storage: DurableObjectStorage,
  id: string,
): Promise<Space | null> {
  const result = await storage.get<{ name: string }>(`space:${id}`);
  return result ? { id, name: result.name } : null;
}

export async function getSpaces(
  storage: DurableObjectStorage,
  ids: string[],
): Promise<Space[]> {
  return storage
    .get<{ name: string }>(ids.map((id) => `space:${id}`))
    .then((map) => {
      return Array.from(map.entries()).map(([id, { name }]) => ({
        id,
        name,
      }));
    });
}

export async function addSpace(
  storage: DurableObjectStorage,
  params: { name: string; accountId: string },
): Promise<Space> {
  const { name, accountId } = params;
  const spaceId = createRandomId();
  const membershipId = createRandomId();
  const role: Role = 'owner';

  const creatorMembership: Membership = {
    accountId,
    spaceId,
    role,
    id: membershipId,
  };

  await storage.put({
    [`account/space:${accountId}/${spaceId}`]: { membershipId },
    [`space/membership:${spaceId}/${membershipId}`]: true,
    [`membership:${membershipId}`]: creatorMembership,
    [`space:${spaceId}`]: { name },
  });

  return {
    name,
    id: spaceId,
  };
}

export async function updateSpace(
  storage: DurableObjectStorage,
  params: Space,
): Promise<null | Space> {
  const { id, name } = params;

  if (!(await getSpace(storage, id))) {
    return null;
  }

  await storage.put({
    [`space:${id}`]: { name },
  });

  return {
    id,
    name,
  };
}

export async function removeSpace(
  storage: DurableObjectStorage,
  conceptStore: DurableObjectStub,
  spaceId: string,
) {
  const membershipIds: string[] = await storage
    .list<true>({
      prefix: `space/membership:${spaceId}/`,
    })
    .then((results) => {
      return Array.from(results.keys()).map((key) => {
        return key.split(':')[1].split('/')[1];
      });
    });

  const memberships = await getMemberships(storage, membershipIds);

  const deletionKeys = [`space:${spaceId}`];

  memberships.forEach((m) => {
    deletionKeys.push(
      `account/space:${m.accountId}/${spaceId}`,
      `space/membership:${spaceId}/${m.id}`,
      `membership:${m.id}`,
    );
  });

  await storage.delete(deletionKeys);

  await conceptStore.fetch(
    new Request('http://localhost/', {
      method: 'DELETE',
    }),
  );

  return true;
}
