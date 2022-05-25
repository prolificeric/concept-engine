import {
  Concept,
  extractVariables,
  isVariable,
  parseConcept,
  parseConcepts,
  VariableDict,
} from '@coeng/concept-ml-parser';

import { Dict } from '../types';

export interface Trigger {
  name: string;
  components: {
    matches: Concept[];
    adds: Concept[];
    notifies: Concept[];
    removes: Concept[];
  };
}

export interface TriggerMatch {
  trigger: Trigger;
  variables: VariableDict;
}

export type TriggerIndex = Dict<Trigger>;

interface TriggerMatchIndex {
  [triggerName: string]: TriggerMatchPartial[];
}

interface TriggerMatchPartial extends TriggerMatch {
  rules: Concept[];
}

export const createTrigger = (name: string): Trigger => {
  return {
    name,
    components: {
      matches: [],
      adds: [],
      notifies: [],
      removes: [],
    },
  };
};

export enum ComponentType {
  matches = '@matches',
  adds = '@adds',
  notifies = '@notifies',
  removes = '@removes',
}

export const triggerFragRules = {
  match: parseConcepts(`$trigger [${ComponentType.matches} $rule]`),
  add: parseConcepts(`$trigger [${ComponentType.adds} $template]`),
  remove: parseConcepts(`$trigger [${ComponentType.removes} $template]`),
  notify: parseConcepts(`$trigger [${ComponentType.notifies} $url]`),
};

export const indexTriggerFrag = (
  index: TriggerIndex,
  triggerConcept: Concept,
  component: keyof Trigger['components'],
  fragConcept: Concept,
) => {
  const triggerName = triggerConcept.key;
  const trigger = index[triggerName] || createTrigger(triggerName);
  trigger.components[component].push(fragConcept);
  index[triggerName] = trigger;
};

export const extractTriggerMatches = (
  triggers: Trigger[],
  concepts: Concept[],
): {
  matches: TriggerMatch[];
  partials: TriggerMatchPartial[];
} => {
  const partialIndex: TriggerMatchIndex = {};
  const fullMatches: TriggerMatch[] = [];

  concepts.forEach((concept) => {
    triggers.forEach((trigger) => {
      trigger.components.matches.forEach((rule) => {
        const variables = extractVariables(concept, rule);

        if (!variables) {
          return;
        }

        const triggerPartials = partialIndex[trigger.name] || [];
        partialIndex[trigger.name] = triggerPartials;

        const partial: TriggerMatchPartial = {
          trigger,
          variables,
          rules: [rule],
        };

        if (isFullMatch(partial)) {
          fullMatches.push({
            trigger,
            variables,
          });

          return;
        }

        triggerPartials.push(partial);

        triggerPartials.forEach((otherPartial) => {
          const isComplimentary = variableDictsAreComplimentary(
            variables,
            otherPartial.variables,
          );

          if (!isComplimentary) {
            return;
          }

          const mergedPartial: TriggerMatchPartial = {
            trigger,
            rules: [...otherPartial.rules, rule],
            variables: {
              ...otherPartial.variables,
              ...variables,
            },
          };

          if (isFullMatch(mergedPartial)) {
            fullMatches.push({
              trigger,
              variables: mergedPartial.variables,
            });

            return;
          }

          triggerPartials.push(mergedPartial);
        });
      });
    });
  });

  return {
    matches: fullMatches,
    partials: Object.values(partialIndex).flat(),
  };
};

export const variableDictsAreComplimentary = (
  a: VariableDict,
  b: VariableDict,
) => {
  let sharedKeys = 0;

  for (const key in a) {
    if (b[key]) {
      if (a[key] !== b[key]) {
        return false;
      }

      sharedKeys += 1;
    }
  }

  return sharedKeys > 0;
};

export const isFullMatch = (partial: TriggerMatchPartial) => {
  return (
    partial.rules.length === partial.trigger.components.matches.length &&
    !variablesContainVariables(partial.variables)
  );
};

export const variablesContainVariables = (variables: VariableDict) => {
  return Object.values(variables).every(isVariable);
};

export const buildTriggerIndex = (frags: Concept[]): TriggerIndex => {
  const index: TriggerIndex = {};

  frags.forEach((frag) => {
    const { $trigger, $componentType, $component } =
      extractVariables(frag, triggerFragPattern) || {};

    if (!$trigger) {
      return;
    }

    switch ($componentType.key) {
      case ComponentType.matches:
        indexTriggerFrag(index, $trigger, 'matches', $component);
        break;
      case ComponentType.adds:
        indexTriggerFrag(index, $trigger, 'adds', $component);
        break;
      case ComponentType.notifies:
        indexTriggerFrag(index, $trigger, 'notifies', $component);
        break;
      case ComponentType.removes:
        indexTriggerFrag(index, $trigger, 'removes', $component);
        break;
      default:
        break;
    }
  });

  return index;
};

export const triggerFragPattern = parseConcept(
  '$trigger [$componentType $component]',
);

export const separateTriggerFrags = (concepts: Concept[]) => {
  const frags: Concept[] = [];
  const nonFrags: Concept[] = [];

  concepts.forEach((concept) => {
    const parts = extractVariables(concept, triggerFragPattern);

    if (!parts || !componentTypeDirectives.includes(parts.$componentType.key)) {
      nonFrags.push(concept);
      return;
    }

    frags.push(concept);
  });

  return {
    triggerFrags: frags,
    concepts: nonFrags,
  };
};

const componentTypeDirectives = Object.keys(ComponentType);
