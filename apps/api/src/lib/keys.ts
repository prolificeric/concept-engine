import {
  VariableDict,
  parseConcept,
  Concept,
  extractVariables,
} from '@creatureco/concept-ml-parser';

export const createMaskMatchKey = (params: {
  concept: Concept;
  mask: Concept;
}) => {
  const { concept, mask } = params;
  const vars = extractVariables(concept, mask);

  if (!vars) {
    throw new Error('Mask does not match concept.');
  }

  const encodedMaskKey = encodeConceptKey(params.mask.key);

  return `mask/match:${encodedMaskKey}/${createVariableValueString(vars)}`;
};

export const createMaskMatchCountKey = (params: { mask: Concept }) => {
  const encodedMaskKey = encodeConceptKey(params.mask.key);
  return `mask/matchCount:${encodedMaskKey}`;
};

export const createVariableValueString = (vars: VariableDict) => {
  return Object.entries(vars)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => encodeConceptKey(value.key))
    .join(';');
};

export const parseMatchKey = (key: string): VariableDict => {
  const [, valueStr] = key.split(':')[1]?.split('/') || [];
  const dict: VariableDict = {};

  if (!valueStr) {
    return dict;
  }

  valueStr.split(';').forEach((value, i) => {
    dict['$' + i] = parseConcept(decodeConceptKey(value));
  });

  return dict;
};

export const createConceptStorageKey = (params: { concept: Concept }) => {
  return `concept:${encodeConceptKey(params.concept.key)}`;
};

export const createConceptDataKey = (params: {
  spaceId: string;
  concept: Concept;
}) => {
  return `space/concept/data:${params.spaceId}/${encodeConceptKey(
    params.concept.key,
  )}`;
};

export const createContainmentKeys = (params: {
  concept: Concept;
}): string[] => {
  const { concept } = params;

  return params.concept.parts.map((part, index) => {
    return `concept/index/container:${encodeConceptKey(
      part.key,
    )}/${index}/${encodeConceptKey(concept.key)}`;
  });
};

export const createContainmentPrefixKey = (params: { concept: Concept }) => {
  return `concept/index/container:${encodeConceptKey(params.concept.key)}/`;
};

export const encodeConceptKey = (key: string): string => {
  return encodeURIComponent(toPostEncoding(key));
};

export const decodeConceptKey = (encoded: string): string => {
  return fromPostEncoding(decodeURIComponent(encoded));
};

export const parseContainmentKey = (
  key: string,
): null | {
  concept: Concept;
  container: Concept;
  index: number;
} => {
  const [conceptKey, index, containerKey] = key.split(':')[1]?.split('/') || [];

  if (!conceptKey || !containerKey || !index) {
    return null;
  }

  return {
    concept: parseConcept(decodeConceptKey(conceptKey)),
    container: parseConcept(decodeConceptKey(containerKey)),
    index: parseInt(index, 10),
  };
};

export const toPostEncoding = (key: string): string => {
  const rxp = /\[|\]/g;
  let match: RegExpExecArray | null = null;

  const matchDict = {
    '[': [] as number[],
    ']': [] as number[],
  };

  while ((match = rxp.exec(key))) {
    const char = match[0] as keyof typeof matchDict;
    matchDict[char].push(match.index);
  }

  return [
    key.replace(rxp, ''),
    matchDict['['].join(';'),
    matchDict[']'].join(';'),
  ].join('|');
};

export const fromPostEncoding = (encoded: string): string => {
  const split = encoded.split('|');

  const replacements = split
    .slice(-2)
    .flatMap((str, i) => {
      if (str.length === 0) {
        return [];
      }

      const indexes = str.split(';').map((str) => parseInt(str, 10));
      return indexes.map((index) => ({
        index,
        value: i === 0 ? '[' : ']',
      }));
    })
    .sort((a, b) => {
      return a.index - b.index;
    });

  let out = split.slice(0, -2).join('|');

  replacements.forEach(({ index, value }) => {
    out = out.slice(0, index) + value + out.slice(index);
  });

  return out;
};
