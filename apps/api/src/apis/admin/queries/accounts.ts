import { Account } from '../../../types';

export async function saveAccount(
  storage: DurableObjectStorage,
  account: Account,
): Promise<Account> {
  await storage.put({
    [`account:${account.id}`]: {
      ...account,
      created: (account.created || new Date()).toISOString(),
    },
  });

  return account;
}

export async function getAccount(
  storage: DurableObjectStorage,
  id: string,
): Promise<Account | undefined> {
  const account = await storage.get<Account>(`account:${id}`);

  if (!account) {
    return undefined;
  }

  return {
    ...account,
    created: new Date(account.created),
  };
}

export default async function deleteAccount(
  storage: DurableObjectStorage,
  id: string,
): Promise<true> {
  await storage.delete(`account:${id}`);
  return true;
}
