import GraphQLStore from '../lib/graphql-store';
import { schema } from '../apis/space';
import { SpaceResolverContext } from '../types';
import { parseRequester } from '../lib/requester';
import { parseConfig } from '@/config';

export default class ConceptStore extends GraphQLStore {
  getSchema() {
    return schema;
  }

  async reset() {
    return this.state.storage.deleteAll();
  }

  async fetch(request: Request) {
    if (new URL(request.url).pathname === '/' && request.method === 'DELETE') {
      await this.reset();
    }

    return super.fetch(request);
  }

  async getResolverContext(request: Request): Promise<SpaceResolverContext> {
    const spaceId = (new URL(request.url).pathname.match(
      /^\/spaces\/([^/]+)\//,
    ) || [, null])[1];

    if (!spaceId) {
      throw new Error('Could not parse space ID from request');
    }

    return {
      ...(await super.getResolverContext(request)),
      spaceId,
    };
  }
}
