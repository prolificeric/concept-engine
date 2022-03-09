import { MemoryStorage } from '@miniflare/storage-memory';
import { DurableObjectStorage } from '@miniflare/durable-objects';
import { KVNamespace } from '@miniflare/kv';
import { SpaceResolverContext } from '@/types';

export const createTestContext = async (): Promise<SpaceResolverContext> => {
  const mem = new MemoryStorage();

  return {
    storage: new DurableObjectStorage(mem),
    spaceId: 'TEST_SPACE',
    globalData: new KVNamespace(mem) as any,
    env: {} as any,
    config: {} as any,
    requester: {} as any,
    paymentProvider: {} as any,
  };
};
