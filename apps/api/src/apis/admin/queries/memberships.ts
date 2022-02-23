import { Membership } from '../../../types';

export async function getAccountMemberships(
  storage: DurableObjectStorage,
  accountId: string,
): Promise<Membership[]> {
  const membershipIds: string[] = await storage
    .list({
      prefix: `account/space:${accountId}/`,
    })
    .then((map) => {
      return Array.from(map.values()).map((v: any) => v.membershipId);
    });

  return getMemberships(storage, membershipIds);
}

export async function getMembershipByAccountAndSpace(
  storage: DurableObjectStorage,
  accountId: string,
  spaceId: string,
): Promise<Membership | null> {
  const membershipId = await storage
    .get(`account/space:${accountId}/${spaceId}`)
    .then((v: any) => (v?.membershipId as string) || null);

  if (!membershipId) {
    return null;
  }

  const membership = await getMembership(storage, membershipId);

  return membership || null;
}

export async function getMemberships(
  storage: DurableObjectStorage,
  ids: string[],
): Promise<Membership[]> {
  return storage
    .get<Membership>(ids.map((id) => `membership:${id}`))
    .then((map) => Array.from(map.values()));
}

export async function getMembership(storage: DurableObjectStorage, id: string) {
  return storage.get<Membership>(`membership:${id}`);
}

export async function getSpaceMemberships(
  storage: DurableObjectStorage,
  spaceId: string,
) {
  const keyMap = await storage.list({
    prefix: `space/membership:${spaceId}/`,
  });

  const membershipIds = Object.keys(keyMap).map((key) => {
    return key.split(':')[1].split('/')[1];
  });

  return storage
    .get<Membership>(membershipIds)
    .then((map) => Array.from(map.values()));
}

export async function removeMembership(
  storage: DurableObjectStorage,
  id: string,
): Promise<boolean> {
  const membership = await getMembership(storage, id);

  if (!membership) {
    return false;
  }

  await storage.delete([
    `space/membership:${membership.spaceId}/${membership.id}`,
    `membership:${membership.id}`,
  ]);

  return true;
}

export async function saveMembership(
  storage: DurableObjectStorage,
  membership: Membership,
) {
  await storage.put({
    [`membership:${membership.id}`]: membership,
  });

  return membership;
}
