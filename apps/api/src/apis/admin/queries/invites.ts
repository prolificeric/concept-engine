import { Role } from '../../../types';

export async function getInvite(storage: DurableObjectStorage, email: string) {
  const role = await storage.get<Role>(`invite:${email}`);

  return {
    email,
    role,
  };
}

export async function removeInvite(
  storage: DurableObjectStorage,
  spaceId: string,
  email: string,
): Promise<boolean> {
  const result = await storage.delete(`space/invite:${spaceId}/${email}`);
  await storage.delete(`invite/space:${email}/${spaceId}`);
  return result;
}

export async function addInvite(
  storage: DurableObjectStorage,
  spaceId: string,
  email: string,
  role: Role,
) {
  await storage.put(`space/invite:${spaceId}/${email}`, role);
  await storage.put(`invite/space:${email}/${spaceId}`, role);

  return {
    email,
    role,
  };
}
