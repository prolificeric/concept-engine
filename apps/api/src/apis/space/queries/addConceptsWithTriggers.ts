import {
  Concept,
  extractVariables,
  filterUniqueConcepts,
  interpolateToConcepts,
  isAtom,
  isVariable,
  parseConcept,
} from '@coeng/concept-ml-parser';

import { Trigger, TriggerMatch } from '../../../lib/triggers';
import { getConceptText } from '../../../lib/concepts';
import addConcepts from './addConcepts';
import matchConcepts from './matchRules';
import getAllTriggers from './getAllTriggers';
import removeConcepts from './removeConcepts';

export interface TriggerMatchNotification extends TriggerMatch {
  url: string;
}

export interface TriggerComponent {
  triggerName: string;
  type: keyof Trigger['components'];
  arg: Concept;
}

export interface TriggerResults {
  params: ProcessTriggersParams;
  triggeredChanges: TriggeredChangesDict;
  recursion: null | TriggerResults;
}

export interface ProcessTriggersParams {
  storage: DurableObjectStorage;
  globalData: KVNamespace;
  spaceId: string;
  allTriggers: Trigger[];
  newConcepts: Concept[];
  newTriggers: Trigger[];
  onConceptAdded?: (concept: Concept) => void;
  processNotification?: (
    notification: TriggerMatchNotification,
  ) => Promise<any>;
}

export interface TriggeredChangesDict {
  conceptsToAdd: Concept[];
  conceptsToRemove: Concept[];
  notifications: TriggerMatchNotification[];
}

const TRIGGER_COMPONENT_PATTERN = parseConcept('$trigger [$type $arg]');
const COMPONENT_TYPE_KEYS = ['@matches', '@adds', '@removes', '@notifies'];

export const processNotificationWithFetch = async ({
  url,
  variables,
  trigger,
}: TriggerMatchNotification) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables,
      trigger,
    }),
  });
};

export const addConceptsWithTriggers = async (params: {
  storage: DurableObjectStorage;
  concepts: Concept[];
  globalData: KVNamespace;
  spaceId: string;
  triggers?: Trigger[];
  onConceptAdded?: (concept: Concept) => void;
  processNotification?: ProcessTriggersParams['processNotification'];
}): Promise<null | TriggerResults> => {
  const {
    storage,
    concepts,
    globalData,
    spaceId,
    processNotification,
    onConceptAdded = () => {},
  } = params;

  const allTriggers = params.triggers || (await getAllTriggers(storage));
  const organized = separateTriggers(concepts);

  if (concepts.length === 0) {
    return null;
  }

  // Make sure there are no duplicate triggers
  allTriggers.forEach((trigger) => {
    if (organized.triggers[trigger.name]) {
      throw new Error(`Trigger "${trigger.name}" already exists`);
    }
  });

  const newTriggers = Object.values(organized.triggers);

  // Add new triggers to whole list
  allTriggers.push(...newTriggers);

  // Save new concepts
  const newConcepts = await addConcepts(
    storage,
    Object.values(organized.concepts),
  );

  // Run callbacks on new concepts
  newConcepts.forEach(onConceptAdded);

  const processTriggersParams: ProcessTriggersParams = {
    storage,
    globalData,
    spaceId,
    allTriggers,
    newConcepts,
    newTriggers,
    onConceptAdded,
    processNotification,
  };

  // Skip processing triggers if there are no new concepts or triggers
  if (allTriggers.length + newConcepts.length === 0) {
    const result: TriggerResults = {
      params: processTriggersParams,
      triggeredChanges: {
        conceptsToAdd: [],
        conceptsToRemove: [],
        notifications: [],
      },
      recursion: null,
    };

    return result;
  }

  // Run add/remove/notify
  const result = await processTriggers(processTriggersParams);

  // Save new trigger components
  // We do this after processing triggers so that they don't match themselves.
  const newComponents = await addConcepts(
    storage,
    Object.values(organized.triggerComponents),
  );

  // Run callbacks on new concepts
  newComponents.forEach(onConceptAdded);

  return result;
};

export const processTriggers = async (
  params: ProcessTriggersParams,
): Promise<TriggerResults> => {
  const {
    storage,
    allTriggers,
    newConcepts,
    newTriggers,
    globalData,
    spaceId,
    processNotification = processNotificationWithFetch,
  } = params;

  const allTriggerMatches: TriggerMatch[] = [];

  // Find trigger matches for new concepts
  for (const concept of newConcepts) {
    const triggerMatches = await findTriggerMatchesForConcept({
      storage,
      concept,
      triggers: allTriggers,
    });

    allTriggerMatches.push(...triggerMatches);
  }

  // Find trigger matches for new triggers
  for (const trigger of newTriggers) {
    const triggerMatches = await findTriggerMatchesForTrigger({
      storage,
      trigger,
    });

    allTriggerMatches.push(...triggerMatches);
  }

  const triggeredChanges = getTriggeredChanges(allTriggerMatches);
  const { conceptsToAdd, conceptsToRemove, notifications } = triggeredChanges;

  // Process add concepts with triggers recursively
  const recursion = await addConceptsWithTriggers({
    storage,
    globalData,
    spaceId,
    concepts: conceptsToAdd,
    triggers: allTriggers,
    onConceptAdded: params.onConceptAdded,
  });

  // Process notifications
  for (const notification of notifications) {
    await processNotification(notification).catch((err) => {
      console.error('Trigger notification error', err.message, {
        spaceId,
        url: notification.url,
        triggerName: notification.trigger.name,
      });
    });
  }

  // Process removed concepts
  await removeConcepts({
    storage,
    globalData,
    spaceId,
    concepts: conceptsToRemove,
  });

  return {
    params,
    triggeredChanges,
    recursion,
  };
};

export const findTriggerMatchesForConcept = async (params: {
  storage: DurableObjectStorage;
  concept: Concept;
  triggers: Trigger[];
}): Promise<TriggerMatch[]> => {
  const { storage, concept, triggers } = params;
  const triggerMatches: TriggerMatch[] = [];

  if (isAtom(concept)) {
    return [];
  }

  // Test each trigger to see if it matches the concept
  triggerLoop: for (const trigger of triggers) {
    const rules = trigger.components.matches;

    // Loop through rules to see if there's any match
    ruleLoop: for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      const variables = extractVariables(concept, rule);

      // No match? Well, let's try the next rule.
      if (!variables) {
        continue ruleLoop;
      }

      // No need to look for matches in storage if there's only one rule.
      if (rules.length === 1) {
        triggerMatches.push({ trigger, variables });
      }

      // There's more than one rule, so we need to see if it matches other
      // concepts in the DB.
      else {
        // All rules except current one
        const restRules = [...rules.slice(0, i), ...rules.slice(i + 1)];

        // All matches for the rest of the rules.
        const restMatches = await matchConcepts(
          storage,
          interpolateToConcepts(restRules, variables),
        );

        // For each rule match, combine the variables with the
        // above rule match and add as trigger match.
        triggerMatches.push(
          ...restMatches.map((restVariables) => ({
            trigger,
            variables: {
              ...variables,
              ...restVariables,
            },
          })),
        );
      }

      // Get out of the rule loop and keep trying other triggers.
      continue triggerLoop;
    }
  }

  return triggerMatches;
};

export const findTriggerMatchesForTrigger = async (params: {
  storage: DurableObjectStorage;
  trigger: Trigger;
}): Promise<TriggerMatch[]> => {
  const { storage, trigger } = params;
  const ruleMatches = await matchConcepts(storage, trigger.components.matches);

  return ruleMatches
    .map((variables) => ({
      trigger,
      variables,
    }))
    .filter((match) => {
      return Object.values(match.variables).every((c) => {
        return !isVariable(c);
      });
    });
};

export const getTriggeredChanges = (
  allTriggerMatches: TriggerMatch[],
): TriggeredChangesDict => {
  // Compute added concepts
  const conceptsToAdd = allTriggerMatches.flatMap(({ trigger, variables }) => {
    const interpolated = interpolateToConcepts(
      trigger.components.adds,
      variables,
    );

    return interpolated;

    // const metaInterpolated = interpolated.map((c) => {
    //   return parseConcept(`[${c.key}] @triggeredBy [${trigger.name}]`);
    // });

    // return interpolated.concat(metaInterpolated);
  });

  // Compute removed concepts
  const conceptsToRemove = allTriggerMatches.flatMap(
    ({ trigger, variables }) => {
      return interpolateToConcepts(trigger.components.removes, variables);
    },
  );

  // Compute notifications
  const notifications = allTriggerMatches.flatMap(({ trigger, variables }) => {
    return trigger.components.notifies.map(getConceptText).map((url) => {
      return {
        url,
        trigger,
        variables,
      };
    });
  });

  return {
    notifications,
    conceptsToAdd: filterUniqueConcepts(conceptsToAdd),
    conceptsToRemove: filterUniqueConcepts(conceptsToRemove),
  };
};

export const separateTriggers = (concepts: Concept[]) => {
  const organized: {
    triggers: Record<string, Trigger>;
    triggerComponents: Record<string, Concept>;
    concepts: Record<string, Concept>;
  } = {
    triggers: {},
    triggerComponents: {},
    concepts: {},
  };

  concepts.forEach((concept) => {
    const component = parseTriggerComponent(concept);

    if (!component) {
      organized.concepts[concept.key] = concept;
    } else {
      const trigger: Trigger = organized.triggers[component.triggerName] || {
        name: component.triggerName,
        components: {
          matches: [],
          adds: [],
          removes: [],
          notifies: [],
        },
      };

      organized.triggers[component.triggerName] = trigger;
      trigger.components[component.type].push(component.arg);
      organized.triggerComponents[concept.key] = concept;
    }
  });

  return organized;
};

export const parseTriggerComponent = (
  concept: Concept,
): null | TriggerComponent => {
  const match = extractVariables(concept, TRIGGER_COMPONENT_PATTERN);

  if (match && COMPONENT_TYPE_KEYS.includes(match.$type.key)) {
    return {
      triggerName: match.$trigger.key,
      type: match.$type.key.slice(1) as any,
      arg: match.$arg,
    };
  }

  return null;
};

export default addConceptsWithTriggers;
