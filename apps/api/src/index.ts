import { Router } from 'itty-router';
import { Env } from './types';
import ConceptStore from './durable-objects/ConceptStore';
import AdminStore from './durable-objects/AdminStore';
import { json } from './lib/responses';
import { handleOptions, setCorsHeaders } from './lib/cors';
import { validateRequester } from './lib/requester';

export { ConceptStore, AdminStore };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      // Handle CORS pre-flight request
      return handleOptions(request);
    }

    const adminStore = env.ADMIN_STORE.get(env.ADMIN_STORE.idFromName('admin'));

    const router = Router()
      .post('/admin/graphql', () => {
        return adminStore.fetch(request);
      })
      .post(`/spaces/:spaceId/graphql`, async ({ params }) => {
        const { spaceId } = params as any;

        const store = env.CONCEPT_STORE.get(
          env.CONCEPT_STORE.idFromName(spaceId),
        );

        return await validateRequester({ request, spaceId, adminStore })
          .then(() => store.fetch(request))
          .catch((err) => json(200, { errors: [{ message: err.message }] }));
      })
      .all('*', () => {
        return json(200, {
          errors: [{ message: 'Invalid endpoint' }],
        });
      });

    return router.handle(request).then(setCorsHeaders);
  },
};
