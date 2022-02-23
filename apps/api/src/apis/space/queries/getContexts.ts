import { Concept } from '@creatureco/concept-ml-parser';
import {
  createContainmentPrefixKey,
  parseContainmentKey,
} from '../../../lib/keys';

export default async function getContexts(
  storage: DurableObjectStorage,
  concept: Concept,
): Promise<Concept[]> {
  const containmentKeys = await storage.list<true>({
    prefix: createContainmentPrefixKey({ concept }),
  });

  const contexts: Concept[] = [];

  for (const [containmentKey] of containmentKeys) {
    const { container } = parseContainmentKey(containmentKey) || {};
    if (container) {
      contexts.push(container);
    }
  }

  return contexts;
}
